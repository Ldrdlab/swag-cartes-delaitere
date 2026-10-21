/**
 * Réglages du profil joueur.
 *
 * Rôle : centraliser les contraintes du pseudonyme et la clé de sauvegarde locale.
 * Expose : PSEUDO_MIN_LENGTH, PSEUDO_MAX_LENGTH, PLAYER_STORAGE_KEY.
 * Dépend de : rien. Pour changer la longueur autorisée du pseudo, modifier ce fichier.
 */

/** Nombre minimal de caractères du pseudonyme (après suppression des espaces de début/fin). */
export const PSEUDO_MIN_LENGTH = 2;

/** Nombre maximal de caractères du pseudonyme. */
export const PSEUDO_MAX_LENGTH = 16;

/** Clé sous laquelle le profil est sauvegardé dans le navigateur (localStorage). */
export const PLAYER_STORAGE_KEY = 'booster-opening:player';
