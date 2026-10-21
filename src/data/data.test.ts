/**
 * Tests de cohérence des cartes factices.
 *
 * Rôle : détecter un doublon d'identifiant de carte. (La cohérence des boosters est testée dans
 * src/boosters/boosters.test.ts.)
 * Dépend de : vitest, data/cards.
 */
import { describe, expect, it } from 'vitest';
import { CARDS } from './cards';

describe('cartes factices', () => {
  it('les identifiants de cartes sont uniques', () => {
    const ids = CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
