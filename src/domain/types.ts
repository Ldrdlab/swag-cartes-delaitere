/**
 * Types du modèle métier.
 *
 * Rôle : définir Player, Booster, Card et l'énumération des raretés.
 * Expose : RARITIES, Rarity, Player, Card, Booster.
 * Dépend de : rien (logique pure, aucun import React ni DOM).
 */

/** Raretés possibles, de la plus fréquente à la plus rare. */
export const RARITIES = ['commune', 'peu_commune', 'rare', 'ultra_rare'] as const;

/** Rareté d'une carte (valeur parmi RARITIES). */
export type Rarity = (typeof RARITIES)[number];

/** Joueur local. */
export interface Player {
  /** Identifiant unique du joueur. */
  id: string;
  /** Pseudonyme affiché (déjà nettoyé et validé). */
  pseudo: string;
  /** Identifiant de l'icône de profil. Réservé pour une itération ultérieure. */
  iconId?: string;
}

/** Carte à collectionner. */
export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  /** Adresse de l'image. Optionnelle : un placeholder est affiché sinon. */
  imageUrl?: string;
  /** Champs libres pour la personnalisation future (ex. export d'un outil externe de création de cartes). */
  extra?: Record<string, unknown>;
}

/**
 * Booster, vu par le tirage : un nom et la liste des cartes qui peuvent en sortir.
 * (Son apparence — thème, skin — est décrite dans src/boosters/, pas ici.)
 */
export interface Booster {
  id: string;
  name: string;
  /** Identifiants des cartes qui peuvent sortir de ce booster. */
  cardIds: readonly string[];
}
