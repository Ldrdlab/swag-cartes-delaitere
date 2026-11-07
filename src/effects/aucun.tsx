/**
 * Effet « aucun » : la carte s'affiche simplement, sans rien par-dessus.
 *
 * Rôle : seul effet du registre pour l'instant. Les vrais effets (holographique, feu…) seront ajoutés
 * plus tard, chacun dans son fichier, puis déclarés dans effects/index.ts.
 * Expose : EffetAucun.
 * Dépend de : effects/types (type).
 */
import type { PropsEffet } from './types';

/** N'affiche rien. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- le composant reçoit la carte mais n'en a pas besoin
export function EffetAucun(_props: PropsEffet) {
  return null;
}
