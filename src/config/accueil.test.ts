/**
 * Tests de cohérence des réglages de l'écran d'accueil.
 *
 * Rôle : repérer une faute de frappe dans config/accueil.ts (carte hors écran, taille nulle...).
 * Dépend de : vitest, config/accueil.
 */
import { describe, expect, it } from 'vitest';
import { CARTES_FLOTTANTES, REGLAGES_ANIMATION } from './accueil';

describe('cartes flottantes de l’accueil', () => {
  it('place chaque carte (au moins en partie) dans l’écran', () => {
    for (const carte of CARTES_FLOTTANTES) {
      expect(carte.x).toBeGreaterThanOrEqual(-10);
      expect(carte.x).toBeLessThanOrEqual(110);
      expect(carte.y).toBeGreaterThanOrEqual(-10);
      expect(carte.y).toBeLessThanOrEqual(110);
    }
  });

  it('donne une largeur positive à chaque carte', () => {
    for (const carte of CARTES_FLOTTANTES) {
      expect(carte.largeur).toBeGreaterThan(0);
    }
  });

  it('contient les trois profondeurs, dont 3 ou 4 cartes proches', () => {
    const proches = CARTES_FLOTTANTES.filter((carte) => carte.profondeur === 'proche');
    expect(proches.length).toBeGreaterThanOrEqual(3);
    expect(proches.length).toBeLessThanOrEqual(4);
    expect(CARTES_FLOTTANTES.some((carte) => carte.profondeur === 'moyenne')).toBe(true);
    expect(CARTES_FLOTTANTES.some((carte) => carte.profondeur === 'lointaine')).toBe(true);
  });

  it('a des durées d’animation positives', () => {
    expect(REGLAGES_ANIMATION.dureeFlottementS).toBeGreaterThan(0);
    expect(REGLAGES_ANIMATION.dureePulsationS).toBeGreaterThan(0);
    expect(REGLAGES_ANIMATION.amplitudeFlottementPx).toBeGreaterThanOrEqual(0);
  });
});
