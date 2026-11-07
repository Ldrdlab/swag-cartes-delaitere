/**
 * Connexion des joueurs avec Supabase Auth.
 *
 * Rôle : ouvrir / fermer la session (e-mail + mot de passe), suivre son état et lire le profil du compte
 * connecté (table `profiles`, dont le rôle). La session reste ouverte sur l'appareil et se renouvelle
 * toute seule. Le rôle lu ici ne sert qu'à AFFICHER ou non l'espace admin : c'est la base qui refuse les
 * actions d'admin à un joueur.
 * Expose : SupabaseAuthService.
 * Dépend de : @supabase/supabase-js, domain/administration, services/AuthService.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { profilDepuisLigne, type LigneProfil } from '../domain/administration';
import { ErreurAuth, type AuthService, type EtatAuth } from './AuthService';

/** Service de connexion basé sur Supabase. */
export class SupabaseAuthService implements AuthService {
  private readonly client: SupabaseClient;
  private readonly rappels = new Set<(etat: EtatAuth) => void>();
  private etat: EtatAuth = { statut: 'chargement' };
  private utilisateurId: string | null = null;
  private demarre = false;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /** Change l'état et prévient tous les observateurs. */
  private publier(etat: EtatAuth): void {
    this.etat = etat;
    this.rappels.forEach((rappel) => rappel(etat));
  }

  /** Lit le profil du compte et publie l'état « connecté » (ou « erreur »). */
  private async chargerProfil(id: string): Promise<void> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, email, pseudo, avatar_id, role')
      .eq('id', id)
      .maybeSingle<LigneProfil>();
    // Si la session a changé pendant la lecture, ce résultat est périmé.
    if (this.utilisateurId !== id) return;
    this.publier(
      error || !data
        ? { statut: 'erreur' }
        : { statut: 'connecte', profil: profilDepuisLigne(data) },
    );
  }

  /** Branche le suivi de la session (une seule fois, au premier observateur). */
  private demarrer(): void {
    if (this.demarre) return;
    this.demarre = true;
    this.client.auth.onAuthStateChange((evenement, session) => {
      if (!session) {
        this.utilisateurId = null;
        this.publier({ statut: 'deconnecte' });
        return;
      }
      // Un simple renouvellement du jeton ne change rien pour l'utilisateur.
      if (evenement === 'TOKEN_REFRESHED' && this.utilisateurId === session.user.id) return;
      this.utilisateurId = session.user.id;
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
    if (!error) return;
    if (error.status === 429 || error.code === 'over_request_rate_limit') {
      throw new ErreurAuth('trop_de_tentatives', error.message);
    }
    if (error.code === 'invalid_credentials' || error.status === 400) {
      throw new ErreurAuth('identifiants', error.message);
    }
    if (/failed to fetch|network|load failed/i.test(error.message)) {
      throw new ErreurAuth('reseau', error.message);
    }
    throw new ErreurAuth('inconnue', error.message);
  }

  async seDeconnecter(): Promise<void> {
    await this.client.auth.signOut();
  }

  recharger(): void {
    if (this.utilisateurId) {
      this.publier({ statut: 'chargement' });
      void this.chargerProfil(this.utilisateurId);
    }
  }
}
