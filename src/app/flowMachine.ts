/**
 * Machine à états de la navigation.
 *
 * Rôle : décrire de façon explicite et typée les écrans et les transitions autorisées.
 *
 *   Écrans à ONGLETS (barre d'onglets visible) : HOME · COLLECTION · JOUER · INSTALLER · ADMIN
 *     GO_TAB : passe d'un onglet à un autre, depuis n'importe quel onglet.
 *
 *   Parcours d'OUVERTURE (plein écran, sans barre d'onglets) :
 *     HOME → BOOSTER_SELECT → BOOSTER_CONFIRM → BOOSTER_OPENING → CARD_REVEAL
 *          ↑_____ LEAVE_SELECT ___|     ↑____ BACK ____|     |__ OPENING_FAILED ↩ BOOSTER_CONFIRM
 *     CARD_REVEAL → BOOSTER_SELECT (OPEN_ANOTHER)  ·  CARD_REVEAL → HOME (GO_HOME)
 *
 *   Profil : HOME → PROFILE (OPEN_PROFILE) → HOME (PROFILE_DONE)
 *
 * Expose : Onglet, ONGLETS, Screen, FlowState, FlowEvent, INITIAL_FLOW_STATE, transition().
 * Dépend de : domain/types (type CarteTiree), services/erreurs (type CodeErreur). Aucun import React :
 * testable isolément.
 */
import type { CarteTiree } from '../domain/types';
import type { CodeErreur } from '../services/erreurs';

/** Écrans à onglets. */
export const ONGLETS = ['HOME', 'COLLECTION', 'JOUER', 'INSTALLER', 'ADMIN'] as const;

/** Un onglet de la barre de navigation. */
export type Onglet = (typeof ONGLETS)[number];

/** Écrans du parcours. */
export type Screen =
  Onglet | 'PROFILE' | 'BOOSTER_SELECT' | 'BOOSTER_CONFIRM' | 'BOOSTER_OPENING' | 'CARD_REVEAL';

/** État complet de la navigation. */
export interface FlowState {
  /** Écran actuellement affiché. */
  screen: Screen;
  /** Position du booster choisi dans la liste (conservée pour que le carrousel retrouve sa place). */
  selectedBoosterIndex: number;
  /** Cartes tirées lors de la dernière ouverture (vide hors de CARD_REVEAL). */
  drawnCards: readonly CarteTiree[];
  /** Pourquoi la dernière ouverture a échoué (affiché sur l'écran de confirmation), ou `null`. */
  erreurOuverture: CodeErreur | null;
}

/** Événements qui font avancer la navigation. */
export type FlowEvent =
  | { type: 'GO_TAB'; tab: Onglet }
  | { type: 'OPEN_PROFILE' }
  | { type: 'PROFILE_DONE' }
  | { type: 'START' }
  | { type: 'LEAVE_SELECT' }
  | { type: 'BOOSTER_CHOSEN'; boosterIndex: number }
  | { type: 'BACK' }
  | { type: 'OPEN_CONFIRMED' }
  | { type: 'OPENING_DONE'; cards: readonly CarteTiree[] }
  | { type: 'OPENING_FAILED'; code: CodeErreur }
  | { type: 'OPEN_ANOTHER' }
  | { type: 'GO_HOME' };

/** État au lancement de l'application. */
export const INITIAL_FLOW_STATE: FlowState = {
  screen: 'HOME',
  selectedBoosterIndex: 0,
  drawnCards: [],
  erreurOuverture: null,
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

/** Vrai si l'écran courant est un onglet (barre d'onglets visible). */
export function estOnglet(screen: Screen): screen is Onglet {
  return (ONGLETS as readonly string[]).includes(screen);
}

/**
 * Unique point d'entrée de toutes les transitions de la navigation (fonction pure, compatible useReducer).
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
    case 'GO_TAB':
      if (!estOnglet(state.screen) || state.screen === event.tab) return state;
      return { ...state, screen: event.tab };
    case 'OPEN_PROFILE':
      return moveTo(state, 'HOME', 'PROFILE');
    case 'PROFILE_DONE':
      return moveTo(state, 'PROFILE', 'HOME');
    case 'START':
      return moveTo(state, 'HOME', 'BOOSTER_SELECT', { erreurOuverture: null });
    case 'LEAVE_SELECT':
      return moveTo(state, 'BOOSTER_SELECT', 'HOME');
    case 'BOOSTER_CHOSEN':
      return moveTo(state, 'BOOSTER_SELECT', 'BOOSTER_CONFIRM', {
        selectedBoosterIndex: event.boosterIndex,
        erreurOuverture: null,
      });
    case 'BACK':
      return moveTo(state, 'BOOSTER_CONFIRM', 'BOOSTER_SELECT', { erreurOuverture: null });
    case 'OPEN_CONFIRMED':
      return moveTo(state, 'BOOSTER_CONFIRM', 'BOOSTER_OPENING', { erreurOuverture: null });
    case 'OPENING_DONE':
      return moveTo(state, 'BOOSTER_OPENING', 'CARD_REVEAL', { drawnCards: event.cards });
    case 'OPENING_FAILED':
      return moveTo(state, 'BOOSTER_OPENING', 'BOOSTER_CONFIRM', { erreurOuverture: event.code });
    case 'OPEN_ANOTHER':
      return moveTo(state, 'CARD_REVEAL', 'BOOSTER_SELECT', { drawnCards: [] });
    case 'GO_HOME':
      return moveTo(state, 'CARD_REVEAL', 'HOME', { drawnCards: [] });
  }
}
