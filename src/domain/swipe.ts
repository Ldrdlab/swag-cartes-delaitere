/**
 * Classification d'un geste « glisser » (tap, swipe, ou rien).
 *
 * Rôle : décider, à partir du déplacement total et de la durée d'un geste, s'il s'agit d'un tap,
 * d'un swipe horizontal valide, ou d'un geste à ignorer (trop court, trop lent, trop vertical).
 * C'est ce qui garantit qu'un swipe ne déclenche jamais une sélection par erreur.
 * Expose : SwipeThresholds, GestureSample, GestureKind, classifyGesture().
 * Dépend de : rien (logique pure). Les seuils viennent de config/gestures.ts.
 */

/** Seuils de reconnaissance (valeurs réelles dans config/gestures.ts). */
export interface SwipeThresholds {
  /** Déplacement maximal (px) pour qu'un geste compte encore comme un tap. */
  tapMaxDistancePx: number;
  /** Durée maximale (ms) d'un tap. */
  tapMaxDurationMs: number;
  /** Déplacement horizontal minimal (px) d'un swipe. */
  swipeMinDistancePx: number;
  /** Vitesse minimale (px par ms) d'un swipe : en dessous, le geste est trop lent. */
  swipeMinVelocityPxPerMs: number;
}

/** Mesure d'un geste terminé. */
export interface GestureSample {
  /** Déplacement horizontal total (px, négatif vers la gauche). */
  deltaX: number;
  /** Déplacement vertical total (px). */
  deltaY: number;
  /** Durée du geste (ms). */
  durationMs: number;
}

/** Résultat de la classification. `none` = geste annulé, aucune action. */
export type GestureKind = 'tap' | 'swipe-left' | 'swipe-right' | 'none';

/**
 * Classe un geste terminé.
 *
 * - tap : très peu de mouvement ET geste bref ;
 * - swipe : assez long, plus horizontal que vertical, et assez rapide ;
 * - sinon `none` (le composant revient à sa position initiale).
 *
 * @param sample - Déplacement et durée du geste.
 * @param thresholds - Seuils de reconnaissance.
 * @returns La nature du geste.
 */
export function classifyGesture(sample: GestureSample, thresholds: SwipeThresholds): GestureKind {
  const distance = Math.hypot(sample.deltaX, sample.deltaY);
  if (distance < thresholds.tapMaxDistancePx) {
    return sample.durationMs <= thresholds.tapMaxDurationMs ? 'tap' : 'none';
  }

  const horizontalDistance = Math.abs(sample.deltaX);
  const isHorizontal = horizontalDistance > Math.abs(sample.deltaY);
  const velocity = horizontalDistance / Math.max(sample.durationMs, 1);
  const isLongEnough = horizontalDistance >= thresholds.swipeMinDistancePx;
  const isFastEnough = velocity >= thresholds.swipeMinVelocityPxPerMs;

  if (isHorizontal && isLongEnough && isFastEnough) {
    return sample.deltaX < 0 ? 'swipe-left' : 'swipe-right';
  }
  return 'none';
}
