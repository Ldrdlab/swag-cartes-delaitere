/**
 * Effets par défaut des raretés, pour toute l'application.
 *
 * Rôle : lire UNE fois (à la connexion) la table « rareté (+ variante) → effet » via la fonction
 * `get_rarity_effects()` et la mettre à disposition de <Carte />, qui décide ainsi seule de l'effet de
 * chaque carte « automatique ». Sans ces règles (pas encore lues, ou lecture échouée), les cartes
 * automatiques s'affichent simplement sans effet : rien ne bloque jamais l'appli. L'admin peut relire
 * les règles après les avoir modifiées (`rafraichir`).
 * Expose : ReglesEffetsProvider, useReglesEffets().
 * Dépend de : react, domain/effetsCartes (type), hooks/useAuth, services/CollectionService (type).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RegleEffet } from '../domain/effetsCartes';
import type { CollectionService } from '../services/CollectionService';
import { useAuth } from './useAuth';

interface ValeurReglesEffets {
  regles: readonly RegleEffet[];
  /** Relit les règles (après une modification par l'admin). */
  rafraichir: () => Promise<void>;
}

const AUCUNE: readonly RegleEffet[] = [];
const RIEN: ValeurReglesEffets = { regles: [], rafraichir: () => Promise.resolve() };
const Contexte = createContext<ValeurReglesEffets>(RIEN);

interface Props {
  service: CollectionService;
  children: ReactNode;
}

/** Fournit les effets par défaut des raretés (lus à la connexion). */
export function ReglesEffetsProvider({ service, children }: Props) {
  const { etat } = useAuth();
  const connecte = etat.statut === 'connecte';
  const [regles, setRegles] = useState<readonly RegleEffet[]>([]);

  // Lecture à la connexion (la relecture à la demande, après un changement de l'admin, est `rafraichir`).
  useEffect(() => {
    if (!connecte) return undefined;
    let annule = false;
    service
      .lireEffetsParDefaut()
      .then((lues) => {
        if (!annule) setRegles(lues);
      })
      // Lecture impossible : les cartes automatiques restent sans effet (rien d'autre n'est touché).
      .catch(() => undefined);
    return () => {
      annule = true;
    };
  }, [connecte, service]);

  const rafraichir = useCallback(async () => {
    try {
      setRegles(await service.lireEffetsParDefaut());
    } catch {
      // Voir ci-dessus : on garde les règles déjà lues.
    }
  }, [service]);

  // Déconnecté : aucune règle (elles sont relues à la prochaine connexion).
  const visibles = connecte ? regles : AUCUNE;
  const valeur = useMemo(() => ({ regles: visibles, rafraichir }), [visibles, rafraichir]);
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

/** Les effets par défaut des raretés (vides hors fournisseur ou tant qu'ils arrivent). */
export function useReglesEffets(): ValeurReglesEffets {
  return useContext(Contexte);
}
