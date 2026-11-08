/**
 * Logique pure des effets visuels de cartes : zones, intensité, qualité, inclinaison, effet par défaut.
 *
 * Rôle : tout ce qui se calcule sans toucher à l'écran. Les valeurs (pourcentages, seuils) viennent de
 * config/effets.ts et sont passées en paramètre : ce fichier n'a aucun réglage en dur.
 * Expose : ModeEffet, ZoneEffet, QualiteEffet, PointeurEffet, GeometrieZones, SeuilsAppareil,
 * RegleEffetDefaut, effetParDefaut(), facteurIntensite(), zoneVersClipPath(), resoudreQualite(),
 * positionDepuisInclinaison(), rapprocher().
 * Dépend de : domain/types (types). Aucun import React ni DOM.
 */
import type { Rarity, Variant } from './types';

/** Façon d'afficher l'effet : image fixe, animation seule, ou animation qui suit souris / inclinaison. */
export type ModeEffet = 'statique' | 'anime' | 'interactif';

/** Partie de la carte couverte : toute la carte, l'intérieur du cadre, l'illustration encadrée, ou le cadre. */
export type ZoneEffet = 'carte' | 'interieur' | 'illustration' | 'cadre';

/** Qualité de rendu : `eco` retire les couches secondaires et les animations. */
export type QualiteEffet = 'haute' | 'eco';

/** Position du reflet sur la carte, de 0 à 1 (0,5 / 0,5 = centre). */
export interface PointeurEffet {
  x: number;
  y: number;
}

/** Mesures des zones, en pourcentage de la carte (voir config/effets.ts). */
export interface GeometrieZones {
  cadreHorizontal: number;
  cadreVertical: number;
  rayonInterieurCqw: number;
  illustration: { x: number; y: number; largeur: number; hauteur: number };
}

/** Ce que l'on sait de l'appareil (lu dans le navigateur, injectable dans les tests). */
export interface IndicesAppareil {
  coeurs?: number | undefined;
  memoireGo?: number | undefined;
  economieDonnees?: boolean | undefined;
}

/** Seuils en dessous desquels l'appareil est jugé modeste. */
export interface SeuilsAppareil {
  coeurs: number;
  memoireGo: number;
}

/** Une ligne de la table « rareté (+ variante) → effet par défaut ». */
export interface RegleEffetDefaut {
  rarete: Rarity;
  variante?: Variant;
  cle: string;
}

/** Clé de l'effet par défaut d'une carte ; `aucun` si aucune règle ne correspond. */
export function effetParDefaut(
  rarete: Rarity,
  variante: Variant | undefined,
  regles: readonly RegleEffetDefaut[],
  cleAucun = 'aucun',
): string {
  const regle = regles.find((r) => r.rarete === rarete && r.variante === variante);
  return regle?.cle ?? cleAucun;
}

/** Intensité en pourcentage (0 à 100) → facteur de 0 à 1 (borné, valeur invalide = 0). */
export function facteurIntensite(pourcent: number): number {
  if (!Number.isFinite(pourcent)) return 0;
  return Math.min(100, Math.max(0, pourcent)) / 100;
}

/** Écrit un pourcentage sans bruit numérique (`3.7600000001` → `3.76`). */
const pct = (valeur: number): string => `${Math.round(valeur * 1000) / 1000}%`;

/**
 * Découpe CSS (`clip-path`) d'une zone ; `undefined` pour toute la carte (rien à découper).
 * - `interieur` : tout sauf la bande du cadre, coins intérieurs arrondis ;
 * - `illustration` : le rectangle de l'illustration encadrée ;
 * - `cadre` : la bande du cadre seule (deux contours, règle pair-impair).
 */
export function zoneVersClipPath(zone: ZoneEffet, g: GeometrieZones): string | undefined {
  if (zone === 'carte') return undefined;
  if (zone === 'interieur') {
    return `inset(${pct(g.cadreVertical)} ${pct(g.cadreHorizontal)} round ${g.rayonInterieurCqw}cqw)`;
  }
  if (zone === 'illustration') {
    const { x, y, largeur, hauteur } = g.illustration;
    return `inset(${pct(y)} ${pct(100 - x - largeur)} ${pct(100 - y - hauteur)} ${pct(x)})`;
  }
  const [x1, y1] = [pct(g.cadreHorizontal), pct(g.cadreVertical)];
  const [x2, y2] = [pct(100 - g.cadreHorizontal), pct(100 - g.cadreVertical)];
  return (
    `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ` +
    `${x1} ${y1}, ${x1} ${y2}, ${x2} ${y2}, ${x2} ${y1}, ${x1} ${y1})`
  );
}

/** Qualité effective : « éco » si l'utilisateur réduit les effets ou si l'appareil est modeste. */
export function resoudreQualite(
  indices: IndicesAppareil,
  seuils: SeuilsAppareil,
  effetsReduits: boolean,
): QualiteEffet {
  if (effetsReduits || indices.economieDonnees === true) return 'eco';
  const peuDeCoeurs = indices.coeurs !== undefined && indices.coeurs <= seuils.coeurs;
  const peuDeMemoire = indices.memoireGo !== undefined && indices.memoireGo <= seuils.memoireGo;
  return peuDeCoeurs || peuDeMemoire ? 'eco' : 'haute';
}

/** Ramène une valeur dans [0, 1]. */
const borner01 = (valeur: number): number => Math.min(1, Math.max(0, valeur));

/**
 * Position du reflet d'après l'inclinaison d'un téléphone (degrés).
 * @param gamma - Inclinaison gauche-droite. @param beta - Inclinaison avant-arrière.
 */
export function positionDepuisInclinaison(
  gamma: number,
  beta: number,
  angleMaxDegres: number,
  betaReposDegres: number,
): PointeurEffet {
  const portee = 2 * angleMaxDegres;
  return {
    x: borner01(0.5 + gamma / portee),
    y: borner01(0.5 + (beta - betaReposDegres) / portee),
  };
}

/** Avance `courante` d'une part `lissage` vers `cible` ; `arrivee` est vrai quand l'écart est négligeable. */
export function rapprocher(
  courante: PointeurEffet,
  cible: PointeurEffet,
  lissage: number,
  seuilArret: number,
): { position: PointeurEffet; arrivee: boolean } {
  const dx = cible.x - courante.x;
  const dy = cible.y - courante.y;
  if (Math.abs(dx) < seuilArret && Math.abs(dy) < seuilArret) {
    return { position: { ...cible }, arrivee: true };
  }
  return {
    position: { x: courante.x + dx * lissage, y: courante.y + dy * lissage },
    arrivee: false,
  };
}
