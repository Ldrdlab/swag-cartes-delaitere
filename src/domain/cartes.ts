/**
 * Logique pure de la collection de cartes (« Mes cartes »).
 *
 * Rôle : vérifier les proportions d'une image, calculer ses dimensions optimisées, valider les infos
 * d'une carte (nom, rareté, variante, effet, activation), filtrer / trier / compter les cartes.
 * Les réglages (ratio, tolérance, variantes…) sont passés en paramètres : ils viennent de
 * config/cartes.ts.
 * Expose : VerdictRatio, InfosCarte, ErreurInfos, ErreursInfos, FiltreCartes, verifierRatio(),
 * dimensionsOptimisees(), typeImageAccepte(), nomDepuisFichier(), variantesPour(), fusionnerInfos(),
 * normaliserInfos(), validerInfos(), compterParRarete(), filtrerCartes(), trierCartes().
 * Dépend de : domain/types. Aucun import React ni DOM.
 */
import { origineEffet, type OrigineEffet, type ParamsEffetCarte } from './effetsCartes.ts';
import { RARITIES, type Card, type Rarity, type Variant } from './types.ts';

/** Résultat de la vérification des proportions d'une image. */
export interface VerdictRatio {
  /** `true` si les proportions sont celles d'une carte, à la tolérance près. */
  conforme: boolean;
  /** Écart relatif avec le ratio attendu (0.05 = 5 %). */
  ecart: number;
}

/**
 * Vérifie que les proportions d'une image sont celles attendues (sans jamais la déformer).
 *
 * @param largeur - Largeur de l'image (px).
 * @param hauteur - Hauteur de l'image (px).
 * @param ratioAttendu - Largeur / hauteur d'une carte.
 * @param tolerance - Écart relatif accepté (0.02 = 2 %).
 * @returns Le verdict ; une image de taille nulle n'est jamais conforme.
 */
export function verifierRatio(
  largeur: number,
  hauteur: number,
  ratioAttendu: number,
  tolerance: number,
): VerdictRatio {
  if (!(largeur > 0) || !(hauteur > 0) || !(ratioAttendu > 0)) {
    return { conforme: false, ecart: Number.POSITIVE_INFINITY };
  }
  const ecart = Math.abs(largeur / hauteur / ratioAttendu - 1);
  return { conforme: ecart <= tolerance, ecart };
}

/**
 * Dimensions d'une image réduite à une largeur maximale, proportions conservées. Une image plus
 * étroite que le maximum n'est jamais agrandie.
 *
 * @param largeur - Largeur d'origine (px).
 * @param hauteur - Hauteur d'origine (px).
 * @param largeurMax - Largeur maximale (px).
 * @returns Les nouvelles dimensions, arrondies, d'au moins 1 px.
 */
export function dimensionsOptimisees(
  largeur: number,
  hauteur: number,
  largeurMax: number,
): { largeur: number; hauteur: number } {
  const echelle = largeur > largeurMax ? largeurMax / largeur : 1;
  return {
    largeur: Math.max(1, Math.round(largeur * echelle)),
    hauteur: Math.max(1, Math.round(hauteur * echelle)),
  };
}

/**
 * Dit si un fichier est une image acceptée : d'après son type MIME, ou à défaut son extension.
 *
 * @param type - Type MIME donné par le navigateur (peut être vide).
 * @param nomFichier - Nom du fichier.
 * @param typesAcceptes - Types MIME acceptés.
 * @param extensionsAcceptees - Extensions acceptées, avec le point (ex. `.png`).
 */
export function typeImageAccepte(
  type: string,
  nomFichier: string,
  typesAcceptes: readonly string[],
  extensionsAcceptees: readonly string[],
): boolean {
  if (type !== '') return typesAcceptes.includes(type.toLowerCase());
  const nom = nomFichier.toLowerCase();
  return extensionsAcceptees.some((extension) => nom.endsWith(extension));
}

/**
 * Propose un nom de carte à partir d'un nom de fichier : sans extension, tirets et soulignés
 * remplacés par des espaces, première lettre en majuscule.
 *
 * @param nomFichier - Ex. `dragon_de_feu.png`.
 * @param longueurMax - Nombre maximal de caractères.
 * @returns Ex. `Dragon de feu`.
 */
export function nomDepuisFichier(nomFichier: string, longueurMax: number): string {
  const sansExtension = nomFichier.replace(/\.[^./\\]+$/, '');
  const propre = sansExtension.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const coupe = Array.from(propre).slice(0, longueurMax).join('').trim();
  return coupe.charAt(0).toUpperCase() + coupe.slice(1);
}

/** Variantes autorisées pour une rareté (liste vide si cette rareté n'a pas de variante). */
export function variantesPour(
  rarete: Rarity,
  table: Readonly<Partial<Record<Rarity, readonly Variant[]>>>,
): readonly Variant[] {
  return table[rarete] ?? [];
}

/** Infos modifiables d'une carte. */
export interface InfosCarte {
  nom: string;
  rarete: Rarity;
  variante?: Variant | undefined;
  /** Effet imposé : `''` = automatique (effet de la rareté), `aucun`, ou la clé d'un effet. Absent = inchangé. */
  effet?: string | undefined;
  /** Réglages de l'effet de la carte (intensité, zone…). Absents = inchangés ; `{}` = les efface. */
  parametres?: ParamsEffetCarte | undefined;
  /** Carte active (peut sortir des boosters). Absente = inchangée / active. */
  active?: boolean | undefined;
}

/** Problèmes possibles sur les infos d'une carte (le texte affiché dépend de l'écran). */
export type ErreurInfos = 'nom_vide' | 'nom_trop_long' | 'variante_requise' | 'variante_invalide';

/** Erreurs trouvées, par champ. */
export interface ErreursInfos {
  nom?: ErreurInfos;
  variante?: ErreurInfos;
}

/**
 * Applique un changement aux infos d'une carte en gardant la variante cohérente avec la rareté :
 * une variante qui n'existe pas pour la nouvelle rareté est remplacée par la première autorisée
 * (ou retirée si cette rareté n'a pas de variante).
 *
 * @param infos - Infos actuelles.
 * @param changement - Champs modifiés.
 * @param table - Variantes autorisées par rareté.
 */
export function fusionnerInfos(
  infos: InfosCarte,
  changement: Partial<InfosCarte>,
  table: Readonly<Partial<Record<Rarity, readonly Variant[]>>>,
): InfosCarte {
  const fusion = { ...infos, ...changement };
  const possibles = variantesPour(fusion.rarete, table);
  const variante =
    fusion.variante && possibles.includes(fusion.variante) ? fusion.variante : possibles[0];
  return { ...fusion, variante };
}

/**
 * Nettoie les infos : nom sans espaces autour, et variante retirée si la rareté n'en a pas.
 *
 * @param infos - Infos saisies.
 * @param table - Variantes autorisées par rareté.
 */
export function normaliserInfos(
  infos: InfosCarte,
  table: Readonly<Partial<Record<Rarity, readonly Variant[]>>>,
): InfosCarte {
  const propre: InfosCarte = { nom: infos.nom.trim(), rarete: infos.rarete };
  if (variantesPour(infos.rarete, table).length > 0 && infos.variante) {
    propre.variante = infos.variante;
  }
  if (infos.effet !== undefined) propre.effet = infos.effet;
  if (infos.parametres !== undefined) propre.parametres = infos.parametres;
  if (infos.active !== undefined) propre.active = infos.active;
  return propre;
}

/**
 * Valide les infos d'une carte : nom obligatoire, et variante obligatoire (et autorisée) pour les
 * raretés qui en ont une.
 *
 * @param infos - Infos saisies.
 * @param table - Variantes autorisées par rareté.
 * @param nomMax - Nombre maximal de caractères du nom.
 * @returns Les erreurs trouvées (objet vide = tout est valide).
 */
export function validerInfos(
  infos: InfosCarte,
  table: Readonly<Partial<Record<Rarity, readonly Variant[]>>>,
  nomMax: number,
): ErreursInfos {
  const erreurs: ErreursInfos = {};
  const nom = infos.nom.trim();
  if (nom === '') erreurs.nom = 'nom_vide';
  else if (Array.from(nom).length > nomMax) erreurs.nom = 'nom_trop_long';

  const autorisees = variantesPour(infos.rarete, table);
  if (autorisees.length > 0) {
    if (!infos.variante) erreurs.variante = 'variante_requise';
    else if (!autorisees.includes(infos.variante)) erreurs.variante = 'variante_invalide';
  }
  return erreurs;
}

/** Nombre de cartes de chaque rareté. */
export function compterParRarete(cartes: readonly Card[]): Record<Rarity, number> {
  const comptes = Object.fromEntries(RARITIES.map((rarete) => [rarete, 0])) as Record<
    Rarity,
    number
  >;
  for (const carte of cartes) comptes[carte.rarity] += 1;
  return comptes;
}

/** Critères de la galerie. */
export interface FiltreCartes {
  /** Rareté voulue, ou `'toutes'`. */
  rarete: Rarity | 'toutes';
  /** Texte cherché dans le nom (sans tenir compte des accents ni des majuscules). */
  recherche: string;
  /** Origine de l'effet voulue (automatique, forcé, aucun) ; absente ou `'tous'` = toutes. */
  effet?: OrigineEffet | 'tous';
}

/** Met un texte en minuscules, sans accents, pour comparer. */
function simplifier(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Garde les cartes qui respectent le filtre de rareté, d'effet ET la recherche par nom. */
export function filtrerCartes(cartes: readonly Card[], filtre: FiltreCartes): Card[] {
  const recherche = simplifier(filtre.recherche);
  return cartes.filter(
    (carte) =>
      (filtre.rarete === 'toutes' || carte.rarity === filtre.rarete) &&
      (filtre.effet === undefined ||
        filtre.effet === 'tous' ||
        origineEffet(carte.effect) === filtre.effet) &&
      (recherche === '' || simplifier(carte.name).includes(recherche)),
  );
}

/** Trie par rareté (de la plus fréquente à la plus rare), puis par nom. La liste d'origine est conservée. */
export function trierCartes(cartes: readonly Card[]): Card[] {
  return [...cartes].sort(
    (a, b) =>
      RARITIES.indexOf(a.rarity) - RARITIES.indexOf(b.rarity) ||
      a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }),
  );
}
