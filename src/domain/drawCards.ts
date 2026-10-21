/**
 * Tirage des cartes d'un booster.
 *
 * Rôle : tirer N cartes parmi celles du booster, en respectant les probabilités de rareté.
 * Algorithme, pour chaque carte : 1) choisir une rareté selon son poids (parmi celles qui existent
 * dans le booster) ; 2) choisir une carte au hasard parmi celles de cette rareté.
 * Le tirage se fait avec remise : une même carte peut sortir deux fois dans un booster.
 * La source d'aléatoire est injectable pour obtenir des tests déterministes.
 * Expose : RandomSource, drawCards().
 * Dépend de : domain/types. Aucun import React ni DOM.
 */
import { RARITIES, type Booster, type Card, type Rarity } from './types';

/** Fonction qui renvoie un nombre dans [0, 1[ (comme `Math.random`). */
export type RandomSource = () => number;

/** Cartes d'une même rareté et poids associé. */
interface RarityGroup {
  cards: readonly Card[];
  weight: number;
}

/** Choisit un élément au hasard, de façon uniforme. */
function pickUniform<T>(items: readonly T[], random: RandomSource): T {
  const index = Math.min(Math.floor(random() * items.length), items.length - 1);
  const item = items[index];
  if (item === undefined) throw new Error('Tirage impossible dans une liste vide.');
  return item;
}

/** Choisit un groupe de rareté selon son poids ; si tous les poids sont nuls, de façon uniforme. */
function pickByWeight(groups: readonly RarityGroup[], random: RandomSource): RarityGroup {
  const totalWeight = groups.reduce((sum, group) => sum + Math.max(group.weight, 0), 0);
  if (totalWeight <= 0) return pickUniform(groups, random);

  let remaining = random() * totalWeight;
  for (const group of groups) {
    remaining -= Math.max(group.weight, 0);
    if (remaining < 0) return group;
  }
  // Filet de sécurité contre les arrondis : on renvoie le dernier groupe de poids positif.
  return pickUniform(groups.filter((group) => group.weight > 0).slice(-1), random);
}

/**
 * Tire les cartes d'un booster.
 *
 * @param booster - Booster ouvert (liste des cartes possibles).
 * @param catalog - Toutes les cartes connues (les identifiants du booster y sont recherchés).
 * @param count - Nombre de cartes à tirer.
 * @param rarityWeights - Poids de tirage de chaque rareté.
 * @param random - Source d'aléatoire (par défaut `Math.random`).
 * @returns Les cartes tirées, dans l'ordre du tirage.
 * @throws Si le booster ne contient aucune carte connue du catalogue.
 */
export function drawCards(
  booster: Booster,
  catalog: readonly Card[],
  count: number,
  rarityWeights: Readonly<Record<Rarity, number>>,
  random: RandomSource = Math.random,
): Card[] {
  const catalogById = new Map(catalog.map((card) => [card.id, card]));
  const pool = booster.cardIds
    .map((cardId) => catalogById.get(cardId))
    .filter((card): card is Card => card !== undefined);
  if (pool.length === 0) {
    throw new Error(`Le booster « ${booster.name} » ne contient aucune carte connue.`);
  }

  // Une seule entrée par rareté réellement présente dans ce booster.
  const groups: RarityGroup[] = RARITIES.map((rarity) => ({
    cards: pool.filter((card) => card.rarity === rarity),
    weight: rarityWeights[rarity],
  })).filter((group) => group.cards.length > 0);

  const drawn: Card[] = [];
  for (let i = 0; i < count; i += 1) {
    drawn.push(pickUniform(pickByWeight(groups, random).cards, random));
  }
  return drawn;
}
