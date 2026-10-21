/**
 * Durées des animations.
 *
 * Rôle : centraliser les durées (en millisecondes) pour pouvoir les ajuster au même endroit.
 * Expose : CAROUSEL_TRANSITION_MS, CUT_DETACH_MS, STACK_TRANSITION_MS, AVATAR_PICKER_OPEN_MS, FOIL_BALAYAGE_MS.
 * Dépend de : rien.
 */

/** Durée de la rotation du carrousel de boosters (ms). */
export const CAROUSEL_TRANSITION_MS = 450;

/** Durée de l'animation du haut du booster qui se détache après la découpe (ms). L'écran suivant arrive juste après. */
export const CUT_DETACH_MS = 600;

/** Durée du mouvement des cartes de la pile pendant la révélation (ms). */
export const STACK_TRANSITION_MS = 200;

/** Durée de l'animation d'ouverture de la fenêtre de choix d'avatar (montée + fondu, ms). */
export const AVATAR_PICKER_OPEN_MS = 280;

/** Durée d'un balayage de reflet holographique sur un booster (ms). */
export const FOIL_BALAYAGE_MS = 3800;
