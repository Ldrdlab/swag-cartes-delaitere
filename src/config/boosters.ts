/**
 * Dimensions de référence des boosters et géométrie du carrousel.
 *
 * Rôle : fixer la taille « de référence » d'un booster (172 × 320) sur laquelle toutes les skins sont
 * dessinées. À l'écran, un booster peut être plus grand ou plus petit : tout est alors mis à l'échelle
 * (une « unité » = largeur affichée / 172).
 * Expose : LARGEUR_REFERENCE, HAUTEUR_REFERENCE, HAUTEUR_HAUT_REFERENCE, HAUTEUR_AVEC_REFLET,
 * RATIO_HAUT, GEOMETRIE_CARROUSEL.
 * Dépend de : rien.
 */

/** Largeur d'un booster, en unités de référence. */
export const LARGEUR_REFERENCE = 172;

/** Hauteur d'un booster, en unités de référence. */
export const HAUTEUR_REFERENCE = 320;

/**
 * Hauteur de la bande du haut (sertis + bandeau + fine bande brillante), en unités de référence.
 * C'est la partie que l'écran d'ouverture découpe : TOUTES les skins doivent respecter cette hauteur
 * pour leur partie « haut ».
 */
export const HAUTEUR_HAUT_REFERENCE = 60;

/** Hauteur à prévoir pour un booster ET son reflet au sol, en unités de référence. */
export const HAUTEUR_AVEC_REFLET = 376;

/** Proportion de la hauteur occupée par la bande du haut (sert aussi de ligne de découpe). */
export const RATIO_HAUT = HAUTEUR_HAUT_REFERENCE / HAUTEUR_REFERENCE;

/** Positions des boosters dans le carrousel de l'écran de choix. */
export const GEOMETRIE_CARROUSEL = {
  /** Décalage horizontal d'un booster latéral par rapport au central, en pixels. */
  decalageLateralPx: 118,
  /** De combien un booster latéral est abaissé, en pixels. */
  abaissementCotePx: 38,
  /** Réduction d'un booster latéral (0,78 = 78 % de la taille du central). */
  echelleCote: 0.78,
};
