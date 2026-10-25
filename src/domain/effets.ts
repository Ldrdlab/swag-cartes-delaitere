/**
 * Génération des confettis et des étincelles de la révélation (fonctions pures, sans hasard).
 *
 * Rôle : calculer la pluie de confettis et les étincelles. Aucune valeur n'est tirée au hasard : tout est
 * calculé à partir du NUMÉRO de la pièce, donc le rendu est toujours le même (et testable).
 * (Le tremblement de la carte est dans domain/tremblement.ts.)
 * Expose : GeometrieConfetti, PieceConfetti, genererConfettis(), nombreConfettis(), GeometrieEtincelles,
 * Etincelle, genererEtincelles().
 * Dépend de : rien (aucun import React ni DOM).
 */

/** Nombre pseudo-aléatoire dans [0, 1[, toujours le même pour un même couple (indice, graine). */
function fraction(indice: number, graine: number): number {
  const hachage = (Math.imul(indice + 1, 2654435761) ^ Math.imul(graine + 1, 40503)) >>> 0;
  return (hachage % 10007) / 10007;
}

/** Valeur entre `min` et `max` selon une fraction de [0, 1[. */
function entre(min: number, max: number, fractionDePlage: number): number {
  return min + (max - min) * fractionDePlage;
}

/** Réglages de la pluie de confettis (valeurs dans config/revelation.ts). */
export interface GeometrieConfetti {
  largeurMin: number;
  largeurMax: number;
  hauteurMin: number;
  hauteurMax: number;
  /** Part des confettis ronds (0 à 1). */
  proportionRondes: number;
  /** Hauteur de chute (px). */
  chutePx: number;
  /** Dérive horizontale maximale, vers la gauche ou la droite (px). */
  deriveMaxPx: number;
  /** Rotation maximale, dans un sens ou l'autre (degrés). */
  rotationMaxDeg: number;
  dureeMinS: number;
  dureeMaxS: number;
  delaiMaxS: number;
}

/** Un confetti. */
export interface PieceConfetti {
  id: number;
  /** Position de départ, en % de la largeur de l'écran. */
  gauchePourcent: number;
  largeur: number;
  hauteur: number;
  ronde: boolean;
  couleur: string;
  delaiS: number;
  dureeS: number;
  deriveX: number;
  rotationDeg: number;
  chutePx: number;
}

/**
 * Génère `nombre` confettis, positionnés par calcul à partir de leur numéro.
 *
 * @param nombre - Nombre de confettis.
 * @param couleurs - Couleurs possibles.
 * @param geometrie - Tailles, durées et amplitudes.
 * @returns Les confettis (tableau vide si `nombre` vaut 0 ou si `couleurs` est vide).
 */
export function genererConfettis(
  nombre: number,
  couleurs: readonly string[],
  geometrie: GeometrieConfetti,
): PieceConfetti[] {
  if (couleurs.length === 0) return [];
  return Array.from({ length: Math.max(nombre, 0) }, (_, id) => {
    const ronde = fraction(id, 5) < geometrie.proportionRondes;
    const largeur = entre(geometrie.largeurMin, geometrie.largeurMax, fraction(id, 2));
    const hauteur = ronde
      ? largeur
      : entre(geometrie.hauteurMin, geometrie.hauteurMax, fraction(id, 3));
    return {
      id,
      gauchePourcent: entre(0, 100, fraction(id, 1)),
      largeur,
      hauteur,
      ronde,
      couleur: couleurs[Math.floor(fraction(id, 4) * couleurs.length)] ?? couleurs[0] ?? '#FFFFFF',
      delaiS: entre(0, geometrie.delaiMaxS, fraction(id, 6)),
      dureeS: entre(geometrie.dureeMinS, geometrie.dureeMaxS, fraction(id, 7)),
      deriveX: entre(-geometrie.deriveMaxPx, geometrie.deriveMaxPx, fraction(id, 8)),
      rotationDeg: entre(-geometrie.rotationMaxDeg, geometrie.rotationMaxDeg, fraction(id, 9)),
      chutePx: geometrie.chutePx,
    };
  });
}

/**
 * Nombre de confettis réellement lancés : divisé par deux en mode « effets réduits » (téléphones
 * d'entrée de gamme).
 *
 * @param nombreDeBase - Nombre prévu pour la rareté (config/raretes.ts).
 * @param effetsReduits - Vrai pour alléger les effets.
 * @returns Le nombre de confettis à afficher.
 */
export function nombreConfettis(nombreDeBase: number, effetsReduits: boolean): number {
  return effetsReduits ? Math.ceil(nombreDeBase / 2) : nombreDeBase;
}

/** Réglages des étincelles (valeurs dans config/revelation.ts). */
export interface GeometrieEtincelles {
  /** Hauteur de montée (px). */
  montePx: number;
  /** Durée d'un cycle (s). */
  dureeS: number;
  /** Écart entre les départs de deux étincelles consécutives (s). */
  decalageS: number;
  tailleMinPx: number;
  tailleMaxPx: number;
}

/** Une étincelle dorée. */
export interface Etincelle {
  id: number;
  /** Position horizontale de départ, en % de la largeur de la zone. */
  gauchePourcent: number;
  /** Position verticale de départ, en % de la hauteur de la zone (depuis le bas). */
  departBasPourcent: number;
  delaiS: number;
  dureeS: number;
  montePx: number;
  taillePx: number;
}

/**
 * Génère `nombre` étincelles, positionnées par calcul à partir de leur numéro.
 *
 * @param nombre - Nombre d'étincelles.
 * @param geometrie - Taille, durée et montée.
 * @returns Les étincelles, dont les départs sont décalés.
 */
export function genererEtincelles(nombre: number, geometrie: GeometrieEtincelles): Etincelle[] {
  return Array.from({ length: Math.max(nombre, 0) }, (_, id) => ({
    id,
    gauchePourcent: entre(12, 88, fraction(id, 11)),
    departBasPourcent: entre(25, 65, fraction(id, 12)),
    delaiS: (id * geometrie.decalageS) % geometrie.dureeS,
    dureeS: geometrie.dureeS,
    montePx: geometrie.montePx,
    taillePx: entre(geometrie.tailleMinPx, geometrie.tailleMaxPx, fraction(id, 13)),
  }));
}
