/**
 * Tests de la table des raretés.
 *
 * Rôle : vérifier qu'il y a UNE entrée complète par rareté, avec des étoiles croissantes, et que le
 * nombre de confettis suit le cahier des charges (0 / 0 / 0 / 26 / 40).
 * Dépend de : vitest, config/raretes, domain/types, domain/effets.
 */
import { describe, expect, it } from 'vitest';
import { nombreConfettis } from '../domain/effets';
import { RARITIES } from '../domain/types';
import { RARETES } from './raretes';

describe('table des raretés', () => {
  it('a une entrée pour chacune des 5 raretés', () => {
    expect(RARITIES).toHaveLength(5);
    expect(Object.keys(RARETES).sort()).toEqual([...RARITIES].sort());
  });

  it('donne à chaque rareté un nom, des couleurs et une durée de retournement', () => {
    for (const rarete of RARITIES) {
      const definition = RARETES[rarete];
      expect(definition.nom, rarete).not.toBe('');
      expect(
        Object.values(definition.couleurs).every((c) => c.trim() !== ''),
        rarete,
      ).toBe(true);
      expect(definition.dureeRetournementMs, rarete).toBeGreaterThan(0);
    }
  });

  it('a de 1 à 5 étoiles, une de plus à chaque rareté', () => {
    RARITIES.forEach((rarete, rang) => {
      expect(RARETES[rarete].etoiles).toBe(rang + 1);
    });
  });

  it('lance 0, 0, 0, 26 puis 40 confettis', () => {
    expect(RARITIES.map((rarete) => nombreConfettis(RARETES[rarete].confettis, false))).toEqual([
      0, 0, 0, 26, 40,
    ]);
  });

  it('divise les confettis par deux en mode effets réduits', () => {
    expect(RARITIES.map((rarete) => nombreConfettis(RARETES[rarete].confettis, true))).toEqual([
      0, 0, 0, 13, 20,
    ]);
  });

  it('suit le tableau du cahier des charges (retournement, reflet, tease)', () => {
    expect(RARITIES.map((r) => RARETES[r].dureeRetournementMs)).toEqual([650, 650, 650, 750, 900]);
    expect(RARITIES.map((r) => RARETES[r].reflet)).toEqual([false, false, true, true, true]);
    expect(RARITIES.map((r) => RARETES[r].tease)).toEqual([false, false, false, false, true]);
    expect(RARITIES.map((r) => RARETES[r].halo?.opacite ?? null)).toEqual([
      null,
      0.4,
      0.55,
      0.65,
      0.8,
    ]);
  });

  it('met une lueur autour des ultra-rares et des légendaires au bilan', () => {
    expect(RARITIES.map((r) => RARETES[r].lueurBilan)).toEqual([false, false, false, true, true]);
  });
});
