/**
 * Conversion des données d'administration : profil du compte, réglages du jeu, liste des joueurs.
 *
 * Rôle : traduire les lignes de la base (noms de colonnes en anglais, `snake_case`) en objets de l'appli.
 * Expose : RoleCompte, ProfilCompte, LigneProfil, profilDepuisLigne(), ReglagesAdmin, LigneReglages,
 * reglagesDepuisLigne(), champsDepuisReglages(), JoueurAdmin, LigneJoueur, joueurDepuisLigne().
 * Dépend de : domain/types, domain/reglages. Aucun import React ni DOM.
 */
import type { ReglagesJeu } from './reglages';
import { RARITIES, type Rarity } from './types';

/** Rôle d'un compte. Il ne peut être changé que depuis la base de données. */
export type RoleCompte = 'admin' | 'joueur';

/** Profil du compte connecté. */
export interface ProfilCompte {
  id: string;
  email: string | null;
  pseudo: string | null;
  avatarId: string | null;
  role: RoleCompte;
}

/** Ligne de la table `profiles`. */
export interface LigneProfil {
  id: string;
  email: string | null;
  pseudo: string | null;
  avatar_id: string | null;
  role: string;
}

/** Transforme une ligne `profiles` en profil. Un rôle inconnu est traité comme « joueur » (le plus prudent). */
export function profilDepuisLigne(ligne: LigneProfil): ProfilCompte {
  return {
    id: ligne.id,
    email: ligne.email,
    pseudo: ligne.pseudo,
    avatarId: ligne.avatar_id,
    role: ligne.role === 'admin' ? 'admin' : 'joueur',
  };
}

/** Réglages modifiables par l'admin : réglages du jeu + version minimum requise. */
export interface ReglagesAdmin extends ReglagesJeu {
  /** Version minimale de l'appli autorisée (ex. `0.1.0`). */
  versionMin: string;
}

/** Ligne de la table `app_config`. */
export interface LigneReglages {
  cards_per_booster: number;
  boosters_per_day: number;
  rarity_weights: Partial<Record<string, number>>;
  min_version: string;
}

/** Transforme la ligne `app_config` en réglages. Une rareté absente compte pour 0 %. */
export function reglagesDepuisLigne(ligne: LigneReglages): ReglagesAdmin {
  const probabilites = Object.fromEntries(
    RARITIES.map((rarete) => [rarete, Number(ligne.rarity_weights[rarete] ?? 0)]),
  ) as Record<Rarity, number>;
  return {
    cartesParBooster: ligne.cards_per_booster,
    boostersParJour: ligne.boosters_per_day,
    probabilites,
    versionMin: ligne.min_version,
  };
}

/**
 * Champs de `app_config` à enregistrer. Seuls les réglages fournis sont modifiés : la section « Boosters »
 * n'écrase donc jamais la version minimum, et inversement.
 */
export function champsDepuisReglages(modifs: Partial<ReglagesAdmin>): Partial<LigneReglages> {
  const champs: Partial<LigneReglages> = {};
  if (modifs.cartesParBooster !== undefined) champs.cards_per_booster = modifs.cartesParBooster;
  if (modifs.boostersParJour !== undefined) champs.boosters_per_day = modifs.boostersParJour;
  if (modifs.probabilites !== undefined) champs.rarity_weights = { ...modifs.probabilites };
  if (modifs.versionMin !== undefined) champs.min_version = modifs.versionMin;
  return champs;
}

/** Un joueur vu par l'admin. */
export interface JoueurAdmin {
  id: string;
  email: string | null;
  pseudo: string | null;
  role: RoleCompte;
  /** Date de création du compte (texte ISO). */
  creeLe: string;
  /** Nombre de cartes possédées, doublons compris. */
  nombreCartes: number;
  /** Nombre de cartes différentes possédées. */
  cartesDistinctes: number;
}

/** Ligne renvoyée par la fonction `admin_list_players()`. */
export interface LigneJoueur {
  player_id: string;
  email: string | null;
  pseudo: string | null;
  role: string;
  created_at: string;
  total_cards: number | string;
  distinct_cards: number | string;
}

/** Transforme une ligne de `admin_list_players()` en joueur. */
export function joueurDepuisLigne(ligne: LigneJoueur): JoueurAdmin {
  return {
    id: ligne.player_id,
    email: ligne.email,
    pseudo: ligne.pseudo,
    role: ligne.role === 'admin' ? 'admin' : 'joueur',
    creeLe: ligne.created_at,
    nombreCartes: Number(ligne.total_cards),
    cartesDistinctes: Number(ligne.distinct_cards),
  };
}
