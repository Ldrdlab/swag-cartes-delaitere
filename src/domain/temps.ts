/**
 * Affichage d'une durée.
 *
 * Rôle : écrire une durée en secondes de façon lisible pour le compte à rebours avant la remise à zéro
 * des boosters du jour (« 3 h 12 min », « 12 min », « moins d'une minute »).
 * Expose : DecompositionDuree, decomposerDuree(), formaterDuree().
 * Dépend de : rien. Aucun import React ni DOM.
 */

/** Une durée décomposée en heures et minutes. */
export interface DecompositionDuree {
  heures: number;
  minutes: number;
}

/**
 * Décompose une durée en heures et minutes, arrondies à la minute SUPÉRIEURE (« il reste 1 s » → 1 min,
 * pour ne jamais afficher « 0 min » alors qu'il faut encore attendre).
 *
 * @param secondes - Durée en secondes (une valeur négative ou illisible compte pour 0).
 */
export function decomposerDuree(secondes: number): DecompositionDuree {
  const total = Number.isFinite(secondes) && secondes > 0 ? Math.ceil(secondes / 60) : 0;
  return { heures: Math.floor(total / 60), minutes: total % 60 };
}

/**
 * Écrit une durée en français.
 *
 * @param secondes - Durée en secondes.
 * @param textes - Les mots à employer (viennent de content/textes.ts).
 * @returns Par exemple `3 h 12 min`, `45 min` ou le texte « moins d'une minute » pour 0.
 */
export function formaterDuree(
  secondes: number,
  textes: { heures: string; minutes: string; moinsUneMinute: string },
): string {
  const { heures, minutes } = decomposerDuree(secondes);
  if (heures === 0 && minutes === 0) return textes.moinsUneMinute;
  if (heures === 0) return `${minutes} ${textes.minutes}`;
  if (minutes === 0) return `${heures} ${textes.heures}`;
  return `${heures} ${textes.heures} ${minutes} ${textes.minutes}`;
}
