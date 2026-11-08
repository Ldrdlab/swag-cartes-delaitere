/**
 * Noms des variables CSS où est écrite la position du reflet.
 *
 * Rôle : petit fichier à part, pour que le suivi du pointeur (chargé tout de suite) ne tire pas avec lui
 * les briques des effets (chargées seulement quand un effet est affiché).
 * Expose : POINTEUR_X, POINTEUR_Y. Dépend de : rien.
 */

/** Position horizontale (0 à 1) du reflet, écrite sur la racine de l'effet. */
export const POINTEUR_X = '--effet-x';
/** Position verticale (0 à 1) du reflet. */
export const POINTEUR_Y = '--effet-y';
