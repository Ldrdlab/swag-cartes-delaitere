/**
 * Réglages des effets visuels des cartes (V0.1.5).
 *
 * Rôle : toutes les valeurs des effets au même endroit : zones d'application (en pourcentages de la
 * carte), intensité, seuils d'un téléphone « modeste », réglage du gyroscope et correspondance rareté →
 * effet par défaut. Rien de tout cela n'est écrit en dur dans le code des effets.
 * Expose : CLE_STOCKAGE_EFFETS_REDUITS, INTENSITE_EFFET, GEOMETRIE_ZONES, POSE_REFLET, SEUILS_APPAREIL_MODESTE,
 * INCLINAISON, EFFETS_PAR_DEFAUT.
 * Dépend de : domain/effetsCartes (types).
 *
 * ┌─ COMMENT MODIFIER (pour débutant) ────────────────────────────────────────────────┐
 * │ Changer l'effet d'une rareté : modifie EFFETS_PAR_DEFAUT (clé = nom dans           │
 * │ src/effects/index.ts). Ajuster la zone « illustration » : modifie GEOMETRIE_ZONES. │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */
import type { GeometrieZones, RegleEffetDefaut, SeuilsAppareil } from '../domain/effetsCartes';

/** Clé du stockage local où l'option « Effets réduits » est retenue sur l'appareil. */
export const CLE_STOCKAGE_EFFETS_REDUITS = 'swag.effetsReduits';

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

/** Réglage de l'inclinaison (souris, gyroscope, glisser du doigt). */
export const INCLINAISON = {
  /** Angle (degrés) qui amène le reflet d'un bord à l'autre de la carte. */
  angleMaxDegres: 25,
  /** Inclinaison « au repos » d'un téléphone tenu à la main (degrés, axe avant-arrière). */
  betaReposDegres: 45,
  /** Part du chemin parcourue à chaque image vers la cible (adoucit le mouvement). */
  lissage: 0.18,
  /** Écart sous lequel on considère que le reflet est arrivé (arrêt de la boucle). */
  seuilArret: 0.002,
} as const;

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
