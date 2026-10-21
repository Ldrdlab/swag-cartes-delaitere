/**
 * Seuils des gestes tactiles / souris.
 *
 * Rôle : centraliser les réglages de reconnaissance des gestes (tap, swipe, découpe du booster).
 * Expose : SWIPE_THRESHOLDS, CUT_THRESHOLDS.
 * Dépend de : domain/swipe et domain/cutGesture (types uniquement). Pour rendre les gestes plus ou
 * moins sensibles, modifier les valeurs de ce fichier.
 */
import type { CutThresholds } from '../domain/cutGesture';
import type { SwipeThresholds } from '../domain/swipe';

export const SWIPE_THRESHOLDS: SwipeThresholds = {
  /** Au-delà de ce déplacement (px), le geste n'est plus un tap (et le glissement visuel démarre). */
  tapMaxDistancePx: 10,
  /** Un appui plus long que cette durée (ms) n'est pas un tap. */
  tapMaxDurationMs: 500,
  /** Distance horizontale minimale (px) pour valider un swipe. */
  swipeMinDistancePx: 40,
  /** Vitesse minimale (px/ms) pour valider un swipe : 0,15 = 150 px par seconde. */
  swipeMinVelocityPxPerMs: 0.15,
};

export const CUT_THRESHOLDS: CutThresholds = {
  /** Position de la ligne de découpe : 18 % de la hauteur du booster en partant du haut. */
  cutLineYRatio: 0.18,
  /** Tolérance verticale autour de la ligne : ± 7 % de la hauteur du booster. */
  bandToleranceRatio: 0.07,
  /** Le geste doit démarrer à moins de 20 % de la largeur d'un bord latéral. */
  startEdgeRatio: 0.2,
  /** La découpe est validée après 80 % de la largeur parcourue. */
  completionRatio: 0.8,
};
