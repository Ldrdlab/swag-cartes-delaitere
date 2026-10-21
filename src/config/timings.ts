/**
 * Durées des animations.
 *
 * Rôle : centraliser les durées (en millisecondes) pour pouvoir les ajuster au même endroit.
 * Expose : CAROUSEL_TRANSITION_MS, CUT_DETACH_MS, STACK_TRANSITION_MS.
 * Dépend de : rien.
 */

/** Durée de la rotation du carrousel de boosters (ms). */
export const CAROUSEL_TRANSITION_MS = 300;

/** Durée de l'animation du haut du booster qui se détache après la découpe (ms). L'écran suivant arrive juste après. */
export const CUT_DETACH_MS = 600;

/** Durée du mouvement des cartes de la pile pendant la révélation (ms). */
export const STACK_TRANSITION_MS = 200;
