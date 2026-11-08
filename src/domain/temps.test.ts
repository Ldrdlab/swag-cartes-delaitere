/**
 * Tests de l'affichage des durées.
 *
 * Rôle : vérifier la décomposition (arrondie à la minute supérieure) et le texte produit.
 * Dépend de : vitest, domain/temps.
 */
import { describe, expect, it } from 'vitest';
import { decomposerDuree, formaterDuree } from './temps';

const mots = { heures: 'h', minutes: 'min', moinsUneMinute: 'moins d’une minute' };

describe('decomposerDuree', () => {
  it('arrondit à la minute supérieure', () => {
    expect(decomposerDuree(1)).toEqual({ heures: 0, minutes: 1 });
    expect(decomposerDuree(60)).toEqual({ heures: 0, minutes: 1 });
    expect(decomposerDuree(61)).toEqual({ heures: 0, minutes: 2 });
    expect(decomposerDuree(3600)).toEqual({ heures: 1, minutes: 0 });
    expect(decomposerDuree(3 * 3600 + 11 * 60 + 5)).toEqual({ heures: 3, minutes: 12 });
  });

  it('compte 0 pour une durée nulle, négative ou illisible', () => {
    for (const valeur of [0, -5, Number.NaN, Number.POSITIVE_INFINITY * -1]) {
      expect(decomposerDuree(valeur)).toEqual({ heures: 0, minutes: 0 });
    }
  });
});

describe('formaterDuree', () => {
  it('écrit les heures et les minutes', () => {
    expect(formaterDuree(3 * 3600 + 12 * 60, mots)).toBe('3 h 12 min');
    expect(formaterDuree(45 * 60, mots)).toBe('45 min');
    expect(formaterDuree(2 * 3600, mots)).toBe('2 h');
  });

  it('dit « moins d’une minute » à zéro', () => {
    expect(formaterDuree(0, mots)).toBe('moins d’une minute');
  });
});
