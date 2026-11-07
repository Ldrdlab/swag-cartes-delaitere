/**
 * Version de l'application.
 *
 * Rôle : donner le numéro de version de l'appli en cours d'exécution. Il vient de `package.json`
 * (source unique) : Vite le recopie ici au moment de la construction.
 * Expose : VERSION_APPLI.
 * Dépend de : rien (la valeur est injectée par vite.config.ts).
 */

/** Numéro de version de cette appli, format `majeur.mineur.correctif` (ex. `0.1.0`). */
export const VERSION_APPLI: string = __VERSION_APPLI__;
