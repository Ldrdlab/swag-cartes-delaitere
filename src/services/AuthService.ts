/**
 * Contrat de la connexion des joueurs.
 *
 * Rôle : abstraire la connexion (e-mail + mot de passe). Aujourd'hui : Supabase Auth. Il n'y a PAS
 * d'inscription libre dans l'appli : les comptes sont créés par l'admin (invitation par e-mail ou création
 * dans Supabase). Un joueur invité choisit son mot de passe à sa première visite ; un joueur qui l'a oublié
 * peut demander un lien de réinitialisation.
 * Expose : EtatAuth, ErreurConnexion, ErreurAuth, l'interface `AuthService`.
 * Dépend de : domain/administration (type ProfilCompte).
 */
import type { ProfilCompte } from '../domain/administration';

/** Situation de la session. */
export type EtatAuth =
  | { statut: 'chargement' }
  // `lienExpire` : le joueur vient de cliquer sur un lien d'e-mail périmé ou déjà utilisé.
  | { statut: 'deconnecte'; lienExpire?: boolean }
  | { statut: 'connecte'; profil: ProfilCompte }
  // Connecté par un lien d'invitation ou de réinitialisation : il doit d'abord choisir son mot de passe.
  | { statut: 'mot_de_passe'; profil: ProfilCompte }
  // Connecté, mais impossible de lire le profil (réseau coupé, profil absent…).
  | { statut: 'erreur' };

/** Raisons possibles d'un échec (connexion, choix du mot de passe, demande de lien). */
export type ErreurConnexion =
  | 'identifiants'
  | 'trop_de_tentatives'
  | 'mot_de_passe_faible'
  | 'meme_mot_de_passe'
  | 'reseau'
  | 'inconnue';

/** Échec d'une opération de connexion. */
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
  /** Enregistre le mot de passe choisi (après un lien d'invitation ou de réinitialisation). @throws ErreurAuth. */
  definirMotDePasse(motDePasse: string): Promise<void>;
  /**
   * Envoie un e-mail avec un lien pour choisir un nouveau mot de passe. Ne révèle jamais si l'adresse
   * correspond à un compte. @throws ErreurAuth.
   */
  envoyerLienReinitialisation(email: string): Promise<void>;
  /** Relit le profil (bouton « Réessayer » après une erreur). */
  recharger(): void;
  /** Relit le profil sans repasser par « Chargement… » (après un changement de pseudo, par exemple). */
  rafraichir(): Promise<void>;
}
