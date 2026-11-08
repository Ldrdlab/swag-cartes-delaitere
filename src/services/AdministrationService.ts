/**
 * Contrat d'accès aux fonctions d'administration (réglages du jeu, liste des joueurs, effets par rareté).
 *
 * Rôle : abstraire d'où viennent les réglages et la liste des joueurs. Aujourd'hui : Supabase. Les droits
 * sont vérifiés par la BASE : un joueur qui appelle ces fonctions à la main est refusé.
 * Expose : l'interface `AdministrationService`.
 * Dépend de : domain/administration (types).
 * Les erreurs sont des `ErreurService` (services/erreurs.ts).
 */
import type { JoueurAdmin, ReglagesAdmin } from '../domain/administration';
import type { RegleEffet } from '../domain/effetsCartes';

/** Service d'administration. */
export interface AdministrationService {
  /** Lit les réglages du jeu et la version minimum requise. */
  lireReglages(): Promise<ReglagesAdmin>;
  /** Enregistre les réglages fournis (les autres ne changent pas) et renvoie ce que la base a retenu. */
  enregistrerReglages(modifs: Partial<ReglagesAdmin>): Promise<ReglagesAdmin>;
  /** Liste les joueurs avec leur nombre de cartes (lecture seule). */
  listerJoueurs(): Promise<JoueurAdmin[]>;
  /** Lit l'effet par défaut de chaque rareté (et variante), avec ses réglages. */
  lireEffetsRaretes(): Promise<RegleEffet[]>;
  /** Change l'effet et les réglages d'une rareté (et variante) ; renvoie ce que la base a retenu. */
  enregistrerEffetRarete(regle: RegleEffet): Promise<RegleEffet>;
}
