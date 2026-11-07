/**
 * Accès au service d'administration depuis les composants.
 *
 * Rôle : fournir un `AdministrationService` à toute l'appli via un contexte React (même principe que
 * useCollectionService). Pour brancher un autre stockage, il suffit de changer l'implémentation passée
 * à <AdministrationProvider> dans main.tsx.
 * Expose : AdministrationProvider, useAdministrationService().
 * Dépend de : react, services/AdministrationService.
 */
import { createContext, useContext, type ReactNode } from 'react';
import type { AdministrationService } from '../services/AdministrationService';

const ContexteAdministration = createContext<AdministrationService | null>(null);

interface AdministrationProviderProps {
  /** Implémentation à utiliser dans toute l'appli. */
  service: AdministrationService;
  children: ReactNode;
}

/** Fournit le service d'administration aux composants enfants. */
export function AdministrationProvider({ service, children }: AdministrationProviderProps) {
  return (
    <ContexteAdministration.Provider value={service}>{children}</ContexteAdministration.Provider>
  );
}

/**
 * Renvoie le service d'administration courant.
 * @throws Si le composant n'est pas dans un <AdministrationProvider>.
 */
export function useAdministrationService(): AdministrationService {
  const service = useContext(ContexteAdministration);
  if (!service) {
    throw new Error(
      'useAdministrationService doit être utilisé à l’intérieur de <AdministrationProvider>',
    );
  }
  return service;
}
