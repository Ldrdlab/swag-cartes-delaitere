/**
 * Détection du réglage « réduire les animations » du système.
 *
 * Rôle : savoir si l'utilisateur a demandé moins de mouvement (prefers-reduced-motion), pour couper
 * les effets qui bougent côté JavaScript (tremblement, confettis…). Le CSS gère le reste.
 * Expose : useMouvementReduit().
 * Dépend de : react.
 */
import { useSyncExternalStore } from 'react';

const REQUETE = '(prefers-reduced-motion: reduce)';

/** S'abonne aux changements du réglage système. */
function sAbonner(rappel: () => void): () => void {
  const media = window.matchMedia(REQUETE);
  media.addEventListener('change', rappel);
  return () => media.removeEventListener('change', rappel);
}

/**
 * Indique si l'utilisateur veut réduire les animations.
 *
 * @returns `true` si le système demande de réduire les mouvements.
 */
export function useMouvementReduit(): boolean {
  return useSyncExternalStore(
    sAbonner,
    () => window.matchMedia(REQUETE).matches,
    () => false,
  );
}
