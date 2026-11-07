/**
 * Réglages de l'espace « Mes cartes » (collection de visuels de cartes).
 *
 * Rôle : centraliser les dimensions d'une carte, la tolérance sur les proportions, les formats d'image
 * acceptés, les réglages d'optimisation et les variantes autorisées par rareté.
 * Expose : CARTE_LARGEUR_PX, CARTE_HAUTEUR_PX, DIMENSIONS_CARTE_TEXTE, RATIO_CARTE, TOLERANCE_RATIO, TYPES_IMAGE_ACCEPTES,
 * EXTENSIONS_IMAGE_ACCEPTEES, TAILLE_MAX_SOURCE_OCTETS, OPTIMISATION, NOM_CARTE_MAX, VARIANTES_PAR_RARETE,
 * NOMS_VARIANTES.
 * Dépend de : domain/types (types uniquement).
 *
 * ┌─ COMMENT MODIFIER (pour débutant) ────────────────────────────────────────────────┐
 * │ Changer la TOLÉRANCE du ratio : modifie TOLERANCE_RATIO (0.02 = 2 %).              │
 * │ Changer la QUALITÉ des images : modifie OPTIMISATION.qualite (de 0 à 1).           │
 * │ Changer les VARIANTES d'une rareté : modifie VARIANTES_PAR_RARETE.                 │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */
import type { Rarity, Variant } from '../domain/types.ts';

/** Largeur d'une carte complète, en pixels (export de l'outil de création de cartes). */
export const CARTE_LARGEUR_PX = 744;
/** Hauteur d'une carte complète, en pixels. */
export const CARTE_HAUTEUR_PX = 1040;
/** Proportions d'une carte (largeur / hauteur) : environ 5:7, comme une carte TCG classique. */
export const RATIO_CARTE = CARTE_LARGEUR_PX / CARTE_HAUTEUR_PX;
/** Dimensions d'une carte écrites pour les messages (ex. « 744 × 1040 »). */
export const DIMENSIONS_CARTE_TEXTE = `${CARTE_LARGEUR_PX} × ${CARTE_HAUTEUR_PX}`;
/** Écart relatif toléré sur les proportions (0.02 = 2 %). */
export const TOLERANCE_RATIO = 0.02;

/** Types d'image acceptés (la transparence des PNG et des WebP est conservée). */
export const TYPES_IMAGE_ACCEPTES = ['image/png', 'image/jpeg', 'image/webp'] as const;
/** Extensions acceptées (utilisées quand le navigateur ne donne pas le type du fichier). */
export const EXTENSIONS_IMAGE_ACCEPTEES = ['.png', '.jpg', '.jpeg', '.webp'] as const;
/** Poids maximal d'un fichier avant optimisation (octets) : protège contre les fichiers énormes. */
export const TAILLE_MAX_SOURCE_OCTETS = 25 * 1024 * 1024;

/** Réglages d'optimisation des images avant enregistrement. */
export const OPTIMISATION = {
  /** Largeur maximale de l'image enregistrée (jamais agrandie). */
  largeurMaxPx: CARTE_LARGEUR_PX,
  /** Largeur de la miniature utilisée dans la galerie. */
  largeurMiniaturePx: CARTE_LARGEUR_PX / 2,
  /** Qualité WebP de l'image principale (0 à 1) : 0.92 est visuellement sans perte. */
  qualite: 0.92,
  /** Qualité WebP de la miniature (0 à 1). */
  qualiteMiniature: 0.85,
} as const;

/** Nombre maximal de caractères du nom d'une carte. */
export const NOM_CARTE_MAX = 60;

/** Variantes autorisées pour chaque rareté (une rareté absente de la liste n'a pas de variante). */
export const VARIANTES_PAR_RARETE: Readonly<Partial<Record<Rarity, readonly Variant[]>>> = {
  mythique: ['feu', 'bronze'],
  secrete: ['argent', 'or'],
};

/** Noms affichés des variantes. */
export const NOMS_VARIANTES: Readonly<Record<Variant, string>> = {
  feu: 'Feu',
  bronze: 'Bronze',
  argent: 'Argent',
  or: 'Or',
};
