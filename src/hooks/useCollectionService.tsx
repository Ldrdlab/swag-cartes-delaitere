/**
 * Accès au service de collection depuis les composants.
 *
 * Rôle : fournir un `CollectionService` à toute l'application via un contexte React (même principe
 * que useStorage). Pour brancher un autre stockage, il suffit de changer l'implémentation passée à
 * <CollectionProvider> dans main.tsx.
 * Expose : CollectionProvider, useCollectionService().
 * Dépend de : react, services/CollectionService.
 */
import { createContext, useContext, type ReactNode } from 'react';
import type { CollectionService } from '../services/CollectionService';

const CollectionContext = createContext<CollectionService | null>(null);

interface CollectionProviderProps {
  /** Implémentation à utiliser dans toute l'application. */
  service: CollectionService;
  children: ReactNode;
}

/** Fournit le service de collection aux composants enfants. */
export function CollectionProvider({ service, children }: CollectionProviderProps) {
  return <CollectionContext.Provider value={service}>{children}</CollectionContext.Provider>;
}

/**
 * Renvoie le service de collection courant.
 * @throws Si le composant n'est pas dans un <CollectionProvider>.
 */
export function useCollectionService(): CollectionService {
  const service = useContext(CollectionContext);
  if (!service) {
    throw new Error('useCollectionService doit être utilisé à l’intérieur de <CollectionProvider>');
  }
  return service;
}
