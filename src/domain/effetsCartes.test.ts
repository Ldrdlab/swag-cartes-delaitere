/**
 * Tests de la logique pure des effets de cartes.
 *
 * Rôle : vérifier l'effet par défaut selon la rareté, le calcul des zones, l'intensité, la qualité selon
 * l'appareil, l'inclinaison du téléphone et l'adoucissement du reflet.
 * Dépend de : vitest, domain/effetsCartes, config/effets.
 */
import { describe, expect, it } from 'vitest';
import { EFFETS_PAR_DEFAUT, GEOMETRIE_ZONES, SEUILS_APPAREIL_MODESTE } from '../config/effets';
import {
  effetParDefaut,
  facteurIntensite,
  positionDepuisInclinaison,
  rapprocher,
  resoudreQualite,
  zoneVersClipPath,
} from './effetsCartes';

describe('effetParDefaut', () => {
  it('suit la table rareté → effet', () => {
    expect(effetParDefaut('commune', undefined, EFFETS_PAR_DEFAUT)).toBe('aucun');
    expect(effetParDefaut('rare', undefined, EFFETS_PAR_DEFAUT)).toBe('holo');
    expect(effetParDefaut('mythique', 'feu', EFFETS_PAR_DEFAUT)).toBe('feu');
    expect(effetParDefaut('mythique', 'bronze', EFFETS_PAR_DEFAUT)).toBe('bronze');
    expect(effetParDefaut('secrete', 'argent', EFFETS_PAR_DEFAUT)).toBe('argent');
    expect(effetParDefaut('secrete', 'or', EFFETS_PAR_DEFAUT)).toBe('or');
  });

  it('donne « aucun » quand aucune règle ne correspond (variante manquante)', () => {
    expect(effetParDefaut('mythique', undefined, EFFETS_PAR_DEFAUT)).toBe('aucun');
  });
});

describe('facteurIntensite', () => {
  it('convertit les pourcentages et borne les valeurs', () => {
    expect(facteurIntensite(100)).toBe(1);
    expect(facteurIntensite(50)).toBe(0.5);
    expect(facteurIntensite(-20)).toBe(0);
    expect(facteurIntensite(250)).toBe(1);
    expect(facteurIntensite(Number.NaN)).toBe(0);
  });
});

describe('zoneVersClipPath', () => {
  it('ne découpe rien pour toute la carte', () => {
    expect(zoneVersClipPath('carte', GEOMETRIE_ZONES)).toBeUndefined();
  });

  it('découpe l’intérieur du cadre avec ses coins arrondis', () => {
    expect(zoneVersClipPath('interieur', GEOMETRIE_ZONES)).toBe('inset(2.69% 3.76% round 1.6cqw)');
  });

  it('découpe l’illustration encadrée (haut, droite, bas, gauche)', () => {
    expect(zoneVersClipPath('illustration', GEOMETRIE_ZONES)).toBe('inset(9.5% 7% 52.5% 7.5%)');
  });

  it('dessine la bande du cadre avec deux contours (règle pair-impair)', () => {
    const bande = zoneVersClipPath('cadre', GEOMETRIE_ZONES);
    expect(bande).toMatch(/^polygon\(evenodd, /);
    expect(bande).toContain('3.76% 2.69%');
    expect(bande).toContain('96.24% 97.31%');
  });
});

describe('resoudreQualite', () => {
  const seuils = SEUILS_APPAREIL_MODESTE;
  it('reste haute sur un appareil récent', () => {
    expect(resoudreQualite({ coeurs: 8, memoireGo: 8 }, seuils, false)).toBe('haute');
    expect(resoudreQualite({}, seuils, false)).toBe('haute');
  });
  it('passe en éco sur un appareil modeste ou en économie de données', () => {
    expect(resoudreQualite({ coeurs: 4 }, seuils, false)).toBe('eco');
    expect(resoudreQualite({ memoireGo: 2 }, seuils, false)).toBe('eco');
    expect(resoudreQualite({ coeurs: 8, economieDonnees: true }, seuils, false)).toBe('eco');
  });
  it('passe en éco quand les effets sont réduits', () => {
    expect(resoudreQualite({ coeurs: 8, memoireGo: 8 }, seuils, true)).toBe('eco');
  });
});

describe('positionDepuisInclinaison', () => {
  it('place le reflet au centre pour un téléphone tenu au repos', () => {
    expect(positionDepuisInclinaison(0, 45, 25, 45)).toEqual({ x: 0.5, y: 0.5 });
  });
  it('borne le reflet aux bords de la carte', () => {
    expect(positionDepuisInclinaison(90, -90, 25, 45)).toEqual({ x: 1, y: 0 });
    expect(positionDepuisInclinaison(-90, 180, 25, 45)).toEqual({ x: 0, y: 1 });
  });
});

describe('rapprocher', () => {
  it('avance d’une part du chemin vers la cible', () => {
    const { position, arrivee } = rapprocher({ x: 0, y: 0 }, { x: 1, y: 1 }, 0.5, 0.001);
    expect(position).toEqual({ x: 0.5, y: 0.5 });
    expect(arrivee).toBe(false);
  });
  it('s’arrête quand l’écart est négligeable', () => {
    const { position, arrivee } = rapprocher({ x: 0.9995, y: 1 }, { x: 1, y: 1 }, 0.5, 0.001);
    expect(position).toEqual({ x: 1, y: 1 });
    expect(arrivee).toBe(true);
  });
});
