/**
 * Types du registre d'effets de cartes.
 *
 * Rôle : décrire un effet. Un effet est une « fiche » : une fonction qui transforme le contexte
 * (intensité, position du reflet, qualité) en une pile de calques CSS posée par-dessus l'image de la
 * carte, plus, pour les effets qui en ont besoin (le feu), un composant WebGL. Le code d'un effet n'est
 * chargé que lorsqu'il est affiché (voir effects/index.ts). L'image de la carte reste une photo fixe.
 * Expose : ContexteEffet, CalqueEffet, ReglageEffet, ReglagesEffet, PropsComposantEffet, FicheEffet,
 * DefinitionEffet.
 * Dépend de : react (types), domain/effetsCartes (types).
 */
import type { ComponentType, CSSProperties } from 'react';
import type { PointeurEffet, QualiteEffet, ZoneEffet } from '../domain/effetsCartes';

/** Réglages numériques propres à un effet (tous facultatifs : la fiche a des valeurs par défaut). */
export interface ReglagesEffet {
  /** Vitesse des animations : 1 = normale. */
  vitesse?: number | undefined;
  /** Densité des paillettes : 1 = normale. */
  densite?: number | undefined;
}

/** Description d'un réglage proposé pour un effet (bornes et valeur par défaut). */
export interface ReglageEffet {
  cle: keyof ReglagesEffet;
  min: number;
  max: number;
  pas: number;
  defaut: number;
}

/** Ce que reçoit la fonction de calques d'un effet. */
export interface ContexteEffet {
  /** Force de l'effet, de 0 (invisible) à 1. */
  intensite: number;
  /** Position du reflet : valeur de repli (les variables CSS `--effet-x/y` l'emportent). */
  pointeur: PointeurEffet;
  qualite: QualiteEffet;
  reglages?: ReglagesEffet | undefined;
}

/** Un calque : un dégradé (ou aplat) fondu avec la carte par un mode de fusion. */
export interface CalqueEffet {
  fond: string;
  fusion: NonNullable<CSSProperties['mixBlendMode']>;
  opacite: number;
  tailleFond?: string;
  positionFond?: string;
  /** Animation CSS au repos (keyframes de EffetCarte.module.css) : `transform` et `opacity` seulement. */
  animation?: string;
  /** Transformation de départ (calque agrandi pour glisser sans bord visible). */
  transformation?: string;
  /** Variables CSS propres au calque (bornes d'un scintillement…). */
  variables?: Readonly<Record<`--${string}`, string>>;
}

/** Ce que reçoit le composant WebGL d'un effet. */
export interface PropsComposantEffet {
  intensite: number;
  reglages: ReglagesEffet;
  qualite: QualiteEffet;
  /** Vrai : ne rien animer, dessiner une seule image (la « pose »). */
  fige: boolean;
  /** Carte agrandie ou retournée : prioritaire pour animer son dessin WebGL. */
  prioritaire: boolean;
  /** Nombre maximal de dessins WebGL animés en même temps dans une grille. */
  maxAnimes: number;
}

/** Fiche d'un effet, chargée à la demande. */
export interface FicheEffet {
  /** Zone couverte par défaut. */
  zone: ZoneEffet;
  /** Coût sur téléphone, pour l'admin et les décisions de qualité. */
  cout: 'faible' | 'moyen' | 'eleve';
  /** Vrai si l'effet a des couches qui bougent seules au repos. */
  animeAuRepos: boolean;
  reglages: readonly ReglageEffet[];
  /** Calques CSS de l'effet (fonction pure). */
  calques: (contexte: ContexteEffet) => CalqueEffet[];
  /** Dessin WebGL posé au-dessus des calques (facultatif). Repli sans WebGL : les calques seuls. */
  Composant?: ComponentType<PropsComposantEffet>;
}

/** Un effet du registre : son nom (liste déroulante de l'admin) et le chargement de sa fiche. */
export interface DefinitionEffet {
  nom: string;
  /** Charge le code de l'effet ; `null` pour « aucun » (rien à charger ni à afficher). */
  charger: (() => Promise<FicheEffet>) | null;
}
