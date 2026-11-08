/**
 * Configuration de Vite et de Vitest.
 *
 * Rôle : déclarer le plugin React, la PWA (application installable), le numéro de version de l'appli
 * et les réglages des tests unitaires.
 * Expose : la configuration par défaut utilisée par `vite` et `vitest`.
 * Dépend de : vite, vitest, @vitejs/plugin-react, vite-plugin-pwa, package.json, CHANGELOG.md,
 * config/deploiement, domain/changelog.
 * À chaque construction, un fichier `version.json` (version + nouveautés du CHANGELOG) est publié : l'ancienne
 * appli le lit pour annoncer les nouveautés dans le bandeau « Nouvelle version disponible ».
 * Le chemin de base (`/swag-cartes-delaitere/`) n'est appliqué qu'au `build` et à `preview` : en développement,
 * l'appli reste à la racine (http://localhost:5173/).
 */
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { VitePWA } from 'vite-plugin-pwa';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { CHEMIN_BASE, MANIFEST_APPLI } from './src/config/deploiement.ts';
import { contenuNonPublie, notesDeVersion } from './src/domain/changelog.ts';

/** Numéro de version de l'appli, lu dans package.json (source unique, format 0.1.0). */
const { version: VERSION_APPLI } = JSON.parse(readFileSync('./package.json', 'utf8')) as {
  version: string;
};

/** Publie `version.json` : numéro de version et nouveautés (CHANGELOG.md, ou « Non publié » à défaut). */
function pluginVersionJson(): Plugin {
  return {
    name: 'version-json',
    apply: 'build',
    generateBundle() {
      const changelog = readFileSync('./CHANGELOG.md', 'utf8');
      const publiees = notesDeVersion(changelog, VERSION_APPLI);
      const notes = publiees.length > 0 ? publiees : contenuNonPublie(changelog);
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: VERSION_APPLI, notes }),
      });
    },
  };
}

export default defineConfig(({ command, isPreview }) => ({
  // `vite preview` (aperçu du build) reproduit le site publié : il a donc aussi le chemin de base.
  base: command === 'build' || isPreview ? CHEMIN_BASE : '/',
  // Remplace `__VERSION_APPLI__` dans le code par le numéro de version (voir config/version.ts).
  define: { __VERSION_APPLI__: JSON.stringify(VERSION_APPLI) },
  plugins: [
    react(),
    pluginVersionJson(),
    VitePWA({
      // « prompt » : une nouvelle version n'est jamais installée de force ; l'appli propose la mise à jour.
      registerType: 'prompt',
      includeAssets: ['icons/apple-touch-icon.png'],
      // Copie des icônes : le plugin attend une liste modifiable (la config, elle, est en lecture seule).
      manifest: { ...MANIFEST_APPLI, icons: [...MANIFEST_APPLI.icons] },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        // Aucun visuel de carte n'est mis en cache avec l'appli (ils sont privés, dans Supabase).
        globIgnores: ['cartes/**'],
      },
    }),
  ],
  // Aperçu sur téléphone avant publication (voir GUIDE.md) : un tunnel HTTPS temporaire (cloudflared) donne
  // une adresse en .trycloudflare.com, que `vite preview` doit accepter ; HTTPS est nécessaire au gyroscope.
  preview: { allowedHosts: ['.trycloudflare.com'] },
  test: {
    // Les tests ciblent la logique pure (domain/, app/, services/, config/) : pas besoin du DOM.
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
}));
