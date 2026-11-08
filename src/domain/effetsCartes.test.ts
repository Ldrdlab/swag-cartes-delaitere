/**
 * Tests de la logique pure des effets de cartes.
 *
 * Rôle : vérifier l'effet par défaut selon la rareté, le calcul des zones, l'intensité, la qualité selon
 * l'appareil, l'inclinaison du téléphone, l'adoucissement du reflet, les réglages enregistrés en base et
 * la résolution de l'effet d'une carte (automatique, forcé, aucun).
 * Dépend de : vitest, domain/effetsCartes, config/effets.
 */
import { describe, expect, it } from 'vitest';
import { EFFETS_PAR_DEFAUT, GEOMETRIE_ZONES, SEUILS_APPAREIL_MODESTE } from '../config/effets';
import {
  effetParDefaut,
  facteurIntensite,
  origineEffet,
  paramsDepuisJson,
  paramsVersJson,
  regleDepuisLigne,
  resoudreEffet,
  resoudreQualite,
  zoneVersClipPath,
  type RegleEffet,
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
  it('passe en éco quand les effets sont réduits, même si on a demandé la qualité élevée', () => {
    expect(resoudreQualite({ coeurs: 8, memoireGo: 8 }, seuils, true)).toBe('eco');
    expect(resoudreQualite({ coeurs: 8 }, seuils, true, 'haute')).toBe('eco');
  });
  it('respecte le choix du joueur : élevée même sur un appareil modeste, économie même sur un récent', () => {
    expect(resoudreQualite({ coeurs: 2 }, seuils, false, 'haute')).toBe('haute');
    expect(resoudreQualite({ coeurs: 12, memoireGo: 8 }, seuils, false, 'eco')).toBe('eco');
    expect(resoudreQualite({ coeurs: 2 }, seuils, false, 'auto')).toBe('eco');
  });
});

describe('paramsDepuisJson / paramsVersJson', () => {
  it('lit les réglages de la base', () => {
    expect(
      paramsDepuisJson({ intensity: 70, zone: 'cadre', settings: { vitesse: 1.5, densite: 2 } }),
    ).toEqual({ intensite: 70, zone: 'cadre', reglages: { vitesse: 1.5, densite: 2 } });
  });

  it('ignore ce qui est inattendu au lieu de planter', () => {
    expect(paramsDepuisJson(null)).toEqual({});
    expect(paramsDepuisJson('texte')).toEqual({});
    expect(paramsDepuisJson({ intensity: 'fort', zone: 'partout', settings: 3 })).toEqual({});
    expect(paramsDepuisJson({ settings: { vitesse: 'vite' } })).toEqual({});
  });

  it('prépare le JSON de la base sans écrire les champs absents', () => {
    expect(paramsVersJson(undefined)).toEqual({});
    expect(paramsVersJson({})).toEqual({});
    expect(paramsVersJson({ intensite: 0, reglages: { vitesse: 2 } })).toEqual({
      intensity: 0,
      settings: { vitesse: 2 },
    });
  });

  it('relit ce qu’il a écrit', () => {
    const params = { intensite: 55, zone: 'illustration' as const, reglages: { densite: 0.8 } };
    expect(paramsDepuisJson(paramsVersJson(params))).toEqual(params);
  });
});

describe('regleDepuisLigne', () => {
  it('traduit une ligne de rarity_effects', () => {
    expect(
      regleDepuisLigne({
        rarity: 'mythique',
        variant: 'feu',
        effect: 'feu',
        params: { intensity: 100 },
      }),
    ).toEqual({ rarete: 'mythique', variante: 'feu', cle: 'feu', params: { intensite: 100 } });
    expect(
      regleDepuisLigne({ rarity: 'rare', variant: null, effect: 'holo', params: {} }).variante,
    ).toBeUndefined();
  });
});

describe('origineEffet', () => {
  it('vide = automatique, aucun = aucun, le reste = forcé', () => {
    expect(origineEffet('')).toBe('automatique');
    expect(origineEffet(undefined)).toBe('automatique');
    expect(origineEffet('aucun')).toBe('aucun');
    expect(origineEffet('feu')).toBe('force');
  });
});

describe('resoudreEffet', () => {
  const regles: RegleEffet[] = [
    { rarete: 'rare', cle: 'holo', params: { intensite: 80, reglages: { vitesse: 2 } } },
    { rarete: 'commune', cle: 'aucun', params: {} },
    { rarete: 'mythique', variante: 'feu', cle: 'feu', params: {} },
  ];

  it('automatique : prend l’effet et les réglages de la rareté', () => {
    expect(resoudreEffet({ rarity: 'rare', effect: '' }, regles, 100)).toEqual({
      cle: 'holo',
      intensite: 80,
      zone: undefined,
      reglages: { vitesse: 2 },
      origine: 'automatique',
    });
  });

  it('automatique : l’intensité réglée sur la carte l’emporte, sans perdre les autres réglages', () => {
    const effet = resoudreEffet(
      { rarity: 'rare', effect: '', effectParams: { intensite: 30, zone: 'carte' } },
      regles,
      100,
    );
    expect(effet.intensite).toBe(30);
    expect(effet.zone).toBe('carte');
    expect(effet.reglages).toEqual({ vitesse: 2 });
  });

  it('automatique : l’intensité par défaut s’applique quand rien n’est réglé', () => {
    expect(
      resoudreEffet({ rarity: 'mythique', variant: 'feu', effect: '' }, regles, 100).intensite,
    ).toBe(100);
  });

  it('automatique : pas d’effet pour une rareté sans effet, une variante inconnue ou sans règle', () => {
    expect(resoudreEffet({ rarity: 'commune', effect: '' }, regles, 100).cle).toBe('aucun');
    expect(
      resoudreEffet({ rarity: 'mythique', variant: 'bronze', effect: '' }, regles, 100).cle,
    ).toBe('aucun');
    expect(resoudreEffet({ rarity: 'rare', effect: '' }, [], 100).cle).toBe('aucun');
  });

  it('aucun : jamais d’effet, même si la rareté en a un', () => {
    const effet = resoudreEffet({ rarity: 'rare', effect: 'aucun' }, regles, 100);
    expect(effet).toEqual({ cle: 'aucun', intensite: 0, origine: 'aucun' });
  });

  it('forcé : l’effet de la carte avec SES réglages (ceux de la rareté ne s’appliquent pas)', () => {
    const effet = resoudreEffet(
      { rarity: 'rare', effect: 'feu', effectParams: { intensite: 50 } },
      regles,
      100,
    );
    expect(effet).toEqual({
      cle: 'feu',
      intensite: 50,
      zone: undefined,
      reglages: undefined,
      origine: 'force',
    });
  });
});
