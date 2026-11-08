/**
 * Effet affiché sur la grande carte de l'espace admin pendant la modification d'une carte.
 *
 * Rôle : calculer l'effet du BROUILLON (infos en cours de saisie) avec les effets par défaut des raretés
 * (hooks/useReglesEffets), pour que le formulaire « Effet visuel » agisse en direct sur la carte. Hors
 * modification, renvoie `undefined` : la carte décide alors seule de son effet.
 * Expose : useApercuEffet().
 * Dépend de : config/effets, domain/cartes (type), domain/effetsCartes, hooks/useReglesEffets.
 */
import { INTENSITE_EFFET } from '../config/effets';
import type { InfosCarte } from '../domain/cartes';
import { resoudreEffet, type EffetResolu, type RegleEffet } from '../domain/effetsCartes';
import { useReglesEffets } from './useReglesEffets';

/**
 * @param brouillon - Infos en cours de modification, ou `undefined` hors modification.
 * @returns Les règles des raretés et l'effet du brouillon (`undefined` sans brouillon).
 */
export function useApercuEffet(brouillon: InfosCarte | undefined): {
  regles: readonly RegleEffet[];
  effet: EffetResolu | undefined;
} {
  const { regles } = useReglesEffets();
  if (!brouillon) return { regles, effet: undefined };
  const effet = resoudreEffet(
    {
      rarity: brouillon.rarete,
      variant: brouillon.variante,
      effect: brouillon.effet,
      effectParams: brouillon.parametres,
    },
    regles,
    INTENSITE_EFFET.defaut,
  );
  return { regles, effet };
}
