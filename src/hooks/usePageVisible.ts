/**
 * Détection de la visibilité de la page.
 *
 * Rôle : savoir si la page est affichée (onglet au premier plan, écran allumé). Sert à suspendre les
 * animations qui tournent en boucle (reflet, rayons) quand personne ne les voit.
 * Expose : usePageVisible().
 * Dépend de : react.
 */
import { useSyncExternalStore } from 'react';

/** S'abonne aux changements de visibilité. */
function sAbonner(rappel: () => void): () => void {
  document.addEventListener('visibilitychange', rappel);
  return () => document.removeEventListener('visibilitychange', rappel);
}

/**
 * Indique si la page est visible.
 *
 * @returns `true` tant que la page est affichée.
 */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    sAbonner,
    () => document.visibilityState === 'visible',
    () => true,
  );
}
