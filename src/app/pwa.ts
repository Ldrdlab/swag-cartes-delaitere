/**
 * Enregistrement du service worker (ce qui rend l'appli installable et utilisable hors ligne).
 *
 * Rôle : déclarer le service worker au démarrage. Mode « prompt » : une nouvelle version n'est jamais
 * installée de force. Le bandeau « Nouvelle version disponible » sera ajouté en phase 5.
 * Expose : enregistrerPwa().
 * Dépend de : virtual:pwa-register (fourni par vite-plugin-pwa ; sans effet avec `npm run dev`).
 */
import { registerSW } from 'virtual:pwa-register';

/** Enregistre le service worker dès que la page est chargée. */
export function enregistrerPwa(): void {
  registerSW({ immediate: true });
}
