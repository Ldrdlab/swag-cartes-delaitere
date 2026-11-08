/**
 * Tests du catalogue des boosters.
 *
 * Rôle : vérifier que chaque booster pointe vers une skin existante du registre, que les identifiants
 * sont uniques et que les thèmes sont complets.
 * Dépend de : vitest, boosters/catalogue, boosters/skins/registre, boosters/taille,
 * config/boosters.
 */
import { describe, expect, it } from 'vitest';
import { HAUTEUR_REFERENCE, LARGEUR_REFERENCE } from '../config/boosters';
import { CATALOGUE, getBoosterAt } from './catalogue';
import { SKINS } from './skins/registre';
import { ajusterBooster } from './taille';

describe('catalogue des boosters', () => {
  it('contient au moins un booster', () => {
    expect(CATALOGUE.length).toBeGreaterThan(0);
  });

  it('chaque booster pointe vers une skin existante du registre', () => {
    for (const booster of CATALOGUE) {
      expect(Object.keys(SKINS), `${booster.theme.id} → skin « ${booster.skin} »`).toContain(
        booster.skin,
      );
      expect(typeof SKINS[booster.skin]).toBe('function');
    }
  });

  it('les identifiants de thèmes sont uniques', () => {
    const ids = CATALOGUE.map((booster) => booster.theme.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chaque thème a ses textes, ses couleurs et une illustration', () => {
    for (const { theme } of CATALOGUE) {
      for (const texte of [theme.nom, theme.ligne1, theme.ligne2, theme.saison, theme.code]) {
        expect(texte.trim(), theme.id).not.toBe('');
      }
      expect(theme.ligne1, theme.id).toBe(theme.ligne1.toUpperCase());
      expect(theme.ligne2, theme.id).toBe(theme.ligne2.toUpperCase());
      expect(Object.values(theme.couleurs).every((couleur) => couleur.trim() !== '')).toBe(true);
      expect(theme.illustration.length, theme.id).toBeGreaterThan(0);
      expect(theme.effets.foilIntensite).toBeGreaterThanOrEqual(0);
      expect(theme.effets.foilIntensite).toBeLessThanOrEqual(1);
    }
  });
});

describe('getBoosterAt', () => {
  it('renvoie le booster demandé et boucle hors de la liste', () => {
    expect(getBoosterAt(0)).toBe(CATALOGUE[0]);
    expect(getBoosterAt(CATALOGUE.length)).toBe(CATALOGUE[0]);
    expect(getBoosterAt(-1)).toBe(CATALOGUE[CATALOGUE.length - 1]);
  });
});

describe('ajusterBooster', () => {
  const rapport = HAUTEUR_REFERENCE / LARGEUR_REFERENCE;

  it('remplit la largeur quand la place est étroite et haute, sans déformer le booster', () => {
    const taille = ajusterBooster(398, 753);
    expect(taille.largeur).toBeLessThanOrEqual(398);
    expect(taille.hauteur).toBeLessThanOrEqual(753);
    expect(taille.hauteur / taille.largeur).toBeCloseTo(rapport);
  });

  it('remplit la hauteur quand la place est large', () => {
    const taille = ajusterBooster(1000, 320);
    expect(taille.hauteur).toBeCloseTo(320);
    expect(taille.largeur).toBeCloseTo(172);
  });

  it('renvoie 0 × 0 tant que la place n’est pas connue', () => {
    expect(ajusterBooster(0, 500)).toEqual({ largeur: 0, hauteur: 0 });
  });
});
