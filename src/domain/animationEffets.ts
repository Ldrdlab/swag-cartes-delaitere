/**
 * Logique pure de l'animation des effets : orbite au repos, lissage du geste, retour doux, arbitrage WebGL.
 *
 * Rôle : tout ce qui se calcule sans toucher à l'écran. Chaque carte a un « pointeur virtuel » qui décrit
 * une orbite lente (les reflets bougent sans qu'on touche la carte) ; pendant un geste, la position du
 * doigt ou de la souris la remplace en douceur ; à la fin du geste, on revient à l'orbite en fondu.
 * Les valeurs (durée du tour, rayon, lissage…) viennent de config/effets.ts et sont passées en paramètre.
 * Expose : ParamsOrbite, ParamsGeste, positionOrbite(), lisserVers(), avancerPoids(), adoucir(), melanger(),
 * phaseDepuisTexte(), estGlisse(), CandidatNuanceur, choisirAnimes().
 * Dépend de : domain/effetsCartes (type PointeurEffet). Aucun import React ni DOM.
 */
import type { PointeurEffet } from './effetsCartes';

/** Orbite au repos. */
export interface ParamsOrbite {
  /** Durée d'un tour complet (secondes). */
  periodeSecondes: number;
  /** Rayon de l'orbite, en fraction de la carte (0,2 = 20 % de la largeur autour du centre). */
  rayon: number;
}

/** Réglages du geste. */
export interface ParamsGeste {
  /** Constante de temps du lissage de la position du doigt (ms) : plus c'est grand, plus c'est doux. */
  lissageMs: number;
  /** Temps pour que le geste prenne la main au début (ms). */
  priseMs: number;
  /** Temps du retour vers l'orbite à la fin du geste (ms). */
  retourMs: number;
}

const DEUX_PI = 2 * Math.PI;

/** Position du pointeur virtuel sur son orbite, à l'instant `secondes`, avec la phase propre à la carte (radians). */
export function positionOrbite(
  secondes: number,
  phase: number,
  params: ParamsOrbite,
): PointeurEffet {
  const angle = (DEUX_PI * secondes) / params.periodeSecondes + phase;
  return { x: 0.5 + params.rayon * Math.cos(angle), y: 0.5 + params.rayon * Math.sin(angle) };
}

/**
 * Rapproche `courante` de `cible` : lissage exponentiel, indépendant de la fréquence d'images
 * (la même sensation à 30 ou 60 images par seconde).
 */
export function lisserVers(
  courante: PointeurEffet,
  cible: PointeurEffet,
  dtMs: number,
  tauMs: number,
): PointeurEffet {
  if (tauMs <= 0 || dtMs <= 0) return { ...cible };
  const part = 1 - Math.exp(-dtMs / tauMs);
  return {
    x: courante.x + (cible.x - courante.x) * part,
    y: courante.y + (cible.y - courante.y) * part,
  };
}

/**
 * Poids du geste dans la position affichée (0 = orbite seule, 1 = geste seul) : monte vite quand un geste
 * commence, redescend en douceur quand il se termine.
 */
export function avancerPoids(
  poids: number,
  geste: boolean,
  dtMs: number,
  params: Pick<ParamsGeste, 'priseMs' | 'retourMs'>,
): number {
  if (geste) return Math.min(1, poids + dtMs / Math.max(params.priseMs, 1));
  return Math.max(0, poids - dtMs / Math.max(params.retourMs, 1));
}

/** Courbe douce (0 → 1) pour que le fondu ne démarre ni ne finisse brusquement. */
export function adoucir(poids: number): number {
  const p = Math.min(1, Math.max(0, poids));
  return p * p * (3 - 2 * p);
}

/** Mélange deux positions (`poids` 0 = a, 1 = b). */
export function melanger(a: PointeurEffet, b: PointeurEffet, poids: number): PointeurEffet {
  return { x: a.x + (b.x - a.x) * poids, y: a.y + (b.y - a.y) * poids };
}

/**
 * Phase de départ propre à une carte (0 à 2π), tirée de son identifiant : les cartes d'une grille ne
 * bougent pas toutes ensemble, et une même carte repart toujours du même point.
 */
export function phaseDepuisTexte(texte: string): number {
  let hachage = 2166136261;
  for (let i = 0; i < texte.length; i += 1) {
    hachage = Math.imul(hachage ^ texte.charCodeAt(i), 16777619) >>> 0;
  }
  return (hachage / 4294967296) * DEUX_PI;
}

/**
 * Un geste est un GLISSÉ (qui incline la carte) dès que le doigt ou la souris s'est déplacé de plus de
 * `seuilPx` depuis l'appui ; en dessous, c'est un simple APPUI (ouvrir, retourner ou fermer selon l'écran).
 */
export function estGlisse(
  debut: { x: number; y: number },
  actuel: { x: number; y: number },
  seuilPx: number,
): boolean {
  return Math.hypot(actuel.x - debut.x, actuel.y - debut.y) > seuilPx;
}

/** Un dessin WebGL qui voudrait s'animer. */
export interface CandidatNuanceur {
  id: number;
  /** Carte agrandie ou retournée : toujours prioritaire. */
  prioritaire: boolean;
  /** Distance de la carte au centre de l'écran (px) ; `Infinity` si elle n'est pas à l'écran. */
  distance: number;
}

/**
 * Choisit les dessins WebGL qui ont le droit de s'animer.
 *  - S'il y a une carte prioritaire (vue agrandie, révélation), elle est SEULE à animer : le processeur
 *    graphique ne travaille que pour elle (la dernière inscrite si elles sont plusieurs).
 *  - Sinon, les `max` cartes les plus proches du centre de l'écran (celles hors écran n'animent jamais).
 * Les autres gardent leur dernière image.
 */
export function choisirAnimes(candidats: readonly CandidatNuanceur[], max: number): Set<number> {
  const prioritaires = candidats.filter((c) => c.prioritaire);
  const dernier = prioritaires[prioritaires.length - 1];
  if (dernier) return new Set([dernier.id]);
  return new Set(
    candidats
      .filter((c) => Number.isFinite(c.distance))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, Math.max(0, max))
      .map((c) => c.id),
  );
}
