/**
 * Points d'accroche pour le son et la vibration pendant la découpe.
 *
 * Rôle : réserver l'emplacement du retour sensoriel (itération ultérieure). Les trois fonctions sont
 * volontairement VIDES : rien n'est implémenté pour l'instant.
 * Expose : CutFeedback, cutFeedback.
 * Dépend de : rien. Utilisé par screens/BoosterOpening.
 */

/** Fonctions appelées aux grandes étapes de la découpe. */
export interface CutFeedback {
  /** La découpe démarre (premier contact valide). */
  onCutStart: () => void;
  /** La découpe avance ; `progress` va de 0 à 1. */
  onCutProgress: (progress: number) => void;
  /** La découpe est validée (le haut du booster se détache). */
  onCutComplete: () => void;
}

export const cutFeedback: CutFeedback = {
  onCutStart: () => {
    // TODO: son et vibration au début de la découpe (itération ultérieure).
  },
  onCutProgress: () => {
    // TODO: son continu / vibration légère selon la progression (itération ultérieure).
  },
  onCutComplete: () => {
    // TODO: son et vibration à l'ouverture du booster (itération ultérieure).
  },
};
