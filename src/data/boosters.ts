/**
 * Boosters factices (placeholders).
 *
 * Rôle : définir les boosters proposés (nom, couleur provisoire, cartes possibles).
 * Expose : BOOSTERS.
 * Dépend de : domain/types, data/cards (les identifiants de cartes doivent exister).
 * Pour ajouter, retirer ou renommer un booster, modifier ce fichier.
 */
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
