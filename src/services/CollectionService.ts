/**
 * Contrat d'accès à la collection de cartes.
 *
 * Rôle : abstraire où les cartes sont lues et enregistrées. Aujourd'hui : fichiers du projet
 * (`public/cartes/`) écrits par le serveur de développement ; demain, on pourra brancher un vrai
 * backend sans toucher aux écrans.
 * Expose : CodeErreurCollection, ErreurCollection, StatutAdministration, NouvelleCarteDonnees,
 * l'interface `CollectionService`.
 * Dépend de : domain/cartes (type InfosCarte), domain/types (type Card).
 */
import type { InfosCarte } from '../domain/cartes';
import type { Card } from '../domain/types';

/** Raisons possibles d'un échec (chacune a un message dans content/textes.ts). */
export type CodeErreurCollection =
  | 'code_incorrect'
  | 'code_non_defini'
  | 'infos_invalides'
  | 'image_invalide'
  | 'trop_gros'
  | 'introuvable'
  | 'reseau'
  | 'inconnue';

/** Échec d'une opération sur la collection. */
export class ErreurCollection extends Error {
  readonly code: CodeErreurCollection;

  constructor(code: CodeErreurCollection, message: string = code) {
    super(message);
    this.code = code;
  }
}

/** Disponibilité de l'administration (ajout, modification, suppression). */
export interface StatutAdministration {
  /** `true` seulement avec `npm run dev` (jamais sur le site publié). */
  disponible: boolean;
  /** `true` si un code admin est défini dans `.env.local`. */
  codeDefini: boolean;
}

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
  /** Lit toutes les cartes (adresses d'images prêtes à l'emploi). */
  lireCartes(): Promise<Card[]>;
  /** Dit si l'administration est possible dans cette version de l'appli. */
  statutAdministration(): Promise<StatutAdministration>;
  /** Vérifie le code admin. @throws ErreurCollection si le code est faux ou non défini. */
  verifierCode(code: string): Promise<void>;
  /** Ajoute une carte (le code est revérifié côté serveur à chaque écriture). */
  ajouterCarte(code: string, donnees: NouvelleCarteDonnees): Promise<Card>;
  /** Modifie le nom, la rareté et la variante d'une carte. */
  modifierCarte(code: string, id: string, infos: InfosCarte): Promise<Card>;
  /** Supprime une carte et ses images. */
  supprimerCarte(code: string, id: string): Promise<void>;
}
