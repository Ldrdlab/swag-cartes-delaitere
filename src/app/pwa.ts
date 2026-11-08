/**
 * Service worker : installation de l'appli et mises à jour.
 *
 * Rôle : enregistrer le service worker (ce qui rend l'appli installable et utilisable hors ligne) et gérer
 * les nouvelles versions. Mode « prompt » : une nouvelle version n'est JAMAIS installée de force ; quand
 * elle est téléchargée, la mémoire app/miseAJour est prévenue et un bandeau propose « Mettre à jour ».
 * L'appli cherche une nouvelle version toute seule : à intervalle régulier et à chaque retour au premier
 * plan (important pour l'appli installée sur l'écran d'accueil, qui reste ouverte longtemps, iPhone compris).
 * Expose : enregistrerPwa(), appliquerMiseAJour(), forcerMiseAJour().
 * Dépend de : virtual:pwa-register (fourni par vite-plugin-pwa ; sans effet avec `npm run dev`),
 * app/miseAJour, config/miseAJour.
 */
import { registerSW } from 'virtual:pwa-register';
import { MISE_AJOUR } from '../config/miseAJour';
import { storeMiseAJour } from './miseAJour';

/** Installe la nouvelle version si elle est prête, puis recharge la page. */
let installerNouvelleVersion: ((recharger?: boolean) => Promise<void>) | null = null;

/** Lance une recherche de nouvelle version (sans jamais échouer : hors ligne, on réessaiera). */
function chercherMiseAJour(enregistrement: ServiceWorkerRegistration): void {
  enregistrement.update().catch(() => undefined);
}

/** Enregistre le service worker et surveille les nouvelles versions. */
export function enregistrerPwa(): void {
  installerNouvelleVersion = registerSW({
    immediate: true,
    onNeedRefresh: () => storeMiseAJour.signalerDisponible(),
    onRegisteredSW: (_adresse, enregistrement) => {
      if (!enregistrement) return;
      window.setInterval(() => chercherMiseAJour(enregistrement), MISE_AJOUR.intervalleRechercheMs);
      // Retour au premier plan (appli installée rouverte, onglet retrouvé) : on cherche tout de suite.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') chercherMiseAJour(enregistrement);
      });
    },
  });
}

/** « Mettre à jour » du bandeau : installe la version téléchargée et recharge l'appli. */
export async function appliquerMiseAJour(): Promise<void> {
  if (installerNouvelleVersion) await installerNouvelleVersion(true);
  else window.location.reload();
}

/**
 * « Mettre à jour » de l'écran obligatoire : plus radical, il fonctionne même si la nouvelle version n'a
 * pas encore été téléchargée. On supprime le service worker et le cache, puis on recharge : l'appli
 * récupère alors la dernière version publiée.
 */
export async function forcerMiseAJour(): Promise<void> {
  try {
    const enregistrements = await navigator.serviceWorker?.getRegistrations();
    await Promise.all((enregistrements ?? []).map((enregistrement) => enregistrement.unregister()));
    const caches_ = await caches.keys();
    await Promise.all(caches_.map((cache) => caches.delete(cache)));
  } finally {
    window.location.reload();
  }
}
