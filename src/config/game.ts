/**
 * Réglages du jeu (tirage des cartes).
 *
 * Rôle : centraliser le nombre de cartes par booster et les probabilités de rareté.
 * Les noms affichés, les couleurs et les effets de chaque rareté sont dans config/raretes.ts.
 * Expose : CARDS_PER_BOOSTER, RARITY_WEIGHTS.
 * Dépend de : domain/types (type uniquement).
 * Pour changer le nombre de cartes par booster : modifier CARDS_PER_BOOSTER ci-dessous.
 */
import type { Rarity } from '../domain/types';

/** Nombre de cartes dans un booster. */
export const CARDS_PER_BOOSTER = 5;

/**
 * Poids de tirage de chaque rareté (relatifs entre eux : 60/25/11/3/1 donne 60 % / 25 % / 11 % / 3 % / 1 %).
 * Une rareté absente du booster est ignorée.
 */
export const RARITY_WEIGHTS: Readonly<Record<Rarity, number>> = {
  commune: 60,
  peu_commune: 25,
  rare: 11,
  ultra_rare: 3,
  legendaire: 1,
};
