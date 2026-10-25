/**
 * Composition du bilan de fin de révélation (fonctions pures).
 *
 * Rôle : classer les cartes de la plus rare à la moins rare ; les premières sont mises en avant dans
 * « Tes meilleures cartes », les autres dans « Autres cartes ». À rareté égale, l'ordre du tirage est
 * conservé.
 * Expose : rangRarete(), trierParRarete(), composerBilan(), BilanCartes.
 * Dépend de : domain/types. Aucun import React ni DOM.
 */
import { RARITIES, type Card, type Rarity } from './types';

/** Résultat : les meilleures cartes, puis toutes les autres. */
export interface BilanCartes {
  meilleures: Card[];
  autres: Card[];
}

/**
 * Position d'une rareté dans l'échelle (0 = la plus fréquente, 4 = la plus rare).
 *
 * @param rarete - Une rareté.
 * @returns Son rang.
 */
export function rangRarete(rarete: Rarity): number {
  return RARITIES.indexOf(rarete);
}

/**
 * Trie les cartes par rareté décroissante. Le tri est stable : à rareté égale, l'ordre de tirage est
 * conservé. La liste d'origine n'est pas modifiée.
 *
 * @param cartes - Cartes dans l'ordre du tirage.
 * @returns Une nouvelle liste triée.
 */
export function trierParRarete(cartes: readonly Card[]): Card[] {
  return [...cartes].sort((a, b) => rangRarete(b.rarity) - rangRarete(a.rarity));
}

/**
 * Sépare les cartes en « meilleures » (les plus rares) et « autres ».
 *
 * @param cartes - Cartes dans l'ordre du tirage.
 * @param nombreMeilleures - Combien de cartes mettre en avant.
 * @returns Les meilleures cartes et les autres, chacune triée par rareté décroissante.
 */
export function composerBilan(cartes: readonly Card[], nombreMeilleures: number): BilanCartes {
  const triees = trierParRarete(cartes);
  return { meilleures: triees.slice(0, nombreMeilleures), autres: triees.slice(nombreMeilleures) };
}
