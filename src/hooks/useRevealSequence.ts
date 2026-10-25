/**
 * Séquence de révélation des cartes pour les composants.
 *
 * Rôle : branche la machine à états pure (domain/revelation) sur React et gère les minuteries :
 * fin de l'attente (TREMBLE) et fin du retournement (RETOURNE). Toutes les minuteries sont annulées
 * quand l'étape change et au démontage de l'écran.
 * Si l'utilisateur a réduit les animations : pas d'attente, retournement remplacé par un fondu court.
 * Expose : useRevealSequence(), RevealSequence.
 * Dépend de : react, domain/revelation, domain/types, config/raretes, config/revelation.
 */
import { useCallback, useEffect, useReducer } from 'react';
import { RARETES, type DefinitionRarete } from '../config/raretes';
import { DUREES } from '../config/revelation';
import {
  demarrerRevelation,
  estDerniereCarte,
  reduireRevelation,
  type EtatRevelation,
} from '../domain/revelation';
import type { Card } from '../domain/types';

/** Ce que renvoie le hook. */
export interface RevealSequence {
  etat: EtatRevelation;
  /** Carte courante (absente s'il n'y a aucune carte). */
  carte: Card | undefined;
  /** Définition de la rareté de la carte courante. */
  rarete: DefinitionRarete | undefined;
  /** Durée du retournement de la carte courante (ms). */
  dureeRetournementMs: number;
  /** La carte courante est-elle la dernière ? */
  estDerniere: boolean;
  /** Toucher / clic / Entrée / Espace sur la carte. */
  toucher: () => void;
  /** Bouton « Suivant » (ou « Voir le bilan »). */
  suivant: () => void;
  /** Bouton « Passer ». */
  passer: () => void;
}

interface Options {
  /** Cartes à révéler, dans l'ordre. */
  cartes: readonly Card[];
  /** L'utilisateur a-t-il demandé de réduire les animations ? */
  mouvementReduit: boolean;
}

/**
 * Pilote la révélation : état courant, minuteries et actions.
 *
 * @param options - Les cartes et le réglage « mouvement réduit ».
 * @returns L'état de la révélation et les actions à brancher sur les boutons.
 */
export function useRevealSequence({ cartes, mouvementReduit }: Options): RevealSequence {
  const [etat, dispatch] = useReducer(reduireRevelation, cartes.length, demarrerRevelation);
  const carte = cartes[etat.indiceCarte];
  const rarete = carte ? RARETES[carte.rarity] : undefined;
  const tease = Boolean(rarete?.tease) && !mouvementReduit;
  const dureeRetournementMs = mouvementReduit
    ? DUREES.fonduReduitMs
    : (rarete?.dureeRetournementMs ?? 0);

  // Minuteries : une seule à la fois, annulée au changement d'étape et au démontage.
  useEffect(() => {
    if (etat.etape === 'TREMBLE') {
      const minuterie = window.setTimeout(
        () => dispatch({ type: 'TREMBLE_TERMINE' }),
        DUREES.teaseMs,
      );
      return () => window.clearTimeout(minuterie);
    }
    if (etat.etape === 'RETOURNE') {
      const minuterie = window.setTimeout(
        () => dispatch({ type: 'RETOURNEMENT_TERMINE' }),
        dureeRetournementMs,
      );
      return () => window.clearTimeout(minuterie);
    }
    return undefined;
  }, [etat.etape, etat.indiceCarte, dureeRetournementMs]);

  const toucher = useCallback(() => dispatch({ type: 'TOUCHER', tease }), [tease]);
  const suivant = useCallback(() => dispatch({ type: 'SUIVANT' }), []);
  const passer = useCallback(() => dispatch({ type: 'PASSER' }), []);

  return {
    etat,
    carte,
    rarete,
    dureeRetournementMs,
    estDerniere: estDerniereCarte(etat),
    toucher,
    suivant,
    passer,
  };
}
