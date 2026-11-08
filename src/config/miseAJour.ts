/**
 * Réglages des mises à jour de l'appli.
 *
 * Rôle : centraliser la fréquence des vérifications faites quand l'appli reste ouverte (ce qui est le cas
 * d'une appli installée sur l'écran d'accueil). À chaque retour au premier plan, une vérification est
 * aussi lancée tout de suite.
 * Expose : MISE_AJOUR.
 * Dépend de : rien.
 *
 * ┌─ COMMENT MODIFIER (pour débutant) ────────────────────────────────────────────────┐
 * │ Les durées sont en millisecondes : 60 000 = 1 minute.                              │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 */
export const MISE_AJOUR = {
  /** Fréquence de recherche d'une nouvelle version de l'appli (service worker) : 30 minutes. */
  intervalleRechercheMs: 30 * 60 * 1000,
  /** Fréquence de lecture de la « version minimum requise » (Supabase) : 10 minutes. */
  intervalleVersionMinimaleMs: 10 * 60 * 1000,
  /** Nombre maximal de points de nouveautés affichés dans le bandeau de mise à jour. */
  notesMax: 5,
} as const;
