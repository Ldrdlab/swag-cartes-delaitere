/**
 * Réglages de mise en ligne et d'installation de l'appli (PWA).
 *
 * Rôle : centraliser le nom du dépôt GitHub (qui donne l'adresse du site), l'identité de l'appli
 * installée (nom, description, couleurs) et la liste des icônes.
 * Expose : NOM_DEPOT, CHEMIN_BASE, MANIFEST_APPLI.
 * Dépend de : rien. Lu par vite.config.ts : ce fichier est donc importé avec l'extension `.ts`.
 *
 * ┌─ COMMENT MODIFIER (pour débutant) ────────────────────────────────────────────────┐
 * │ Changer l'ADRESSE du site : modifie NOM_DEPOT (même nom que le dépôt GitHub).      │
 * │ Changer le NOM sous l'icône du téléphone : modifie `short_name`.                   │
 * │ Changer les COULEURS : `theme_color` (barre du navigateur) et `background_color`   │
 * │ (écran de démarrage). Les icônes sont dans public/icons/.                          │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */

/** Nom du dépôt GitHub : le site sera publié sur https://<compte>.github.io/<NOM_DEPOT>/ */
export const NOM_DEPOT = 'swag-cartes-delaitere';

/** Début de toutes les adresses de l'appli publiée sur GitHub Pages (commence et finit par `/`). */
export const CHEMIN_BASE = `/${NOM_DEPOT}/`;

/** Couleur de fond sombre de l'appli (la même que `--color-bg-page` dans styles/tokens.css). */
const COULEUR_FOND = '#1c1c24';

/** Contenu du manifest : la « carte d'identité » de l'appli installée. */
export const MANIFEST_APPLI = {
  name: 'SWAG',
  short_name: 'SWAG',
  description: 'Cartes Délaitère',
  lang: 'fr',
  display: 'standalone',
  orientation: 'portrait',
  theme_color: COULEUR_FOND,
  background_color: COULEUR_FOND,
  icons: [
    { src: 'icons/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
} as const;
