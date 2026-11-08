/**
 * Point d'entrée de l'application.
 *
 * Rôle : importer les styles globaux, créer les services (connexion, profil, collection de cartes,
 * administration, boosters : tous basés sur Supabase) et monter <App /> dans #root.
 * Si le fichier `.env` (URL et clé Supabase) est vide, l'appli affiche un message de configuration.
 * Expose : rien (effet de bord : rendu React).
 * Dépend de : react-dom, app/App, app/pwa, hooks/use*Service, hooks/useAuth, hooks/useStorage, services/*,
 * styles/*.css, @fontsource/lilita-one, @fontsource/nunito (polices).
 * Pour changer d'hébergeur de données plus tard, remplacer les services `Supabase…` ci-dessous :
 * aucun écran n'est à modifier.
 */
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { enregistrerPwa } from './app/pwa';
import { AdministrationProvider } from './hooks/useAdministrationService';
import { AuthProvider } from './hooks/useAuth';
import { BoosterProvider } from './hooks/useBoosterService';
import { CollectionProvider } from './hooks/useCollectionService';
import { StorageProvider } from './hooks/useStorage';
import { VersionProvider } from './hooks/useVersionService';
import { LocalStorageService } from './services/LocalStorageService';
import { SupabaseAdministrationService } from './services/SupabaseAdministrationService';
import { SupabaseAuthService } from './services/SupabaseAuthService';
import { SupabaseBoosterService } from './services/SupabaseBoosterService';
import { SupabaseCollectionService } from './services/SupabaseCollectionService';
import { SupabaseStorageService } from './services/SupabaseStorageService';
import { SupabaseVersionService } from './services/SupabaseVersionService';
import { supabase } from './services/supabaseClient';
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

// Services créés une seule fois (Supabase configuré) ou absents (appli affichant un message de configuration).
const authService = supabase ? new SupabaseAuthService(supabase) : null;
const storageService = supabase ? new SupabaseStorageService(supabase) : new LocalStorageService();
const collectionService = supabase ? new SupabaseCollectionService(supabase) : null;
const administrationService = supabase ? new SupabaseAdministrationService(supabase) : null;
const boosterService = supabase ? new SupabaseBoosterService(supabase) : null;
const versionService = supabase ? new SupabaseVersionService(supabase) : null;

/** Branche les services de données (seulement si Supabase est configuré). */
function Services({ children }: { children: ReactNode }) {
  if (!collectionService || !administrationService || !boosterService || !versionService) {
    return <>{children}</>;
  }
  return (
    <VersionProvider service={versionService}>
      <CollectionProvider service={collectionService}>
        <AdministrationProvider service={administrationService}>
          <BoosterProvider service={boosterService}>{children}</BoosterProvider>
        </AdministrationProvider>
      </CollectionProvider>
    </VersionProvider>
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <StorageProvider service={storageService}>
      <AuthProvider service={authService}>
        <Services>
          <App />
        </Services>
      </AuthProvider>
    </StorageProvider>
  </StrictMode>,
);
