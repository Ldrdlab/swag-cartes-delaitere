/**
 * Cartes factices (placeholders).
 *
 * Rôle : fournir des cartes de test couvrant toutes les raretés. À remplacer plus tard par un fichier
 * JSON exporté depuis un outil de création de cartes (voir domain/cardImport).
 * Expose : CARDS.
 * Dépend de : domain/types. Pour ajouter une carte, l'ajouter ici puis l'inscrire dans src/boosters/catalogue.ts.
 */
import type { Card } from '../domain/types';

export const CARDS: readonly Card[] = [
  { id: 'card-01', name: 'Carte 01', rarity: 'commune' },
  { id: 'card-02', name: 'Carte 02', rarity: 'commune' },
  { id: 'card-03', name: 'Carte 03', rarity: 'commune' },
  { id: 'card-04', name: 'Carte 04', rarity: 'commune' },
  { id: 'card-05', name: 'Carte 05', rarity: 'peu_commune' },
  { id: 'card-06', name: 'Carte 06', rarity: 'peu_commune' },
  { id: 'card-07', name: 'Carte 07', rarity: 'peu_commune' },
  { id: 'card-08', name: 'Carte 08', rarity: 'rare' },
  { id: 'card-09', name: 'Carte 09', rarity: 'rare' },
  { id: 'card-10', name: 'Carte 10', rarity: 'rare' },
  { id: 'card-11', name: 'Carte 11', rarity: 'ultra_rare' },
  { id: 'card-12', name: 'Carte 12', rarity: 'ultra_rare' },
  { id: 'card-13', name: 'Carte 13', rarity: 'legendaire' },
];
