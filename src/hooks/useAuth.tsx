/**
 * Accès à la connexion depuis les composants.
 *
 * Rôle : suivre la session (via `AuthService`) et la partager avec toute l'appli par un contexte React.
 * Si Supabase n'est pas configuré (fichier `.env` vide), la situation est « non_configure ».
 * Expose : AuthProvider, useAuth(), SituationAuth.
 * Dépend de : react, services/AuthService.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthService, EtatAuth } from '../services/AuthService';

/** Situation de la session, avec le cas « Supabase non configuré ». */
export type SituationAuth = EtatAuth | { statut: 'non_configure' };

interface ValeurAuth {
  etat: SituationAuth;
  seConnecter: (email: string, motDePasse: string) => Promise<void>;
  seDeconnecter: () => Promise<void>;
  definirMotDePasse: (motDePasse: string) => Promise<void>;
  envoyerLienReinitialisation: (email: string) => Promise<void>;
  recharger: () => void;
  rafraichir: () => Promise<void>;
}

const ContexteAuth = createContext<ValeurAuth | null>(null);

interface AuthProviderProps {
  /** Service de connexion, ou `null` si Supabase n'est pas configuré. */
  service: AuthService | null;
  children: ReactNode;
}

/** Fournit la connexion aux composants enfants. */
export function AuthProvider({ service, children }: AuthProviderProps) {
  const [etat, setEtat] = useState<SituationAuth>(
    service ? { statut: 'chargement' } : { statut: 'non_configure' },
  );

  useEffect(() => {
    if (!service) return;
    return service.observer(setEtat);
  }, [service]);

  const seConnecter = useCallback(
    async (email: string, motDePasse: string) => {
      if (!service) throw new Error('Supabase non configuré');
      await service.seConnecter(email, motDePasse);
    },
    [service],
  );
  const seDeconnecter = useCallback(async () => {
    await service?.seDeconnecter();
  }, [service]);
  const definirMotDePasse = useCallback(
    async (motDePasse: string) => {
      if (!service) throw new Error('Supabase non configuré');
      await service.definirMotDePasse(motDePasse);
    },
    [service],
  );
  const envoyerLienReinitialisation = useCallback(
    async (email: string) => {
      if (!service) throw new Error('Supabase non configuré');
      await service.envoyerLienReinitialisation(email);
    },
    [service],
  );
  const recharger = useCallback(() => service?.recharger(), [service]);
  const rafraichir = useCallback(async () => {
    await service?.rafraichir();
  }, [service]);

  const valeur = useMemo(
    () => ({
      etat,
      seConnecter,
      seDeconnecter,
      definirMotDePasse,
      envoyerLienReinitialisation,
      recharger,
      rafraichir,
    }),
    [
      etat,
      seConnecter,
      seDeconnecter,
      definirMotDePasse,
      envoyerLienReinitialisation,
      recharger,
      rafraichir,
    ],
  );
  return <ContexteAuth.Provider value={valeur}>{children}</ContexteAuth.Provider>;
}

/**
 * Renvoie la connexion courante.
 * @throws Si le composant n'est pas dans un <AuthProvider>.
 */
export function useAuth(): ValeurAuth {
  const valeur = useContext(ContexteAuth);
  if (!valeur) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>');
  return valeur;
}
