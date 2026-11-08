/**
 * Boosters du jour et compte à rebours.
 *
 * Rôle : lire combien de boosters il reste à ouvrir aujourd'hui, et le temps avant la remise à zéro
 * (minuit, heure de Paris). Le compte à rebours avance localement ; quand il atteint zéro, le statut est
 * relu pour afficher les nouveaux boosters. Le serveur reste seul juge de la limite (open_booster()).
 * Expose : EtatBoosters, useBoosters().
 * Dépend de : react, hooks/useBoosterService, hooks/useChargement, domain/ouverture (type).
 */
import { useCallback, useEffect, useState } from 'react';
import type { StatutBoosters } from '../domain/ouverture';
import { useBoosterService } from './useBoosterService';
import { useChargement, type EtatChargement } from './useChargement';

/** Intervalle de mise à jour du compte à rebours (ms). Le texte n'affiche que des minutes. */
const PAS_COMPTE_A_REBOURS_MS = 15_000;

/** Statut lu au serveur, avec l'heure d'échéance calculée à la réception. */
interface StatutDatee {
  statut: StatutBoosters;
  /** Heure (ms) de la remise à zéro. */
  echeance: number;
}

/** Ce que renvoie le hook. */
export interface EtatBoosters {
  etat: EtatChargement<StatutBoosters>;
  /** Secondes avant la remise à zéro (mises à jour en continu). */
  secondesAvantReset: number;
  recharger: () => void;
}

/** Suit les boosters du jour. */
export function useBoosters(): EtatBoosters {
  const service = useBoosterService();
  const lire = useCallback(async (): Promise<StatutDatee> => {
    const statut = await service.statut();
    return { statut, echeance: Date.now() + statut.secondesAvantReset * 1000 };
  }, [service]);
  const { etat, recharger } = useChargement(lire);
  const [maintenant, setMaintenant] = useState<number | null>(null);

  // Fait avancer le compte à rebours tant que l'écran est affiché.
  useEffect(() => {
    const demarrage = window.setTimeout(() => setMaintenant(Date.now()), 0);
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), PAS_COMPTE_A_REBOURS_MS);
    return () => {
      window.clearTimeout(demarrage);
      window.clearInterval(minuteur);
    };
  }, []);

  const pret = etat.statut === 'pret' ? etat.donnees : null;
  const secondesAvantReset =
    pret && maintenant !== null
      ? Math.max(0, Math.ceil((pret.echeance - maintenant) / 1000))
      : (pret?.statut.secondesAvantReset ?? 0);

  // Minuit passé : on relit le statut (les boosters du jour sont revenus).
  const aRelire = pret !== null && maintenant !== null && secondesAvantReset === 0;
  useEffect(() => {
    if (aRelire) recharger();
  }, [aRelire, recharger]);

  return {
    etat: pret
      ? { statut: 'pret', donnees: pret.statut }
      : (etat as EtatChargement<StatutBoosters>),
    secondesAvantReset,
    recharger,
  };
}
