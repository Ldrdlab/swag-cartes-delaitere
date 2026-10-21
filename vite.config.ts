/**
 * Configuration de Vite et de Vitest.
 *
 * Rôle : déclarer le plugin React et les réglages des tests unitaires.
 * Expose : la configuration par défaut utilisée par `vite` et `vitest`.
 * Dépend de : vite, vitest, @vitejs/plugin-react.
 */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    // Les tests ciblent la logique pure (domain/, app/, services/) : pas besoin du DOM.
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
});
