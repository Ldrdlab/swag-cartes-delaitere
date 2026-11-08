/**
 * Mise à jour obligatoire ou non.
 *
 * Rôle : lire la « version minimum requise » (Supabase) au démarrage, régulièrement et à chaque retour au
 * premier plan, et dire si la version de cette appli est plus ancienne. En cas d'erreur réseau, on ne bloque
 * jamais personne : on réessaiera plus tard.
 * Expose : EtatVersionMinimale, useVersionMinimale().
 * Dépend de : react, config/miseAJour, config/version, domain/version, hooks/useVersionService.
 */
import { useEffect, useState } from 'react';
import { MISE_AJOUR } from '../config/miseAJour';
import { VERSION_APPLI } from '../config/version';
import { estInferieure } from '../domain/version';
import { useVersionService } from './useVersionService';

/** Ce que renvoie le hook. */
export interface EtatVersionMinimale {
  /** Vrai si cette version est plus ancienne que la version minimum requise. */
  obligatoire: boolean;
  /** Version minimum requise (`null` tant qu'elle n'a pas été lue). */
  versionMin: string | null;
}

/** Suit la version minimum requise. */
export function useVersionMinimale(): EtatVersionMinimale {
  const service = useVersionService();
  const [versionMin, setVersionMin] = useState<string | null>(null);

  useEffect(() => {
    if (!service) return;
    let annule = false;
    const verifier = () => {
      service.versionMinimale().then(
        (version) => {
          if (!annule) setVersionMin(version);
        },
        () => undefined, // hors ligne ou erreur : on ne bloque personne, on réessaiera
      );
    };
    verifier();
    const minuteur = window.setInterval(verifier, MISE_AJOUR.intervalleVersionMinimaleMs);
    const auRetour = () => {
      if (document.visibilityState === 'visible') verifier();
    };
    document.addEventListener('visibilitychange', auRetour);
    return () => {
      annule = true;
      window.clearInterval(minuteur);
      document.removeEventListener('visibilitychange', auRetour);
    };
  }, [service]);

  return {
    obligatoire: versionMin !== null && estInferieure(VERSION_APPLI, versionMin),
    versionMin,
  };
}
