/**
 * Contrat d'accès à la collection de cartes.
 *
 * Rôle : abstraire où les cartes sont lues et enregistrées. Aujourd'hui : Supabase (base de données +
 * stockage privé des images). Les droits (qui peut ajouter, modifier, supprimer) sont vérifiés par la
 * BASE, pas par l'appli : un joueur qui appelle ces fonctions à la main est refusé.
 * Expose : NouvelleCarteDonnees, l'interface `CollectionService`.
 * Dépend de : domain/cartes (type InfosCarte), domain/collection (type), domain/types (type Card).
 * Les erreurs sont des `ErreurService` (services/erreurs.ts).
 */
import type { InfosCarte } from '../domain/cartes';
import type { EntreeCollection } from '../domain/collection';
import type { RegleEffet } from '../domain/effetsCartes';
import type { Card } from '../domain/types';

/** Une carte à ajouter : ses infos et ses images déjà optimisées. */
export interface NouvelleCarteDonnees {
  infos: InfosCarte;
  /** Dimensions de l'image enregistrée (px). */
  largeur: number;
  hauteur: number;
  image: Blob;
  miniature: Blob;
}

/** Service de lecture et d'écriture de la collection. */
export interface CollectionService {
  /** Lit les cartes visibles par l'utilisateur connecté (adresses d'images signées, prêtes à l'emploi). */
  lireCartes(): Promise<Card[]>;
  /**
   * Lit la collection du joueur connecté : toutes les cartes du jeu avec la quantité possédée (0 = pas
   * encore obtenue). Les images ne sont fournies QUE pour les cartes possédées.
   */
  lireCollectionJoueur(): Promise<EntreeCollection[]>;
  /** Ajoute une carte (admin seulement). */
  ajouterCarte(donnees: NouvelleCarteDonnees): Promise<Card>;
  /** Modifie le nom, la rareté, la variante, l'effet et l'activation d'une carte (admin seulement). */
  modifierCarte(id: string, infos: InfosCarte): Promise<Card>;
  /** Supprime une carte et ses images (admin seulement ; refusé si un joueur la possède). */
  supprimerCarte(id: string): Promise<void>;
  /** Lit l'effet par défaut de chaque rareté (et variante), pour tout joueur connecté. */
  lireEffetsParDefaut(): Promise<RegleEffet[]>;
}
