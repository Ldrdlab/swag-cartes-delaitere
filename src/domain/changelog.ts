/**
 * Lecture et mise à jour du fichier CHANGELOG.md.
 *
 * Rôle : le CHANGELOG (en français simple) sert de notes de mise à jour. Ce module sait :
 *   - lire les points d'une version (`## [0.2.0] - 2026-12-01`) pour les montrer aux joueurs ;
 *   - lire ce qui est « Non publié » (ce qui sera dans la prochaine version) ;
 *   - publier une version : ce qui était « Non publié » passe sous le titre de la nouvelle version.
 * Expose : TITRE_NON_PUBLIE, notesDeVersion(), contenuNonPublie(), publierChangelog(), InfosVersionPubliee,
 * lireInfosVersion().
 * Dépend de : rien. Aucun import React ni DOM. Importé aussi par scripts/publier.mjs (Node) et
 * vite.config.ts : ses imports d'éventuels autres fichiers devraient donc garder l'extension `.ts`.
 *
 * Format attendu :
 *   ## Non publié
 *   ### Nouveautés
 *   - Un point par ligne.
 *   ## [0.1.0] - 2026-11-08
 *   - …
 */

/** Titre de la section des changements pas encore publiés. */
export const TITRE_NON_PUBLIE = '## Non publié';

/** Une section : son titre (ligne `## …`) et son contenu (jusqu'au prochain titre `## `). */
interface Section {
  titre: string;
  debut: number;
  fin: number;
}

/** Découpe le texte en sections de niveau 2 (`## `). */
function lireSections(texte: string): Section[] {
  const lignes = texte.split('\n');
  const sections: Section[] = [];
  lignes.forEach((ligne, index) => {
    if (/^## /.test(ligne)) {
      const precedente = sections[sections.length - 1];
      if (precedente) precedente.fin = index;
      sections.push({ titre: ligne.trim(), debut: index, fin: lignes.length });
    }
  });
  return sections;
}

/** Points (`- …`) d'une section, sans le tiret. Les sous-titres `### …` et les lignes vides sont ignorés. */
function pointsDe(texte: string, section: Section): string[] {
  return texte
    .split('\n')
    .slice(section.debut + 1, section.fin)
    .map((ligne) => ligne.trim())
    .filter((ligne) => /^[-*] /.test(ligne))
    .map((ligne) => ligne.replace(/^[-*] /, '').trim())
    .filter((ligne) => ligne !== '');
}

/**
 * Points de la section d'une version publiée.
 *
 * @param changelog - Contenu de CHANGELOG.md.
 * @param version - Numéro de version (ex. `0.2.0`).
 * @returns Les points, ou une liste vide si la version n'est pas dans le fichier.
 */
export function notesDeVersion(changelog: string, version: string): string[] {
  const section = lireSections(changelog).find((s) => s.titre.startsWith(`## [${version}]`));
  return section ? pointsDe(changelog, section) : [];
}

/** Points de la section « Non publié » (ce qui sera dans la prochaine version). */
export function contenuNonPublie(changelog: string): string[] {
  const section = lireSections(changelog).find((s) => s.titre === TITRE_NON_PUBLIE);
  return section ? pointsDe(changelog, section) : [];
}

/**
 * Publie une version : le contenu de « Non publié » passe sous `## [version] - date`, et une nouvelle
 * section « Non publié » vide reste en haut, prête pour la suite.
 *
 * @param changelog - Contenu actuel de CHANGELOG.md.
 * @param version - Numéro de la version publiée.
 * @param date - Date au format AAAA-MM-JJ.
 * @returns Le nouveau contenu du fichier.
 * @throws Si la section « Non publié » n'existe pas, est vide, ou si la version est déjà publiée.
 */
export function publierChangelog(changelog: string, version: string, date: string): string {
  const sections = lireSections(changelog);
  const nonPublie = sections.find((s) => s.titre === TITRE_NON_PUBLIE);
  if (!nonPublie) throw new Error(`Le CHANGELOG n'a pas de section « ${TITRE_NON_PUBLIE} ».`);
  if (pointsDe(changelog, nonPublie).length === 0) {
    throw new Error('Rien à publier : la section « Non publié » du CHANGELOG est vide.');
  }
  if (sections.some((s) => s.titre.startsWith(`## [${version}]`))) {
    throw new Error(`La version ${version} existe déjà dans le CHANGELOG.`);
  }

  const lignes = changelog.split('\n');
  const contenu = lignes.slice(nonPublie.debut + 1, nonPublie.fin);
  // Retire les lignes vides de début et de fin du contenu déplacé.
  while (contenu.length > 0 && contenu[0]?.trim() === '') contenu.shift();
  while (contenu.length > 0 && contenu[contenu.length - 1]?.trim() === '') contenu.pop();

  const nouvelles = [TITRE_NON_PUBLIE, '', `## [${version}] - ${date}`, '', ...contenu, ''];
  return [...lignes.slice(0, nonPublie.debut), ...nouvelles, ...lignes.slice(nonPublie.fin)].join(
    '\n',
  );
}

/** Ce que le fichier `version.json` (publié avec chaque version) dit de la version en ligne. */
export interface InfosVersionPubliee {
  version: string;
  /** Points de nouveautés (lus dans le CHANGELOG au moment de la construction). */
  notes: string[];
}

/**
 * Lit le contenu de `version.json` (JSON déjà décodé).
 *
 * @returns Les infos, ou `null` si le contenu n'a pas la bonne forme (on n'affiche alors aucune note).
 */
export function lireInfosVersion(json: unknown): InfosVersionPubliee | null {
  if (typeof json !== 'object' || json === null) return null;
  const { version, notes } = json as Record<string, unknown>;
  if (typeof version !== 'string' || version === '') return null;
  if (!Array.isArray(notes)) return null;
  return {
    version,
    notes: notes.filter((note): note is string => typeof note === 'string' && note.trim() !== ''),
  };
}
