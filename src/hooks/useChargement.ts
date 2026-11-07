/**
 * Chargement d'une donnée asynchrone, avec état « chargement / prêt / erreur ».
 *
 * Rôle : lancer une lecture au montage du composant, garder son résultat et permettre de la relancer
 * (bouton « Réessayer »). Sert aux sections Boosters, Joueurs et Version de l'espace admin.
 * Expose : EtatChargement, useChargement().
 * Dépend de : react, services/erreurs.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ErreurService, type CodeErreur } from '../services/erreurs';

/** État d'une lecture. */
export type EtatChargement<T> =
  | { statut: 'chargement' }
  | { statut: 'erreur'; code: CodeErreur }
  | { statut: 'pret'; donnees: T };

/**
 * Charge une donnée au montage.
 *
 * @param lire - Fonction qui lit la donnée (doit être stable : à envelopper dans `useCallback` si elle
 * dépend d'autre chose que d'un service).
 * @returns L'état courant, `recharger` pour relancer, et `remplacer` pour mettre la donnée à jour à la main.
 */
export function useChargement<T>(lire: () => Promise<T>) {
  const [etat, setEtat] = useState<EtatChargement<T>>({ statut: 'chargement' });
  const numero = useRef(0);

  /** Lance une lecture ; le résultat d'une lecture périmée (relancée ou démontée) est ignoré. */
  const lancer = useCallback(() => {
    numero.current += 1;
    const mien = numero.current;
    lire().then(
      (donnees) => {
        if (numero.current === mien) setEtat({ statut: 'pret', donnees });
      },
      (erreur: unknown) => {
        if (numero.current !== mien) return;
        const code = erreur instanceof ErreurService ? erreur.code : 'inconnue';
        setEtat({ statut: 'erreur', code });
      },
    );
  }, [lire]);

  useEffect(() => {
    lancer();
    return () => {
      numero.current += 1;
    };
  }, [lancer]);

  const recharger = useCallback(() => {
    setEtat({ statut: 'chargement' });
    lancer();
  }, [lancer]);

  const remplacer = useCallback((donnees: T) => setEtat({ statut: 'pret', donnees }), []);

  return { etat, recharger, remplacer };
}
