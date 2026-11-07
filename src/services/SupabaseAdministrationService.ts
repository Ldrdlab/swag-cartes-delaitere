/**
 * Administration stockée dans Supabase.
 *
 * Rôle : lire et modifier la ligne unique de `app_config` (réglages du jeu, version minimum) et lister
 * les joueurs grâce à la fonction `admin_list_players()`. Réservé à l'admin : la base refuse les autres.
 * Expose : SupabaseAdministrationService.
 * Dépend de : @supabase/supabase-js (type), domain/administration, services/AdministrationService,
 * services/erreurs.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  champsDepuisReglages,
  joueurDepuisLigne,
  reglagesDepuisLigne,
  type JoueurAdmin,
  type LigneJoueur,
  type LigneReglages,
  type ReglagesAdmin,
} from '../domain/administration';
import type { AdministrationService } from './AdministrationService';
import { ErreurService, traduireErreur } from './erreurs';

/** Colonnes lues dans `app_config`. */
const COLONNES_REGLAGES = 'cards_per_booster, boosters_per_day, rarity_weights, min_version';

/** Service d'administration basé sur Supabase. */
export class SupabaseAdministrationService implements AdministrationService {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async lireReglages(): Promise<ReglagesAdmin> {
    const { data, error } = await this.client
      .from('app_config')
      .select(COLONNES_REGLAGES)
      .eq('id', 1)
      .maybeSingle<LigneReglages>();
    if (error) throw traduireErreur(error);
    // Pas de ligne visible : la base ne montre les réglages qu'à l'admin.
    if (!data) throw new ErreurService('non_autorise');
    return reglagesDepuisLigne(data);
  }

  async enregistrerReglages(modifs: Partial<ReglagesAdmin>): Promise<ReglagesAdmin> {
    const { data, error } = await this.client
      .from('app_config')
      .update(champsDepuisReglages(modifs))
      .eq('id', 1)
      .select(COLONNES_REGLAGES)
      .maybeSingle<LigneReglages>();
    if (error) throw traduireErreur(error);
    if (!data) throw new ErreurService('non_autorise');
    return reglagesDepuisLigne(data);
  }

  async listerJoueurs(): Promise<JoueurAdmin[]> {
    const { data, error } = await this.client.rpc('admin_list_players');
    if (error) throw traduireErreur(error);
    return (data as LigneJoueur[]).map(joueurDepuisLigne);
  }
}
