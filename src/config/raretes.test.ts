/**
 * Tests de la table des raretés.
 *
 * Rôle : vérifier qu'il y a UNE entrée complète par rareté, avec des étoiles croissantes, et que le
 * nombre de confettis suit le cahier des charges (0 / 0 / 0 / 26 / 40 / 40 / 40).
 * Dépend de : vitest, config/raretes, domain/types, domain/effets.
 */
import { describe, expect, it } from 'vitest';
import { nombreConfettis } from '../domain/effets';
import { RARITIES } from '../domain/types';
import { RARETES } from './raretes';

describe('table des raretés', () => {
  it('a une entrée pour chacune des 7 raretés', () => {
    expect(RARITIES).toHaveLength(7);
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

  it('a de 1 à 5 étoiles, une de plus à chaque rareté jusqu’à la légendaire (5 ensuite)', () => {
    expect(RARITIES.map((rarete) => RARETES[rarete].etoiles)).toEqual([1, 2, 3, 4, 5, 5, 5]);
  });

  it('lance 0, 0, 0, 26 puis 40 confettis (idem pour mythique et secrète)', () => {
    expect(RARITIES.map((rarete) => nombreConfettis(RARETES[rarete].confettis, false))).toEqual([
      0, 0, 0, 26, 40, 40, 40,
    ]);
  });

  it('divise les confettis par deux en mode effets réduits', () => {
    expect(RARITIES.map((rarete) => nombreConfettis(RARETES[rarete].confettis, true))).toEqual([
      0, 0, 0, 13, 20, 20, 20,
    ]);
  });

  it('suit le tableau du cahier des charges (retournement, reflet, tease)', () => {
    expect(RARITIES.map((r) => RARETES[r].dureeRetournementMs)).toEqual([
      650, 650, 650, 750, 900, 900, 900,
    ]);
    expect(RARITIES.map((r) => RARETES[r].reflet)).toEqual([
      false,
      false,
      true,
      true,
      true,
      true,
      true,
    ]);
    expect(RARITIES.map((r) => RARETES[r].tease)).toEqual([
      false,
      false,
      false,
      false,
      true,
      true,
      true,
    ]);
    expect(RARITIES.map((r) => RARETES[r].halo?.opacite ?? null)).toEqual([
      null,
      0.4,
      0.55,
      0.65,
      0.8,
      0.8,
      0.85,
    ]);
  });

  it('met une lueur autour des super rares et des raretés supérieures au bilan', () => {
    expect(RARITIES.map((r) => RARETES[r].lueurBilan)).toEqual([
      false,
      false,
      false,
      true,
      true,
      true,
      true,
    ]);
  });
});
