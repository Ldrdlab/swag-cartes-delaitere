/**
 * Contrat de la connexion des joueurs.
 *
 * Rôle : abstraire la connexion (e-mail + mot de passe). Aujourd'hui : Supabase Auth. Il n'y a PAS
 * d'inscription dans l'appli : les comptes sont créés par l'admin depuis Supabase.
 * Expose : EtatAuth, ErreurConnexion, ErreurAuth, l'interface `AuthService`.
 * Dépend de : domain/administration (type ProfilCompte).
 */
import type { ProfilCompte } from '../domain/administration';

/** Situation de la session. */
export type EtatAuth =
  | { statut: 'chargement' }
  | { statut: 'deconnecte' }
  | { statut: 'connecte'; profil: ProfilCompte }
  // Connecté, mais impossible de lire le profil (réseau coupé, profil absent…).
  | { statut: 'erreur' };

/** Raisons possibles d'un échec de connexion. */
export type ErreurConnexion = 'identifiants' | 'trop_de_tentatives' | 'reseau' | 'inconnue';

/** Échec de connexion. */
export class ErreurAuth extends Error {
  readonly code: ErreurConnexion;

  constructor(code: ErreurConnexion, message: string = code) {
    super(message);
    this.code = code;
  }
}

/** Service de connexion. */
export interface AuthService {
  /**
   * Suit la session : le rappel est appelé tout de suite avec la situation actuelle, puis à chaque
   * changement (connexion, déconnexion, session expirée).
   *
   * @returns Une fonction qui arrête le suivi.
   */
  observer(rappel: (etat: EtatAuth) => void): () => void;
  /** Ouvre une session. @throws ErreurAuth. */
  seConnecter(email: string, motDePasse: string): Promise<void>;
  /** Ferme la session. */
  seDeconnecter(): Promise<void>;
  /** Relit le profil (bouton « Réessayer » après une erreur). */
  recharger(): void;
  /** Relit le profil sans repasser par « Chargement… » (après un changement de pseudo, par exemple). */
  rafraichir(): Promise<void>;
}
