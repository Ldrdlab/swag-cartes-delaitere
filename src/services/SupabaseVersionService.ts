/**
 * Version minimum requise lue dans Supabase.
 *
 * Rôle : appeler la fonction SQL `get_min_version()`, accessible sans être connecté.
 * Expose : SupabaseVersionService.
 * Dépend de : @supabase/supabase-js (type), services/VersionService, services/erreurs.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { ErreurService, traduireErreur } from './erreurs';
import type { VersionService } from './VersionService';

/** Service de version minimale basé sur Supabase. */
export class SupabaseVersionService implements VersionService {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async versionMinimale(): Promise<string> {
    const { data, error } = await this.client.rpc('get_min_version');
    if (error) throw traduireErreur(error);
    if (typeof data !== 'string') throw new ErreurService('inconnue');
    return data;
  }
}
