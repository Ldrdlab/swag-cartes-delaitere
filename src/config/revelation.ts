/**
 * Réglages de l'écran de révélation des cartes.
 *
 * Rôle : toutes les durées, tailles, nombres et couleurs d'effets de la révélation, au même endroit.
 * Les couleurs et effets PROPRES À CHAQUE RARETÉ sont dans config/raretes.ts.
 * Expose : RATIO_CARTE, TAILLE_CARTE, DUREES, ENTREE_CARTE, PILE, TREMBLEMENT, LUEUR_DOS, HALO, RAYONS,
 * FLASH, REFLET_DUREE_MS, NOMBRE_ETINCELLES, GEOMETRIE_ETINCELLES, COULEURS_CONFETTIS,
 * GEOMETRIE_CONFETTIS, BILAN, EFFETS_REDUITS.
 * Dépend de : domain/effets et domain/tremblement (types uniquement).
 *
 * ┌─ COMMENT MODIFIER (pour débutant) ────────────────────────────────────────────────┐
 * │ Changer une DURÉE : modifie le nombre (en millisecondes : 1000 = 1 seconde).      │
 * │ Changer la TAILLE de la carte : modifie TAILLE_CARTE.                              │
 * │ Téléphone lent ? Mets EFFETS_REDUITS à `true` : moitié moins de confettis et       │
 * │ plus de rayons (un simple halo à la place).                                        │
 * │ Pour changer le DOS des cartes : remplace le fichier                              │
 * │ src/assets/images/cartes/dos-carte.webp par une image du MÊME FORMAT.              │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */
import type { GeometrieConfetti, GeometrieEtincelles } from '../domain/effets';
import type { ConfigTremblement } from '../domain/tremblement';

/** Proportions d'une carte (largeur / hauteur). Définies UNE seule fois, ici. */
export const RATIO_CARTE = 418 / 597;

/** Taille de la carte : 228 px de large au maximum, réduite sur les petits écrans (clamp en CSS). */
export const TAILLE_CARTE = {
  /** Largeur de référence (px). */
  largeurPx: 228,
  /** Largeur minimale (px). */
  largeurMinPx: 168,
  /** Largeur idéale, en % de la largeur de l'écran. */
  largeurVw: 58,
  /** Largeur maximale, en % de la hauteur de l'écran (évite que la carte déborde sur un écran court). */
  largeurDvh: 30,
};

/** Durées de la révélation (ms). */
export const DUREES = {
  /** Durée de l'animation d'attente d'une carte légendaire. */
  teaseMs: 2100,
  /** Durée du flash plein écran. */
  flashMs: 800,
  /** Durée de l'arrivée d'une nouvelle carte. */
  entreeCarteMs: 380,
  /** Durée de la sortie du paquet découpé. */
  sortiePaquetMs: 300,
  /** Durée du retournement remplacé par un fondu si l'utilisateur réduit les animations. */
  fonduReduitMs: 200,
  /** Durée d'apparition du halo d'une carte sans animation d'attente. */
  apparitionHaloMs: 400,
  /** Durée d'un cycle de pulsation des phrases d'indication. */
  pulsationMs: 2200,
};

/** Arrivée d'une nouvelle carte : montée + fondu + léger zoom. */
export const ENTREE_CARTE = {
  montePx: 34,
  echelleDepart: 0.96,
};

/** Pile de dos de cartes derrière la carte courante. */
export const PILE = {
  /** Nombre maximal de dos visibles derrière la carte. */
  dosVisibles: 2,
  /** Décalage vers le bas de chaque dos (px), du plus proche au plus lointain. */
  decalagesPx: [10, 20],
  /** Réduction de chaque dos (1 = taille de la carte). */
  echelles: [0.965, 0.93],
  /** Assombrissement de chaque dos (0 = aucun, 1 = noir). */
  assombrissements: [0.16, 0.3],
};

/** Tremblement de la carte légendaire pendant l'attente. */
export const TREMBLEMENT: ConfigTremblement = {
  etapes: 21,
  amplitudeMin: 0.4,
  amplitudeMax: 8,
  rotationMin: 0.15,
  rotationMax: 3.15,
  echelleMax: 1.045,
  ratioVertical: 0.6,
};

/** Lueur dorée sur le dos de la carte pendant l'attente. */
export const LUEUR_DOS = {
  couleurCentre: '#FFE68C',
  couleurMilieu: '#FFC94D',
  opaciteMax: 0.85,
};

/** Halo lumineux derrière la carte. */
export const HALO = {
  /** Diamètre (px). */
  taillePx: 420,
  /** Taille au début de l'apparition (1 = taille finale). */
  echelleDepart: 0.5,
};

/** Rayons de lumière qui tournent derrière une carte légendaire. */
export const RAYONS = {
  taillePx: 528,
  couleur: 'rgba(255, 222, 120, 0.6)',
  /** Largeur d'un rayon et distance entre deux rayons (degrés). */
  traitDeg: 6,
  periodeDeg: 22,
  /** Durée d'un tour complet (s). */
  tourS: 16,
};

/** Flash plein écran au retournement d'une carte légendaire. */
export const FLASH = {
  /** Moment du pic de luminosité, en % de la durée du flash. */
  picPourcent: 45,
  couleurCentre: 'rgba(255, 255, 255, 0.95)',
  couleurBord: 'rgba(255, 224, 138, 0.9)',
};

/** Durée d'un balayage du reflet holographique sur la carte (ms). */
export const REFLET_DUREE_MS = 3800;

/** Nombre d'étincelles pendant l'attente d'une carte légendaire. */
export const NOMBRE_ETINCELLES = 12;

export const GEOMETRIE_ETINCELLES: GeometrieEtincelles = {
  montePx: 130,
  dureeS: 1.6,
  decalageS: 0.2,
  tailleMinPx: 3,
  tailleMaxPx: 7,
};

/** Couleurs des confettis. */
export const COULEURS_CONFETTIS = [
  '#FF5E5B',
  '#FFC94D',
  '#FFFFFF',
  '#3FE0C5',
  '#FF9EC4',
  '#8E6BFF',
];

export const GEOMETRIE_CONFETTIS: GeometrieConfetti = {
  largeurMin: 6,
  largeurMax: 10,
  hauteurMin: 10,
  hauteurMax: 16,
  proportionRondes: 0.3,
  chutePx: 880,
  deriveMaxPx: 46,
  rotationMaxDeg: 640,
  dureeMinS: 2.4,
  dureeMaxS: 3.6,
  delaiMaxS: 0.7,
};

/** Écran de bilan. */
export const BILAN = {
  /** Nombre de cartes mises en avant dans « Tes meilleures cartes ». */
  meilleures: 3,
  largeurMeilleuresPx: 96,
  largeurAutresPx: 72,
};

/**
 * Mode « effets réduits » pour les téléphones d'entrée de gamme : moitié moins de confettis, et les
 * rayons de lumière sont remplacés par le simple halo. Mettre `true` pour l'activer.
 */
export const EFFETS_REDUITS = false;
