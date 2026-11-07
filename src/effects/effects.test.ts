/**
 * Tests du registre d'effets.
 *
 * Rôle : vérifier que le registre contient « aucun », que les clés sont valides pour la base, et que la
 * traduction clé ↔ valeur de la base fonctionne.
 * Dépend de : vitest, effects/index, effects/cles.
 */
import { describe, expect, it } from 'vitest';
import { baseDepuisCle, CLE_EFFET_AUCUN, cleDepuisBase } from './cles';
import { listerEffets, REGISTRE_EFFETS, trouverEffet } from './index';

describe('registre d’effets', () => {
  it('contient « aucun » (et rien d’autre pour l’instant)', () => {
    expect(Object.keys(REGISTRE_EFFETS)).toEqual([CLE_EFFET_AUCUN]);
    expect(listerEffets()).toEqual([{ cle: 'aucun', nom: 'Aucun' }]);
  });

  it('n’utilise que des clés acceptées par la base (minuscules, chiffres, souligné)', () => {
    for (const cle of Object.keys(REGISTRE_EFFETS)) expect(cle).toMatch(/^[a-z0-9_]{1,40}$/);
  });

  it('retombe sur « aucun » pour une clé inconnue', () => {
    expect(trouverEffet('effet_retire')).toBe(REGISTRE_EFFETS[CLE_EFFET_AUCUN]);
  });
});

describe('clés d’effets', () => {
  it('traduit le texte vide de la base en « aucun », et inversement', () => {
    expect(cleDepuisBase('')).toBe('aucun');
    expect(cleDepuisBase(null)).toBe('aucun');
    expect(cleDepuisBase(undefined)).toBe('aucun');
    expect(cleDepuisBase('holo')).toBe('holo');
    expect(baseDepuisCle('aucun')).toBe('');
    expect(baseDepuisCle('holo')).toBe('holo');
  });
});
