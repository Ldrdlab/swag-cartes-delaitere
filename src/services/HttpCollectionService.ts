/**
 * Accès à la collection par le réseau (fichiers du projet + API d'administration de développement).
 *
 * Rôle : lire la liste des cartes dans `cartes/cartes.json` (fichier publié avec l'appli, lisible par
 * tous) et, seulement si l'administration est disponible (`npm run dev`), appeler l'API
 * `/api/cartes` pour ajouter / modifier / supprimer. Le code admin est envoyé dans un en-tête HTTP et
 * vérifié par le serveur.
 * Expose : OptionsHttpCollection, HttpCollectionService.
 * Dépend de : config/cartes, domain/cartes, domain/types, services/CollectionService.
 */
import { STOCKAGE_CARTES, VARIANTES_PAR_RARETE } from '../config/cartes';
import { lireListeCartes, type InfosCarte } from '../domain/cartes';
import type { Card } from '../domain/types';
import {
  ErreurCollection,
  type CodeErreurCollection,
  type CollectionService,
  type NouvelleCarteDonnees,
  type StatutAdministration,
} from './CollectionService';

/** Réglages de la connexion. */
export interface OptionsHttpCollection {
  /** Début des adresses de l'appli (`import.meta.env.BASE_URL`, se termine par `/`). */
  baseUrl: string;
  /** L'administration est-elle proposée ? (`import.meta.env.DEV` : jamais sur le site publié.) */
  administration: boolean;
}

/** Codes d'erreur renvoyés par le serveur que l'écran sait expliquer. */
const CODES_CONNUS: readonly CodeErreurCollection[] = [
  'code_incorrect',
  'code_non_defini',
  'infos_invalides',
  'image_invalide',
  'trop_gros',
  'introuvable',
];

/** Encode un blob en base64 (sans le préfixe `data:...`). */
function blobEnBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => resolve(String(lecteur.result).split(',')[1] ?? '');
    lecteur.onerror = () => reject(new ErreurCollection('image_invalide'));
    lecteur.readAsDataURL(blob);
  });
}

/** Service de collection basé sur `fetch`. */
export class HttpCollectionService implements CollectionService {
  private readonly options: OptionsHttpCollection;

  constructor(options: OptionsHttpCollection) {
    this.options = options;
  }

  /** Complète une adresse relative du fichier de liste (`cartes/x.webp`) avec le début de l'appli. */
  private resoudre(adresse: string): string {
    return `${this.options.baseUrl}${adresse}`;
  }

  /** Appelle l'API d'administration et renvoie le JSON de la réponse. */
  private async appeler(
    methode: 'GET' | 'POST' | 'PUT' | 'DELETE',
    chemin: string,
    code?: string,
    corps?: unknown,
  ): Promise<Record<string, unknown>> {
    if (!this.options.administration) throw new ErreurCollection('inconnue');
    const entetes: Record<string, string> = { 'Content-Type': 'application/json' };
    // encodeURIComponent : un en-tête HTTP n'accepte pas les accents ni les emojis tels quels.
    if (code !== undefined) entetes[STOCKAGE_CARTES.enteteCode] = encodeURIComponent(code);

    let reponse: Response;
    try {
      reponse = await fetch(`${STOCKAGE_CARTES.racineApi}${chemin}`, {
        method: methode,
        headers: entetes,
        body: corps === undefined ? null : JSON.stringify(corps),
      });
    } catch {
      throw new ErreurCollection('reseau');
    }
    const json = (await reponse.json().catch(() => ({}))) as Record<string, unknown>;
    if (!reponse.ok) {
      const codeServeur = CODES_CONNUS.find((connu) => connu === json.erreur);
      throw new ErreurCollection(codeServeur ?? 'inconnue', String(json.message ?? reponse.status));
    }
    return json;
  }

  /** Transforme une carte du serveur (adresses relatives) en carte prête à afficher. */
  private carteAffichable(carte: Card): Card {
    return {
      ...carte,
      ...(carte.imageUrl ? { imageUrl: this.resoudre(carte.imageUrl) } : {}),
      ...(carte.thumbUrl ? { thumbUrl: this.resoudre(carte.thumbUrl) } : {}),
    };
  }

  async lireCartes(): Promise<Card[]> {
    const adresse = this.resoudre(`${STOCKAGE_CARTES.dossier}/${STOCKAGE_CARTES.fichierListe}`);
    let reponse: Response;
    try {
      reponse = await fetch(adresse, { cache: 'no-store' });
    } catch {
      throw new ErreurCollection('reseau');
    }
    // Pas de fichier (collection jamais remplie) : le serveur répond 404, ou renvoie la page d'accueil.
    if (!reponse.ok) {
      if (reponse.status === 404) return [];
      throw new ErreurCollection('reseau');
    }
    const json: unknown = await reponse.json().catch(() => null);
    return lireListeCartes(json, VARIANTES_PAR_RARETE).cartes.map((c) => this.carteAffichable(c));
  }

  async statutAdministration(): Promise<StatutAdministration> {
    if (!this.options.administration) return { disponible: false, codeDefini: false };
    try {
      const json = await this.appeler('GET', '/statut');
      return { disponible: json.administration === true, codeDefini: json.codeDefini === true };
    } catch {
      return { disponible: false, codeDefini: false };
    }
  }

  async verifierCode(code: string): Promise<void> {
    await this.appeler('POST', '/verifier', code);
  }

  async ajouterCarte(code: string, donnees: NouvelleCarteDonnees): Promise<Card> {
    const json = await this.appeler('POST', '/', code, {
      nom: donnees.infos.nom,
      rarete: donnees.infos.rarete,
      variante: donnees.infos.variante,
      largeur: donnees.largeur,
      hauteur: donnees.hauteur,
      image: await blobEnBase64(donnees.image),
      miniature: await blobEnBase64(donnees.miniature),
    });
    return this.carteAffichable(json.carte as Card);
  }

  async modifierCarte(code: string, id: string, infos: InfosCarte): Promise<Card> {
    const json = await this.appeler('PUT', `/${encodeURIComponent(id)}`, code, {
      nom: infos.nom,
      rarete: infos.rarete,
      variante: infos.variante,
    });
    return this.carteAffichable(json.carte as Card);
  }

  async supprimerCarte(code: string, id: string): Promise<void> {
    await this.appeler('DELETE', `/${encodeURIComponent(id)}`, code);
  }
}
