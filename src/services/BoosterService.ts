/**
 * Contrat d'accès aux boosters du joueur.
 *
 * Rôle : lire combien de boosters il reste à ouvrir aujourd'hui, et ouvrir un booster. Le TIRAGE se fait
 * côté serveur (fonction SQL `open_booster()`) : l'appli ne choisit jamais les cartes elle-même.
 * Expose : l'interface `BoosterService`.
 * Dépend de : domain/ouverture (types).
 * Les erreurs sont des `ErreurService` (services/erreurs.ts), notamment `limite_atteinte`.
 */
import type { ResultatOuverture, StatutBoosters } from '../domain/ouverture';

/** Service des boosters. */
export interface BoosterService {
  /** Boosters du jour : autorisés, ouverts, restants, temps avant la remise à zéro. */
  statut(): Promise<StatutBoosters>;
  /**
   * Ouvre un booster pour le joueur connecté.
   *
   * @param boosterId - Thème de booster choisi (purement esthétique, gardé dans l'historique).
   * @throws ErreurService `limite_atteinte` si tous les boosters du jour sont ouverts.
   */
  ouvrir(boosterId: string): Promise<ResultatOuverture>;
}
