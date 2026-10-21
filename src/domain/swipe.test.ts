/**
 * Tests de la classification des gestes (tap / swipe / rien).
 *
 * Dépend de : vitest, domain/swipe.
 */
import { describe, expect, it } from 'vitest';
import { classifyGesture, type SwipeThresholds } from './swipe';

const seuils: SwipeThresholds = {
  tapMaxDistancePx: 10,
  tapMaxDurationMs: 500,
  swipeMinDistancePx: 40,
  swipeMinVelocityPxPerMs: 0.2,
};

describe('classifyGesture', () => {
  it('reconnaît un tap : peu de mouvement, geste bref', () => {
    expect(classifyGesture({ deltaX: 2, deltaY: -3, durationMs: 120 }, seuils)).toBe('tap');
  });

  it('ignore un appui long sans mouvement (ni tap, ni swipe)', () => {
    expect(classifyGesture({ deltaX: 0, deltaY: 0, durationMs: 900 }, seuils)).toBe('none');
  });

  it('reconnaît un swipe vers la gauche rapide et assez long', () => {
    expect(classifyGesture({ deltaX: -120, deltaY: 10, durationMs: 200 }, seuils)).toBe(
      'swipe-left',
    );
  });

  it('reconnaît un swipe vers la droite rapide et assez long', () => {
    expect(classifyGesture({ deltaX: 120, deltaY: -10, durationMs: 200 }, seuils)).toBe(
      'swipe-right',
    );
  });

  it('ignore un swipe trop court (jamais un tap, jamais un swipe)', () => {
    expect(classifyGesture({ deltaX: 25, deltaY: 0, durationMs: 50 }, seuils)).toBe('none');
  });

  it('ignore un swipe trop lent', () => {
    // 100 px en 1 s = 0,1 px/ms < 0,2 px/ms
    expect(classifyGesture({ deltaX: 100, deltaY: 0, durationMs: 1000 }, seuils)).toBe('none');
  });

  it('ignore un geste plutôt vertical', () => {
    expect(classifyGesture({ deltaX: 60, deltaY: 90, durationMs: 150 }, seuils)).toBe('none');
  });

  it('un geste qui a bougé au-delà de la tolérance du tap n’est jamais un tap', () => {
    expect(classifyGesture({ deltaX: 15, deltaY: 0, durationMs: 80 }, seuils)).not.toBe('tap');
  });
});
