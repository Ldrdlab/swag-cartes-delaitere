/**
 * Boosters du joueur via Supabase.
 *
 * Rôle : appeler les fonctions SQL `get_booster_status()` et `open_booster()` (le tirage et la limite
 * quotidienne sont décidés par la base), puis demander les adresses signées des images des cartes tirées.
 * Expose : SupabaseBoosterService.
 * Dépend de : @supabase/supabase-js (type), config/supabase, domain/ouverture, services/BoosterService,
 * services/erreurs.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { STOCKAGE_SUPABASE } from '../config/supabase';
import {
  cheminsOuverture,
  ouvertureDepuisJson,
  statutDepuisLigne,
  type LigneStatut,
  type OuvertureBrute,
  type ResultatOuverture,
  type StatutBoosters,
} from '../domain/ouverture';
import type { BoosterService } from './BoosterService';
import { traduireErreur } from './erreurs';

/** Service des boosters basé sur Supabase. */
export class SupabaseBoosterService implements BoosterService {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async statut(): Promise<StatutBoosters> {
    const { data, error } = await this.client.rpc('get_booster_status');
    if (error) throw traduireErreur(error);
    return statutDepuisLigne(data as LigneStatut);
  }

  async ouvrir(boosterId: string): Promise<ResultatOuverture> {
    const { data, error } = await this.client.rpc('open_booster', { p_booster: boosterId });
    if (error) throw traduireErreur(error);
    const brut = data as OuvertureBrute;

    const adresses = new Map<string, string>();
    const chemins = cheminsOuverture(brut);
    if (chemins.length > 0) {
      const signees = await this.client.storage
        .from(STOCKAGE_SUPABASE.bucketCartes)
        .createSignedUrls(chemins, STOCKAGE_SUPABASE.dureeAdresseSigneeS);
      // Si les images ne peuvent pas être signées, les cartes s'affichent avec leur nom (repli de <Carte />) :
      // le booster, lui, est bien ouvert et enregistré, on ne le perd pas.
      if (!signees.error) {
        for (const entree of signees.data) {
          if (entree.signedUrl && entree.path) adresses.set(entree.path, entree.signedUrl);
        }
      }
    }
    return ouvertureDepuisJson(brut, adresses);
  }
}
