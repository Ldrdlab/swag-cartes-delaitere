/**
 * État d'un carrousel circulaire.
 *
 * Rôle : mémoriser quel élément est au centre (et lequel l'était juste avant, pour animer correctement
 * l'élément qui « boucle » d'un bord à l'autre) et fournir les actions de rotation.
 * Expose : useCarousel(), CarouselControls.
 * Dépend de : react, domain/carousel.
 */
import { useCallback, useState } from 'react';
import { stepIndex, wrapIndex } from '../domain/carousel';

/** État et actions d'un carrousel (renvoyé par useCarousel). */
export interface CarouselControls {
  /** Index de l'élément au centre. */
  index: number;
  /** Index de l'élément qui était au centre avant la dernière rotation. */
  previousIndex: number;
  /** Tourne de `delta` crans (+1 = élément suivant vers le centre, -1 = précédent). */
  rotateBy: (delta: number) => void;
  /** Amène directement l'élément `targetIndex` au centre. */
  rotateTo: (targetIndex: number) => void;
  /** Oublie la rotation précédente (à appeler quand un nouveau glissement commence). */
  settle: () => void;
}

/**
 * Gère l'élément central d'un carrousel qui boucle.
 *
 * @param count - Nombre d'éléments (> 0).
 * @param initialIndex - Élément central au départ (ramené dans la liste si besoin).
 * @returns L'état et les actions de rotation.
 */
export function useCarousel(count: number, initialIndex = 0): CarouselControls {
  const [position, setPosition] = useState(() => {
    const start = wrapIndex(initialIndex, count);
    return { index: start, previousIndex: start };
  });

  const rotateBy = useCallback(
    (delta: number) =>
      setPosition((current) => ({
        previousIndex: current.index,
        index: stepIndex(current.index, delta, count),
      })),
    [count],
  );

  const rotateTo = useCallback(
    (targetIndex: number) =>
      setPosition((current) => ({
        previousIndex: current.index,
        index: wrapIndex(targetIndex, count),
      })),
    [count],
  );

  const settle = useCallback(
    () =>
      setPosition((current) =>
        current.previousIndex === current.index
          ? current
          : { ...current, previousIndex: current.index },
      ),
    [],
  );

  return { ...position, rotateBy, rotateTo, settle };
}
