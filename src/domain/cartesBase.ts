/**
 * Conversion entre les cartes de la base de données (Supabase) et les cartes de l'appli.
 *
 * Rôle : traduire une ligne de la table `cards` en `Card`, lister les chemins d'images à signer, et
 * préparer les champs à enregistrer à partir des infos saisies dans l'espace admin.
 * Expose : COLONNES_CARTE, LigneCarte, ChampsCarte, cheminsImages(), ligneVersCarte(), champsDepuisInfos().
 * Dépend de : domain/types, domain/cartes (type). Aucun import React ni DOM.
 */
import type { InfosCarte } from './cartes';
import type { Card, Rarity, Variant } from './types';

/** Colonnes demandées à la table `cards`. */
export const COLONNES_CARTE = 'id, name, rarity, variant, effect, image_path, thumb_path, active';

/** Une ligne de la table `cards`. */
export interface LigneCarte {
  id: string;
  name: string;
  rarity: Rarity;
  variant: Variant | null;
  /** Clé de l'effet ; texte vide = aucun effet. */
  effect: string;
  image_path: string;
  thumb_path: string | null;
  active: boolean;
}

/** Champs enregistrables d'une carte (ajout ou modification). */
export interface ChampsCarte {
  name: string;
  rarity: Rarity;
  variant: Variant | null;
  effect?: string;
  active?: boolean;
}

/** Chemins des images (principales et miniatures) à signer, sans doublon. */
export function cheminsImages(lignes: readonly LigneCarte[]): string[] {
  const chemins = new Set<string>();
  for (const ligne of lignes) {
    chemins.add(ligne.image_path);
    if (ligne.thumb_path) chemins.add(ligne.thumb_path);
  }
  return [...chemins];
}

/**
 * Transforme une ligne de la base en carte de l'appli.
 *
 * @param ligne - Ligne de la table `cards`.
 * @param adresses - Adresses signées, par chemin d'image.
 */
export function ligneVersCarte(ligne: LigneCarte, adresses: ReadonlyMap<string, string>): Card {
  const carte: Card = {
    id: ligne.id,
    name: ligne.name,
    rarity: ligne.rarity,
    effect: ligne.effect,
    active: ligne.active,
  };
  if (ligne.variant) carte.variant = ligne.variant;
  const image = adresses.get(ligne.image_path);
  if (image) carte.imageUrl = image;
  const miniature = ligne.thumb_path ? adresses.get(ligne.thumb_path) : undefined;
  if (miniature) carte.thumbUrl = miniature;
  return carte;
}

/**
 * Prépare les champs à enregistrer. La variante absente devient `null` (elle est effacée si la
 * rareté n'en a pas) ; l'effet et l'activation ne sont modifiés que s'ils sont fournis.
 *
 * @param infos - Infos saisies (le champ `effet` doit déjà être la valeur de la base : `''` = aucun).
 */
export function champsDepuisInfos(infos: InfosCarte): ChampsCarte {
  const champs: ChampsCarte = {
    name: infos.nom,
    rarity: infos.rarete,
    variant: infos.variante ?? null,
  };
  if (infos.effet !== undefined) champs.effect = infos.effet;
  if (infos.active !== undefined) champs.active = infos.active;
  return champs;
}
