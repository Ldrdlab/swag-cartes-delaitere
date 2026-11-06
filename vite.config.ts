/**
 * Configuration de Vite et de Vitest.
 *
 * Rôle : déclarer le plugin React, le plugin d'administration des cartes (serveur de développement
 * uniquement), la PWA (application installable) et les réglages des tests unitaires.
 * Expose : la configuration par défaut utilisée par `vite` et `vitest`.
 * Dépend de : vite, vitest, @vitejs/plugin-react, vite-plugin-pwa, tools/cartesPlugin, config/deploiement.
 * Le code admin est lu dans le fichier `.env.local` (variable ADMIN_CODE, jamais envoyée au navigateur).
 * Le chemin de base (`/swag-cartes-delaitere/`) n'est appliqué qu'au `build` et à `preview` : en développement,
 * l'appli reste à la racine (http://localhost:5173/).
 */
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { CHEMIN_BASE, MANIFEST_APPLI } from './src/config/deploiement.ts';
import { pluginCartes } from './tools/cartesPlugin.ts';

export default defineConfig(({ mode, command, isPreview }) => {
  const racine = process.cwd();
  // Préfixe '' : lit aussi les variables qui ne commencent pas par VITE_ (donc non exposées au navigateur).
  const env = loadEnv(mode, racine, '');

  return {
    // `vite preview` (aperçu du build) reproduit le site publié : il a donc aussi le chemin de base.
    base: command === 'build' || isPreview ? CHEMIN_BASE : '/',
    plugins: [
      react(),
      pluginCartes({ racine, codeAdmin: env.ADMIN_CODE }),
      VitePWA({
        // « prompt » : une nouvelle version n'est jamais installée de force ; l'appli propose la mise à jour.
        registerType: 'prompt',
        includeAssets: ['icons/apple-touch-icon.png'],
        // Copie des icônes : le plugin attend une liste modifiable (la config, elle, est en lecture seule).
        manifest: { ...MANIFEST_APPLI, icons: [...MANIFEST_APPLI.icons] },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
          // Les visuels des cartes ne sont JAMAIS mis en cache avec l'appli (ils sont privés).
          globIgnores: ['cartes/**'],
        },
      }),
    ],
    test: {
      // Les tests ciblent la logique pure (domain/, app/, services/, tools/) : pas besoin du DOM.
      environment: 'node',
      include: ['src/**/*.test.ts', 'tools/**/*.test.ts'],
      passWithNoTests: true,
    },
  };
});
