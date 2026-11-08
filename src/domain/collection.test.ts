/**
 * Tests de la logique de la collection du joueur.
 *
 * Rôle : vérifier la progression, les compteurs par rareté, le filtre et le tri.
 * Dépend de : vitest, domain/collection.
 */
import { describe, expect, it } from 'vitest';
import {
  filtrerParRarete,
  progression,
  progressionParRarete,
  trierEntrees,
  type EntreeCollection,
} from './collection';
import type { Rarity } from './types';

const entree = (id: string, rarity: Rarity, quantite: number, name = id): EntreeCollection => ({
  carte: { id, name, rarity },
  quantite,
});

const entrees: EntreeCollection[] = [
  entree('z', 'rare', 0),
  entree('b', 'commune', 2, 'Banane'),
  entree('a', 'commune', 1, 'Abeille'),
  entree('y', 'commune', 0),
  entree('x', 'mythique', 0),
  entree('c', 'commune', 0),
];

describe('progression', () => {
  it('compte les cartes différentes possédées sur le total', () => {
    expect(progression(entrees)).toEqual({ possedees: 2, total: 6 });
  });

  it('ne compte pas les doublons plusieurs fois', () => {
    expect(progression([entree('a', 'commune', 5)])).toEqual({ possedees: 1, total: 1 });
  });

  it('gère une collection vide', () => {
    expect(progression([])).toEqual({ possedees: 0, total: 0 });
  });
});

describe('progressionParRarete', () => {
  it('donne une ligne par rareté, y compris celles sans carte', () => {
    const resultat = progressionParRarete(entrees);
    expect(resultat.commune).toEqual({ possedees: 2, total: 4 });
    expect(resultat.rare).toEqual({ possedees: 0, total: 1 });
    expect(resultat.mythique).toEqual({ possedees: 0, total: 1 });
    expect(resultat.secrete).toEqual({ possedees: 0, total: 0 });
    expect(Object.keys(resultat)).toHaveLength(7);
  });
});

describe('filtrerParRarete', () => {
  it('garde une rareté ou toutes', () => {
    expect(filtrerParRarete(entrees, 'commune')).toHaveLength(4);
    expect(filtrerParRarete(entrees, 'secrete')).toHaveLength(0);
    expect(filtrerParRarete(entrees, 'toutes')).toHaveLength(6);
  });
});

describe('trierEntrees', () => {
  it('classe par rareté, possédées d’abord (par nom), puis non obtenues dans leur ordre d’origine', () => {
    expect(trierEntrees(entrees).map((e) => e.carte.id)).toEqual(['a', 'b', 'y', 'c', 'z', 'x']);
  });

  it('ne modifie pas la liste d’origine', () => {
    const copie = [...entrees];
    trierEntrees(entrees);
    expect(entrees).toEqual(copie);
  });
});
