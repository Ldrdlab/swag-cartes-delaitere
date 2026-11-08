/**
 * Profil du joueur (pseudo et avatar) stocké dans Supabase.
 *
 * Rôle : implémentation de `StorageService` qui lit et enregistre le pseudo et l'avatar dans la table
 * `profiles` du compte connecté. L'écran Profil fonctionne donc comme avant, mais le profil suit le
 * joueur sur tous ses appareils. Deux joueurs ne peuvent pas avoir le même pseudo (la base refuse).
 * Expose : SupabaseStorageService.
 * Dépend de : @supabase/supabase-js (type), domain/types (type), services/StorageService,
 * services/erreurs.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Player } from '../domain/types';
import { ErreurService, traduireErreur } from './erreurs';
import type { StorageService } from './StorageService';

/** Service de profil basé sur Supabase. */
export class SupabaseStorageService implements StorageService {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** Identifiant du compte connecté. */
  private async utilisateur(): Promise<string> {
    const { data } = await this.client.auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new ErreurService('non_connecte');
    return id;
  }

  async loadPlayer(): Promise<Player | null> {
    const id = await this.utilisateur();
    const { data, error } = await this.client
      .from('profiles')
      .select('pseudo, avatar_id')
      .eq('id', id)
      .maybeSingle<{ pseudo: string | null; avatar_id: string | null }>();
    // Pas encore de pseudo : le joueur doit d'abord en choisir un.
    if (error || !data?.pseudo) return null;
    return data.avatar_id
      ? { id, pseudo: data.pseudo, iconId: data.avatar_id }
      : { id, pseudo: data.pseudo };
  }

  async savePlayer(player: Player): Promise<void> {
    const id = await this.utilisateur();
    const { error } = await this.client
      .from('profiles')
      .update({ pseudo: player.pseudo, avatar_id: player.iconId ?? null })
      .eq('id', id);
    if (error) throw traduireErreur(error);
  }

  async clearPlayer(): Promise<void> {
    const id = await this.utilisateur();
    const { error } = await this.client
      .from('profiles')
      .update({ pseudo: null, avatar_id: null })
      .eq('id', id);
    if (error) throw traduireErreur(error);
  }
}
