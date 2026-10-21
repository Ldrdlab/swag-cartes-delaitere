/**
 * Geste de découpe avec les Pointer Events (souris, doigt et stylet).
 *
 * Rôle : traduire les événements du pointeur en appels à la logique pure de `domain/cutGesture`,
 * exposer la trace à dessiner en temps réel et prévenir quand la découpe démarre, avance ou aboutit.
 * L'élément qui reçoit les `handlers` doit avoir `touch-action: none` en CSS (aucun scroll ni zoom
 * de la page pendant le geste).
 * Expose : useCutGesture().
 * Dépend de : react, domain/cutGesture, config/gestures, hooks/cutFeedback (type).
 */
import { useRef, useState, type PointerEvent } from 'react';
import { CUT_THRESHOLDS } from '../config/gestures';
import {
  endCut,
  IDLE_CUT,
  moveCut,
  startCut,
  type CutState,
  type Point,
  type Size,
} from '../domain/cutGesture';
import type { CutFeedback } from './cutFeedback';

interface UseCutGestureOptions extends CutFeedback {
  /** Désactive le geste (ex. une fois le booster ouvert). */
  disabled?: boolean;
}

/** Position du pointeur et taille du booster, relatives au coin haut-gauche de l'élément. */
function measure(event: PointerEvent<HTMLElement>): { point: Point; size: Size } {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    point: { x: event.clientX - rect.left, y: event.clientY - rect.top },
    size: { width: rect.width, height: rect.height },
  };
}

/**
 * Branche le geste de découpe sur l'élément du booster.
 *
 * @param options - `onCutStart`, `onCutProgress`, `onCutComplete` (points d'accroche son/vibration)
 *   et `disabled`.
 * @returns `handlers` à étaler sur l'élément, `trail` (points de la trace, vide hors geste) et
 *   `isCutting`.
 */
export function useCutGesture({
  disabled = false,
  onCutStart,
  onCutProgress,
  onCutComplete,
}: UseCutGestureOptions) {
  const [cut, setCut] = useState<CutState>(IDLE_CUT);
  // Copie synchrone de l'état : plusieurs événements peuvent arriver avant le prochain rendu.
  const cutRef = useRef<CutState>(IDLE_CUT);
  const pointerIdRef = useRef<number | null>(null);

  const update = (next: CutState) => {
    cutRef.current = next;
    setCut(next);
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (disabled || pointerIdRef.current !== null) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerIdRef.current = event.pointerId;

    const { point, size } = measure(event);
    const next = startCut(point, size, CUT_THRESHOLDS);
    update(next);
    if (next.status === 'cutting') onCutStart();
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerId !== pointerIdRef.current || cutRef.current.status !== 'cutting') return;

    const { point, size } = measure(event);
    const next = moveCut(cutRef.current, point, size, CUT_THRESHOLDS);
    update(next);
    if (next.status === 'cutting') onCutProgress(next.progress);
    else if (next.status === 'completed') onCutComplete();
  };

  // Pointeur relâché ou geste interrompu : une découpe inachevée est annulée et la trace s'efface.
  const finish = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerId !== pointerIdRef.current) return;
    pointerIdRef.current = null;
    const ended = endCut(cutRef.current);
    update(ended.status === 'completed' ? ended : IDLE_CUT);
  };

  const trail = cut.status === 'cutting' || cut.status === 'completed' ? cut.trail : [];

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
      onLostPointerCapture: finish,
    },
    trail,
    isCutting: cut.status === 'cutting',
  };
}
