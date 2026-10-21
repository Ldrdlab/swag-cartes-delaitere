/**
 * Tests de la validation du pseudonyme.
 *
 * Dépend de : vitest, domain/validatePseudo, config/profile.
 */
import { describe, expect, it } from 'vitest';
import { PSEUDO_MAX_LENGTH, PSEUDO_MIN_LENGTH } from '../config/profile';
import { validatePseudo } from './validatePseudo';

describe('validatePseudo', () => {
  it('accepte un pseudo valide et retire les espaces de début et de fin', () => {
    expect(validatePseudo('  Sacha  ')).toEqual({ valid: true, pseudo: 'Sacha' });
  });

  it('refuse un pseudo vide ou composé uniquement d’espaces', () => {
    expect(validatePseudo('')).toMatchObject({ valid: false });
    expect(validatePseudo('    ')).toMatchObject({ valid: false });
  });

  it('refuse un pseudo trop court (espaces non comptés)', () => {
    const tropCourt = 'a'.repeat(PSEUDO_MIN_LENGTH - 1);
    expect(validatePseudo(` ${tropCourt} `)).toMatchObject({ valid: false });
  });

  it('accepte les longueurs limites', () => {
    expect(validatePseudo('a'.repeat(PSEUDO_MIN_LENGTH)).valid).toBe(true);
    expect(validatePseudo('a'.repeat(PSEUDO_MAX_LENGTH)).valid).toBe(true);
  });

  it('refuse un pseudo trop long', () => {
    expect(validatePseudo('a'.repeat(PSEUDO_MAX_LENGTH + 1))).toMatchObject({ valid: false });
  });

  it('compte un emoji comme un seul caractère', () => {
    expect(validatePseudo('😀'.repeat(PSEUDO_MAX_LENGTH)).valid).toBe(true);
  });

  it('fournit un message d’erreur non vide quand le pseudo est invalide', () => {
    const resultat = validatePseudo('');
    expect(resultat.valid === false && resultat.error.length > 0).toBe(true);
  });
});
