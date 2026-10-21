/**
 * Contrat commun à toutes les skins de booster.
 *
 * Rôle : définir ce que reçoit une skin (le thème, l'état, la partie à dessiner, la taille) et ce
 * qu'elle doit savoir faire. Une « skin » est un modèle de rendu : elle sait dessiner N'IMPORTE
 * QUEL thème à sa façon (en CSS, avec une image, avec des calques animés…).
 *
 * RÈGLES À RESPECTER PAR UNE SKIN
 *  1. Elle remplit entièrement son parent (largeur ET hauteur 100 %) ; c'est BoosterVisuel qui fixe la taille.
 *  2. Toutes ses mesures s'écrivent en « unités » : `calc(N * var(--u))`, où N est en pixels du paquet de
 *     référence (172 × 320, voir config/boosters.ts). Ainsi elle suit la taille du booster.
 *  3. Elle sait s'afficher en deux parties séparées, indispensable pour l'écran d'ouverture :
 *       - `haut`  : la bande du haut (sertis + bandeau), hauteur HAUTEUR_HAUT_REFERENCE (60 unités) ;
 *       - `corps` : tout le reste (260 unités) ;
 *       - `complet` : les deux, l'une sous l'autre.
 *     Les deux parties mises bout à bout doivent redonner exactement le paquet complet.
 *  4. Elle n'anime que `transform` et `opacity`, et seulement si `etat` est `centre` ou `confirmation`.
 * Le foil (reflet holographique) et le reflet au sol sont ajoutés par BoosterVisuel : la skin n'a pas à
 * s'en occuper.
 *
 * Expose : EtatBooster, PartieBooster, NomSkin, PropsSkin.
 * Dépend de : boosters/themes/types.
 */
import type { ThemeBooster } from '../themes/types';

/** Où se trouve le booster à l'écran. */
export type EtatBooster =
  /** Booster du milieu du carrousel (les animations tournent). */
  | 'centre'
  /** Booster voisin, derrière (animations en pause). */
  | 'cote'
  /** Booster seul sur l'écran de confirmation. */
  | 'confirmation'
  /** Booster en cours de découpe sur l'écran d'ouverture. */
  | 'ouverture';

/** Quelle partie du paquet dessiner. */
export type PartieBooster = 'complet' | 'haut' | 'corps';

/** Noms des skins disponibles (chacune est associée à son composant dans registre.ts). */
export type NomSkin = 'standard' | 'image' | 'exemple-ultra';

/** Ce que reçoit une skin. */
export interface PropsSkin {
  /** Le thème à dessiner (couleurs, textes, illustration, effets). */
  theme: ThemeBooster;
  /** Où se trouve le booster à l'écran. */
  etat: EtatBooster;
  /** Quelle partie dessiner. */
  partie: PartieBooster;
  /** Taille d'une unité de référence en pixels (largeur affichée ÷ 172). Pour les calculs en JavaScript. */
  unite: number;
}
