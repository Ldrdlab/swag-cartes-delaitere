/**
 * Configuration ESLint (format "flat config").
 *
 * Rôle : règles de qualité TypeScript, React (hooks) et accessibilité (jsx-a11y).
 * Prettier gère seul le formatage (eslint-config-prettier désactive les règles qui feraient doublon).
 * Dépend de : @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y,
 * eslint-config-prettier, globals.
 */
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['*.config.{js,ts}'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);
