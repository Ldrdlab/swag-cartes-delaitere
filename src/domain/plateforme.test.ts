/**
 * Tests de la détection de plateforme.
 *
 * Rôle : vérifier la reconnaissance d'un iPhone, d'un iPad récent, d'Android et d'un ordinateur.
 * Dépend de : vitest, domain/plateforme.
 */
import { describe, expect, it } from 'vitest';
import { detecterPlateforme } from './plateforme';

describe('detecterPlateforme', () => {
  it('reconnaît un iPhone et un iPad', () => {
    expect(detecterPlateforme('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe(
      'ios',
    );
    expect(detecterPlateforme('Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)')).toBe('ios');
  });

  it('reconnaît un iPad récent qui se présente comme un Mac (écran tactile)', () => {
    const mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
    expect(detecterPlateforme(mac, 5)).toBe('ios');
    expect(detecterPlateforme(mac, 0)).toBe('bureau');
  });

  it('reconnaît Android', () => {
    expect(detecterPlateforme('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120')).toBe(
      'android',
    );
  });

  it('considère le reste comme un ordinateur', () => {
    expect(detecterPlateforme('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120')).toBe(
      'bureau',
    );
    expect(detecterPlateforme('')).toBe('bureau');
  });
});
