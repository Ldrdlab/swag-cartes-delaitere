/**
 * Configuration de Vite et de Vitest.
 *
 * Rôle : déclarer le plugin React, le plugin d'administration des cartes (serveur de développement
 * uniquement) et les réglages des tests unitaires.
 * Expose : la configuration par défaut utilisée par `vite` et `vitest`.
 * Dépend de : vite, vitest, @vitejs/plugin-react, tools/cartesPlugin.
 * Le code admin est lu dans le fichier `.env.local` (variable ADMIN_CODE, jamais envoyée au navigateur).
 */
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { pluginCartes } from './tools/cartesPlugin.ts';

export default defineConfig(({ mode }) => {
  const racine = process.cwd();
  // Préfixe '' : lit aussi les variables qui ne commencent pas par VITE_ (donc non exposées au navigateur).
  const env = loadEnv(mode, racine, '');

  return {
    plugins: [react(), pluginCartes({ racine, codeAdmin: env.ADMIN_CODE })],
    test: {
      // Les tests ciblent la logique pure (domain/, app/, services/, tools/) : pas besoin du DOM.
      environment: 'node',
      include: ['src/**/*.test.ts', 'tools/**/*.test.ts'],
      passWithNoTests: true,
    },
  };
});
