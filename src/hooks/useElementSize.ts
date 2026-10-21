/**
 * Mesure la taille d'un élément et la suit quand elle change.
 *
 * Rôle : savoir quelle place est disponible (ex. pour adapter un booster à son conteneur). La mesure
 * se fait AVANT le premier affichage (useLayoutEffect) pour éviter un clignotement. On lit la taille
 * « de mise en page » (offsetWidth/Height) : elle ne change pas quand l'élément est agrandi ou réduit
 * par un `transform`.
 * Expose : useElementSize().
 * Dépend de : react.
 */
import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Suit la taille d'un élément.
 *
 * @returns `ref` à poser sur l'élément, puis sa `width` et sa `height` en pixels (0 avant la mesure).
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const mesurer = () => {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      setSize((actuelle) =>
        actuelle.width === width && actuelle.height === height ? actuelle : { width, height },
      );
    };
    mesurer();
    const observateur = new ResizeObserver(mesurer);
    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  return { ref, ...size };
}
