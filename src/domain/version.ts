/**
 * Numéros de version de l'application.
 *
 * Rôle : lire un numéro de version « majeur.mineur.correctif » (ex. `0.1.0`), les comparer, et dire si
 * une version est inférieure à la « version minimum requise ».
 * Expose : Version, lireVersion(), versionValide(), comparerVersions(), estInferieure().
 * Dépend de : rien. Aucun import React ni DOM.
 */

/** Une version décomposée. */
export interface Version {
  majeur: number;
  mineur: number;
  correctif: number;
}

/** Une version s'écrit exactement `nombre.nombre.nombre` (sans zéro inutile devant, comme SemVer). */
const FORMAT_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/**
 * Décompose un numéro de version.
 *
 * @param texte - Ex. `0.1.0`.
 * @returns La version, ou `null` si le format n'est pas `majeur.mineur.correctif`.
 */
export function lireVersion(texte: string): Version | null {
  const morceaux = FORMAT_VERSION.exec(texte.trim());
  if (!morceaux) return null;
  const [, majeur, mineur, correctif] = morceaux;
  return { majeur: Number(majeur), mineur: Number(mineur), correctif: Number(correctif) };
}

/** Vrai si le texte est un numéro de version valide. */
export function versionValide(texte: string): boolean {
  return lireVersion(texte) !== null;
}

/**
 * Compare deux versions.
 *
 * @returns Un nombre négatif si `a` < `b`, positif si `a` > `b`, 0 si elles sont égales.
 * @throws Si l'une des deux n'est pas un numéro de version valide.
 */
export function comparerVersions(a: string, b: string): number {
  const va = lireVersion(a);
  const vb = lireVersion(b);
  if (!va || !vb) throw new Error(`Version invalide : « ${va ? b : a} ».`);
  return va.majeur - vb.majeur || va.mineur - vb.mineur || va.correctif - vb.correctif;
}

/**
 * Dit si une version est strictement inférieure à une autre (ex. version de l'appli < version minimum).
 * Un texte illisible n'est jamais considéré comme inférieur : on ne bloque personne par erreur.
 */
export function estInferieure(version: string, reference: string): boolean {
  if (!versionValide(version) || !versionValide(reference)) return false;
  return comparerVersions(version, reference) < 0;
}
