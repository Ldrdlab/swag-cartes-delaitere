/**
 * Tests du tirage des cartes (aléatoire injecté : résultats déterministes).
 *
 * Dépend de : vitest, domain/drawCards, domain/types.
 */
import { describe, expect, it } from 'vitest';
import { drawCards, type RandomSource } from './drawCards';
import type { Booster, Card, Rarity } from './types';

const catalogue: Card[] = [
  { id: 'c1', name: 'C1', rarity: 'commune' },
  { id: 'c2', name: 'C2', rarity: 'commune' },
  { id: 'p1', name: 'P1', rarity: 'peu_commune' },
  { id: 'r1', name: 'R1', rarity: 'rare' },
  { id: 'u1', name: 'U1', rarity: 'ultra_rare' },
  { id: 'hors-booster', name: 'Ailleurs', rarity: 'rare' },
];

const booster: Booster = {
  id: 'b',
  name: 'Booster test',
  color: '#000',
  cardIds: ['c1', 'c2', 'p1', 'r1', 'u1'],
};

const poids: Record<Rarity, number> = { commune: 60, peu_commune: 25, rare: 12, ultra_rare: 3 };

/** Source d'aléatoire qui renvoie toujours la même valeur. */
const constant =
  (valeur: number): RandomSource =>
  () =>
    valeur;

/** Source d'aléatoire qui rejoue une suite de valeurs, en boucle. */
function sequence(...valeurs: number[]): RandomSource {
  let position = 0;
  return () => {
    const valeur = valeurs[position % valeurs.length] ?? 0;
    position += 1;
    return valeur;
  };
}

describe('drawCards', () => {
  it('tire le nombre de cartes demandé', () => {
    expect(drawCards(booster, catalogue, 5, poids, constant(0.5))).toHaveLength(5);
  });

  it('ne tire que des cartes du booster', () => {
    const cartes = drawCards(booster, catalogue, 50, poids, sequence(0.1, 0.4, 0.7, 0.95, 0.3));
    for (const carte of cartes) {
      expect(booster.cardIds).toContain(carte.id);
    }
  });

  it('est déterministe : même aléatoire, même tirage', () => {
    const premier = drawCards(booster, catalogue, 5, poids, sequence(0.2, 0.6, 0.9, 0.1));
    const second = drawCards(booster, catalogue, 5, poids, sequence(0.2, 0.6, 0.9, 0.1));
    expect(premier).toEqual(second);
  });

  it('tire la rareté la plus fréquente et la première carte avec un aléatoire à 0', () => {
    const cartes = drawCards(booster, catalogue, 3, poids, constant(0));
    expect(cartes.map((carte) => carte.id)).toEqual(['c1', 'c1', 'c1']);
  });

  it('tire la rareté la plus rare avec un aléatoire proche de 1', () => {
    const cartes = drawCards(booster, catalogue, 2, poids, constant(0.999));
    expect(cartes.map((carte) => carte.id)).toEqual(['u1', 'u1']);
  });

  it('respecte les seuils de probabilité (60 / 25 / 12 / 3 %)', () => {
    // Le 1er nombre choisit la rareté, le 2e la carte dans cette rareté.
    const rareteAvec = (premier: number) =>
      drawCards(booster, catalogue, 1, poids, sequence(premier, 0))[0]?.rarity;
    expect(rareteAvec(0.59)).toBe('commune');
    expect(rareteAvec(0.61)).toBe('peu_commune');
    expect(rareteAvec(0.84)).toBe('peu_commune');
    expect(rareteAvec(0.86)).toBe('rare');
    expect(rareteAvec(0.96)).toBe('rare');
    expect(rareteAvec(0.98)).toBe('ultra_rare');
  });

  it('ignore une rareté absente du booster', () => {
    const sansUltra: Booster = { ...booster, cardIds: ['c1', 'p1', 'r1'] };
    const cartes = drawCards(sansUltra, catalogue, 2, poids, constant(0.999));
    expect(cartes.map((carte) => carte.rarity)).toEqual(['rare', 'rare']);
  });

  it('ignore les identifiants de cartes inconnus du catalogue', () => {
    const avecInconnu: Booster = { ...booster, cardIds: ['inconnue', 'c1'] };
    const cartes = drawCards(avecInconnu, catalogue, 3, poids, constant(0.5));
    expect(cartes.map((carte) => carte.id)).toEqual(['c1', 'c1', 'c1']);
  });

  it('tire uniformément quand tous les poids sont nuls', () => {
    const poidsNuls: Record<Rarity, number> = {
      commune: 0,
      peu_commune: 0,
      rare: 0,
      ultra_rare: 0,
    };
    expect(drawCards(booster, catalogue, 4, poidsNuls, constant(0.5))).toHaveLength(4);
  });

  it('refuse un booster sans aucune carte connue', () => {
    const vide: Booster = { ...booster, cardIds: ['inconnue'] };
    expect(() => drawCards(vide, catalogue, 5, poids)).toThrow();
  });
});
