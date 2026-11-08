/**
 * Types du modèle métier.
 *
 * Rôle : définir Player, Card, CarteTiree, l'énumération des raretés et celle des variantes.
 * Expose : RARITIES, Rarity, VARIANTS, Variant, Player, Card, CarteTiree.
 * Dépend de : rien (logique pure, aucun import React ni DOM).
 */

/** Raretés possibles, de la plus fréquente à la plus rare. */
export const RARITIES = [
  'commune',
  'peu_commune',
  'rare',
  'super_rare',
  'legendaire',
  'mythique',
  'secrete',
] as const;

/** Rareté d'une carte (valeur parmi RARITIES). */
export type Rarity = (typeof RARITIES)[number];

/** Variantes possibles d'une carte (seules les raretés mythique et secrète en ont une). */
export const VARIANTS = ['feu', 'bronze', 'argent', 'or'] as const;

/** Variante d'une carte (valeur parmi VARIANTS). */
export type Variant = (typeof VARIANTS)[number];

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
  /** Variante (Feu, Bronze, Argent, Or) : uniquement pour les raretés mythique et secrète. */
  variant?: Variant;
  /** Adresse de l'image. Optionnelle : un placeholder est affiché sinon. */
  imageUrl?: string;
  /** Adresse d'une version réduite de l'image (galerie). Optionnelle : `imageUrl` est utilisée sinon. */
  thumbUrl?: string;
  /** Dimensions de l'image enregistrée, en pixels (pour vérifier ses proportions). */
  width?: number;
  height?: number;
  /** Clé de l'effet visuel de la carte (registre src/effects/). Vide ou absente = aucun effet. */
  effect?: string;
  /** Vrai si la carte peut sortir des boosters. Une carte désactivée reste dans les collections. */
  active?: boolean;
  /** Champs libres pour la personnalisation future (ex. export d'un outil externe de création de cartes). */
  extra?: Record<string, unknown>;
}

/** Carte tirée dans un booster : la carte, son badge « Nouvelle ! » et la quantité possédée après le tirage. */
export interface CarteTiree extends Card {
  /** Vrai si le joueur ne possédait pas encore cette carte avant ce booster. */
  nouvelle: boolean;
  /** Nombre d'exemplaires possédés une fois ce booster ajouté à la collection. */
  quantite: number;
}
