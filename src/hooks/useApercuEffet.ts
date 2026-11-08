/**
 * Effet affiché sur la grande carte de l'espace admin (vue détaillée), en direct.
 *
 * Rôle : lire les effets par défaut des raretés (administrateur seulement) et calculer l'effet à
 * montrer : celui de la carte, ou celui du brouillon pendant qu'on modifie ses infos (le formulaire
 * « Effet visuel » agit donc en direct sur l'aperçu). Pour un joueur (`actif` faux), rien n'est lu et
 * l'appel renvoie `undefined` : la carte garde son affichage normal.
 * Expose : useApercuEffet().
 * Dépend de : react, config/effets, domain/cartes (type), domain/effetsCartes, domain/types (type),
 * hooks/useAdministrationService.
 */
import { useEffect, useState } from 'react';
import { INTENSITE_EFFET } from '../config/effets';
import type { InfosCarte } from '../domain/cartes';
import { resoudreEffet, type EffetResolu, type RegleEffet } from '../domain/effetsCartes';
import type { Card } from '../domain/types';
import { useAdministrationService } from './useAdministrationService';

/**
 * @param carte - Carte affichée.
 * @param brouillon - Infos en cours de modification, ou `undefined` hors modification.
 * @param actif - Vrai pour un administrateur.
 * @returns Les règles lues (vides tant qu'elles arrivent) et l'effet à afficher.
 */
export function useApercuEffet(
  carte: Card,
  brouillon: InfosCarte | undefined,
  actif: boolean,
): { regles: readonly RegleEffet[]; effet: EffetResolu | undefined } {
  const service = useAdministrationService();
  const [regles, setRegles] = useState<readonly RegleEffet[]>([]);

  useEffect(() => {
    if (!actif) return undefined;
    let annule = false;
    // En cas d'échec, on garde une liste vide : l'effet automatique n'est alors simplement pas montré.
    service
      .lireEffetsRaretes()
      .then((lues) => {
        if (!annule) setRegles(lues);
      })
      .catch(() => undefined);
    return () => {
      annule = true;
    };
  }, [service, actif]);

  if (!actif) return { regles, effet: undefined };
  const source = brouillon
    ? {
        rarity: brouillon.rarete,
        variant: brouillon.variante,
        effect: brouillon.effet,
        effectParams: brouillon.parametres,
      }
    : carte;
  return { regles, effet: resoudreEffet(source, regles, INTENSITE_EFFET.defaut) };
}
