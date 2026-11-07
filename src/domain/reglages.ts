/**
 * Logique pure des réglages de booster.
 *
 * Rôle : calculer le total des probabilités et vérifier que les réglages saisis sont acceptables
 * (nombre de cartes, boosters par jour, probabilités positives dont le total fait exactement 100).
 * Les bornes sont passées en paramètres : elles viennent de config/reglages.ts.
 * Expose : ReglagesJeu, LimitesReglages, ErreurReglage, lireNombreSaisi(), totalProbabilites(),
 * verifierReglages().
 * Dépend de : domain/types. Aucun import React ni DOM.
 */
import { RARITIES, type Rarity } from './types';

/** Réglages du jeu modifiables par l'admin. */
export interface ReglagesJeu {
  /** Nombre de cartes dans un booster. */
  cartesParBooster: number;
  /** Nombre de boosters ouvrables par joueur et par jour. */
  boostersParJour: number;
  /** Probabilité de chaque rareté, en %. */
  probabilites: Record<Rarity, number>;
}

/** Bornes acceptées. */
export interface LimitesReglages {
  cartesParBooster: { min: number; max: number };
  boostersParJour: { min: number; max: number };
  decimalesProbabilite: number;
  totalProbabilites: number;
}

/** Problèmes possibles (le texte affiché dépend de l'écran). */
export type ErreurReglage =
  'cartes_invalides' | 'boosters_invalides' | 'probabilite_invalide' | 'total_incorrect';

/**
 * Lit un nombre tapé dans un champ : la virgule française est acceptée (`0,6` = `0.6`).
 *
 * @returns Le nombre, ou `NaN` si le texte est vide ou n'est pas un nombre positif.
 */
export function lireNombreSaisi(texte: string): number {
  const propre = texte.trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(propre) ? Number(propre) : Number.NaN;
}

/** Un nombre est « entier relatif aux décimales près » : 0.6 → 60 centièmes, évite les erreurs d'arrondi. */
function enCentiemes(valeur: number, decimales: number): number {
  return Math.round(valeur * 10 ** decimales);
}

/**
 * Total des probabilités, en %, sans erreur d'arrondi (0.1 + 0.2 donne bien 0.3).
 *
 * @param probabilites - Probabilité de chaque rareté.
 * @param decimales - Nombre maximal de décimales d'une probabilité.
 */
export function totalProbabilites(
  probabilites: Readonly<Record<Rarity, number>>,
  decimales: number,
): number {
  const total = RARITIES.reduce((somme, r) => somme + enCentiemes(probabilites[r], decimales), 0);
  return total / 10 ** decimales;
}

/** Nombre entier compris entre deux bornes ? */
function entierDans(valeur: number, bornes: { min: number; max: number }): boolean {
  return Number.isInteger(valeur) && valeur >= bornes.min && valeur <= bornes.max;
}

/**
 * Vérifie des réglages saisis.
 *
 * @returns Les erreurs trouvées (liste vide = tout est valide). `probabilite_invalide` est renvoyée au
 * plus une fois ; `total_incorrect` seulement si chaque probabilité est valable par elle-même.
 */
export function verifierReglages(reglages: ReglagesJeu, limites: LimitesReglages): ErreurReglage[] {
  const erreurs: ErreurReglage[] = [];
  if (!entierDans(reglages.cartesParBooster, limites.cartesParBooster)) {
    erreurs.push('cartes_invalides');
  }
  if (!entierDans(reglages.boostersParJour, limites.boostersParJour)) {
    erreurs.push('boosters_invalides');
  }

  const decimales = limites.decimalesProbabilite;
  const toutesValables = RARITIES.every((r) => {
    const p = reglages.probabilites[r];
    return (
      Number.isFinite(p) &&
      p >= 0 &&
      p <= limites.totalProbabilites &&
      Math.abs(p * 10 ** decimales - enCentiemes(p, decimales)) < 1e-6
    );
  });
  if (!toutesValables) {
    erreurs.push('probabilite_invalide');
  } else if (
    enCentiemes(totalProbabilites(reglages.probabilites, decimales), decimales) !==
    enCentiemes(limites.totalProbabilites, decimales)
  ) {
    erreurs.push('total_incorrect');
  }
  return erreurs;
}
