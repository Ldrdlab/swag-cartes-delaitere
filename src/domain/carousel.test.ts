/**
 * Tests de la logique d'index du carrousel.
 *
 * Dépend de : vitest, domain/carousel.
 */
import { describe, expect, it } from 'vitest';
import { relativeOffset, stepIndex, wrapIndex } from './carousel';

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
