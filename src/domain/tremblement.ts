/**
 * Tremblement progressif de la carte légendaire (fonctions pures, sans hasard).
 *
 * Rôle : générer les images-clés du tremblement (21 par défaut) : l'amplitude, la rotation et l'échelle
 * augmentent avec une courbe « ease-in », les signes alternent. Les images-clés sont CALCULÉES par une
 * fonction, pas écrites à la main.
 * Expose : ConfigTremblement, ImageCleTremblement, genererImagesClesTremblement(), transformTremblement().
 * Dépend de : rien (aucun import React ni DOM).
 */

/** Réglages du tremblement (valeurs dans config/revelation.ts). */
export interface ConfigTremblement {
  /** Nombre d'images-clés. */
  etapes: number;
  /** Amplitude du décalage au début et à la fin (px). */
  amplitudeMin: number;
  amplitudeMax: number;
  /** Rotation au début et à la fin (degrés). */
  rotationMin: number;
  rotationMax: number;
  /** Échelle à la fin (1 au début). */
  echelleMax: number;
  /** Le décalage vertical vaut cette part du décalage horizontal. */
  ratioVertical: number;
}

/** Une image-clé du tremblement. */
export interface ImageCleTremblement {
  /** Position dans l'animation, de 0 (début) à 1 (fin). */
  offset: number;
  decalageX: number;
  decalageY: number;
  rotationDeg: number;
  echelle: number;
}

/** Valeur intermédiaire entre `debut` et `fin` (0 → debut, 1 → fin). */
function interpoler(debut: number, fin: number, progression: number): number {
  return debut + (fin - debut) * progression;
}

/**
 * Génère les images-clés du tremblement : l'amplitude, la rotation et l'échelle augmentent avec une
 * courbe « ease-in » (démarrage lent, fin rapide) ; les signes alternent d'une image à l'autre.
 *
 * @param config - Réglages du tremblement.
 * @returns `config.etapes` images-clés, de la plus douce à la plus violente.
 */
export function genererImagesClesTremblement(config: ConfigTremblement): ImageCleTremblement[] {
  return Array.from({ length: config.etapes }, (_, indice) => {
    const progression = config.etapes > 1 ? indice / (config.etapes - 1) : 1;
    const adoucie = progression * progression; // ease-in
    const amplitude = interpoler(config.amplitudeMin, config.amplitudeMax, adoucie);
    const rotation = interpoler(config.rotationMin, config.rotationMax, adoucie);
    const signe = indice % 2 === 0 ? 1 : -1;
    const signeVertical = indice % 4 < 2 ? 1 : -1;
    return {
      offset: progression,
      decalageX: signe * amplitude,
      decalageY: signeVertical * amplitude * config.ratioVertical,
      rotationDeg: signe * rotation,
      echelle: interpoler(1, config.echelleMax, adoucie),
    };
  });
}

/**
 * Écrit une image-clé comme valeur CSS de `transform`.
 *
 * @param image - Image-clé du tremblement.
 * @returns Ex. `translate(1.2px, -0.7px) rotate(0.3deg) scale(1.001)`.
 */
export function transformTremblement(image: ImageCleTremblement): string {
  const arrondir = (valeur: number) => Number(valeur.toFixed(3));
  return `translate(${arrondir(image.decalageX)}px, ${arrondir(image.decalageY)}px) rotate(${arrondir(image.rotationDeg)}deg) scale(${arrondir(image.echelle)})`;
}
