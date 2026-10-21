/**
 * Contrat de sauvegarde des données du joueur.
 *
 * Rôle : abstraire l'endroit où le profil est stocké (navigateur aujourd'hui, backend partagé entre
 * amis demain). Les écrans ne dépendent que de cette interface.
 * Expose : l'interface `StorageService`.
 * Dépend de : domain/types. Toutes les méthodes sont asynchrones pour permettre un futur appel réseau.
 */
import type { Player } from '../domain/types';

/** Service de persistance du profil. */
export interface StorageService {
  /** Relit le profil sauvegardé, ou `null` s'il n'y en a pas (ou s'il est illisible). */
  loadPlayer(): Promise<Player | null>;
  /** Sauvegarde (crée ou remplace) le profil. */
  savePlayer(player: Player): Promise<void>;
  /** Supprime le profil sauvegardé. */
  clearPlayer(): Promise<void>;
}
