/**
 * Machine à états de la révélation des cartes (fonctions pures, sans React).
 *
 * Rôle : décrire la séquence d'une carte, puis le passage à la suivante :
 *
 *   DOS ──toucher──▶ RETOURNE ──fin──▶ FACE ──« Suivant »──▶ DOS (carte suivante) … ──▶ BILAN
 *    └─ si la rareté a un tease ─▶ TREMBLE ──fin──▶ RETOURNE
 *   « Passer » : depuis n'importe quel état ──▶ BILAN
 *
 * Les minuteries (fins de TREMBLE et de RETOURNE) sont gérées par le hook useRevealSequence ; ici on
 * ne fait que calculer l'état suivant. Contient aussi le mode développeur `?forcer=<rareté>`.
 * Expose : EtapeRevelation, EtatRevelation, EvenementRevelation, demarrerRevelation(),
 * reduireRevelation(), estDerniereCarte(), lireForcage(), appliquerForcage().
 * Dépend de : domain/types. Aucun import React ni DOM.
 */
import { RARITIES, type Card, type Rarity } from './types';

/** Étape de la révélation. */
export type EtapeRevelation = 'DOS' | 'TREMBLE' | 'RETOURNE' | 'FACE' | 'BILAN';

/** État de la révélation. */
export interface EtatRevelation {
  etape: EtapeRevelation;
  /** Position de la carte courante (0 = première). */
  indiceCarte: number;
  /** Nombre de cartes du booster. */
  total: number;
}

/** Événements qui font avancer la révélation. */
export type EvenementRevelation =
  /** Toucher / clic / Entrée / Espace sur la carte. `tease` : sa rareté a une animation d'attente. */
  | { type: 'TOUCHER'; tease: boolean }
  /** L'animation d'attente est terminée. */
  | { type: 'TREMBLE_TERMINE' }
  /** Le retournement est terminé. */
  | { type: 'RETOURNEMENT_TERMINE' }
  /** Bouton « Suivant » (ou « Voir le bilan » après la dernière carte). */
  | { type: 'SUIVANT' }
  /** Bouton « Passer » : directement au bilan. */
  | { type: 'PASSER' };

/**
 * État de départ : première carte face cachée (ou directement le bilan s'il n'y a aucune carte).
 *
 * @param total - Nombre de cartes du booster.
 * @returns L'état initial.
 */
export function demarrerRevelation(total: number): EtatRevelation {
  return { etape: total > 0 ? 'DOS' : 'BILAN', indiceCarte: 0, total };
}

/**
 * Calcule l'état suivant. Un événement qui n'a pas de sens dans l'étape courante est ignoré (le même
 * objet est renvoyé) : par exemple, un toucher pendant TREMBLE ou RETOURNE ne fait rien.
 *
 * @param etat - État courant.
 * @param evenement - Événement reçu.
 * @returns Le nouvel état.
 */
export function reduireRevelation(
  etat: EtatRevelation,
  evenement: EvenementRevelation,
): EtatRevelation {
  switch (evenement.type) {
    case 'TOUCHER':
      if (etat.etape !== 'DOS') return etat;
      return { ...etat, etape: evenement.tease ? 'TREMBLE' : 'RETOURNE' };
    case 'TREMBLE_TERMINE':
      return etat.etape === 'TREMBLE' ? { ...etat, etape: 'RETOURNE' } : etat;
    case 'RETOURNEMENT_TERMINE':
      return etat.etape === 'RETOURNE' ? { ...etat, etape: 'FACE' } : etat;
    case 'SUIVANT':
      if (etat.etape !== 'FACE') return etat;
      return estDerniereCarte(etat)
        ? { ...etat, etape: 'BILAN' }
        : { ...etat, etape: 'DOS', indiceCarte: etat.indiceCarte + 1 };
    case 'PASSER':
      return etat.etape === 'BILAN' ? etat : { ...etat, etape: 'BILAN' };
  }
}

/**
 * Vrai si la carte courante est la dernière du booster.
 *
 * @param etat - État courant.
 * @returns `true` pour la dernière carte.
 */
export function estDerniereCarte(etat: EtatRevelation): boolean {
  return etat.indiceCarte >= etat.total - 1;
}

/**
 * Lit le paramètre d'URL `forcer` (mode développeur), ex. `?forcer=legendaire`.
 *
 * @param recherche - La partie de l'adresse qui suit `?` (ex. `window.location.search`).
 * @returns La rareté demandée, ou `null` si le paramètre est absent ou inconnu.
 */
export function lireForcage(recherche: string): Rarity | null {
  const valeur = new URLSearchParams(recherche).get('forcer');
  if (!valeur) return null;
  const normalisee = valeur
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return RARITIES.find((rarete) => rarete === normalisee) ?? null;
}

/**
 * Mode développeur : fait commencer la révélation par une carte de la rareté demandée.
 * Si la première carte a déjà cette rareté, rien ne change ; sinon elle est remplacée par la première
 * carte du catalogue de cette rareté (s'il y en a une).
 *
 * @param cartes - Cartes tirées.
 * @param rarete - Rareté voulue en première carte.
 * @param catalogue - Toutes les cartes connues.
 * @returns La liste de cartes à révéler.
 */
export function appliquerForcage(
  cartes: readonly Card[],
  rarete: Rarity,
  catalogue: readonly Card[],
): readonly Card[] {
  if (cartes[0]?.rarity === rarete) return cartes;
  const carteForcee = catalogue.find((carte) => carte.rarity === rarete);
  if (!carteForcee) return cartes;
  return [carteForcee, ...cartes.slice(1)];
}
