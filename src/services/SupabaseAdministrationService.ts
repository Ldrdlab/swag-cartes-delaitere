/**
 * Administration stockée dans Supabase.
 *
 * Rôle : lire et modifier la ligne unique de `app_config` (réglages du jeu, version minimum), lister
 * les joueurs grâce à la fonction `admin_list_players()` et gérer l'effet par défaut de chaque rareté
 * (table `rarity_effects`). Réservé à l'admin : la base refuse les autres.
 * Expose : SupabaseAdministrationService.
 * Dépend de : @supabase/supabase-js (type), domain/administration, domain/effetsCartes, services/AdministrationService,
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
import {
  paramsVersJson,
  regleDepuisLigne,
  type LigneRegleEffet,
  type RegleEffet,
} from '../domain/effetsCartes';
import type { AdministrationService } from './AdministrationService';
import { ErreurService, traduireErreur } from './erreurs';

/** Colonnes lues dans `app_config`. */
const COLONNES_REGLAGES = 'cards_per_booster, boosters_per_day, rarity_weights, min_version';

/** Colonnes lues dans `rarity_effects`. */
const COLONNES_EFFETS = 'rarity, variant, effect, params';

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

  async lireEffetsRaretes(): Promise<RegleEffet[]> {
    const { data, error } = await this.client
      .from('rarity_effects')
      .select(COLONNES_EFFETS)
      .order('id', { ascending: true })
      .overrideTypes<LigneRegleEffet[]>();
    if (error) throw traduireErreur(error);
    return data.map(regleDepuisLigne);
  }

  async enregistrerEffetRarete(regle: RegleEffet): Promise<RegleEffet> {
    const requete = this.client
      .from('rarity_effects')
      .update({ effect: regle.cle, params: paramsVersJson(regle.params) })
      .eq('rarity', regle.rarete);
    const { data, error } = await (
      regle.variante ? requete.eq('variant', regle.variante) : requete.is('variant', null)
    )
      .select(COLONNES_EFFETS)
      .maybeSingle<LigneRegleEffet>();
    if (error) throw traduireErreur(error);
    // Aucune ligne modifiée : la base ne l'a pas autorisé (ou la règle n'existe pas).
    if (!data) throw new ErreurService('non_autorise');
    return regleDepuisLigne(data);
  }
}
