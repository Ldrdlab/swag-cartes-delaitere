/**
 * Tremblement progressif d'un élément (carte légendaire pendant l'attente).
 *
 * Rôle : lance, tant que `actif` est vrai, une animation dont les 21 images-clés sont GÉNÉRÉES par
 * domain/tremblement (et non écrites à la main) : l'amplitude, la rotation et l'échelle augmentent
 * jusqu'à la fin. Utilise l'API Web Animations et uniquement `transform`.
 * ATTENTION : l'élément qui reçoit `ref` ne doit PAS être celui qui pivote (voir Carte3D).
 * Expose : useTremblement().
 * Dépend de : react, domain/tremblement, config/revelation.
 */
import { useEffect, type RefObject } from 'react';
import { TREMBLEMENT } from '../config/revelation';
import { genererImagesClesTremblement, transformTremblement } from '../domain/tremblement';

/**
 * Fait trembler l'élément pendant `dureeMs`.
 *
 * @param ref - Élément à faire trembler.
 * @param actif - Vrai pendant l'attente ; l'animation est annulée dès que ça redevient faux.
 * @param dureeMs - Durée du tremblement (ms).
 */
export function useTremblement(
  ref: RefObject<HTMLElement | null>,
  actif: boolean,
  dureeMs: number,
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element || !actif || typeof element.animate !== 'function') return;
    const imagesCles = genererImagesClesTremblement(TREMBLEMENT).map((image) => ({
      offset: image.offset,
      transform: transformTremblement(image),
    }));
    const animation = element.animate(imagesCles, {
      duration: dureeMs,
      easing: 'linear',
      fill: 'forwards',
    });
    return () => animation.cancel();
  }, [ref, actif, dureeMs]);
}
