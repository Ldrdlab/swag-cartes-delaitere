/**
 * Détection de swipe et de tap avec les Pointer Events (souris, doigt et stylet).
 *
 * Rôle : suivre un geste sur une zone, exposer le décalage horizontal en cours (pour que l'élément
 * « suive le doigt ») et appeler `onSwipe` / `onTap` à la fin. La décision (tap, swipe valide ou
 * geste à ignorer) est prise par la fonction pure `classifyGesture`.
 * La zone qui reçoit les `handlers` doit avoir `touch-action: none` en CSS.
 * Expose : useSwipe(), SwipeDirection.
 * Dépend de : react, domain/swipe, config/gestures.
 */
import { useRef, useState, type PointerEvent } from 'react';
import { SWIPE_THRESHOLDS } from '../config/gestures';
import { classifyGesture } from '../domain/swipe';

/** Direction d'un swipe : `left` = le doigt va vers la gauche. */
export type SwipeDirection = 'left' | 'right';

interface UseSwipeOptions {
  /** Appelé quand un swipe valide se termine. */
  onSwipe: (direction: SwipeDirection) => void;
  /** Appelé pour un tap, avec l'élément touché au départ du geste. */
  onTap?: (target: EventTarget | null) => void;
  /** Appelé une fois, quand le pointeur a assez bougé pour que le glissement commence. */
  onDragStart?: () => void;
}

/** Données du geste en cours (dans une ref : pas besoin de re-rendu à chaque mouvement). */
interface ActiveGesture {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  startTarget: EventTarget | null;
  isDragging: boolean;
}

/**
 * Branche la détection de swipe/tap sur une zone.
 *
 * @param options - Callbacks `onSwipe`, `onTap`, `onDragStart`.
 * @returns `handlers` à étaler sur la zone, `dragOffsetPx` (décalage en cours) et `isDragging`.
 */
export function useSwipe({ onSwipe, onTap, onDragStart }: UseSwipeOptions) {
  const gestureRef = useRef<ActiveGesture | null>(null);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const endGesture = () => {
    gestureRef.current = null;
    setDragOffsetPx(0);
    setIsDragging(false);
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    // Un seul pointeur à la fois (un 2e doigt est ignoré) ; avec la souris, seulement le bouton principal.
    // Si le même pointeur réappuie, l'ancien geste n'avait jamais reçu sa fin : on repart de zéro.
    if (gestureRef.current && gestureRef.current.pointerId !== event.pointerId) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // La capture garde les événements même si le pointeur sort de la zone pendant le geste.
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: event.timeStamp,
      startTarget: event.target,
      isDragging: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - gesture.startX;
    if (!gesture.isDragging && Math.abs(deltaX) >= SWIPE_THRESHOLDS.tapMaxDistancePx) {
      gesture.isDragging = true;
      setIsDragging(true);
      onDragStart?.();
    }
    if (gesture.isDragging) setDragOffsetPx(deltaX);
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const kind = classifyGesture(
      {
        deltaX: event.clientX - gesture.startX,
        deltaY: event.clientY - gesture.startY,
        durationMs: event.timeStamp - gesture.startTime,
      },
      SWIPE_THRESHOLDS,
    );
    const { startTarget } = gesture;
    endGesture();
    if (kind === 'tap') onTap?.(startTarget);
    else if (kind === 'swipe-left') onSwipe('left');
    else if (kind === 'swipe-right') onSwipe('right');
    // kind === 'none' : geste trop court, trop lent ou trop vertical → retour à la position initiale.
  };

  // Geste interrompu par le système (appel entrant, etc.) ou capture perdue : on annule sans rien déclencher.
  // (Après un pointerup normal, le geste est déjà terminé : ces appels ne font alors rien.)
  const onPointerCancel = (event: PointerEvent<HTMLElement>) => {
    if (gestureRef.current?.pointerId === event.pointerId) endGesture();
  };

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture: onPointerCancel,
    },
    dragOffsetPx,
    isDragging,
  };
}
