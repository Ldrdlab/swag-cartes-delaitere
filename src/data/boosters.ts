/**
 * Boosters factices (placeholders).
 *
 * Rôle : définir les boosters proposés (nom, couleur provisoire, cartes possibles).
 * Expose : BOOSTERS, getBoosterAt().
 * Dépend de : domain/types, domain/carousel, data/cards (les identifiants de cartes doivent exister).
 * Pour ajouter, retirer ou renommer un booster, modifier ce fichier.
 */
import { wrapIndex } from '../domain/carousel';
import type { Booster } from '../domain/types';

export const BOOSTERS: readonly Booster[] = [
  {
    id: 'booster-aurore',
    name: 'Booster Aurore',
    color: '#e07a5f',
    cardIds: [
      'card-01',
      'card-02',
      'card-03',
      'card-05',
      'card-06',
      'card-08',
      'card-09',
      'card-11',
    ],
  },
  {
    id: 'booster-orage',
    name: 'Booster Orage',
    color: '#3d5a80',
    cardIds: [
      'card-02',
      'card-03',
      'card-04',
      'card-05',
      'card-07',
      'card-08',
      'card-10',
      'card-12',
    ],
  },
  {
    id: 'booster-foret',
    name: 'Booster Forêt',
    color: '#4a7c59',
    cardIds: [
      'card-01',
      'card-02',
      'card-04',
      'card-06',
      'card-07',
      'card-09',
      'card-10',
      'card-12',
    ],
  },
];

/**
 * Renvoie le booster à une position donnée de la liste (la position est ramenée dans la liste).
 *
 * @param index - Position du booster (ex. `selectedBoosterIndex` de la machine à états).
 * @returns Le booster correspondant.
 * @throws Si la liste BOOSTERS est vide (erreur de configuration).
 */
export function getBoosterAt(index: number): Booster {
  const booster = BOOSTERS[wrapIndex(index, BOOSTERS.length)];
  if (!booster) {
    throw new Error('Aucun booster défini dans data/boosters.ts');
  }
  return booster;
}
