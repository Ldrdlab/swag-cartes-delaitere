/**
 * Machine à états du parcours de l'application.
 *
 * Rôle : décrire de façon explicite et typée les écrans et les transitions autorisées.
 *
 *   WELCOME → PROFILE → BOOSTER_SELECT → BOOSTER_CONFIRM → BOOSTER_OPENING → CARD_REVEAL
 *                          ↑______BACK_______|                                  |
 *   BOOSTER_SELECT ←──────────────── OPEN_ANOTHER ────────────────────────────┤
 *   WELCOME ←─────────────────────── GO_HOME ─────────────────────────────────┘
 *   WELCOME → MES_CARTES (OPEN_CARDS)  ·  MES_CARTES → WELCOME (CLOSE_CARDS)
 *
 * Expose : Screen, FlowState, FlowEvent, INITIAL_FLOW_STATE, transition().
 * Dépend de : domain/types (type Card uniquement). Aucun import React : testable isolément.
 */
import type { Card } from '../domain/types';

/** Écrans du parcours. */
export type Screen =
  | 'WELCOME'
  | 'PROFILE'
  | 'BOOSTER_SELECT'
  | 'BOOSTER_CONFIRM'
  | 'BOOSTER_OPENING'
  | 'CARD_REVEAL'
  | 'MES_CARTES';

/** État complet du parcours. */
export interface FlowState {
  /** Écran actuellement affiché. */
  screen: Screen;
  /** Position du booster choisi dans la liste (conservée pour que le carrousel retrouve sa place). */
  selectedBoosterIndex: number;
  /** Cartes tirées lors de la dernière ouverture (vide hors de CARD_REVEAL). */
  drawnCards: readonly Card[];
}

/** Événements qui font avancer le parcours. */
export type FlowEvent =
  | { type: 'START' }
  | { type: 'PROFILE_DONE' }
  | { type: 'BOOSTER_CHOSEN'; boosterIndex: number }
  | { type: 'BACK' }
  | { type: 'OPEN_CONFIRMED' }
  | { type: 'OPENING_DONE'; cards: readonly Card[] }
  | { type: 'OPEN_ANOTHER' }
  | { type: 'GO_HOME' }
  | { type: 'OPEN_CARDS' }
  | { type: 'CLOSE_CARDS' };

/** État au lancement de l'application. */
export const INITIAL_FLOW_STATE: FlowState = {
  screen: 'WELCOME',
  selectedBoosterIndex: 0,
  drawnCards: [],
};

/** Change d'écran uniquement si l'état courant est bien sur l'écran `from`. */
function moveTo(
  state: FlowState,
  from: Screen,
  to: Screen,
  changes: Partial<FlowState> = {},
): FlowState {
  if (state.screen !== from) return state;
  return { ...state, ...changes, screen: to };
}

/**
 * Unique point d'entrée de toutes les transitions du parcours (fonction pure, compatible useReducer).
 *
 * Un événement qui n'est pas autorisé depuis l'écran courant est ignoré :
 * la même référence d'état est renvoyée, rien ne change.
 *
 * @param state - État courant.
 * @param event - Événement reçu.
 * @returns Le nouvel état (ou l'état inchangé si la transition est interdite).
 */
export function transition(state: FlowState, event: FlowEvent): FlowState {
  switch (event.type) {
    case 'START':
      return moveTo(state, 'WELCOME', 'PROFILE');
    case 'PROFILE_DONE':
      return moveTo(state, 'PROFILE', 'BOOSTER_SELECT');
    case 'BOOSTER_CHOSEN':
      return moveTo(state, 'BOOSTER_SELECT', 'BOOSTER_CONFIRM', {
        selectedBoosterIndex: event.boosterIndex,
      });
    case 'BACK':
      return moveTo(state, 'BOOSTER_CONFIRM', 'BOOSTER_SELECT');
    case 'OPEN_CONFIRMED':
      return moveTo(state, 'BOOSTER_CONFIRM', 'BOOSTER_OPENING');
    case 'OPENING_DONE':
      return moveTo(state, 'BOOSTER_OPENING', 'CARD_REVEAL', { drawnCards: event.cards });
    case 'OPEN_ANOTHER':
      return moveTo(state, 'CARD_REVEAL', 'BOOSTER_SELECT', { drawnCards: [] });
    case 'GO_HOME':
      return moveTo(state, 'CARD_REVEAL', 'WELCOME', { drawnCards: [] });
    case 'OPEN_CARDS':
      return moveTo(state, 'WELCOME', 'MES_CARTES');
    case 'CLOSE_CARDS':
      return moveTo(state, 'MES_CARTES', 'WELCOME');
  }
}
