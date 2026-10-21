/**
 * Tests de la validation / import de cartes depuis un JSON externe.
 *
 * Dépend de : vitest, domain/cardImport.
 */
import { describe, expect, it } from 'vitest';
import { importCards } from './cardImport';

describe('importCards', () => {
  it('importe un tableau de cartes valides', () => {
    const resultat = importCards([
      { id: 'a', name: 'Alpha', rarity: 'commune' },
      { id: 'b', name: 'Beta', rarity: 'rare', imageUrl: 'beta.png' },
    ]);
    expect(resultat).toEqual({
      ok: true,
      cards: [
        { id: 'a', name: 'Alpha', rarity: 'commune' },
        { id: 'b', name: 'Beta', rarity: 'rare', imageUrl: 'beta.png' },
      ],
    });
  });

  it('accepte aussi un objet { cards: [...] }', () => {
    const resultat = importCards({ cards: [{ id: 'a', name: 'Alpha', rarity: 'commune' }] });
    expect(resultat.ok).toBe(true);
  });

  it('reconnaît les raretés écrites avec espaces, tirets ou majuscules', () => {
    const resultat = importCards([
      { id: 'a', name: 'A', rarity: 'Peu commune' },
      { id: 'b', name: 'B', rarity: 'ultra-rare' },
    ]);
    expect(resultat).toMatchObject({
      ok: true,
      cards: [{ rarity: 'peu_commune' }, { rarity: 'ultra_rare' }],
    });
  });

  it('conserve les champs inconnus dans extra (champs libres)', () => {
    const resultat = importCards([
      { id: 'a', name: 'A', rarity: 'rare', pv: 70, extra: { auteur: 'Sam' } },
    ]);
    expect(resultat).toMatchObject({ ok: true, cards: [{ extra: { pv: 70, auteur: 'Sam' } }] });
  });

  it('refuse tout le fichier si une carte est invalide, avec un message par erreur', () => {
    const resultat = importCards([
      { id: 'a', name: 'Alpha', rarity: 'commune' },
      { id: '', name: 'Sans id', rarity: 'légendaire' },
    ]);
    expect(resultat.ok).toBe(false);
    if (!resultat.ok) {
      expect(resultat.errors).toHaveLength(2);
      expect(resultat.errors[0]).toContain('Carte n°2');
    }
  });

  it('refuse les identifiants en double', () => {
    const resultat = importCards([
      { id: 'a', name: 'Alpha', rarity: 'commune' },
      { id: 'a', name: 'Copie', rarity: 'commune' },
    ]);
    expect(resultat.ok).toBe(false);
  });

  it('refuse un contenu qui n’est pas une liste', () => {
    expect(importCards('n’importe quoi').ok).toBe(false);
    expect(importCards(null).ok).toBe(false);
    expect(importCards([42]).ok).toBe(false);
  });
});
