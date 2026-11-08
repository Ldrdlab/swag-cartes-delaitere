/**
 * Logique pure de la collection du joueur.
 *
 * Rôle : calculer la progression (X / Y cartes), les compteurs par rareté, filtrer par rareté et trier.
 * Une « entrée » est une carte du jeu avec la quantité possédée par le joueur (0 = pas encore obtenue,
 * affichée comme un emplacement vide grisé).
 * Expose : EntreeCollection, Progression, progression(), progressionParRarete(), filtrerParRarete(),
 * trierEntrees().
 * Dépend de : domain/types. Aucun import React ni DOM.
 */
import { RARITIES, type Card, type Rarity } from './types';

/** Une carte du jeu et la quantité possédée. */
export interface EntreeCollection {
  carte: Card;
  /** Nombre d'exemplaires possédés (0 = jamais obtenue). */
  quantite: number;
}

/** Cartes possédées / cartes du jeu. */
export interface Progression {
  possedees: number;
  total: number;
}

/** Nombre de cartes DIFFÉRENTES possédées sur le total (les doublons ne comptent qu'une fois). */
export function progression(entrees: readonly EntreeCollection[]): Progression {
  return {
    possedees: entrees.filter((entree) => entree.quantite > 0).length,
    total: entrees.length,
  };
}

/** Progression de chaque rareté, y compris celles qui n'ont aucune carte (0 / 0). */
export function progressionParRarete(
  entrees: readonly EntreeCollection[],
): Record<Rarity, Progression> {
  const resultat = Object.fromEntries(
    RARITIES.map((rarete) => [rarete, { possedees: 0, total: 0 }]),
  ) as Record<Rarity, Progression>;
  for (const entree of entrees) {
    const ligne = resultat[entree.carte.rarity];
    ligne.total += 1;
    if (entree.quantite > 0) ligne.possedees += 1;
  }
  return resultat;
}

/** Garde les cartes d'une rareté (ou toutes avec `'toutes'`). */
export function filtrerParRarete(
  entrees: readonly EntreeCollection[],
  rarete: Rarity | 'toutes',
): EntreeCollection[] {
  return rarete === 'toutes' ? [...entrees] : entrees.filter((e) => e.carte.rarity === rarete);
}

/**
 * Trie par rareté (de la plus fréquente à la plus rare). Dans une même rareté, les cartes possédées
 * viennent d'abord, classées par nom ; les cartes non obtenues suivent, dans l'ordre où la base les
 * donne (on ne les classe pas par nom : cela dévoilerait des indices sur des cartes encore cachées).
 * La liste d'origine est conservée.
 */
export function trierEntrees(entrees: readonly EntreeCollection[]): EntreeCollection[] {
  const rang = (entree: EntreeCollection) => RARITIES.indexOf(entree.carte.rarity);
  const indexes = new Map(entrees.map((entree, index) => [entree, index]));
  return [...entrees].sort((a, b) => {
    if (rang(a) !== rang(b)) return rang(a) - rang(b);
    const aPossedee = a.quantite > 0;
    const bPossedee = b.quantite > 0;
    if (aPossedee !== bPossedee) return aPossedee ? -1 : 1;
    if (aPossedee) return a.carte.name.localeCompare(b.carte.name, 'fr', { sensitivity: 'base' });
    return (indexes.get(a) ?? 0) - (indexes.get(b) ?? 0);
  });
}
