/**
 * État du choix d'avatar pour les composants.
 *
 * Rôle : brancher la logique pure `avatarSelectionReducer` sur React et fournir des actions simples
 * (ouvrir, cocher, valider, fermer) à l'écran et au composant AvatarPicker.
 * Expose : useAvatarSelection(), AvatarSelectionControls.
 * Dépend de : react, domain/avatarSelection.
 */
import { useMemo, useReducer } from 'react';
import {
  avatarSelectionReducer,
  createAvatarSelection,
  type AvatarSelectionState,
} from '../domain/avatarSelection';

/** État du choix d'avatar et actions pour le modifier. */
export interface AvatarSelectionControls extends AvatarSelectionState {
  /** Ouvre la fenêtre de choix. */
  open: () => void;
  /** Coche un avatar dans la fenêtre (sans l'appliquer). */
  select: (id: string) => void;
  /** Applique l'avatar coché et ferme. */
  validate: () => void;
  /** Ferme sans rien changer. */
  close: () => void;
}

/**
 * Gère le choix d'avatar d'un profil.
 *
 * @param initialId - Identifiant de l'avatar au départ.
 * @returns L'état (`appliedId`, `draftId`, `isOpen`) et les actions.
 */
export function useAvatarSelection(initialId: string): AvatarSelectionControls {
  const [state, dispatch] = useReducer(avatarSelectionReducer, initialId, createAvatarSelection);
  const actions = useMemo(
    () => ({
      open: () => dispatch({ type: 'OPEN' }),
      select: (id: string) => dispatch({ type: 'SELECT', id }),
      validate: () => dispatch({ type: 'VALIDATE' }),
      close: () => dispatch({ type: 'CLOSE' }),
    }),
    [],
  );
  return { ...state, ...actions };
}
