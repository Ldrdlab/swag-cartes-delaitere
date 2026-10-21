/**
 * Accès au service de stockage depuis les composants.
 *
 * Rôle : fournir un `StorageService` à toute l'application via un contexte React. Pour brancher un
 * backend plus tard, il suffit de passer une autre implémentation à <StorageProvider> dans main.tsx.
 * Expose : StorageProvider, useStorage().
 * Dépend de : react, services/StorageService.
 */
import { createContext, useContext, type ReactNode } from 'react';
import type { StorageService } from '../services/StorageService';

const StorageContext = createContext<StorageService | null>(null);

interface StorageProviderProps {
  /** Implémentation de stockage à utiliser dans toute l'application. */
  service: StorageService;
  children: ReactNode;
}

/** Fournit le service de stockage aux composants enfants. */
export function StorageProvider({ service, children }: StorageProviderProps) {
  return <StorageContext.Provider value={service}>{children}</StorageContext.Provider>;
}

/**
 * Renvoie le service de stockage courant.
 * @throws Si le composant n'est pas dans un <StorageProvider>.
 */
export function useStorage(): StorageService {
  const service = useContext(StorageContext);
  if (!service) {
    throw new Error('useStorage doit être utilisé à l’intérieur de <StorageProvider>');
  }
  return service;
}
