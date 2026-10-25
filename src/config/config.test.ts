/**
 * Tests de cohérence des réglages.
 *
 * Rôle : empêcher qu'une valeur de config/ rende le jeu injouable sans que cela se voie
 * (ex. une découpe impossible à valider, un tirage sans poids).
 * Dépend de : vitest, config/*.
 */
import { describe, expect, it } from 'vitest';
import { RARITIES } from '../domain/types';
import { CARDS_PER_BOOSTER, RARITY_WEIGHTS } from './game';
import { CUT_THRESHOLDS, SWIPE_THRESHOLDS } from './gestures';
import { PSEUDO_MAX_LENGTH, PSEUDO_MIN_LENGTH } from './profile';

describe('réglages de la découpe', () => {
  it('garde la bande de découpe entièrement à l’intérieur du booster', () => {
    const { cutLineYRatio, bandToleranceRatio } = CUT_THRESHOLDS;
    expect(cutLineYRatio - bandToleranceRatio).toBeGreaterThanOrEqual(0);
    expect(cutLineYRatio + bandToleranceRatio).toBeLessThanOrEqual(1);
  });

  it('laisse assez de place pour parcourir la distance demandée depuis un bord', () => {
    const { startEdgeRatio, completionRatio } = CUT_THRESHOLDS;
    expect(startEdgeRatio).toBeGreaterThan(0);
    expect(startEdgeRatio).toBeLessThan(0.5);
    expect(completionRatio).toBeGreaterThan(0);
    // Départ au plus loin du bord + distance à parcourir : ne doit pas sortir du booster.
    expect(startEdgeRatio + completionRatio).toBeLessThanOrEqual(1.0001);
  });
});

describe('réglages des gestes', () => {
  it('distingue le tap du swipe (le swipe exige plus de mouvement qu’un tap)', () => {
    expect(SWIPE_THRESHOLDS.swipeMinDistancePx).toBeGreaterThan(SWIPE_THRESHOLDS.tapMaxDistancePx);
    expect(SWIPE_THRESHOLDS.swipeMinVelocityPxPerMs).toBeGreaterThan(0);
  });
});

describe('réglages du jeu', () => {
  it('tire au moins une carte par booster', () => {
    expect(Number.isInteger(CARDS_PER_BOOSTER)).toBe(true);
    expect(CARDS_PER_BOOSTER).toBeGreaterThan(0);
  });

  it('définit un poids positif ou nul pour chaque rareté, avec au moins un poids > 0', () => {
    for (const rarity of RARITIES) {
      expect(RARITY_WEIGHTS[rarity]).toBeGreaterThanOrEqual(0);
    }
    expect(RARITIES.some((rarity) => RARITY_WEIGHTS[rarity] > 0)).toBe(true);
  });
});

describe('réglages du profil', () => {
  it('a des bornes de pseudo cohérentes', () => {
    expect(PSEUDO_MIN_LENGTH).toBeGreaterThanOrEqual(1);
    expect(PSEUDO_MAX_LENGTH).toBeGreaterThanOrEqual(PSEUDO_MIN_LENGTH);
  });
});
