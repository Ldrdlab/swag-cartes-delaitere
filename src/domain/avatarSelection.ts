/**
 * Logique du choix d'avatar (fonctions pures).
 *
 * Rôle : gérer les trois choses que le sélecteur doit distinguer :
 *   - l'avatar APPLIQUÉ (celui du profil, qui ne change que sur « Valider ») ;
 *   - l'avatar SURVOLÉ/COCHÉ dans la fenêtre (le brouillon) ;
 *   - la fenêtre ouverte ou fermée.
 * Fermer la fenêtre (croix, Échap, toucher le voile) abandonne le brouillon : l'avatar appliqué
 * ne change jamais sans « Valider ».
 * Expose : AvatarSelectionState, AvatarSelectionAction, createAvatarSelection(), avatarSelectionReducer().
 * Dépend de : rien (aucun import React ni DOM).
 */

/** État du choix d'avatar. */
export interface AvatarSelectionState {
  /** Identifiant de l'avatar appliqué au profil. */
  appliedId: string;
  /** Identifiant de l'avatar coché dans la fenêtre (brouillon, pas encore appliqué). */
  draftId: string;
  /** La fenêtre de choix est-elle ouverte ? */
  isOpen: boolean;
}

/** Actions possibles. */
export type AvatarSelectionAction =
  { type: 'OPEN' } | { type: 'SELECT'; id: string } | { type: 'VALIDATE' } | { type: 'CLOSE' };

/**
 * Crée l'état de départ : fenêtre fermée, avatar donné appliqué.
 *
 * @param initialId - Identifiant de l'avatar du profil.
 * @returns L'état initial.
 */
export function createAvatarSelection(initialId: string): AvatarSelectionState {
  return { appliedId: initialId, draftId: initialId, isOpen: false };
}

/**
 * Fait évoluer le choix d'avatar.
 *
 * - OPEN : ouvre la fenêtre, le brouillon repart de l'avatar appliqué.
 * - SELECT : coche un avatar (seulement si la fenêtre est ouverte).
 * - VALIDATE : applique le brouillon et ferme (seulement si la fenêtre est ouverte).
 * - CLOSE : ferme SANS appliquer, le brouillon est abandonné.
 *
 * @param state - État courant.
 * @param action - Action reçue.
 * @returns Le nouvel état (le même objet si l'action n'a pas lieu d'être).
 */
export function avatarSelectionReducer(
  state: AvatarSelectionState,
  action: AvatarSelectionAction,
): AvatarSelectionState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true, draftId: state.appliedId };
    case 'SELECT':
      return state.isOpen ? { ...state, draftId: action.id } : state;
    case 'VALIDATE':
      return state.isOpen
        ? { appliedId: state.draftId, draftId: state.draftId, isOpen: false }
        : state;
    case 'CLOSE':
      return { ...state, isOpen: false, draftId: state.appliedId };
  }
}
