/**
 * Tests de la composition du bilan.
 *
 * Dépend de : vitest, domain/bilan, domain/types.
 */
import { describe, expect, it } from 'vitest';
import { composerBilan, rangRarete, trierParRarete } from './bilan';
import type { Card, Rarity } from './types';

/** Fabrique une carte de test. */
function carte(id: string, rarity: Rarity): Card {
  return { id, name: id, rarity };
}

describe('rangRarete', () => {
  it('classe les raretés de la plus fréquente à la plus rare', () => {
    expect(rangRarete('commune')).toBeLessThan(rangRarete('peu_commune'));
    expect(rangRarete('ultra_rare')).toBeLessThan(rangRarete('legendaire'));
  });
});

describe('trierParRarete', () => {
  it('trie par rareté décroissante', () => {
    const triees = trierParRarete([
      carte('c', 'commune'),
      carte('l', 'legendaire'),
      carte('r', 'rare'),
    ]);
    expect(triees.map((c) => c.id)).toEqual(['l', 'r', 'c']);
  });

  it('conserve l’ordre du tirage à rareté égale', () => {
    const triees = trierParRarete([
      carte('c1', 'commune'),
      carte('r1', 'rare'),
      carte('c2', 'commune'),
      carte('r2', 'rare'),
    ]);
    expect(triees.map((c) => c.id)).toEqual(['r1', 'r2', 'c1', 'c2']);
  });

  it('ne modifie pas la liste d’origine', () => {
    const origine = [carte('c', 'commune'), carte('l', 'legendaire')];
    trierParRarete(origine);
    expect(origine.map((c) => c.id)).toEqual(['c', 'l']);
  });
});

describe('composerBilan', () => {
  const tirage = [
    carte('c1', 'commune'),
    carte('p1', 'peu_commune'),
    carte('l1', 'legendaire'),
    carte('c2', 'commune'),
    carte('u1', 'ultra_rare'),
  ];

  it('met les 3 plus rares en avant, triées par rareté décroissante', () => {
    const { meilleures } = composerBilan(tirage, 3);
    expect(meilleures.map((c) => c.id)).toEqual(['l1', 'u1', 'p1']);
  });

  it('range les suivantes dans « autres »', () => {
    const { autres } = composerBilan(tirage, 3);
    expect(autres.map((c) => c.id)).toEqual(['c1', 'c2']);
  });

  it('gère un booster plus petit que le nombre de meilleures cartes', () => {
    const bilan = composerBilan([carte('c1', 'commune')], 3);
    expect(bilan.meilleures).toHaveLength(1);
    expect(bilan.autres).toEqual([]);
  });
});
