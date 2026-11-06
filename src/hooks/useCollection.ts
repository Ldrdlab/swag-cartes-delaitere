/**
 * État de la collection de cartes et de l'administration.
 *
 * Rôle : charger les cartes, savoir si l'administration est possible, garder le code admin EN MÉMOIRE
 * seulement (jamais enregistré : fermer ou recharger la page reverrouille), et proposer les actions
 * d'écriture (ajouter, modifier, supprimer) une fois déverrouillé.
 * Expose : ActionsAdmin, StatutAdmin, useCollection().
 * Dépend de : react, domain/cartes (type), domain/types (type), hooks/useCollectionService,
 * services/CollectionService.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { InfosCarte } from '../domain/cartes';
import type { Card } from '../domain/types';
import { ErreurCollection, type NouvelleCarteDonnees } from '../services/CollectionService';
import { useCollectionService } from './useCollectionService';

/** Opérations d'écriture, disponibles seulement quand l'administration est déverrouillée. */
export interface ActionsAdmin {
  ajouter(donnees: NouvelleCarteDonnees): Promise<Card>;
  modifier(id: string, infos: InfosCarte): Promise<Card>;
  supprimer(id: string): Promise<void>;
}

/** Situation de l'administration. */
export type StatutAdmin =
  | 'inconnu' // pas encore vérifié
  | 'indisponible' // site publié : lecture seule, aucune administration
  | 'sans_code' // `npm run dev` mais aucun ADMIN_CODE dans .env.local
  | 'verrouille' // disponible, code à saisir
  | 'deverrouille'; // code correct saisi

/** Charge la collection et gère l'accès administrateur. */
export function useCollection() {
  const service = useCollectionService();
  const [cartes, setCartes] = useState<Card[]>([]);
  const [chargement, setChargement] = useState<'chargement' | 'pret' | 'erreur'>('chargement');
  const [disponibilite, setDisponibilite] = useState<
    'inconnu' | 'indisponible' | 'sans_code' | 'verrouille'
  >('inconnu');
  const [code, setCode] = useState<string | null>(null);

  // Lecture initiale des cartes et du statut de l'administration.
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
    service
      .statutAdministration()
      .then((statut) => {
        if (annule) return;
        if (!statut.disponible) setDisponibilite('indisponible');
        else setDisponibilite(statut.codeDefini ? 'verrouille' : 'sans_code');
      })
      .catch(() => {
        if (!annule) setDisponibilite('indisponible');
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

  /** Vérifie le code ; s'il est bon, déverrouille. @throws ErreurCollection si le code est refusé. */
  const deverrouiller = useCallback(
    async (codeSaisi: string) => {
      await service.verifierCode(codeSaisi);
      setCode(codeSaisi);
    },
    [service],
  );

  const verrouiller = useCallback(() => setCode(null), []);

  const admin = useMemo<ActionsAdmin | null>(() => {
    if (code === null) return null;
    /** Exécute une écriture ; si le serveur refuse le code (ex. code changé), on reverrouille. */
    const ecrire = async <T>(operation: () => Promise<T>): Promise<T> => {
      try {
        return await operation();
      } catch (erreur) {
        if (erreur instanceof ErreurCollection && erreur.code === 'code_incorrect') setCode(null);
        throw erreur;
      }
    };
    return {
      ajouter: (donnees) =>
        ecrire(() => service.ajouterCarte(code, donnees)).then((carte) => {
          setCartes((actuelles) => [...actuelles, carte]);
          return carte;
        }),
      modifier: (id, infos) =>
        ecrire(() => service.modifierCarte(code, id, infos)).then((carte) => {
          setCartes((actuelles) => actuelles.map((c) => (c.id === id ? carte : c)));
          return carte;
        }),
      supprimer: (id) =>
        ecrire(() => service.supprimerCarte(code, id)).then(() => {
          setCartes((actuelles) => actuelles.filter((c) => c.id !== id));
        }),
    };
  }, [code, service]);

  const statutAdmin: StatutAdmin = admin ? 'deverrouille' : disponibilite;

  return { cartes, chargement, recharger, statutAdmin, deverrouiller, verrouiller, admin };
}
