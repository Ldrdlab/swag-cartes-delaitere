/**
 * Conversion des réponses du serveur pour l'ouverture des boosters.
 *
 * Rôle : traduire le JSON renvoyé par les fonctions SQL `get_booster_status()` et `open_booster()` en
 * objets de l'appli (statut du jour, cartes tirées avec leur badge « Nouvelle ! »).
 * Expose : StatutBoosters, LigneStatut, statutDepuisLigne(), CarteTireeBrute, OuvertureBrute,
 * ResultatOuverture, cheminsOuverture(), ouvertureDepuisJson().
 * Dépend de : domain/types, domain/effetsCartes. Aucun import React ni DOM.
 */
import { paramsDepuisJson } from './effetsCartes';
import type { CarteTiree, Rarity, Variant } from './types';

/** Boosters du jour pour le joueur connecté. */
export interface StatutBoosters {
  /** Nombre de boosters autorisés par jour. */
  parJour: number;
  /** Boosters déjà ouverts aujourd'hui. */
  utilises: number;
  /** Boosters encore ouvrables aujourd'hui. */
  restants: number;
  /** Secondes avant la remise à zéro (minuit, heure de Paris). */
  secondesAvantReset: number;
}

/** Réponse brute de `get_booster_status()`. */
export interface LigneStatut {
  per_day: number;
  used: number;
  remaining: number;
  seconds_until_reset: number;
}

/** Transforme la réponse de `get_booster_status()`. */
export function statutDepuisLigne(ligne: LigneStatut): StatutBoosters {
  return {
    parJour: ligne.per_day,
    utilises: ligne.used,
    restants: ligne.remaining,
    secondesAvantReset: ligne.seconds_until_reset,
  };
}

/** Une carte tirée, telle que la renvoie `open_booster()`. */
export interface CarteTireeBrute {
  card_id: string;
  name: string;
  rarity: Rarity;
  variant: Variant | null;
  /** Ancien champ (avant la V0.1.5), plus utilisé. */
  effect?: string;
  /** Effet imposé : vide = automatique. Absent si le serveur n'est pas à jour. */
  effect_override?: string;
  effect_params?: unknown;
  image_path: string;
  thumb_path: string | null;
  is_new: boolean;
  quantity: number;
}

/** Réponse brute de `open_booster()`. */
export interface OuvertureBrute {
  cards: CarteTireeBrute[];
  remaining: number;
}

/** Résultat d'une ouverture, prêt pour l'écran de révélation. */
export interface ResultatOuverture {
  /** Cartes tirées, dans l'ordre de révélation. */
  cartes: CarteTiree[];
  /** Boosters qu'il reste à ouvrir aujourd'hui. */
  restants: number;
}

/** Chemins d'images (principales et miniatures) à signer, sans doublon. */
export function cheminsOuverture(brut: OuvertureBrute): string[] {
  const chemins = new Set<string>();
  for (const carte of brut.cards) {
    chemins.add(carte.image_path);
    if (carte.thumb_path) chemins.add(carte.thumb_path);
  }
  return [...chemins];
}

/**
 * Transforme la réponse de `open_booster()` en résultat d'ouverture.
 *
 * @param brut - Réponse du serveur.
 * @param adresses - Adresses d'images signées, par chemin.
 */
export function ouvertureDepuisJson(
  brut: OuvertureBrute,
  adresses: ReadonlyMap<string, string>,
): ResultatOuverture {
  const cartes = brut.cards.map((c): CarteTiree => {
    const carte: CarteTiree = {
      id: c.card_id,
      name: c.name,
      rarity: c.rarity,
      effect: c.effect_override ?? '',
      nouvelle: c.is_new,
      quantite: c.quantity,
    };
    if (c.variant) carte.variant = c.variant;
    const params = paramsDepuisJson(c.effect_params);
    if (Object.keys(params).length > 0) carte.effectParams = params;
    const image = adresses.get(c.image_path);
    if (image) carte.imageUrl = image;
    const miniature = c.thumb_path ? adresses.get(c.thumb_path) : undefined;
    if (miniature) carte.thumbUrl = miniature;
    return carte;
  });
  return { cartes, restants: brut.remaining };
}
