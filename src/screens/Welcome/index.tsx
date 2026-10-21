/**
 * Écran 1 — Accueil (squelette de l'étape 2, finalisé à l'étape 3).
 *
 * Rôle : point de départ du parcours.
 * Expose : le composant `WelcomeScreen`.
 * Dépend de : components/ScreenLayout, components/Button.
 */
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';

interface WelcomeScreenProps {
  /** Appelé pour passer à l'écran Profil. */
  onStart: () => void;
}

/** Écran d'accueil. */
export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <ScreenLayout title="Accueil" footer={<Button onClick={onStart}>Commencer</Button>}>
      <p>Écran 1 — Accueil (placeholder)</p>
    </ScreenLayout>
  );
}
