/**
 * Connexion des joueurs avec Supabase Auth.
 *
 * Rôle : ouvrir / fermer la session (e-mail + mot de passe), suivre son état et lire le profil du compte
 * connecté (table `profiles`, dont le rôle). La session reste ouverte sur l'appareil et se renouvelle
 * toute seule. Gère aussi les liens reçus par e-mail : un joueur invité (ou qui a demandé une
 * réinitialisation) arrive déjà connecté et doit choisir son mot de passe avant d'entrer.
 * Le rôle lu ici ne sert qu'à AFFICHER ou non l'espace admin : c'est la base qui refuse les actions
 * d'admin à un joueur.
 * Expose : SupabaseAuthService.
 * Dépend de : @supabase/supabase-js, domain/administration, services/AuthService, services/lienAuth.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { profilDepuisLigne, type LigneProfil } from '../domain/administration';
import { ErreurAuth, type AuthService, type EtatAuth, type ErreurConnexion } from './AuthService';
import type { LienAuth } from './lienAuth';

/** Traduit une erreur Supabase en `ErreurAuth`. */
function traduire(erreur: { status?: number; code?: string; message: string }): ErreurAuth {
  let code: ErreurConnexion = 'inconnue';
  if (
    erreur.status === 429 ||
    erreur.code === 'over_request_rate_limit' ||
    erreur.code === 'over_email_send_rate_limit'
  ) {
    code = 'trop_de_tentatives';
  } else if (erreur.code === 'weak_password') code = 'mot_de_passe_faible';
  else if (erreur.code === 'same_password') code = 'meme_mot_de_passe';
  else if (erreur.code === 'invalid_credentials' || erreur.status === 400) code = 'identifiants';
  else if (/failed to fetch|network|load failed/i.test(erreur.message)) code = 'reseau';
  return new ErreurAuth(code, erreur.message);
}

/** Service de connexion basé sur Supabase. */
export class SupabaseAuthService implements AuthService {
  private readonly client: SupabaseClient;
  private readonly lien: LienAuth;
  private readonly redirection: string;
  private readonly rappels = new Set<(etat: EtatAuth) => void>();
  private etat: EtatAuth = { statut: 'chargement' };
  private utilisateurId: string | null = null;
  private motDePasseADefinir: boolean;
  private demarre = false;

  /**
   * @param client - Client Supabase.
   * @param lien - Ce que dit l'adresse d'ouverture de l'appli (lien d'invitation, périmé…).
   * @param redirection - Adresse de l'appli, où mène le lien de l'e-mail de réinitialisation.
   */
  constructor(client: SupabaseClient, lien: LienAuth, redirection: string) {
    this.client = client;
    this.lien = lien;
    this.redirection = redirection;
    this.motDePasseADefinir = lien.type !== null;
  }

  /** Change l'état et prévient tous les observateurs. */
  private publier(etat: EtatAuth): void {
    this.etat = etat;
    this.rappels.forEach((rappel) => rappel(etat));
  }

  /** Lit le profil du compte et publie l'état « connecté » (ou « mot de passe à choisir », ou « erreur »). */
  private async chargerProfil(id: string): Promise<void> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, email, pseudo, avatar_id, role')
      .eq('id', id)
      .maybeSingle<LigneProfil>();
    // Si la session a changé pendant la lecture, ce résultat est périmé.
    if (this.utilisateurId !== id) return;
    if (error || !data) {
      this.publier({ statut: 'erreur' });
      return;
    }
    const profil = profilDepuisLigne(data);
    this.publier(
      this.motDePasseADefinir ? { statut: 'mot_de_passe', profil } : { statut: 'connecte', profil },
    );
  }

  /** Branche le suivi de la session (une seule fois, au premier observateur). */
  private demarrer(): void {
    if (this.demarre) return;
    this.demarre = true;
    this.client.auth.onAuthStateChange((evenement, session) => {
      if (!session) {
        this.utilisateurId = null;
        this.publier(
          this.lien.expire ? { statut: 'deconnecte', lienExpire: true } : { statut: 'deconnecte' },
        );
        return;
      }
      // Un simple renouvellement du jeton ne change rien pour l'utilisateur.
      if (evenement === 'TOKEN_REFRESHED' && this.utilisateurId === session.user.id) return;
      this.utilisateurId = session.user.id;
      // Joueur invité qui n'a pas encore choisi de mot de passe, ou lien de réinitialisation.
      const invite =
        Boolean(session.user.invited_at) &&
        session.user.user_metadata?.mot_de_passe_defini !== true;
      if (evenement === 'PASSWORD_RECOVERY' || invite) this.motDePasseADefinir = true;
      // Pas d'appel Supabase directement dans ce rappel (risque de blocage) : on le décale.
      setTimeout(() => void this.chargerProfil(session.user.id), 0);
    });
  }

  observer(rappel: (etat: EtatAuth) => void): () => void {
    this.rappels.add(rappel);
    rappel(this.etat);
    this.demarrer();
    return () => {
      this.rappels.delete(rappel);
    };
  }

  async seConnecter(email: string, motDePasse: string): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({ email, password: motDePasse });
    if (error) throw traduire(error);
  }

  async seDeconnecter(): Promise<void> {
    this.motDePasseADefinir = false;
    await this.client.auth.signOut();
  }

  async definirMotDePasse(motDePasse: string): Promise<void> {
    // On note dans le compte que le mot de passe est choisi : l'invitation ne le redemandera plus.
    const { error } = await this.client.auth.updateUser({
      password: motDePasse,
      data: { mot_de_passe_defini: true },
    });
    if (error) throw traduire(error);
    this.motDePasseADefinir = false;
    await this.rafraichir();
  }

  async envoyerLienReinitialisation(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: this.redirection,
    });
    if (error) throw traduire(error);
  }

  async rafraichir(): Promise<void> {
    if (this.utilisateurId) await this.chargerProfil(this.utilisateurId);
  }

  recharger(): void {
    if (this.utilisateurId) {
      this.publier({ statut: 'chargement' });
      void this.chargerProfil(this.utilisateurId);
    }
  }
}
