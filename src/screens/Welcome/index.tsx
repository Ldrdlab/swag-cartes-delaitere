/**
 * Écran 1 — Accueil.
 *
 * Rôle : plein écran avec un titre placeholder. Un tap, un clic n'importe où, ou la touche
 * Entrée / Espace fait passer à l'écran Profil.
 * Expose : le composant `WelcomeScreen`.
 * Dépend de : components/ScreenLayout, hooks/useGlobalActivation, Welcome.module.css.
 */
import { ScreenLayout } from '../../components/ScreenLayout';
import { useGlobalActivation } from '../../hooks/useGlobalActivation';
import styles from './Welcome.module.css';

/** Touches qui démarrent le parcours. */
const START_KEYS = ['Enter', ' '] as const;

interface WelcomeScreenProps {
  /** Appelé pour passer à l'écran Profil. */
  onStart: () => void;
}

/** Écran d'accueil. */
export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  // « N'importe où » : clic/tap sur toute la fenêtre (marges de l'écran ordinateur comprises) ou clavier.
  // Un double déclenchement est sans effet : la machine à états ignore le 2e événement.
  useGlobalActivation({ onActivate: onStart, keys: START_KEYS, includeClicks: true });

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
