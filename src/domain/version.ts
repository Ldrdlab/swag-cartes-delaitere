/**
 * Numéros de version de l'application.
 *
 * Rôle : lire un numéro de version « majeur.mineur.correctif » (ex. `0.1.0`), les comparer, et dire si
 * une version est inférieure à la « version minimum requise ».
 * Expose : Version, TypeIncrement, lireVersion(), versionValide(), comparerVersions(), estInferieure(),
 * incrementerVersion().
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

/** Ce qu'on augmente pour passer à la version suivante. */
export type TypeIncrement = 'majeur' | 'mineur' | 'correctif';

/**
 * Calcule la version suivante.
 *
 * @param version - Version actuelle (ex. `0.1.0`).
 * @param type - `correctif` : 0.1.0 → 0.1.1 ; `mineur` : 0.1.0 → 0.2.0 ; `majeur` : 0.1.0 → 1.0.0.
 * @throws Si la version actuelle n'est pas un numéro valide.
 */
export function incrementerVersion(version: string, type: TypeIncrement): string {
  const lue = lireVersion(version);
  if (!lue) throw new Error(`Version invalide : « ${version} ».`);
  if (type === 'majeur') return `${lue.majeur + 1}.0.0`;
  if (type === 'mineur') return `${lue.majeur}.${lue.mineur + 1}.0`;
  return `${lue.majeur}.${lue.mineur}.${lue.correctif + 1}`;
}
