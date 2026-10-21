/**
 * Tests de la liste des avatars.
 *
 * Rôle : repérer un doublon d'identifiant, un avatar par défaut qui n'existe plus ou une liste vide.
 * Dépend de : vitest, config/avatars.
 */
import { describe, expect, it } from 'vitest';
import { AVATARS, ID_AVATAR_PAR_DEFAUT, trouverAvatar } from './avatars';

describe('liste des avatars', () => {
  it('contient au moins un avatar', () => {
    expect(AVATARS.length).toBeGreaterThan(0);
  });

  it('donne à chaque avatar un identifiant unique, un nom et une image', () => {
    const identifiants = AVATARS.map((avatar) => avatar.id);
    expect(new Set(identifiants).size).toBe(identifiants.length);
    for (const avatar of AVATARS) {
      expect(avatar.nom).not.toBe('');
      expect(avatar.image).not.toBe('');
    }
  });

  it('a un avatar par défaut qui existe dans la liste', () => {
    expect(AVATARS.some((avatar) => avatar.id === ID_AVATAR_PAR_DEFAUT)).toBe(true);
  });
});

describe('trouverAvatar', () => {
  it('retrouve un avatar par son identifiant', () => {
    expect(trouverAvatar('avatar-03').id).toBe('avatar-03');
  });

  it('renvoie l’avatar par défaut si l’identifiant est absent ou inconnu', () => {
    expect(trouverAvatar(undefined).id).toBe(ID_AVATAR_PAR_DEFAUT);
    expect(trouverAvatar('avatar-supprime').id).toBe(ID_AVATAR_PAR_DEFAUT);
  });
});
