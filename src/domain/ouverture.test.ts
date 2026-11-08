/**
 * Tests de la conversion des réponses d'ouverture de booster.
 *
 * Rôle : vérifier la lecture du statut du jour et des cartes tirées (badge « Nouvelle ! », quantité,
 * adresses d'images, doublons dans un même booster).
 * Dépend de : vitest, domain/ouverture.
 */
import { describe, expect, it } from 'vitest';
import {
  cheminsOuverture,
  ouvertureDepuisJson,
  statutDepuisLigne,
  type CarteTireeBrute,
  type OuvertureBrute,
} from './ouverture';

const carte = (id: string, changement: Partial<CarteTireeBrute> = {}): CarteTireeBrute => ({
  card_id: id,
  name: `Carte ${id}`,
  rarity: 'commune',
  variant: null,
  effect: '',
  image_path: `${id}.webp`,
  thumb_path: `${id}-mini.webp`,
  is_new: false,
  quantity: 1,
  ...changement,
});

describe('statutDepuisLigne', () => {
  it('lit le statut du jour', () => {
    expect(
      statutDepuisLigne({ per_day: 3, used: 1, remaining: 2, seconds_until_reset: 4000 }),
    ).toEqual({ parJour: 3, utilises: 1, restants: 2, secondesAvantReset: 4000 });
  });
});

describe('ouvertureDepuisJson', () => {
  const brut: OuvertureBrute = {
    cards: [
      carte('a', { is_new: true }),
      carte('b', { rarity: 'mythique', variant: 'feu', quantity: 3 }),
      carte('a', { quantity: 2 }),
    ],
    remaining: 1,
  };
  const adresses = new Map([
    ['a.webp', 'https://x/a'],
    ['a-mini.webp', 'https://x/a-mini'],
    ['b.webp', 'https://x/b'],
  ]);

  it('garde l’ordre du tirage et le badge « Nouvelle ! » de chaque carte', () => {
    const { cartes, restants } = ouvertureDepuisJson(brut, adresses);
    expect(restants).toBe(1);
    expect(cartes.map((c) => [c.id, c.nouvelle, c.quantite])).toEqual([
      ['a', true, 1],
      ['b', false, 3],
      ['a', false, 2],
    ]);
  });

  it('transmet variante et adresses signées, et omet celles qui manquent', () => {
    const { cartes } = ouvertureDepuisJson(brut, adresses);
    expect(cartes[1]?.variant).toBe('feu');
    expect(cartes[0]?.imageUrl).toBe('https://x/a');
    expect(cartes[0]?.thumbUrl).toBe('https://x/a-mini');
    expect(cartes[1]?.imageUrl).toBe('https://x/b');
    expect(cartes[1]?.thumbUrl).toBeUndefined();
    expect(cartes[0]?.variant).toBeUndefined();
  });
});

describe('cheminsOuverture', () => {
  it('liste chaque chemin une seule fois (une carte tirée deux fois)', () => {
    const chemins = cheminsOuverture({
      cards: [carte('a'), carte('a'), carte('b', { thumb_path: null })],
      remaining: 0,
    });
    expect(chemins).toEqual(['a.webp', 'a-mini.webp', 'b.webp']);
  });
});
