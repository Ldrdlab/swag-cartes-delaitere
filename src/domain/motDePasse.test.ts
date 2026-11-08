/**
 * Tests de la validation du mot de passe.
 *
 * Rôle : vérifier la longueur minimale et la confirmation identique.
 * Dépend de : vitest, domain/motDePasse.
 */
import { describe, expect, it } from 'vitest';
import { validerMotDePasse } from './motDePasse';

describe('validerMotDePasse', () => {
  it('accepte un mot de passe assez long et bien confirmé', () => {
    expect(validerMotDePasse('abcdefgh', 'abcdefgh', 8)).toBeNull();
    expect(
      validerMotDePasse('un très long mot de passe', 'un très long mot de passe', 8),
    ).toBeNull();
  });

  it('refuse un mot de passe trop court, même bien confirmé', () => {
    expect(validerMotDePasse('abc', 'abc', 8)).toBe('trop_court');
    expect(validerMotDePasse('', '', 8)).toBe('trop_court');
  });

  it('refuse une confirmation différente (majuscules comprises)', () => {
    expect(validerMotDePasse('abcdefgh', 'abcdefgH', 8)).toBe('different');
    expect(validerMotDePasse('abcdefgh', '', 8)).toBe('different');
  });

  it('compte les caractères visibles (un emoji compte pour 1)', () => {
    expect(validerMotDePasse('😀😀😀', '😀😀😀', 4)).toBe('trop_court');
    expect(validerMotDePasse('😀😀😀😀', '😀😀😀😀', 4)).toBeNull();
  });
});
