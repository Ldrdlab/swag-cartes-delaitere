/**
 * Écran 1 — Accueil.
 *
 * Rôle : plein écran avec un titre placeholder. Un tap, un clic n'importe où, ou la touche
 * Entrée / Espace fait passer à l'écran Profil.
 * Expose : le composant `WelcomeScreen`.
 * Dépend de : react, components/ScreenLayout, Welcome.module.css.
 */
import { useEffect } from 'react';
import { ScreenLayout } from '../../components/ScreenLayout';
import styles from './Welcome.module.css';

interface WelcomeScreenProps {
  /** Appelé pour passer à l'écran Profil. */
  onStart: () => void;
}

/** Écran d'accueil. */
export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  // « N'importe où » : un clic/tap sur toute la fenêtre (marges de l'écran ordinateur comprises)
  // ou Entrée / Espace démarre, même si le bouton n'a pas le focus.
  // Un double déclenchement (clic + touche) est sans effet : la machine à états ignore le 2e événement.
  useEffect(() => {
    const mountedAt = performance.now();
    // Ignore l'événement qui a lui-même provoqué l'arrivée sur cet écran (ex. clic sur « Accueil »).
    const handleClick = (event: MouseEvent) => {
      if (event.timeStamp >= mountedAt) onStart();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.timeStamp < mountedAt) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onStart();
      }
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onStart]);

  return (
    <ScreenLayout>
      {/* Le bouton plein écran sert aux lecteurs d'écran et au focus clavier ; le clic est géré plus haut. */}
      <button type="button" className={styles.fullScreenButton}>
        <span className={styles.title}>Booster Opening</span>
        <span className={styles.message}>Touchez l’écran pour commencer</span>
      </button>
    </ScreenLayout>
  );
}
