/**
 * Réglages du jeu (tirage des cartes).
 *
 * Rôle : centraliser le nombre de cartes par booster, les probabilités de rareté et les libellés.
 * Expose : CARDS_PER_BOOSTER, RARITY_WEIGHTS, RARITY_LABELS, STACK_VISIBLE_CARDS.
 * Dépend de : domain/types (type uniquement).
 * Pour changer le nombre de cartes par booster : modifier CARDS_PER_BOOSTER ci-dessous.
 */
import type { Rarity } from '../domain/types';

/** Nombre de cartes dans un booster. */
export const CARDS_PER_BOOSTER = 5;

/**
 * Poids de tirage de chaque rareté (relatifs entre eux : 60/25/12/3 donne 60 % / 25 % / 12 % / 3 %).
 * Une rareté absente du booster est ignorée.
 */
export const RARITY_WEIGHTS: Readonly<Record<Rarity, number>> = {
  commune: 60,
  peu_commune: 25,
  rare: 12,
  ultra_rare: 3,
};

/** Libellés affichés pour chaque rareté. */
export const RARITY_LABELS: Readonly<Record<Rarity, string>> = {
  commune: 'Commune',
  peu_commune: 'Peu commune',
  rare: 'Rare',
  ultra_rare: 'Ultra-rare',
};

/** Nombre de cartes visibles dans la pile pendant la révélation (la carte du dessus + celles dessous). */
export const STACK_VISIBLE_CARDS = 3;
