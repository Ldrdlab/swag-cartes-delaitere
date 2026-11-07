/**
 * Tests des réglages de booster.
 *
 * Rôle : vérifier le total des probabilités (sans erreur d'arrondi) et la validation des réglages.
 * Dépend de : vitest, domain/reglages, config/reglages.
 */
import { describe, expect, it } from 'vitest';
import { LIMITES_REGLAGES, REGLAGES_PAR_DEFAUT } from '../config/reglages';
import { lireNombreSaisi, totalProbabilites, verifierReglages, type ReglagesJeu } from './reglages';

const decimales = LIMITES_REGLAGES.decimalesProbabilite;
const verifier = (changement: Partial<ReglagesJeu>) =>
  verifierReglages({ ...REGLAGES_PAR_DEFAUT, ...changement }, LIMITES_REGLAGES);

describe('lireNombreSaisi', () => {
  it('accepte le point et la virgule', () => {
    expect(lireNombreSaisi('0.6')).toBe(0.6);
    expect(lireNombreSaisi(' 0,25 ')).toBe(0.25);
    expect(lireNombreSaisi('60')).toBe(60);
  });

  it('renvoie NaN pour tout le reste', () => {
    for (const texte of ['', ' ', 'abc', '-5', '1e3', '1.2.3', '0,5,5']) {
      expect(lireNombreSaisi(texte), texte).toBeNaN();
    }
  });
});

describe('totalProbabilites', () => {
  it('fait exactement 100 pour les valeurs par défaut', () => {
    expect(totalProbabilites(REGLAGES_PAR_DEFAUT.probabilites, decimales)).toBe(100);
  });

  it('ne souffre pas des erreurs d’arrondi des nombres décimaux', () => {
    const p = { ...REGLAGES_PAR_DEFAUT.probabilites, commune: 0.1, peu_commune: 0.2 };
    const autres = 10 + 3 + 1 + 0.6 + 0.4;
    expect(totalProbabilites(p, decimales)).toBeCloseTo(0.3 + autres, 10);
  });
});

describe('verifierReglages', () => {
  it('accepte les valeurs par défaut', () => {
    expect(verifier({})).toEqual([]);
  });

  it('refuse un total différent de 100', () => {
    const probabilites = { ...REGLAGES_PAR_DEFAUT.probabilites, commune: 50 };
    expect(verifier({ probabilites })).toEqual(['total_incorrect']);
  });

  it('accepte une répartition à 100 % avec des décimales', () => {
    const probabilites = {
      commune: 50.5,
      peu_commune: 25,
      rare: 10,
      super_rare: 3,
      legendaire: 1,
      mythique: 0.25,
      secrete: 10.25,
    };
    expect(verifier({ probabilites })).toEqual([]);
  });

  it('refuse une probabilité négative, absente ou avec trop de décimales', () => {
    const base = REGLAGES_PAR_DEFAUT.probabilites;
    expect(verifier({ probabilites: { ...base, commune: -5, rare: 75 } })).toEqual([
      'probabilite_invalide',
    ]);
    expect(verifier({ probabilites: { ...base, commune: Number.NaN } })).toEqual([
      'probabilite_invalide',
    ]);
    expect(verifier({ probabilites: { ...base, commune: 59.999 } })).toEqual([
      'probabilite_invalide',
    ]);
  });

  it('refuse un nombre de cartes ou de boosters hors des bornes', () => {
    expect(verifier({ cartesParBooster: 0 })).toEqual(['cartes_invalides']);
    expect(verifier({ cartesParBooster: 11 })).toEqual(['cartes_invalides']);
    expect(verifier({ cartesParBooster: 2.5 })).toEqual(['cartes_invalides']);
    expect(verifier({ boostersParJour: 0 })).toEqual(['boosters_invalides']);
    expect(verifier({ boostersParJour: 101 })).toEqual(['boosters_invalides']);
  });

  it('cumule plusieurs erreurs', () => {
    expect(verifier({ cartesParBooster: 0, boostersParJour: 0 })).toEqual([
      'cartes_invalides',
      'boosters_invalides',
    ]);
  });
});
