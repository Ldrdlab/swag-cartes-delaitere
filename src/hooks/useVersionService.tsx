/**
 * Accès au service de version minimale depuis les composants.
 *
 * Rôle : fournir un `VersionService` à l'appli via un contexte React. Contrairement aux autres services,
 * son absence n'est pas une erreur : sans Supabase configuré, il n'y a simplement aucune version minimale
 * à respecter (`useVersionService` renvoie alors `null`).
 * Expose : VersionProvider, useVersionService().
 * Dépend de : react, services/VersionService.
 */
import { createContext, useContext, type ReactNode } from 'react';
import type { VersionService } from '../services/VersionService';

const ContexteVersion = createContext<VersionService | null>(null);

interface VersionProviderProps {
  /** Implémentation à utiliser dans toute l'appli. */
  service: VersionService;
  children: ReactNode;
}

/** Fournit le service de version minimale aux composants enfants. */
export function VersionProvider({ service, children }: VersionProviderProps) {
  return <ContexteVersion.Provider value={service}>{children}</ContexteVersion.Provider>;
}

/** Renvoie le service de version minimale, ou `null` si Supabase n'est pas configuré. */
export function useVersionService(): VersionService | null {
  return useContext(ContexteVersion);
}
