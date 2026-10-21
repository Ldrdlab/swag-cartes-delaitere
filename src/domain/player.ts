/**
 * Lecture sûre d'un profil joueur.
 *
 * Rôle : vérifier qu'une donnée inconnue (ex. JSON relu depuis le stockage) est bien un Player.
 * Expose : parsePlayer().
 * Dépend de : domain/types. Aucun import React ni DOM.
 */
import type { Player } from './types';

/**
 * Transforme une valeur inconnue en Player, ou renvoie `null` si elle est invalide.
 *
 * @param value - Valeur à contrôler (typiquement le résultat de JSON.parse).
 * @returns Le joueur reconnu, ou `null`.
 */
export function parsePlayer(value: unknown): Player | null {
  if (typeof value !== 'object' || value === null) return null;
  const { id, pseudo, iconId } = value as Record<string, unknown>;
  if (typeof id !== 'string' || id === '') return null;
  if (typeof pseudo !== 'string' || pseudo === '') return null;
  if (iconId !== undefined && typeof iconId !== 'string') return null;
  return iconId === undefined ? { id, pseudo } : { id, pseudo, iconId };
}
