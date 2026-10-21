/**
 * Détection du geste de découpe du booster (fonctions pures).
 *
 * Rôle : décider si l'utilisateur a bien « coupé » le haut du paquet. Règles :
 *   1. le geste commence près d'un bord latéral, dans la bande de découpe ;
 *   2. le pointeur reste dans la bande verticale de découpe (tolérance configurable) ;
 *   3. la découpe est validée quand la distance parcourue vers l'autre bord atteint le seuil
 *      (ex. 80 % de la largeur) ;
 *   4. sortie de la bande ou relâchement trop tôt : découpe annulée (la trace doit s'effacer).
 * Le sens est libre : on peut couper de gauche à droite ou de droite à gauche.
 *
 * Les coordonnées sont relatives au coin haut-gauche du booster (en pixels).
 * Expose : Point, Size, CutThresholds, CutState, CancelReason, IDLE_CUT, startCut(), moveCut(), endCut().
 * Dépend de : rien (aucun import React ni DOM). Les seuils viennent de config/gestures.ts.
 */

/** Position en pixels, relative au coin haut-gauche du booster. */
export interface Point {
  x: number;
  y: number;
}

/** Dimensions du booster en pixels. */
export interface Size {
  width: number;
  height: number;
}

/** Seuils de la découpe, exprimés en proportion du booster (valeurs réelles dans config/gestures.ts). */
export interface CutThresholds {
  /** Hauteur de la ligne de découpe, en proportion de la hauteur du booster (0 = haut, 1 = bas). */
  cutLineYRatio: number;
  /** Tolérance verticale de part et d'autre de la ligne, en proportion de la hauteur du booster. */
  bandToleranceRatio: number;
  /** Le geste doit démarrer à moins de cette proportion de la largeur d'un bord latéral. */
  startEdgeRatio: number;
  /** Proportion de la largeur à parcourir (depuis le départ) pour valider la découpe. */
  completionRatio: number;
}

/** Pourquoi une découpe a été annulée. */
export type CancelReason = 'bad-start' | 'left-band' | 'released-early';

/** État d'une découpe. */
export type CutState =
  | { status: 'idle' }
  | {
      status: 'cutting';
      /** +1 si le geste part du bord gauche (va vers la droite), -1 s'il part du bord droit. */
      direction: 1 | -1;
      startX: number;
      /** Progression de 0 à 1 (1 = distance requise atteinte). */
      progress: number;
      /** Points parcourus, pour dessiner la trace. */
      trail: readonly Point[];
    }
  | { status: 'completed'; trail: readonly Point[] }
  | { status: 'cancelled'; reason: CancelReason };

/** État de repos : aucune découpe en cours. */
export const IDLE_CUT: CutState = { status: 'idle' };

/** Vrai si le point est dans la bande verticale de découpe. */
function isInBand(point: Point, size: Size, thresholds: CutThresholds): boolean {
  const lineY = thresholds.cutLineYRatio * size.height;
  const tolerance = thresholds.bandToleranceRatio * size.height;
  return Math.abs(point.y - lineY) <= tolerance;
}

/**
 * Démarre une découpe au premier contact.
 *
 * @param point - Position du pointeur, relative au booster.
 * @param size - Dimensions du booster.
 * @param thresholds - Seuils de découpe.
 * @returns `cutting` si le départ est valide (près d'un bord, dans la bande), sinon `cancelled`.
 */
export function startCut(point: Point, size: Size, thresholds: CutThresholds): CutState {
  const edgeDistance = thresholds.startEdgeRatio * size.width;
  const nearLeft = point.x <= edgeDistance;
  const nearRight = point.x >= size.width - edgeDistance;

  if (!isInBand(point, size, thresholds) || (!nearLeft && !nearRight)) {
    return { status: 'cancelled', reason: 'bad-start' };
  }
  return {
    status: 'cutting',
    direction: nearLeft ? 1 : -1,
    startX: point.x,
    progress: 0,
    trail: [point],
  };
}

/**
 * Fait avancer la découpe quand le pointeur bouge. Sans effet si aucune découpe n'est en cours.
 *
 * @param state - État courant.
 * @param point - Nouvelle position du pointeur, relative au booster.
 * @param size - Dimensions du booster.
 * @param thresholds - Seuils de découpe.
 * @returns `cancelled` si le pointeur sort de la bande, `completed` si la distance requise est
 *   atteinte, sinon `cutting` avec la progression mise à jour.
 */
export function moveCut(
  state: CutState,
  point: Point,
  size: Size,
  thresholds: CutThresholds,
): CutState {
  if (state.status !== 'cutting') return state;
  if (!isInBand(point, size, thresholds)) {
    return { status: 'cancelled', reason: 'left-band' };
  }

  const trail = [...state.trail, point];
  // Distance parcourue vers l'autre bord ; reculer ne fait jamais avancer la progression.
  const travelled = (point.x - state.startX) * state.direction;
  const progress = Math.min(Math.max(travelled / size.width / thresholds.completionRatio, 0), 1);

  if (progress >= 1) return { status: 'completed', trail };
  return { ...state, progress, trail };
}

/**
 * Termine le geste (pointeur relâché ou geste interrompu).
 *
 * @param state - État courant.
 * @returns `cancelled` (relâché trop tôt) si la découpe était en cours ; sinon l'état inchangé.
 */
export function endCut(state: CutState): CutState {
  if (state.status === 'cutting') return { status: 'cancelled', reason: 'released-early' };
  return state;
}
