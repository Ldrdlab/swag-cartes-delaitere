/**
 * Calcul de la taille d'un booster dans une place donnée.
 *
 * Rôle : trouver la plus grande taille qui tient dans la place disponible SANS déformer le booster
 * (rapport 172 : 320). Indispensable sur l'écran d'ouverture : le haut et le corps sont dessinés
 * séparément et ne se rejoignent exactement que si le rapport est respecté.
 * Expose : TailleBooster, ajusterBooster().
 * Dépend de : config/boosters.
 */
import { HAUTEUR_REFERENCE, LARGEUR_REFERENCE } from '../config/boosters';

/** Taille d'un booster en pixels. */
export interface TailleBooster {
  largeur: number;
  hauteur: number;
}

/**
 * Plus grande taille de booster qui tient dans la place disponible, proportions respectées.
 *
 * @param largeurDisponible - Largeur disponible en pixels.
 * @param hauteurDisponible - Hauteur disponible en pixels.
 * @returns La taille du booster (0 × 0 si la place n'est pas encore connue).
 */
export function ajusterBooster(
  largeurDisponible: number,
  hauteurDisponible: number,
): TailleBooster {
  if (largeurDisponible <= 0 || hauteurDisponible <= 0) return { largeur: 0, hauteur: 0 };
  const rapport = HAUTEUR_REFERENCE / LARGEUR_REFERENCE;
  const largeur = Math.min(largeurDisponible, hauteurDisponible / rapport);
  return { largeur, hauteur: largeur * rapport };
}
