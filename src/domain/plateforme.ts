/**
 * Détection de la plateforme (pour la page « Installer l'appli »).
 *
 * Rôle : deviner, d'après l'identifiant du navigateur, si l'on est sur iPhone/iPad, sur Android ou sur
 * ordinateur, afin de mettre en avant les bonnes explications d'installation.
 * Expose : Plateforme, detecterPlateforme().
 * Dépend de : rien. Aucun import React ni DOM (l'identifiant est passé en paramètre).
 */

/** Plateforme de l'appareil. */
export type Plateforme = 'ios' | 'android' | 'bureau';

/**
 * Devine la plateforme.
 *
 * @param userAgent - Identifiant du navigateur (`navigator.userAgent`).
 * @param pointsDeContact - Nombre de points de contact tactiles (`navigator.maxTouchPoints`) : sert à
 * reconnaître un iPad récent, qui se présente comme un Mac.
 */
export function detecterPlateforme(userAgent: string, pointsDeContact = 0): Plateforme {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Macintosh/i.test(userAgent) && pointsDeContact > 1) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'bureau';
}
