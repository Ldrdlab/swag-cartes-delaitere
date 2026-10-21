/**
 * Point d'entrée de l'application.
 *
 * Rôle : importer les styles globaux, choisir l'implémentation de stockage et monter <App /> dans #root.
 * Expose : rien (effet de bord : rendu React).
 * Dépend de : react-dom, app/App, hooks/useStorage, services/LocalStorageService, styles/*.css.
 * Pour brancher un backend partagé plus tard, remplacer `LocalStorageService` par une autre
 * implémentation de `StorageService` ci-dessous : aucun écran n'est à modifier.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { StorageProvider } from './hooks/useStorage';
import { LocalStorageService } from './services/LocalStorageService';
import './styles/tokens.css';
import './styles/reset.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Élément #root introuvable dans index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <StorageProvider service={new LocalStorageService()}>
      <App />
    </StorageProvider>
  </StrictMode>,
);
