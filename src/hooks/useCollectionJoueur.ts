/**
 * Collection du joueur connecté.
 *
 * Rôle : charger toutes les cartes du jeu avec la quantité possédée (0 = pas encore obtenue). Les images
 * ne sont fournies que pour les cartes possédées (voir services/SupabaseCollectionService).
 * Expose : useCollectionJoueur().
 * Dépend de : react, hooks/useCollectionService, hooks/useChargement.
 */
import { useCallback } from 'react';
import { useChargement } from './useChargement';
import { useCollectionService } from './useCollectionService';

/** Charge la collection du joueur ; `recharger` relance la lecture. */
export function useCollectionJoueur() {
  const service = useCollectionService();
  const lire = useCallback(() => service.lireCollectionJoueur(), [service]);
  return useChargement(lire);
}
