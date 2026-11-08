/**
 * Tests de la logique pure de l'animation des effets.
 *
 * Rôle : vérifier l'orbite au repos, le lissage indépendant de la fréquence d'images, le retour doux
 * après un geste, la phase propre à chaque carte et le choix des dessins WebGL qui animent.
 * Dépend de : vitest, domain/animationEffets, config/effets.
 */
import { describe, expect, it } from 'vitest';
import { GESTE, ORBITE, WEBGL_ANIMES_MAX } from '../config/effets';
import {
  adoucir,
  avancerPoids,
  choisirAnimes,
  lisserVers,
  melanger,
  phaseDepuisTexte,
  positionOrbite,
} from './animationEffets';

describe('positionOrbite', () => {
  it('part du bord droit de l’orbite à la phase 0, centrée sur la carte', () => {
    const p = positionOrbite(0, 0, ORBITE);
    expect(p.x).toBeCloseTo(0.5 + ORBITE.rayon);
    expect(p.y).toBeCloseTo(0.5);
  });

  it('fait un tour complet en une période', () => {
    const debut = positionOrbite(1.3, 0.7, ORBITE);
    const fin = positionOrbite(1.3 + ORBITE.periodeSecondes, 0.7, ORBITE);
    expect(fin.x).toBeCloseTo(debut.x);
    expect(fin.y).toBeCloseTo(debut.y);
  });

  it('reste dans la carte et ne dépasse jamais le rayon', () => {
    for (let s = 0; s < 20; s += 0.37) {
      const p = positionOrbite(s, 2.1, ORBITE);
      expect(Math.hypot(p.x - 0.5, p.y - 0.5)).toBeCloseTo(ORBITE.rayon);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
    }
  });

  it('inclinaison au repos de 3 à 4° au plus (réglage de départ)', () => {
    const degres = ORBITE.rayon * 2 * 9;
    expect(degres).toBeGreaterThanOrEqual(3);
    expect(degres).toBeLessThanOrEqual(4);
  });
});

describe('lisserVers', () => {
  it('avance d’une part du chemin, sans jamais dépasser la cible', () => {
    const p = lisserVers({ x: 0, y: 0 }, { x: 1, y: 1 }, GESTE.lissageMs, GESTE.lissageMs);
    expect(p.x).toBeCloseTo(1 - Math.exp(-1));
    expect(p.x).toBeLessThan(1);
  });

  it('donne le même résultat à 30 ou 60 images par seconde', () => {
    const un = lisserVers({ x: 0, y: 0 }, { x: 1, y: 1 }, 33.3, GESTE.lissageMs);
    const deux = lisserVers(
      lisserVers({ x: 0, y: 0 }, { x: 1, y: 1 }, 16.65, GESTE.lissageMs),
      { x: 1, y: 1 },
      16.65,
      GESTE.lissageMs,
    );
    expect(deux.x).toBeCloseTo(un.x, 6);
  });

  it('saute à la cible quand le lissage est nul', () => {
    expect(lisserVers({ x: 0, y: 0 }, { x: 0.4, y: 0.6 }, 16, 0)).toEqual({ x: 0.4, y: 0.6 });
  });
});

describe('avancerPoids / adoucir', () => {
  it('monte vite au début du geste et redescend en environ 0,5 s à la fin', () => {
    expect(avancerPoids(0, true, GESTE.priseMs, GESTE)).toBe(1);
    expect(avancerPoids(1, false, GESTE.retourMs / 2, GESTE)).toBeCloseTo(0.5);
    expect(avancerPoids(1, false, GESTE.retourMs, GESTE)).toBe(0);
    expect(avancerPoids(0, false, 100, GESTE)).toBe(0);
  });

  it('adoucit sans saut aux extrémités', () => {
    expect(adoucir(0)).toBe(0);
    expect(adoucir(1)).toBe(1);
    expect(adoucir(0.5)).toBeCloseTo(0.5);
    expect(adoucir(0.1)).toBeLessThan(0.1);
  });

  it('mélange deux positions', () => {
    expect(melanger({ x: 0, y: 0 }, { x: 1, y: 0.5 }, 0.5)).toEqual({ x: 0.5, y: 0.25 });
  });
});

describe('phaseDepuisTexte', () => {
  it('est toujours la même pour une même carte, entre 0 et 2π', () => {
    const phase = phaseDepuisTexte('carte-1');
    expect(phaseDepuisTexte('carte-1')).toBe(phase);
    expect(phase).toBeGreaterThanOrEqual(0);
    expect(phase).toBeLessThan(2 * Math.PI);
  });

  it('décale les cartes d’une grille', () => {
    const phases = new Set(
      Array.from({ length: 30 }, (_, i) => phaseDepuisTexte('id-' + i).toFixed(3)),
    );
    expect(phases.size).toBe(30);
  });
});

describe('choisirAnimes', () => {
  const c = (id: number, distance: number, prioritaire = false) => ({ id, distance, prioritaire });

  it('garde les N cartes les plus proches du centre', () => {
    const choisies = choisirAnimes([c(1, 300), c(2, 50), c(3, 120), c(4, 10)], 2);
    expect([...choisies].sort()).toEqual([2, 4]);
  });

  it('n’anime jamais une carte hors de l’écran', () => {
    expect([...choisirAnimes([c(1, Infinity), c(2, 40)], 2)]).toEqual([2]);
  });

  it('une carte prioritaire (agrandie ou retournée) est seule à animer', () => {
    expect([...choisirAnimes([c(1, 10), c(2, 500, true), c(3, 20)], 2)]).toEqual([2]);
  });

  it('avec plusieurs prioritaires, la dernière inscrite gagne', () => {
    expect([...choisirAnimes([c(1, 0, true), c(2, 0, true)], 2)]).toEqual([2]);
  });

  it('rien n’anime quand le maximum est zéro', () => {
    expect(choisirAnimes([c(1, 10)], 0).size).toBe(0);
  });

  it('les maximums de départ : 2 en élevée, 1 en économie', () => {
    expect(WEBGL_ANIMES_MAX).toEqual({ haute: 2, eco: 1 });
  });
});
