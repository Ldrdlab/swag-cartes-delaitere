/**
 * Tests de la détection du geste de découpe.
 *
 * Booster de test : 300 × 600 px. Ligne de découpe à y = 108 (18 %), bande de ± 42 px (7 %),
 * départ à moins de 60 px d'un bord (20 %), validation après 240 px parcourus (80 %).
 *
 * Dépend de : vitest, domain/cutGesture.
 */
import { describe, expect, it } from 'vitest';
import {
  endCut,
  IDLE_CUT,
  moveCut,
  startCut,
  type CutState,
  type CutThresholds,
  type Size,
} from './cutGesture';

const taille: Size = { width: 300, height: 600 };
const seuils: CutThresholds = {
  cutLineYRatio: 0.18,
  bandToleranceRatio: 0.07,
  startEdgeRatio: 0.2,
  completionRatio: 0.8,
};

/** Enchaîne un départ puis une suite de déplacements. */
function couper(depart: { x: number; y: number }, ...deplacements: { x: number; y: number }[]) {
  return deplacements.reduce<CutState>(
    (etat, point) => moveCut(etat, point, taille, seuils),
    startCut(depart, taille, seuils),
  );
}

describe('startCut', () => {
  it('accepte un départ près du bord gauche, dans la bande (sens vers la droite)', () => {
    expect(startCut({ x: 10, y: 108 }, taille, seuils)).toMatchObject({
      status: 'cutting',
      direction: 1,
    });
  });

  it('accepte un départ près du bord droit, dans la bande (sens vers la gauche)', () => {
    expect(startCut({ x: 290, y: 110 }, taille, seuils)).toMatchObject({
      status: 'cutting',
      direction: -1,
    });
  });

  it('refuse un départ au milieu du booster', () => {
    expect(startCut({ x: 150, y: 108 }, taille, seuils)).toEqual({
      status: 'cancelled',
      reason: 'bad-start',
    });
  });

  it('refuse un départ en dehors de la bande verticale', () => {
    expect(startCut({ x: 10, y: 300 }, taille, seuils)).toEqual({
      status: 'cancelled',
      reason: 'bad-start',
    });
  });
});

describe('moveCut', () => {
  it('fait progresser la découpe et mémorise la trace', () => {
    const etat = couper({ x: 10, y: 108 }, { x: 100, y: 110 });
    expect(etat.status).toBe('cutting');
    if (etat.status === 'cutting') {
      expect(etat.progress).toBeCloseTo(90 / 240);
      expect(etat.trail).toHaveLength(2);
    }
  });

  it('valide la découpe de gauche à droite quand 80 % de la largeur sont parcourus', () => {
    expect(couper({ x: 10, y: 108 }, { x: 249, y: 108 }).status).toBe('cutting');
    expect(couper({ x: 10, y: 108 }, { x: 251, y: 108 }).status).toBe('completed');
  });

  it('valide la découpe de droite à gauche', () => {
    expect(couper({ x: 290, y: 108 }, { x: 150, y: 108 }, { x: 49, y: 108 }).status).toBe(
      'completed',
    );
  });

  it('annule la découpe si le pointeur sort de la bande, et ignore la suite du geste', () => {
    const etat = couper({ x: 10, y: 108 }, { x: 100, y: 300 }, { x: 280, y: 108 });
    expect(etat).toEqual({ status: 'cancelled', reason: 'left-band' });
  });

  it('ne fait pas progresser la découpe quand on recule', () => {
    const etat = couper({ x: 50, y: 108 }, { x: 5, y: 108 });
    expect(etat).toMatchObject({ status: 'cutting', progress: 0 });
  });

  it('ne fait rien si aucune découpe n’est en cours', () => {
    expect(moveCut(IDLE_CUT, { x: 100, y: 108 }, taille, seuils)).toBe(IDLE_CUT);
  });
});

describe('endCut', () => {
  it('annule une découpe relâchée trop tôt', () => {
    const etat = endCut(couper({ x: 10, y: 108 }, { x: 100, y: 108 }));
    expect(etat).toEqual({ status: 'cancelled', reason: 'released-early' });
  });

  it('laisse une découpe déjà validée telle quelle', () => {
    const validee = couper({ x: 10, y: 108 }, { x: 260, y: 108 });
    expect(endCut(validee)).toBe(validee);
  });
});
