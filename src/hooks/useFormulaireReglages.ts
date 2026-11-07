/**
 * État du formulaire des réglages de booster (espace admin, section « Boosters »).
 *
 * Rôle : garder ce que l'admin tape (en texte, pour accepter « 0,6 »), calculer le total des
 * probabilités et les erreurs, proposer les valeurs par défaut et enregistrer. Toute la logique de
 * validation est dans domain/reglages.
 * Expose : EtatEnvoi, useFormulaireReglages().
 * Dépend de : react, config/reglages, domain/administration (type), domain/reglages, domain/types,
 * services/erreurs.
 */
import { useMemo, useState } from 'react';
import { LIMITES_REGLAGES, REGLAGES_PAR_DEFAUT } from '../config/reglages';
import type { ReglagesAdmin } from '../domain/administration';
import {
  lireNombreSaisi,
  totalProbabilites,
  verifierReglages,
  type ReglagesJeu,
} from '../domain/reglages';
import { RARITIES, type Rarity } from '../domain/types';
import { ErreurService, type CodeErreur } from '../services/erreurs';

/** Où en est l'enregistrement. */
export type EtatEnvoi =
  { statut: 'repos' | 'envoi' | 'succes' } | { statut: 'erreur'; code: CodeErreur };

/** Réglages sous forme de textes de champs. */
interface Saisie {
  cartes: string;
  parJour: string;
  probabilites: Record<Rarity, string>;
}

/** Transforme des réglages en textes de champs. */
function versSaisie(reglages: ReglagesJeu): Saisie {
  return {
    cartes: String(reglages.cartesParBooster),
    parJour: String(reglages.boostersParJour),
    probabilites: Object.fromEntries(
      RARITIES.map((rarete) => [rarete, String(reglages.probabilites[rarete])]),
    ) as Record<Rarity, string>,
  };
}

/**
 * Gère le formulaire.
 *
 * @param initial - Réglages actuellement enregistrés.
 * @param enregistrer - Enregistre les réglages modifiés (service d'administration).
 */
export function useFormulaireReglages(
  initial: ReglagesJeu,
  enregistrer: (modifs: Partial<ReglagesAdmin>) => Promise<unknown>,
) {
  const [saisie, setSaisie] = useState<Saisie>(() => versSaisie(initial));
  const [envoi, setEnvoi] = useState<EtatEnvoi>({ statut: 'repos' });

  /** Réglages lus dans les champs (`NaN` quand un champ est illisible). */
  const reglages = useMemo<ReglagesJeu>(
    () => ({
      cartesParBooster: lireNombreSaisi(saisie.cartes),
      boostersParJour: lireNombreSaisi(saisie.parJour),
      probabilites: Object.fromEntries(
        RARITIES.map((rarete) => [rarete, lireNombreSaisi(saisie.probabilites[rarete])]),
      ) as Record<Rarity, number>,
    }),
    [saisie],
  );

  const erreurs = useMemo(() => verifierReglages(reglages, LIMITES_REGLAGES), [reglages]);
  const total = totalProbabilites(reglages.probabilites, LIMITES_REGLAGES.decimalesProbabilite);
  /** Ce qu'il manque (positif) ou ce qu'il y a en trop (négatif) pour arriver à 100 %. */
  const ecart = Number.isFinite(total)
    ? Math.round((LIMITES_REGLAGES.totalProbabilites - total) * 100) / 100
    : null;

  const modifier = (changement: (precedent: Saisie) => Saisie) => {
    setSaisie(changement);
    setEnvoi({ statut: 'repos' });
  };

  return {
    saisie,
    erreurs,
    total,
    ecart,
    envoi,
    peutEnregistrer: erreurs.length === 0 && envoi.statut !== 'envoi',
    changerCartes: (valeur: string) => modifier((p) => ({ ...p, cartes: valeur })),
    changerParJour: (valeur: string) => modifier((p) => ({ ...p, parJour: valeur })),
    changerProbabilite: (rarete: Rarity, valeur: string) =>
      modifier((p) => ({ ...p, probabilites: { ...p.probabilites, [rarete]: valeur } })),
    valeursParDefaut: () => modifier(() => versSaisie(REGLAGES_PAR_DEFAUT)),
    enregistrer: async () => {
      if (erreurs.length > 0) return;
      setEnvoi({ statut: 'envoi' });
      try {
        await enregistrer(reglages);
        setEnvoi({ statut: 'succes' });
      } catch (erreur) {
        setEnvoi({
          statut: 'erreur',
          code: erreur instanceof ErreurService ? erreur.code : 'inconnue',
        });
      }
    },
  };
}
