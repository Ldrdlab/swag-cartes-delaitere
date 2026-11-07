/**
 * Réglages du jeu modifiables par l'administrateur : valeurs par défaut et limites.
 *
 * Rôle : centraliser les valeurs proposées par défaut (nombre de cartes par booster, boosters par jour,
 * probabilité de chaque rareté) et les bornes acceptées. Les mêmes bornes sont imposées par la base
 * (supabase/migrations/…000100_schema.sql) : si tu les changes ici, change-les aussi là-bas.
 * Expose : LIMITES_REGLAGES, REGLAGES_PAR_DEFAUT.
 * Dépend de : domain/types (type), domain/reglages (type).
 *
 * ┌─ COMMENT MODIFIER (pour débutant) ────────────────────────────────────────────────┐
 * │ Changer les valeurs proposées par le bouton « Valeurs par défaut » : modifie       │
 * │ REGLAGES_PAR_DEFAUT. Le total des probabilités doit faire exactement 100.          │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */
import type { ReglagesJeu } from '../domain/reglages';

/** Bornes acceptées pour les réglages. */
export const LIMITES_REGLAGES = {
  cartesParBooster: { min: 1, max: 10 },
  boostersParJour: { min: 1, max: 100 },
  /** Nombre maximal de décimales d'une probabilité (ex. 0.6 ou 0.25). */
  decimalesProbabilite: 2,
  /** Total que les probabilités doivent atteindre (en %). */
  totalProbabilites: 100,
} as const;

/** Valeurs proposées par défaut (celles de la base à sa création). */
export const REGLAGES_PAR_DEFAUT: ReglagesJeu = {
  cartesParBooster: 5,
  boostersParJour: 3,
  probabilites: {
    commune: 60,
    peu_commune: 25,
    rare: 10,
    super_rare: 3,
    legendaire: 1,
    mythique: 0.6,
    secrete: 0.4,
  },
};
