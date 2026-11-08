/**
 * Mise en pause des effets quand on ne les voit pas.
 *
 * Rôle : un effet animé ne travaille que s'il est à l'écran (IntersectionObserver) et que la page est
 * visible. La racine de l'effet porte alors `data-actif`, et les règles de EffetCarte.module.css
 * suspendent ses animations CSS ; le dessin WebGL reçoit `fige` et arrête sa boucle.
 * Expose : useActivite().
 * Dépend de : react, hooks/usePageVisible.
 */
import { useEffect, useState } from 'react';
import { usePageVisible } from '../../hooks/usePageVisible';

/** Vrai si l'élément est visible à l'écran et la page affichée. */
export function useActivite(element: Element | null): boolean {
  const [surEcran, setSurEcran] = useState(true);
  const pageVisible = usePageVisible();
  useEffect(() => {
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;
    const observateur = new IntersectionObserver((entrees) => {
      const derniere = entrees[entrees.length - 1];
      if (derniere) setSurEcran(derniere.isIntersecting);
    });
    observateur.observe(element);
    return () => observateur.disconnect();
  }, [element]);
  return surEcran && pageVisible;
}
