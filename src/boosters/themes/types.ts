/**
 * Contrat d'un thème de booster.
 *
 * Rôle : décrire tout ce qui rend un booster unique à l'œil (couleurs, textes du paquet, illustration,
 * effets). Un thème ne contient PAS de code : seulement des valeurs. C'est une skin
 * (dossier ../skins/) qui sait le dessiner.
 * Expose : CouleursTheme, EffetsTheme, CalqueTheme, ThemeBooster.
 * Dépend de : rien.
 */

/** Couleurs du paquet (écrites comme en CSS : '#FF6B4A', 'rgba(…)'…). */
export interface CouleursTheme {
  /** Début du dégradé du paquet (bandeau du haut, reflet au sol). */
  paquetDebut: string;
  /** Fin du dégradé du paquet. */
  paquetFin: string;
  /** Couleur des bords striés (sertis) du haut et du bas. */
  sertis: string;
  /** Couleur de l'ombre portée sous le paquet. */
  ombre: string;
  /** Couleur de la lueur autour du titre. */
  lueur: string;
}

/** Effets activables sur un booster. Chaque effet s'active ou se coupe ici, jamais dans la skin. */
export interface EffetsTheme {
  /** Reflet holographique qui balaie le paquet (animé seulement sur le booster au centre). */
  foil: boolean;
  /** Force du foil, de 0 (invisible) à 1 (très marqué). */
  foilIntensite: number;
  /** Couleur du reflet qui balaie (ex. 'rgba(255, 255, 255, 0.9)'). */
  foilCouleur: string;
  /** Bords striés en haut et en bas (skin « standard »). */
  sertis: boolean;
  /** Reflet au sol sous le booster central. */
  reflet: boolean;
}

/** Un calque d'image d'une skin avancée (voir skins/exemple-ultra). */
export interface CalqueTheme {
  /** Nom du fichier SANS extension, dans src/assets/images/boosters/<id>/ (ex. 'fond'). */
  fichier: string;
  /** Profondeur : 0 = fond qui ne bouge pas, 1 = premier plan qui bouge le plus. */
  profondeur: number;
}

/** Thème visuel d'un booster. */
export interface ThemeBooster {
  /** Identifiant unique (sert aussi de nom de dossier pour les images : assets/images/boosters/<id>/). */
  id: string;
  /** Nom lisible du booster (affiché sous le carrousel, lu par les lecteurs d'écran). */
  nom: string;
  /** Première ligne du titre du paquet, EN MAJUSCULES. */
  ligne1: string;
  /** Deuxième ligne du titre du paquet, EN MAJUSCULES. */
  ligne2: string;
  /** Texte de la pastille de saison (ex. 'Saison 1'). */
  saison: string;
  /** Code court dans le badge en haut à droite du paquet (ex. 'S1'). */
  code: string;
  couleurs: CouleursTheme;
  /**
   * Illustration du paquet, sous forme de calques CSS (dégradés). Le PREMIER calque est au-dessus, le
   * DERNIER au fond. Les tailles peuvent utiliser `calc(N * var(--u))` : N est alors en unités du paquet
   * de référence (172 de large), donc l'illustration suit la taille du booster.
   */
  illustration: readonly string[];
  effets: EffetsTheme;
  /** Calques d'image pour la skin avancée « exemple-ultra » (facultatif). */
  calques?: readonly CalqueTheme[];
}
