/**
 * Collection de cartes stockée dans Supabase.
 *
 * Rôle : lire les cartes (table `cards`) avec des adresses d'images signées (bucket privé « cards »),
 * et, pour l'admin, ajouter / modifier / supprimer. L'envoi des images et l'ajout de la ligne sont
 * enchaînés : si l'un échoue, ce qui a déjà été envoyé est retiré.
 * Expose : SupabaseCollectionService.
 * Dépend de : @supabase/supabase-js (type), config/supabase, domain/cartes, domain/cartesBase,
 * domain/id, domain/types, effects/cles, services/CollectionService, services/erreurs.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { STOCKAGE_SUPABASE } from '../config/supabase';
import type { InfosCarte } from '../domain/cartes';
import type { EntreeCollection } from '../domain/collection';
import {
  champsDepuisInfos,
  cheminsImages,
  COLONNES_CARTE,
  ligneVersCarte,
  type LigneCarte,
} from '../domain/cartesBase';
import { generateId } from '../domain/id';
import type { Card } from '../domain/types';
import { baseDepuisCle } from '../effects/cles';
import type { CollectionService, NouvelleCarteDonnees } from './CollectionService';
import { ErreurService, traduireErreur } from './erreurs';

/** Extension de fichier correspondant au type d'une image (WebP, ou PNG en secours). */
function extensionDe(image: Blob): string {
  return image.type === 'image/png' ? 'png' : image.type === 'image/jpeg' ? 'jpg' : 'webp';
}

/** Infos prêtes pour la base : la clé d'effet du registre devient la valeur enregistrée. */
function infosPourBase(infos: InfosCarte): InfosCarte {
  return infos.effet === undefined ? infos : { ...infos, effet: baseDepuisCle(infos.effet) };
}

/** Service de collection basé sur Supabase. */
export class SupabaseCollectionService implements CollectionService {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** Transforme des lignes de la base en cartes, en demandant toutes les adresses signées d'un coup. */
  private async versCartes(lignes: readonly LigneCarte[]): Promise<Card[]> {
    const chemins = cheminsImages(lignes);
    const adresses = new Map<string, string>();
    if (chemins.length > 0) {
      const { data, error } = await this.client.storage
        .from(STOCKAGE_SUPABASE.bucketCartes)
        .createSignedUrls(chemins, STOCKAGE_SUPABASE.dureeAdresseSigneeS);
      if (error) throw traduireErreur(error);
      for (const entree of data) {
        if (entree.signedUrl && entree.path) adresses.set(entree.path, entree.signedUrl);
      }
    }
    return lignes.map((ligne) => ligneVersCarte(ligne, adresses));
  }

  /** Retire des fichiers du bucket (sans jamais échouer : c'est un nettoyage). */
  private async retirerFichiers(chemins: readonly string[]): Promise<void> {
    if (chemins.length === 0) return;
    await this.client.storage
      .from(STOCKAGE_SUPABASE.bucketCartes)
      .remove([...chemins])
      .catch(() => undefined);
  }

  async lireCartes(): Promise<Card[]> {
    const { data, error } = await this.client
      .from('cards')
      .select(COLONNES_CARTE)
      .order('created_at', { ascending: true })
      .overrideTypes<LigneCarte[]>();
    if (error) throw traduireErreur(error);
    return this.versCartes(data);
  }

  async lireCollectionJoueur(): Promise<EntreeCollection[]> {
    const { data: session } = await this.client.auth.getSession();
    const utilisateur = session.session?.user.id;
    if (!utilisateur) throw new ErreurService('non_connecte');

    // Cartes visibles : les cartes actives + celles que le joueur possède (même désactivées).
    const cartes = await this.client
      .from('cards')
      .select(COLONNES_CARTE)
      .order('created_at', { ascending: true })
      .overrideTypes<LigneCarte[]>();
    if (cartes.error) throw traduireErreur(cartes.error);
    // Filtre explicite : un administrateur verrait sinon les collections de tous les joueurs.
    const possedees = await this.client
      .from('user_cards')
      .select('card_id, quantity')
      .eq('user_id', utilisateur)
      .overrideTypes<{ card_id: string; quantity: number }[]>();
    if (possedees.error) throw traduireErreur(possedees.error);

    const quantites = new Map(possedees.data.map((ligne) => [ligne.card_id, ligne.quantity]));
    const lignes = cartes.data.filter((ligne) => ligne.active || quantites.has(ligne.id));
    // Les adresses d'images ne sont demandées QUE pour les cartes possédées : une carte pas encore
    // obtenue reste un emplacement vide (aucun visuel n'est transmis à l'écran).
    const visibles = await this.versCartes(lignes.filter((ligne) => quantites.has(ligne.id)));
    const parId = new Map(visibles.map((carte) => [carte.id, carte]));
    return lignes.map((ligne) => ({
      carte: parId.get(ligne.id) ?? ligneVersCarte(ligne, new Map()),
      quantite: quantites.get(ligne.id) ?? 0,
    }));
  }

  async ajouterCarte(donnees: NouvelleCarteDonnees): Promise<Card> {
    const base = generateId();
    const chemin = `${base}.${extensionDe(donnees.image)}`;
    const cheminMiniature = `${base}-mini.${extensionDe(donnees.miniature)}`;
    const stockage = this.client.storage.from(STOCKAGE_SUPABASE.bucketCartes);
    const envoyes: string[] = [];

    try {
      for (const [chemin_, fichier] of [
        [chemin, donnees.image],
        [cheminMiniature, donnees.miniature],
      ] as const) {
        const { error } = await stockage.upload(chemin_, fichier, {
          contentType: fichier.type,
          cacheControl: String(STOCKAGE_SUPABASE.cacheImagesS),
          upsert: false,
        });
        if (error) throw traduireErreur(error);
        envoyes.push(chemin_);
      }

      const { data, error } = await this.client
        .from('cards')
        .insert({
          ...champsDepuisInfos(infosPourBase(donnees.infos)),
          image_path: chemin,
          thumb_path: cheminMiniature,
        })
        .select(COLONNES_CARTE)
        .single<LigneCarte>();
      if (error) throw traduireErreur(error);
      const [carte] = await this.versCartes([data]);
      if (!carte) throw new ErreurService('inconnue');
      return carte;
    } catch (erreur) {
      await this.retirerFichiers(envoyes);
      throw erreur instanceof ErreurService ? erreur : traduireErreur(erreur as Error);
    }
  }

  async modifierCarte(id: string, infos: InfosCarte): Promise<Card> {
    const { data, error } = await this.client
      .from('cards')
      .update(champsDepuisInfos(infosPourBase(infos)))
      .eq('id', id)
      .select(COLONNES_CARTE)
      .maybeSingle<LigneCarte>();
    if (error) throw traduireErreur(error);
    // Aucune ligne modifiée : la carte n'existe plus (ou la base a refusé : ce n'est pas un admin).
    if (!data) throw new ErreurService('introuvable');
    const [carte] = await this.versCartes([data]);
    if (!carte) throw new ErreurService('inconnue');
    return carte;
  }

  async supprimerCarte(id: string): Promise<void> {
    const lecture = await this.client
      .from('cards')
      .select('image_path, thumb_path')
      .eq('id', id)
      .maybeSingle<Pick<LigneCarte, 'image_path' | 'thumb_path'>>();
    if (lecture.error) throw traduireErreur(lecture.error);
    if (!lecture.data) throw new ErreurService('introuvable');

    // La base refuse si un joueur possède la carte (clé étrangère) : rien n'est alors supprimé.
    const { data, error } = await this.client.from('cards').delete().eq('id', id).select('id');
    if (error) throw traduireErreur(error);
    if (data.length === 0) throw new ErreurService('non_autorise');

    const { image_path: image, thumb_path: miniature } = lecture.data;
    await this.retirerFichiers(miniature ? [image, miniature] : [image]);
  }
}
