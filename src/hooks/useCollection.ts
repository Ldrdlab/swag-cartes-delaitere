/**
 * État de la collection de cartes et des actions d'administration.
 *
 * Rôle : charger les cartes et, pour un administrateur, proposer les actions d'écriture (ajouter,
 * modifier, supprimer) en gardant la liste à jour. Ces actions ne sont qu'une COMMODITÉ d'affichage :
 * c'est la base de données qui refuse les écritures d'un joueur ordinaire.
 * Expose : ActionsAdmin, useCollection().
 * Dépend de : react, domain/cartes (type), domain/types (type), hooks/useCollectionService,
 * services/CollectionService.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { InfosCarte } from '../domain/cartes';
import type { Card } from '../domain/types';
import type { NouvelleCarteDonnees } from '../services/CollectionService';
import { useCollectionService } from './useCollectionService';

/** Opérations d'écriture, disponibles seulement pour un administrateur. */
export interface ActionsAdmin {
  ajouter(donnees: NouvelleCarteDonnees): Promise<Card>;
  modifier(id: string, infos: InfosCarte): Promise<Card>;
  supprimer(id: string): Promise<void>;
}

/**
 * Charge la collection.
 *
 * @param peutAdministrer - Vrai si le compte connecté est administrateur (rôle lu dans la base).
 */
export function useCollection(peutAdministrer: boolean) {
  const service = useCollectionService();
  const [cartes, setCartes] = useState<Card[]>([]);
  const [chargement, setChargement] = useState<'chargement' | 'pret' | 'erreur'>('chargement');

  // Lecture initiale des cartes.
  useEffect(() => {
    let annule = false;
    service
      .lireCartes()
      .then((lues) => {
        if (annule) return;
        setCartes(lues);
        setChargement('pret');
      })
      .catch(() => {
        if (!annule) setChargement('erreur');
      });
    return () => {
      annule = true;
    };
  }, [service]);

  /** Relit les cartes (bouton « Réessayer »). */
  const recharger = useCallback(() => {
    setChargement('chargement');
    service
      .lireCartes()
      .then((lues) => {
        setCartes(lues);
        setChargement('pret');
      })
      .catch(() => setChargement('erreur'));
  }, [service]);

  const admin = useMemo<ActionsAdmin | null>(() => {
    if (!peutAdministrer) return null;
    return {
      ajouter: (donnees) =>
        service.ajouterCarte(donnees).then((carte) => {
          setCartes((actuelles) => [...actuelles, carte]);
          return carte;
        }),
      modifier: (id, infos) =>
        service.modifierCarte(id, infos).then((carte) => {
          setCartes((actuelles) => actuelles.map((c) => (c.id === id ? carte : c)));
          return carte;
        }),
      supprimer: (id) =>
        service.supprimerCarte(id).then(() => {
          setCartes((actuelles) => actuelles.filter((c) => c.id !== id));
        }),
    };
  }, [peutAdministrer, service]);

  return { cartes, chargement, recharger, admin };
}
