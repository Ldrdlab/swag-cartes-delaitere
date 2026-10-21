/**
 * Réglages de l'écran d'accueil : cartes flottantes décoratives et durées des animations.
 *
 * Rôle : regrouper au même endroit tout ce qu'on peut ajuster sans toucher au code des composants.
 * Expose : Profondeur, CouleurCarte, CarteFlottante, REGLAGES_ANIMATION, CARTES_FLOTTANTES.
 * Dépend de : rien.
 *
 * ┌─ COMMENT MODIFIER (pour débutant) ────────────────────────────────────────────────┐
 * │ DÉPLACER une carte  : change `x` (0 = bord gauche, 100 = bord droit) et             │
 * │                       `y` (0 = haut de l'écran, 100 = bas). C'est le CENTRE de la   │
 * │                       carte, en pourcentage.                                         │
 * │ AJOUTER une carte   : copie une ligne `{ ... },` du tableau et change les valeurs.  │
 * │ SUPPRIMER une carte : efface toute sa ligne `{ ... },`.                             │
 * │ METTRE UNE PHOTO    : voir le champ `image` ci-dessous.                             │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */

/** Profondeur d'une carte : change son aspect (floue et pâle au loin, nette et ombrée de près). */
export type Profondeur = 'lointaine' | 'moyenne' | 'proche';

/** Dégradé de couleur de la carte (les couleurs sont définies dans styles/tokens.css). */
export type CouleurCarte = 'corail' | 'soleil' | 'menthe' | 'lavande' | 'ciel';

/** Description d'une carte décorative. */
export interface CarteFlottante {
  /** Position horizontale du centre de la carte, en % de la largeur de l'écran (0 = gauche, 100 = droite). */
  x: number;
  /** Position verticale du centre de la carte, en % de la hauteur de l'écran (0 = haut, 100 = bas). */
  y: number;
  /** Largeur en pixels (la hauteur suit : proportions d'une vraie carte 63 × 88). Repères : ≈ 50 lointaine, ≈ 80 moyenne, ≈ 105 proche. */
  largeur: number;
  /** Rotation en degrés (positif = vers la droite, négatif = vers la gauche). */
  rotation: number;
  /** Profondeur : `lointaine`, `moyenne` ou `proche`. Seules les cartes `proche` flottent. */
  profondeur: Profondeur;
  /** Couleur du dégradé : `corail`, `soleil`, `menthe`, `lavande` ou `ciel`. */
  couleur: CouleurCarte;
  /**
   * OPTIONNEL — nom d'une photo pour remplacer le dégradé, par exemple `'photo1.png'`.
   * Démarche : 1) copie la photo dans `src/assets/images/welcome/cartes/` ;
   *            2) écris son nom exact ici : `image: 'photo1.png',`.
   * Laisse ce champ absent pour garder le dégradé.
   */
  image?: string;
  /** OPTIONNEL — retard de départ du flottement, en secondes (négatif = déjà en cours). Évite que les cartes bougent toutes ensemble. */
  decalage?: number;
}

/** Durées et amplitude des animations de l'écran d'accueil. */
export const REGLAGES_ANIMATION = {
  /** Durée d'un aller-retour du flottement des cartes proches, en secondes. */
  dureeFlottementS: 6,
  /** De combien les cartes proches montent et descendent, en pixels. */
  amplitudeFlottementPx: 6,
  /** Durée d'un cycle de la phrase « Touchez pour commencer », en secondes. */
  dureePulsationS: 2.2,
};

/**
 * Les cartes décoratives, de la plus lointaine à la plus proche (les dernières passent devant).
 * Positions pensées pour un téléphone de 360 à 430 px de large : les cartes évitent le logo central.
 */
// prettier-ignore
export const CARTES_FLOTTANTES: readonly CarteFlottante[] = [
  // ----- Lointaines : petites, floues, pâles -----
  { x: 73, y: 5,  largeur: 50, rotation: -12, profondeur: 'lointaine', couleur: 'ciel' },
  { x: 44, y: 3,  largeur: 50, rotation: 10,  profondeur: 'lointaine', couleur: 'lavande' },
  { x: -2, y: 47, largeur: 50, rotation: 8,   profondeur: 'lointaine', couleur: 'menthe' },
  { x: 97, y: 20, largeur: 50, rotation: -10, profondeur: 'lointaine', couleur: 'soleil' },
  { x: 40, y: 76, largeur: 50, rotation: 12,  profondeur: 'lointaine', couleur: 'corail' },
  { x: 68, y: 78, largeur: 50, rotation: -8,  profondeur: 'lointaine', couleur: 'menthe' },
  // ----- Moyennes : nettes -----
  { x: 20, y: 18, largeur: 80, rotation: -8,  profondeur: 'moyenne', couleur: 'soleil' },
  { x: 58, y: 74, largeur: 80, rotation: 7,   profondeur: 'moyenne', couleur: 'menthe' },
  { x: 84, y: 75, largeur: 80, rotation: -9,  profondeur: 'moyenne', couleur: 'lavande' },
  { x: 20, y: 74, largeur: 80, rotation: -7,  profondeur: 'moyenne', couleur: 'ciel' },
  // ----- Proches : grandes, ombrées, elles flottent doucement (decalage = départ décalé) -----
  { x: 87, y: 14, largeur: 105, rotation: 6,  profondeur: 'proche', couleur: 'corail',  decalage: 0 },
  { x: 5,  y: 68, largeur: 105, rotation: -6, profondeur: 'proche', couleur: 'lavande', decalage: -1.5 },
  { x: 95, y: 65, largeur: 105, rotation: 8,  profondeur: 'proche', couleur: 'soleil',  decalage: -3 },
  { x: 50, y: 9,  largeur: 105, rotation: -5, profondeur: 'proche', couleur: 'menthe',  decalage: -4.5 },
];
