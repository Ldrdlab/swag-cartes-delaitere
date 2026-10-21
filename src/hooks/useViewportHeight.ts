/**
 * Suivi de la zone réellement visible (clavier virtuel inclus).
 *
 * Rôle : sur mobile, empêcher le clavier virtuel de masquer le bas de l'écran (bouton OK). Publie la
 * hauteur et le décalage du « visual viewport » dans deux variables CSS utilisées par ScreenLayout :
 * `--viewport-height` et `--viewport-offset-top`. Sans visualViewport, le CSS retombe sur 100dvh.
 * Expose : useViewportHeight().
 * Dépend de : react. À appeler une seule fois, dans App.
 */
import { useEffect } from 'react';

/** Met à jour les variables CSS de hauteur visible tant que le composant est monté. */
export function useViewportHeight(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;

    const update = () => {
      root.style.setProperty('--viewport-height', `${viewport.height}px`);
      root.style.setProperty('--viewport-offset-top', `${viewport.offsetTop}px`);
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      root.style.removeProperty('--viewport-height');
      root.style.removeProperty('--viewport-offset-top');
    };
  }, []);
}
