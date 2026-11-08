/**
 * Installation de l'appli (PWA).
 *
 * Rôle : savoir si l'appli est déjà installée (ouverte en mode « application »), si le navigateur propose
 * l'installation en un clic (Chrome / Edge / Android : événement `beforeinstallprompt`), et la lancer.
 * Safari sur iPhone n'a pas ce bouton : la page « Installer l'appli » explique alors les étapes à la main.
 * Expose : useInstallation().
 * Dépend de : react, domain/plateforme.
 */
import { useCallback, useEffect, useState } from 'react';
import { detecterPlateforme, type Plateforme } from '../domain/plateforme';

/** Événement non standard envoyé par Chrome / Edge quand l'installation est possible. */
interface EvenementInstallation extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Vrai si l'appli tourne en mode « application installée » (plein écran, sans barre d'adresse). */
function estInstallee(): boolean {
  const iosAutonome = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return window.matchMedia('(display-mode: standalone)').matches || iosAutonome;
}

/** Ce que renvoie le hook. */
export interface EtatInstallation {
  /** Plateforme de l'appareil (pour mettre en avant les bonnes étapes). */
  plateforme: Plateforme;
  /** Vrai si l'appli est déjà installée. */
  installee: boolean;
  /** Vrai si le navigateur propose l'installation en un clic. */
  installable: boolean;
  /** Lance l'installation (sans effet si elle n'est pas proposée). */
  installer: () => Promise<void>;
}

/** Suit l'état d'installation de l'appli. */
export function useInstallation(): EtatInstallation {
  const [invite, setInvite] = useState<EvenementInstallation | null>(null);
  const [installee, setInstallee] = useState(estInstallee);
  const [plateforme] = useState(() =>
    detecterPlateforme(navigator.userAgent, navigator.maxTouchPoints),
  );

  useEffect(() => {
    const surInvite = (evenement: Event) => {
      // On garde l'invitation pour la déclencher avec notre propre bouton.
      evenement.preventDefault();
      setInvite(evenement as EvenementInstallation);
    };
    const surInstallation = () => {
      setInstallee(true);
      setInvite(null);
    };
    window.addEventListener('beforeinstallprompt', surInvite);
    window.addEventListener('appinstalled', surInstallation);
    return () => {
      window.removeEventListener('beforeinstallprompt', surInvite);
      window.removeEventListener('appinstalled', surInstallation);
    };
  }, []);

  const installer = useCallback(async () => {
    if (!invite) return;
    await invite.prompt();
    await invite.userChoice;
    // Une invitation ne peut servir qu'une fois.
    setInvite(null);
  }, [invite]);

  return { plateforme, installee, installable: invite !== null, installer };
}
