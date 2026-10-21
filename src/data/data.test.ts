/**
 * Tests de cohérence des données factices.
 *
 * Rôle : détecter une faute de frappe dans un identifiant de carte ou un doublon.
 * Dépend de : vitest, data/boosters, data/cards.
 */
import { describe, expect, it } from 'vitest';
import { BOOSTERS } from './boosters';
import { CARDS } from './cards';

describe('données factices', () => {
  it('les identifiants de cartes sont uniques', () => {
    const ids = CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('les identifiants de boosters sont uniques', () => {
    const ids = BOOSTERS.map((booster) => booster.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chaque booster ne référence que des cartes existantes', () => {
    const existantes = new Set(CARDS.map((card) => card.id));
    for (const booster of BOOSTERS) {
      for (const cardId of booster.cardIds) {
        expect(existantes.has(cardId), `${booster.id} → ${cardId}`).toBe(true);
      }
    }
  });
});
