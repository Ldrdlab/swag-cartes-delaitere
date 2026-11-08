/**
 * Réglages des effets visuels des cartes (V0.1.5).
 *
 * Rôle : toutes les valeurs des effets au même endroit : zones d'application (en pourcentages de la
 * carte), intensité, seuils d'un téléphone « modeste », réglage du gyroscope et correspondance rareté →
 * effet par défaut. Rien de tout cela n'est écrit en dur dans le code des effets.
 * Expose : REVELATION_EFFETS, ORBITE, INCLINAISON_3D, GESTE, INTERVALLE_MS, WEBGL_ANIMES_MAX,
 * CLE_STOCKAGE_QUALITE_EFFETS, SEUIL_APPUI_PX, CLE_STOCKAGE_EFFETS_REDUITS, INTENSITE_EFFET, GEOMETRIE_ZONES, POSE_REFLET, SEUILS_APPAREIL_MODESTE,
 * EFFETS_PAR_DEFAUT.
 * Dépend de : domain/effetsCartes (types).
 *
 * ┌─ COMMENT MODIFIER (pour débutant) ────────────────────────────────────────────────┐
 * │ Changer l'effet d'une rareté : modifie EFFETS_PAR_DEFAUT (clé = nom dans           │
 * │ src/effects/index.ts). Ajuster la zone « illustration » : modifie GEOMETRIE_ZONES. │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */
import type { ParamsGeste, ParamsOrbite } from '../domain/animationEffets';
import type {
  GeometrieZones,
  QualiteEffet,
  RegleEffetDefaut,
  SeuilsAppareil,
} from '../domain/effetsCartes';
import type { Rarity } from '../domain/types';

/** Clé du stockage local où l'option « Effets réduits » est retenue sur l'appareil. */
export const CLE_STOCKAGE_EFFETS_REDUITS = 'swag.effetsReduits';

/**
 * Éclat sobre à la révélation : un éclair de lumière très bref, posé sur la carte quand elle se retourne,
 * pour les raretés à partir de `rareteMinimale` (et seulement hors « Effets réduits »). Mettre
 * `rareteMinimale` à `null` le supprime.
 */
export const REVELATION_EFFETS: {
  rareteMinimale: Rarity | null;
  /** Durée de l'éclat (ms) et force maximale (opacité, de 0 à 1). */
  dureeMs: number;
  force: number;
  couleur: string;
} = { rareteMinimale: 'legendaire', dureeMs: 900, force: 0.55, couleur: '#fff4cf' };

/** Intensité d'un effet, en pourcentage (0 = invisible, 100 = pleine force). */
export const INTENSITE_EFFET = { min: 0, max: 100, defaut: 100 } as const;

/**
 * Zones d'une carte, en pourcentage de sa largeur et de sa hauteur.
 * Mesures reprises de la grille de référence de l'outil de création (744 × 1040 px) :
 * cadre de 28 px de chaque côté (3,76 % de la largeur, 2,69 % de la hauteur), puis la mise en page
 * « illustration encadrée » (x 7,5 %, y 9,5 %, 85,5 % × 38 %).
 */
export const GEOMETRIE_ZONES: GeometrieZones = {
  cadreHorizontal: 3.76,
  cadreVertical: 2.69,
  rayonInterieurCqw: 1.6,
  illustration: { x: 7.5, y: 9.5, largeur: 85.5, hauteur: 38 },
};

/** Position du reflet quand personne ne touche la carte (0,5 / 0,5 = centre). */
export const POSE_REFLET = { x: 0.5, y: 0.5 } as const;

/** En dessous de ces seuils, l'appareil est jugé modeste : les effets passent en qualité « éco ». */
export const SEUILS_APPAREIL_MODESTE: SeuilsAppareil = { coeurs: 4, memoireGo: 4 };

/**
 * Animation au repos : un « pointeur virtuel » décrit une orbite lente autour du centre de la carte, ce qui
 * fait bouger les reflets (et incliner doucement la carte) sans qu'on la touche. Chaque carte part d'un
 * point différent (phase tirée de son identifiant).
 */
export const ORBITE: ParamsOrbite = {
  /** Un tour en 8 secondes. */
  periodeSecondes: 8,
  /** Rayon de l'orbite : 0,20 de la carte, soit environ 3,6° d'inclinaison au repos (0,2 × 2 × 9°). */
  rayon: 0.2,
};

/** Inclinaison 3D de la carte, comme dans l'outil de création : 9° au bord, perspective de 2,4 largeurs de carte. */
export const INCLINAISON_3D = { maxDegres: 9, perspectiveCqw: 240 } as const;

/** Réglage du geste (souris ou doigt) : lissage de la position, prise en main, retour à l'orbite. */
export const GESTE: ParamsGeste = { lissageMs: 80, priseMs: 100, retourMs: 500 };

/**
 * Cadence des mises à jour de l'animation au repos. Dans une grille (mouvement lent, petites cartes) : 30
 * images par seconde suffisent et coûtent moitié moins ; vue agrandie et révélation : à chaque image (0).
 */
export const INTERVALLE_MS = { grille: 33, agrandie: 0 } as const;

/**
 * Nombre maximal de dessins WebGL (feu) qui animent EN MÊME TEMPS dans une grille, selon la qualité : les
 * plus proches du centre de l'écran ; les autres gardent leur dernière image. Une carte agrandie ou retournée
 * est toujours prioritaire (et alors seule à animer).
 */
export const WEBGL_ANIMES_MAX: Readonly<Record<QualiteEffet, number>> = { haute: 2, eco: 1 };

/** Clé du stockage local où la qualité des effets (Auto / Élevée / Économie) est retenue sur l'appareil. */
export const CLE_STOCKAGE_QUALITE_EFFETS = 'swag.qualiteEffets';

/** Déplacement (px) en dessous duquel un geste est un simple appui, pas un glissé. */
export const SEUIL_APPUI_PX = 8;

/** Effet appliqué selon la rareté (et la variante pour Mythique et Secrète). `aucun` = rien. */
export const EFFETS_PAR_DEFAUT: readonly RegleEffetDefaut[] = [
  { rarete: 'commune', cle: 'aucun' },
  { rarete: 'peu_commune', cle: 'lustre' },
  { rarete: 'rare', cle: 'holo' },
  { rarete: 'super_rare', cle: 'prisme' },
  { rarete: 'legendaire', cle: 'arc_en_ciel' },
  { rarete: 'mythique', variante: 'feu', cle: 'feu' },
  { rarete: 'mythique', variante: 'bronze', cle: 'bronze' },
  { rarete: 'secrete', variante: 'argent', cle: 'argent' },
  { rarete: 'secrete', variante: 'or', cle: 'or' },
];
