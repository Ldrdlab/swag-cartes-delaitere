/**
 * Point d'entrée de l'application.
 *
 * Rôle : importer les styles globaux, choisir les implémentations de stockage (profil et collection de
 * cartes) et monter <App /> dans #root.
 * Expose : rien (effet de bord : rendu React).
 * Dépend de : react-dom, app/App, app/pwa, hooks/useStorage, hooks/useCollectionService, services/LocalStorageService,
 * services/HttpCollectionService, styles/*.css,
 * @fontsource/lilita-one, @fontsource/nunito (polices).
 * Pour brancher un backend partagé plus tard, remplacer `LocalStorageService` par une autre
 * implémentation de `StorageService` ci-dessous : aucun écran n'est à modifier.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { enregistrerPwa } from './app/pwa';
import { CollectionProvider } from './hooks/useCollectionService';
import { StorageProvider } from './hooks/useStorage';
import { HttpCollectionService } from './services/HttpCollectionService';
import { LocalStorageService } from './services/LocalStorageService';
// Polices installées dans l'appli (aucun lien externe) : titre = Lilita One, texte = Nunito 600/800/900.
import '@fontsource/lilita-one/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import './styles/tokens.css';
import './styles/reset.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Élément #root introuvable dans index.html');
}

enregistrerPwa();

createRoot(rootElement).render(
  <StrictMode>
    <StorageProvider service={new LocalStorageService()}>
      {/* import.meta.env.DEV : l'administration des cartes n'existe qu'avec « npm run dev ». */}
      <CollectionProvider
        service={
          new HttpCollectionService({
            baseUrl: import.meta.env.BASE_URL,
            administration: import.meta.env.DEV,
          })
        }
      >
        <App />
      </CollectionProvider>
    </StorageProvider>
  </StrictMode>,
);
