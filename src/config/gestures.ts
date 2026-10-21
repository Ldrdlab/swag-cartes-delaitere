/**
 * Seuils des gestes tactiles / souris.
 *
 * Rôle : centraliser les réglages de reconnaissance des gestes (tap, swipe).
 * Expose : SWIPE_THRESHOLDS.
 * Dépend de : domain/swipe (type uniquement). Pour rendre les gestes plus ou moins sensibles,
 * modifier les valeurs de ce fichier.
 */
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
