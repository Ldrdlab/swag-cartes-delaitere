/**
 * Tests des numéros de version.
 *
 * Rôle : vérifier la lecture, la comparaison et le test « version inférieure à la version minimum ».
 * Dépend de : vitest, domain/version.
 */
import { describe, expect, it } from 'vitest';
import {
  comparerVersions,
  estInferieure,
  incrementerVersion,
  lireVersion,
  versionValide,
} from './version';

describe('lireVersion', () => {
  it('décompose un numéro de version', () => {
    expect(lireVersion('0.1.0')).toEqual({ majeur: 0, mineur: 1, correctif: 0 });
    expect(lireVersion(' 12.30.4 ')).toEqual({ majeur: 12, mineur: 30, correctif: 4 });
  });

  it('refuse les formats invalides', () => {
    for (const texte of [
      '',
      '1',
      '1.2',
      '1.2.3.4',
      'a.b.c',
      '1.2.x',
      '01.2.3',
      'v1.2.3',
      '1.2.3-beta',
    ]) {
      expect(lireVersion(texte), texte).toBeNull();
      expect(versionValide(texte), texte).toBe(false);
    }
  });
});

describe('comparerVersions', () => {
  it('compare majeur, puis mineur, puis correctif', () => {
    expect(comparerVersions('1.0.0', '0.9.9')).toBeGreaterThan(0);
    expect(comparerVersions('0.2.0', '0.10.0')).toBeLessThan(0);
    expect(comparerVersions('0.1.2', '0.1.10')).toBeLessThan(0);
    expect(comparerVersions('0.1.0', '0.1.0')).toBe(0);
  });

  it('refuse une version illisible', () => {
    expect(() => comparerVersions('0.1.0', 'abc')).toThrow();
  });
});

describe('estInferieure', () => {
  it('dit si la version est en dessous de la référence', () => {
    expect(estInferieure('0.1.0', '0.2.0')).toBe(true);
    expect(estInferieure('0.2.0', '0.2.0')).toBe(false);
    expect(estInferieure('1.0.0', '0.9.9')).toBe(false);
  });

  it('ne bloque jamais quelqu’un à cause d’un texte illisible', () => {
    expect(estInferieure('0.1.0', 'n’importe quoi')).toBe(false);
    expect(estInferieure('?', '0.1.0')).toBe(false);
  });
});

describe('incrementerVersion', () => {
  it('augmente le correctif, le mineur ou le majeur', () => {
    expect(incrementerVersion('0.1.0', 'correctif')).toBe('0.1.1');
    expect(incrementerVersion('0.1.9', 'mineur')).toBe('0.2.0');
    expect(incrementerVersion('0.9.9', 'majeur')).toBe('1.0.0');
    expect(incrementerVersion('1.2.3', 'mineur')).toBe('1.3.0');
  });

  it('refuse une version illisible', () => {
    expect(() => incrementerVersion('abc', 'mineur')).toThrow();
  });
});
