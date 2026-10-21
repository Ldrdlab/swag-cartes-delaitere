/**
 * Logique d'index du carrousel circulaire.
 *
 * Rôle : calculer les positions dans une liste qui « boucle » (après le dernier, on revient au premier).
 * Expose : wrapIndex(), stepIndex(), relativeOffset().
 * Dépend de : rien (logique pure, aucun import React ni DOM).
 */

/**
 * Ramène un index dans l'intervalle [0, count[ en bouclant (accepte les valeurs négatives).
 *
 * @param index - Index quelconque (ex. -1 ou count).
 * @param count - Nombre d'éléments (> 0).
 * @returns L'index équivalent dans [0, count[.
 */
export function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

/**
 * Avance (delta > 0) ou recule (delta < 0) d'un certain nombre de crans, en bouclant.
 *
 * @param current - Index courant.
 * @param delta - Nombre de crans (négatif pour reculer).
 * @param count - Nombre d'éléments (> 0).
 * @returns Le nouvel index dans [0, count[.
 */
export function stepIndex(current: number, delta: number, count: number): number {
  return wrapIndex(current + delta, count);
}

/**
 * Position d'un élément par rapport à l'élément central, par le chemin le plus court.
 * 0 = au centre, -1 = juste à gauche, +1 = juste à droite, etc.
 *
 * @param itemIndex - Index de l'élément observé.
 * @param centerIndex - Index de l'élément au centre.
 * @param count - Nombre d'éléments (> 0).
 * @returns Le décalage signé (pour 3 éléments : -1, 0 ou +1).
 */
export function relativeOffset(itemIndex: number, centerIndex: number, count: number): number {
  const half = Math.floor(count / 2);
  return wrapIndex(itemIndex - centerIndex + half, count) - half;
}
