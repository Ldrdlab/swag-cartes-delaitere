/**
 * Accès au service des boosters depuis les composants.
 *
 * Rôle : fournir un `BoosterService` à toute l'appli via un contexte React (même principe que
 * useCollectionService). Pour changer d'hébergeur, il suffit de changer l'implémentation passée à
 * <BoosterProvider> dans main.tsx.
 * Expose : BoosterProvider, useBoosterService().
 * Dépend de : react, services/BoosterService.
 */
import { createContext, useContext, type ReactNode } from 'react';
import type { BoosterService } from '../services/BoosterService';

const ContexteBooster = createContext<BoosterService | null>(null);

interface BoosterProviderProps {
  /** Implémentation à utiliser dans toute l'appli. */
  service: BoosterService;
  children: ReactNode;
}

/** Fournit le service des boosters aux composants enfants. */
export function BoosterProvider({ service, children }: BoosterProviderProps) {
  return <ContexteBooster.Provider value={service}>{children}</ContexteBooster.Provider>;
}

/**
 * Renvoie le service des boosters courant.
 * @throws Si le composant n'est pas dans un <BoosterProvider>.
 */
export function useBoosterService(): BoosterService {
  const service = useContext(ContexteBooster);
  if (!service) {
    throw new Error('useBoosterService doit être utilisé à l’intérieur de <BoosterProvider>');
  }
  return service;
}
