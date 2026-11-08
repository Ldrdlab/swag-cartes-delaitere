/**
 * Logique pure des effets visuels de cartes : zones, intensité, qualité, inclinaison, effet par défaut.
 *
 * Rôle : tout ce qui se calcule sans toucher à l'écran. Les valeurs (pourcentages, seuils) viennent de
 * config/effets.ts et sont passées en paramètre : ce fichier n'a aucun réglage en dur.
 * Expose : ModeEffet, ZoneEffet, QualiteEffet, PointeurEffet, GeometrieZones, SeuilsAppareil,
 * RegleEffetDefaut, effetParDefaut(), facteurIntensite(), zoneVersClipPath(), PreferenceQualite,
 * PREFERENCES_QUALITE, resoudreQualite(), puis : ReglagesEffetCarte, ParamsEffetCarte, ParamsEffetJson,
 * ZONES_EFFET, paramsDepuisJson(), paramsVersJson(), OrigineEffet, origineEffet(), RegleEffet, EffetResolu,
 * CarteEffet, resoudreEffet(), LigneRegleEffet, regleDepuisLigne().
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

/** Préférence de qualité choisie par le joueur : automatique, élevée ou économie. */
export type PreferenceQualite = 'auto' | 'haute' | 'eco';

/** Les trois préférences, dans l'ordre d'affichage. */
export const PREFERENCES_QUALITE: readonly PreferenceQualite[] = ['auto', 'haute', 'eco'];

/**
 * Qualité effective des effets.
 *  - « Effets réduits » : toujours économie ;
 *  - préférence « haute » ou « économie » : elle est respectée ;
 *  - « auto » : économie sur un appareil modeste (peu de cœurs ou de mémoire) ou en économie de données.
 */
export function resoudreQualite(
  indices: IndicesAppareil,
  seuils: SeuilsAppareil,
  effetsReduits: boolean,
  preference: PreferenceQualite = 'auto',
): QualiteEffet {
  if (effetsReduits) return 'eco';
  if (preference === 'haute') return 'haute';
  if (preference === 'eco') return 'eco';
  if (indices.economieDonnees === true) return 'eco';
  const peuDeCoeurs = indices.coeurs !== undefined && indices.coeurs <= seuils.coeurs;
  const peuDeMemoire = indices.memoireGo !== undefined && indices.memoireGo <= seuils.memoireGo;
  return peuDeCoeurs || peuDeMemoire ? 'eco' : 'haute';
}

// ---------------------------------------------------------------------------------------------
// Réglages d'effet d'une carte ou d'une rareté, et résolution de l'effet à afficher
// ---------------------------------------------------------------------------------------------

/** Réglages numériques d'un effet (mêmes noms que effects/types). */
export interface ReglagesEffetCarte {
  vitesse?: number | undefined;
  densite?: number | undefined;
}

/** Réglages d'effet d'une carte (ou d'une rareté) : tout est facultatif. */
export interface ParamsEffetCarte {
  /** Intensité de 0 à 100. */
  intensite?: number | undefined;
  /** Zone couverte ; absente = celle de l'effet. */
  zone?: ZoneEffet | undefined;
  reglages?: ReglagesEffetCarte | undefined;
}

/** Réglages tels qu'ils sont enregistrés en base (colonnes `effect_params` et `params`). */
export interface ParamsEffetJson {
  intensity?: number;
  zone?: string;
  settings?: { vitesse?: number; densite?: number };
}

/** Zones connues, pour reconnaître une valeur lue en base. */
export const ZONES_EFFET: readonly ZoneEffet[] = ['carte', 'interieur', 'illustration', 'cadre'];

const estNombre = (valeur: unknown): valeur is number =>
  typeof valeur === 'number' && Number.isFinite(valeur);

/** Lit les réglages de la base (une valeur inattendue est ignorée : l'appli ne plante jamais). */
export function paramsDepuisJson(json: unknown): ParamsEffetCarte {
  if (typeof json !== 'object' || json === null) return {};
  const brut = json as Record<string, unknown>;
  const params: ParamsEffetCarte = {};
  if (estNombre(brut['intensity'])) params.intensite = brut['intensity'];
  const zone = brut['zone'];
  if (typeof zone === 'string' && (ZONES_EFFET as readonly string[]).includes(zone)) {
    params.zone = zone as ZoneEffet;
  }
  const reglages = brut['settings'];
  if (typeof reglages === 'object' && reglages !== null) {
    const { vitesse, densite } = reglages as Record<string, unknown>;
    const lus: ReglagesEffetCarte = {};
    if (estNombre(vitesse)) lus.vitesse = vitesse;
    if (estNombre(densite)) lus.densite = densite;
    if (Object.keys(lus).length > 0) params.reglages = lus;
  }
  return params;
}

/** Prépare les réglages à enregistrer en base (les champs absents ne sont pas écrits). */
export function paramsVersJson(params: ParamsEffetCarte | undefined): ParamsEffetJson {
  const json: ParamsEffetJson = {};
  if (!params) return json;
  if (params.intensite !== undefined) json.intensity = params.intensite;
  if (params.zone !== undefined) json.zone = params.zone;
  const { vitesse, densite } = params.reglages ?? {};
  const settings: { vitesse?: number; densite?: number } = {};
  if (vitesse !== undefined) settings.vitesse = vitesse;
  if (densite !== undefined) settings.densite = densite;
  if (Object.keys(settings).length > 0) json.settings = settings;
  return json;
}

/** Comment l'effet d'une carte est décidé : par sa rareté, imposé, ou volontairement absent. */
export type OrigineEffet = 'automatique' | 'force' | 'aucun';

/** Origine de l'effet d'après la valeur enregistrée (vide = automatique ; `aucun` = aucun ; sinon forcé). */
export function origineEffet(effet: string | undefined, cleAucun = 'aucun'): OrigineEffet {
  if (!effet) return 'automatique';
  return effet === cleAucun ? 'aucun' : 'force';
}

/** Effet par défaut d'une rareté (et variante), avec ses réglages. */
export interface RegleEffet {
  rarete: Rarity;
  variante?: Variant | undefined;
  cle: string;
  params: ParamsEffetCarte;
}

/** Effet à afficher pour une carte. */
export interface EffetResolu {
  cle: string;
  /** Intensité de 0 à 100. */
  intensite: number;
  zone?: ZoneEffet | undefined;
  reglages?: ReglagesEffetCarte | undefined;
  origine: OrigineEffet;
}

/** Ce qu'il faut savoir d'une carte pour décider de son effet. */
export interface CarteEffet {
  rarity: Rarity;
  variant?: Variant | undefined;
  effect?: string | undefined;
  effectParams?: ParamsEffetCarte | undefined;
}

/**
 * Effet à afficher pour une carte.
 *  - `aucun` : rien, quelle que soit la rareté ;
 *  - forcé : l'effet de la carte, avec SES réglages ;
 *  - automatique : l'effet de la rareté (et variante), ses réglages complétés par ceux de la carte
 *    (l'intensité réglée sur la carte l'emporte) ; sans règle connue, pas d'effet.
 */
export function resoudreEffet(
  carte: CarteEffet,
  regles: readonly RegleEffet[],
  intensiteDefaut: number,
  cleAucun = 'aucun',
): EffetResolu {
  const origine = origineEffet(carte.effect, cleAucun);
  if (origine === 'aucun') return { cle: cleAucun, intensite: 0, origine };
  const propres = carte.effectParams ?? {};
  if (origine === 'force') {
    return {
      cle: carte.effect ?? cleAucun,
      intensite: propres.intensite ?? intensiteDefaut,
      zone: propres.zone,
      reglages: propres.reglages,
      origine,
    };
  }
  const regle = regles.find((r) => r.rarete === carte.rarity && r.variante === carte.variant);
  if (!regle || regle.cle === cleAucun) return { cle: cleAucun, intensite: 0, origine };
  return {
    cle: regle.cle,
    intensite: propres.intensite ?? regle.params.intensite ?? intensiteDefaut,
    zone: propres.zone ?? regle.params.zone,
    reglages: { ...regle.params.reglages, ...propres.reglages },
    origine,
  };
}

/** Une règle telle que la renvoie la base (table `rarity_effects` ou fonction `get_rarity_effects()`). */
export interface LigneRegleEffet {
  rarity: Rarity;
  variant: Variant | null;
  effect: string;
  params: unknown;
}

/** Transforme une ligne de la base en règle d'effet. */
export function regleDepuisLigne(ligne: LigneRegleEffet): RegleEffet {
  return {
    rarete: ligne.rarity,
    variante: ligne.variant ?? undefined,
    cle: ligne.effect,
    params: paramsDepuisJson(ligne.params),
  };
}
