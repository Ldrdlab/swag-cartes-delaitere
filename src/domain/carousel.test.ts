/**
 * Tests de la logique d'index du carrousel.
 *
 * Dépend de : vitest, domain/carousel.
 */
import { describe, expect, it } from 'vitest';
import { carouselPositions, relativeOffset, stepIndex, wrapIndex } from './carousel';

describe('wrapIndex', () => {
  it('laisse inchangé un index déjà valide', () => {
    expect(wrapIndex(1, 3)).toBe(1);
  });

  it('boucle après le dernier élément', () => {
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(7, 3)).toBe(1);
  });

  it('boucle avant le premier élément (index négatifs)', () => {
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(-4, 3)).toBe(2);
  });
});

describe('stepIndex', () => {
  it('passe du 3e au 1er en avançant', () => {
    expect(stepIndex(2, 1, 3)).toBe(0);
  });

  it('passe du 1er au 3e en reculant', () => {
    expect(stepIndex(0, -1, 3)).toBe(2);
  });

  it('avance normalement au milieu de la liste', () => {
    expect(stepIndex(0, 1, 3)).toBe(1);
  });
});

describe('relativeOffset (3 éléments)', () => {
  it('place l’élément central à 0', () => {
    expect(relativeOffset(1, 1, 3)).toBe(0);
  });

  it('place les voisins à -1 et +1', () => {
    expect(relativeOffset(0, 1, 3)).toBe(-1);
    expect(relativeOffset(2, 1, 3)).toBe(1);
  });

  it('tient compte de la boucle quand le centre est aux extrémités', () => {
    // Centre = 1er élément : le 3e est « juste à gauche », le 2e « juste à droite ».
    expect(relativeOffset(2, 0, 3)).toBe(-1);
    expect(relativeOffset(1, 0, 3)).toBe(1);
    // Centre = 3e élément : le 1er est « juste à droite ».
    expect(relativeOffset(0, 2, 3)).toBe(1);
  });
});

describe('carouselPositions', () => {
  it('avec 3 boosters : un central et deux voisins visibles', () => {
    expect(carouselPositions(3, 1)).toEqual([
      { offset: -1, role: 'cote' },
      { offset: 0, role: 'centre' },
      { offset: 1, role: 'cote' },
    ]);
  });

  it('avec 3 boosters : boucle quand le premier est au centre', () => {
    expect(carouselPositions(3, 0)).toEqual([
      { offset: 0, role: 'centre' },
      { offset: 1, role: 'cote' },
      { offset: -1, role: 'cote' },
    ]);
  });

  it('avec 5 boosters : seuls les voisins immédiats sont visibles, les autres sont cachés', () => {
    expect(carouselPositions(5, 2)).toEqual([
      { offset: -2, role: 'cache' },
      { offset: -1, role: 'cote' },
      { offset: 0, role: 'centre' },
      { offset: 1, role: 'cote' },
      { offset: 2, role: 'cache' },
    ]);
  });

  it('avec 5 boosters : boucle autour du premier et du dernier', () => {
    expect(carouselPositions(5, 0).map((p) => p.role)).toEqual([
      'centre',
      'cote',
      'cache',
      'cache',
      'cote',
    ]);
    expect(carouselPositions(5, 4).map((p) => p.role)).toEqual([
      'cote',
      'cache',
      'cache',
      'cote',
      'centre',
    ]);
  });

  it('a toujours exactement un central, quel que soit le nombre de boosters', () => {
    for (const count of [1, 2, 3, 4, 5, 8]) {
      for (let centre = 0; centre < count; centre += 1) {
        const roles = carouselPositions(count, centre).map((p) => p.role);
        expect(roles.filter((role) => role === 'centre')).toHaveLength(1);
      }
    }
  });
});
