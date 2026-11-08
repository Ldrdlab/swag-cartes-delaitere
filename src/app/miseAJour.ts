/**
 * Mémoire de l'état « une nouvelle version est disponible ».
 *
 * Rôle : garder, hors de React, l'information « le service worker a téléchargé une nouvelle version » et
 * « le joueur a choisi de reporter ». Le service worker (app/pwa.ts) y écrit ; le bandeau de mise à jour
 * (components/BandeauMiseAJour) la lit grâce à useSyncExternalStore.
 * Expose : EtatMiseAJour, StoreMiseAJour, creerStoreMiseAJour(), storeMiseAJour.
 * Dépend de : rien. Aucun import React ni DOM (testable seul).
 */

/** Ce que l'appli sait des mises à jour. */
export interface EtatMiseAJour {
  /** Une nouvelle version est téléchargée et prête à être installée. */
  disponible: boolean;
  /** Le joueur a cliqué sur « Plus tard » : le bandeau reste caché jusqu'au prochain lancement. */
  reportee: boolean;
}

/** Mémoire observable. */
export interface StoreMiseAJour {
  /** État actuel (la même référence tant que rien ne change). */
  lire(): EtatMiseAJour;
  /** Demande d'être prévenu à chaque changement. Renvoie la fonction qui arrête le suivi. */
  abonner(rappel: () => void): () => void;
  /** Une nouvelle version vient d'être téléchargée. */
  signalerDisponible(): void;
  /** Le joueur reporte la mise à jour. */
  reporter(): void;
}

/** Crée une mémoire vide. */
export function creerStoreMiseAJour(): StoreMiseAJour {
  let etat: EtatMiseAJour = { disponible: false, reportee: false };
  const rappels = new Set<() => void>();

  const changer = (nouvel: EtatMiseAJour) => {
    if (nouvel.disponible === etat.disponible && nouvel.reportee === etat.reportee) return;
    etat = nouvel;
    rappels.forEach((rappel) => rappel());
  };

  return {
    lire: () => etat,
    abonner: (rappel) => {
      rappels.add(rappel);
      return () => {
        rappels.delete(rappel);
      };
    },
    // Une nouvelle version après un report remet le bandeau : c'est une autre mise à jour.
    signalerDisponible: () => changer({ disponible: true, reportee: false }),
    reporter: () => changer({ ...etat, reportee: true }),
  };
}

/** Mémoire unique de l'application. */
export const storeMiseAJour: StoreMiseAJour = creerStoreMiseAJour();
