/**
 * Tests de la génération d'identifiants.
 *
 * Dépend de : vitest, domain/id.
 */
import { describe, expect, it } from 'vitest';
import { generateId } from './id';

describe('generateId', () => {
  it('est déterministe avec une source d’aléatoire et une horloge injectées', () => {
    expect(
      generateId(
        () => 0,
        () => 36,
      ),
    ).toBe('10-0000000000');
  });

  it('produit des identifiants différents avec l’aléatoire par défaut', () => {
    expect(generateId()).not.toBe(generateId());
  });

  it('ne contient que des caractères alphanumériques minuscules et un tiret', () => {
    expect(generateId()).toMatch(/^[0-9a-z]+-[0-9a-z]+$/);
  });
});
