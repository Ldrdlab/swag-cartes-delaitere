/**
 * Tests de l'insertion de valeurs dans les textes.
 *
 * Dépend de : vitest, content/formatTexte, content/textes.
 */
import { describe, expect, it } from 'vitest';
import { remplir } from './formatTexte';
import { TEXTES } from './textes';

describe('remplir', () => {
  it('remplace le repère {pseudo} par la valeur', () => {
    expect(remplir('Bon retour, {pseudo} !', { pseudo: 'Sacha' })).toBe('Bon retour, Sacha !');
  });

  it('remplace plusieurs repères, y compris répétés', () => {
    expect(remplir('{a}-{b}-{a}', { a: '1', b: '2' })).toBe('1-2-1');
  });

  it('laisse un repère inconnu tel quel', () => {
    expect(remplir('Salut {inconnu}', { pseudo: 'Sacha' })).toBe('Salut {inconnu}');
  });

  it('ne casse pas un texte sans repère', () => {
    expect(remplir('Bonjour', { pseudo: 'Sacha' })).toBe('Bonjour');
  });

  it('fonctionne avec les vrais textes du profil', () => {
    expect(remplir(TEXTES.profil.continuer, { pseudo: 'Sacha' })).toContain('Sacha');
    expect(remplir(TEXTES.profil.bonRetour, { pseudo: 'Sacha' })).toContain('Sacha');
  });
});
