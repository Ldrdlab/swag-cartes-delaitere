/**
 * Tests de la génération des effets de la révélation.
 *
 * Dépend de : vitest, domain/effets, domain/tremblement, config/revelation.
 */
import { describe, expect, it } from 'vitest';
import {
  COULEURS_CONFETTIS,
  GEOMETRIE_CONFETTIS,
  GEOMETRIE_ETINCELLES,
  NOMBRE_ETINCELLES,
  TREMBLEMENT,
} from '../config/revelation';
import { genererConfettis, genererEtincelles, nombreConfettis } from './effets';
import { genererImagesClesTremblement, transformTremblement } from './tremblement';

describe('genererImagesClesTremblement', () => {
  const images = genererImagesClesTremblement(TREMBLEMENT);

  it('génère 21 images-clés', () => {
    expect(images).toHaveLength(21);
  });

  it('commence doucement et finit fort (amplitude, rotation, échelle)', () => {
    const premiere = images[0];
    const derniere = images[images.length - 1];
    expect(Math.abs(premiere?.decalageX ?? 0)).toBeCloseTo(0.4);
    expect(Math.abs(derniere?.decalageX ?? 0)).toBeCloseTo(8);
    expect(Math.abs(premiere?.rotationDeg ?? 0)).toBeCloseTo(0.15);
    expect(Math.abs(derniere?.rotationDeg ?? 0)).toBeCloseTo(3.15);
    expect(premiere?.echelle).toBeCloseTo(1);
    expect(derniere?.echelle).toBeCloseTo(1.045);
  });

  it('a une amplitude strictement croissante', () => {
    const amplitudes = images.map((image) => Math.abs(image.decalageX));
    for (let i = 1; i < amplitudes.length; i += 1) {
      expect(amplitudes[i] ?? 0).toBeGreaterThan(amplitudes[i - 1] ?? 0);
    }
  });

  it('alterne les signes d’une image à l’autre', () => {
    for (let i = 1; i < images.length; i += 1) {
      const avant = images[i - 1]?.decalageX ?? 0;
      const apres = images[i]?.decalageX ?? 0;
      expect(Math.sign(apres)).toBe(-Math.sign(avant));
    }
  });

  it('couvre toute l’animation de 0 à 1', () => {
    expect(images[0]?.offset).toBe(0);
    expect(images[images.length - 1]?.offset).toBe(1);
  });

  it('écrit une valeur CSS transform valide', () => {
    const image = images[3];
    expect(image && transformTremblement(image)).toMatch(
      /^translate\(-?[\d.]+px, -?[\d.]+px\) rotate\(-?[\d.]+deg\) scale\([\d.]+\)$/,
    );
  });
});

describe('confettis', () => {
  it('génère exactement le nombre demandé, et aucun pour 0', () => {
    expect(genererConfettis(26, COULEURS_CONFETTIS, GEOMETRIE_CONFETTIS)).toHaveLength(26);
    expect(genererConfettis(40, COULEURS_CONFETTIS, GEOMETRIE_CONFETTIS)).toHaveLength(40);
    expect(genererConfettis(0, COULEURS_CONFETTIS, GEOMETRIE_CONFETTIS)).toEqual([]);
  });

  it('est déterministe : deux appels donnent les mêmes confettis', () => {
    expect(genererConfettis(40, COULEURS_CONFETTIS, GEOMETRIE_CONFETTIS)).toEqual(
      genererConfettis(40, COULEURS_CONFETTIS, GEOMETRIE_CONFETTIS),
    );
  });

  it('respecte les bornes de taille, de durée, de délai et de dérive', () => {
    const g = GEOMETRIE_CONFETTIS;
    for (const piece of genererConfettis(40, COULEURS_CONFETTIS, g)) {
      expect(piece.largeur).toBeGreaterThanOrEqual(g.largeurMin);
      expect(piece.largeur).toBeLessThanOrEqual(g.largeurMax);
      expect(piece.dureeS).toBeGreaterThanOrEqual(g.dureeMinS);
      expect(piece.dureeS).toBeLessThanOrEqual(g.dureeMaxS);
      expect(piece.delaiS).toBeGreaterThanOrEqual(0);
      expect(piece.delaiS).toBeLessThanOrEqual(g.delaiMaxS);
      expect(Math.abs(piece.deriveX)).toBeLessThanOrEqual(g.deriveMaxPx);
      expect(Math.abs(piece.rotationDeg)).toBeLessThanOrEqual(g.rotationMaxDeg);
      expect(COULEURS_CONFETTIS).toContain(piece.couleur);
      if (piece.ronde) expect(piece.hauteur).toBe(piece.largeur);
    }
  });

  it('divise le nombre de confettis par deux en mode effets réduits', () => {
    expect(nombreConfettis(40, false)).toBe(40);
    expect(nombreConfettis(40, true)).toBe(20);
    expect(nombreConfettis(26, true)).toBe(13);
    expect(nombreConfettis(0, true)).toBe(0);
  });
});

describe('étincelles', () => {
  it('génère le nombre configuré, avec des départs décalés', () => {
    const etincelles = genererEtincelles(NOMBRE_ETINCELLES, GEOMETRIE_ETINCELLES);
    expect(etincelles).toHaveLength(12);
    expect(etincelles[1]?.delaiS).toBeCloseTo(0.2);
    for (const etincelle of etincelles) {
      expect(etincelle.delaiS).toBeLessThan(GEOMETRIE_ETINCELLES.dureeS);
    }
  });
});
