/**
 * Hook d'accès à la machine à états du parcours.
 *
 * Rôle : brancher `transition` sur React (useReducer) et exposer l'état + `send`.
 * Expose : useFlow().
 * Dépend de : react, app/flowMachine.
 */
import { useReducer } from 'react';
import { INITIAL_FLOW_STATE, transition, type FlowEvent, type FlowState } from './flowMachine';

/**
 * Fournit l'état courant du parcours et la fonction pour lui envoyer des événements.
 * @returns `state` (état courant) et `send` (déclenche une transition).
 */
export function useFlow(): { state: FlowState; send: (event: FlowEvent) => void } {
  const [state, send] = useReducer(transition, INITIAL_FLOW_STATE);
  return { state, send };
}
