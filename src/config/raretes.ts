/**
 * Table des raretés : nom, étoiles, couleurs et effets de chaque rareté.
 *
 * Rôle : UNE entrée par rareté. Ajouter une rareté ou changer une couleur ne demande de modifier que
 * ce fichier (et la liste RARITIES de domain/types.ts pour une nouvelle rareté).
 * Expose : CouleursRarete, HaloRarete, DefinitionRarete, RARETES.
 * Dépend de : domain/types (type uniquement).
 *
 * ┌─ COMMENT MODIFIER (pour débutant) ────────────────────────────────────────────────┐
 * │ Changer une COULEUR : modifie le code entre guillemets (ex. '#5CA8FF').            │
 * │ Changer le NOM affiché : modifie `nom`.                                            │
 * │ Activer / couper un EFFET : mets `true` ou `false` (reflet, rayons, tease).        │
 * │ Plus ou moins de CONFETTIS : change le nombre `confettis` (0 = aucun).             │
 * │ `tease` = true : la carte tremble avant de se retourner (animation légendaire).    │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */
import type { Rarity } from '../domain/types';

/** Couleurs d'une rareté (écrites comme en CSS). */
export interface CouleursRarete {
  /** Bordure de la carte. */
  bordure: string;
  /** Fond de la carte (dégradé CSS à 160°). */
  fondCarte: string;
  /** Fond de la zone image (visible tant qu'il n'y a pas de photo). */
  fondImage: string;
  /** Fond du badge de rareté (couleur ou dégradé). */
  badgeFond: string;
  /** Texte du badge de rareté. */
  badgeTexte: string;
  /** Couleur des étoiles. */
  etoiles: string;
}

/** Halo lumineux derrière la carte. */
export interface HaloRarete {
  /** Couleur du halo. */
  couleur: string;
  /** Opacité du halo (0 à 1). */
  opacite: number;
}

/** Tout ce qui définit une rareté. */
export interface DefinitionRarete {
  /** Nom affiché (badge, lecteurs d'écran). */
  nom: string;
  /** Nombre d'étoiles (1 à 5). */
  etoiles: number;
  couleurs: CouleursRarete;
  /** Halo derrière la carte (`null` = aucun). */
  halo: HaloRarete | null;
  /** Durée du retournement de la carte (ms). */
  dureeRetournementMs: number;
  /** Nombre de confettis qui tombent à la révélation (0 = aucun). */
  confettis: number;
  /** Reflet holographique qui balaie la carte. */
  reflet: boolean;
  /** Rayons de lumière qui tournent derrière la carte. */
  rayons: boolean;
  /** Animation d'attente : la carte tremble, une lueur monte, puis flash au retournement. */
  tease: boolean;
  /** Lueur autour de la carte dans l'écran de bilan. */
  lueurBilan: boolean;
}

export const RARETES: Readonly<Record<Rarity, DefinitionRarete>> = {
  commune: {
    nom: 'Commune',
    etoiles: 1,
    couleurs: {
      bordure: '#B9BDD3',
      fondCarte: 'linear-gradient(160deg, #F3F4FA, #DCDFF0)',
      fondImage: 'rgba(255, 255, 255, 0.7)',
      badgeFond: '#E4E6F2',
      badgeTexte: '#4A4670',
      etoiles: '#9AA0BF',
    },
    halo: null,
    dureeRetournementMs: 650,
    confettis: 0,
    reflet: false,
    rayons: false,
    tease: false,
    lueurBilan: false,
  },
  peu_commune: {
    nom: 'Peu commune',
    etoiles: 2,
    couleurs: {
      bordure: '#5FCDB4',
      fondCarte: 'linear-gradient(160deg, #EAFBF5, #C5F0E3)',
      fondImage: 'rgba(255, 255, 255, 0.65)',
      badgeFond: '#CFF3EA',
      badgeTexte: '#0E6B5E',
      etoiles: '#2FB59A',
    },
    halo: { couleur: '#5FCDB4', opacite: 0.4 },
    dureeRetournementMs: 650,
    confettis: 0,
    reflet: false,
    rayons: false,
    tease: false,
    lueurBilan: false,
  },
  rare: {
    nom: 'Rare',
    etoiles: 3,
    couleurs: {
      bordure: '#5CA8FF',
      fondCarte: 'linear-gradient(160deg, #EAF3FF, #C6DEFF)',
      fondImage: 'rgba(255, 255, 255, 0.65)',
      badgeFond: '#D2E7FF',
      badgeTexte: '#1D5FB8',
      etoiles: '#3D8BEA',
    },
    halo: { couleur: '#5CA8FF', opacite: 0.55 },
    dureeRetournementMs: 650,
    confettis: 0,
    reflet: true,
    rayons: false,
    tease: false,
    lueurBilan: false,
  },
  ultra_rare: {
    nom: 'Ultra-rare',
    etoiles: 4,
    couleurs: {
      bordure: '#B07CFF',
      fondCarte: 'linear-gradient(160deg, #F5ECFF, #E3D3FF, #FFD9F0)',
      fondImage: 'rgba(255, 255, 255, 0.6)',
      badgeFond: '#5A3FD6',
      badgeTexte: '#FFFFFF',
      etoiles: '#8E5BEA',
    },
    halo: { couleur: '#B07CFF', opacite: 0.65 },
    dureeRetournementMs: 750,
    confettis: 26,
    reflet: true,
    rayons: false,
    tease: false,
    lueurBilan: true,
  },
  legendaire: {
    nom: 'Légendaire',
    etoiles: 5,
    couleurs: {
      bordure: '#FFC94D',
      fondCarte: 'linear-gradient(160deg, #FFF6D6, #FFE08A, #FFB9A8)',
      fondImage: 'rgba(255, 255, 255, 0.55)',
      badgeFond: 'linear-gradient(90deg, #FFC94D, #FF9EC4)',
      badgeTexte: '#2A1B4D',
      etoiles: '#FFB020',
    },
    halo: { couleur: '#FFC94D', opacite: 0.8 },
    dureeRetournementMs: 900,
    confettis: 40,
    reflet: true,
    rayons: true,
    tease: true,
    lueurBilan: true,
  },
};
