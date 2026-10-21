/**
 * Implémentation de StorageService dans le navigateur (localStorage).
 *
 * Rôle : sauvegarder le profil en JSON sur l'appareil. Une donnée absente ou corrompue donne `null`.
 * Expose : la classe `LocalStorageService`.
 * Dépend de : services/StorageService, domain/player, config/profile.
 */
import { PLAYER_STORAGE_KEY } from '../config/profile';
import { parsePlayer } from '../domain/player';
import type { Player } from '../domain/types';
import type { StorageService } from './StorageService';

/** Sous-ensemble de l'API Storage réellement utilisé (permet d'injecter un faux dans les tests). */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Stockage du profil dans `localStorage` (ou tout objet compatible). */
export class LocalStorageService implements StorageService {
  /**
   * @param storage - Stockage clé/valeur à utiliser (par défaut `window.localStorage`).
   * @param key - Clé de sauvegarde (par défaut celle de config/profile).
   */
  constructor(
    private readonly storage: KeyValueStorage = window.localStorage,
    private readonly key: string = PLAYER_STORAGE_KEY,
  ) {}

  /** @inheritdoc */
  async loadPlayer(): Promise<Player | null> {
    try {
      const raw = this.storage.getItem(this.key);
      return raw === null ? null : parsePlayer(JSON.parse(raw));
    } catch {
      // Accès au stockage refusé ou JSON corrompu : on repart sans profil.
      return null;
    }
  }

  /** @inheritdoc */
  async savePlayer(player: Player): Promise<void> {
    this.storage.setItem(this.key, JSON.stringify(player));
  }

  /** @inheritdoc */
  async clearPlayer(): Promise<void> {
    this.storage.removeItem(this.key);
  }
}
