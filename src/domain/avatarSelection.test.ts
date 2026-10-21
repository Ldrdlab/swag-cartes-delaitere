/**
 * Tests du choix d'avatar.
 *
 * Rôle : vérifier surtout que fermer la fenêtre sans valider ne change JAMAIS l'avatar du profil.
 * Dépend de : vitest, domain/avatarSelection.
 */
import { describe, expect, it } from 'vitest';
import {
  avatarSelectionReducer,
  createAvatarSelection,
  type AvatarSelectionAction,
  type AvatarSelectionState,
} from './avatarSelection';

/** Applique une suite d'actions à partir d'un état de départ. */
function jouer(
  depart: AvatarSelectionState,
  ...actions: AvatarSelectionAction[]
): AvatarSelectionState {
  return actions.reduce(avatarSelectionReducer, depart);
}

const depart = createAvatarSelection('avatar-02');

describe('avatarSelectionReducer', () => {
  it('démarre fenêtre fermée, avec l’avatar donné appliqué', () => {
    expect(depart).toEqual({ appliedId: 'avatar-02', draftId: 'avatar-02', isOpen: false });
  });

  it('« Valider » applique l’avatar coché et ferme la fenêtre', () => {
    const etat = jouer(
      depart,
      { type: 'OPEN' },
      { type: 'SELECT', id: 'avatar-04' },
      { type: 'VALIDATE' },
    );
    expect(etat).toEqual({ appliedId: 'avatar-04', draftId: 'avatar-04', isOpen: false });
  });

  it('fermer sans valider (croix, Échap, voile) ne change pas l’avatar appliqué', () => {
    const etat = jouer(
      depart,
      { type: 'OPEN' },
      { type: 'SELECT', id: 'avatar-05' },
      { type: 'CLOSE' },
    );
    expect(etat.appliedId).toBe('avatar-02');
    expect(etat.isOpen).toBe(false);
  });

  it('abandonne le brouillon : à la réouverture, c’est l’avatar appliqué qui est coché', () => {
    const etat = jouer(
      depart,
      { type: 'OPEN' },
      { type: 'SELECT', id: 'avatar-05' },
      { type: 'CLOSE' },
      { type: 'OPEN' },
    );
    expect(etat.draftId).toBe('avatar-02');
  });

  it('garde un avatar déjà validé quand on rouvre puis ferme sans valider', () => {
    const etat = jouer(
      depart,
      { type: 'OPEN' },
      { type: 'SELECT', id: 'avatar-03' },
      { type: 'VALIDATE' },
      { type: 'OPEN' },
      { type: 'SELECT', id: 'avatar-01' },
      { type: 'CLOSE' },
    );
    expect(etat.appliedId).toBe('avatar-03');
  });

  it('ignore « Choisir » et « Valider » quand la fenêtre est fermée', () => {
    expect(jouer(depart, { type: 'SELECT', id: 'avatar-05' })).toBe(depart);
    expect(jouer(depart, { type: 'VALIDATE' })).toBe(depart);
  });

  it('valider sans avoir rien changé conserve l’avatar', () => {
    const etat = jouer(depart, { type: 'OPEN' }, { type: 'VALIDATE' });
    expect(etat.appliedId).toBe('avatar-02');
  });
});
