/**
 * Point d'entrée de l'application.
 *
 * Rôle : importer les styles globaux et monter le composant racine <App /> dans #root.
 * Expose : rien (effet de bord : rendu React).
 * Dépend de : react-dom, app/App, styles/tokens.css, styles/reset.css.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/tokens.css';
import './styles/reset.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Élément #root introuvable dans index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
