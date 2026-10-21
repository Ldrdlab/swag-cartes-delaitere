/**
 * Écran 2 — Profil (squelette de l'étape 2, finalisé à l'étape 3).
 *
 * Rôle : saisie du pseudonyme du joueur.
 * Expose : le composant `ProfileScreen`.
 * Dépend de : components/ScreenLayout, components/Button.
 */
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';

interface ProfileScreenProps {
  /** Appelé quand le profil est validé. */
  onDone: () => void;
}

/** Écran de profil. */
export function ProfileScreen({ onDone }: ProfileScreenProps) {
  return (
    <ScreenLayout title="Profil" footer={<Button onClick={onDone}>OK</Button>}>
      <p>Écran 2 — Profil (placeholder)</p>
    </ScreenLayout>
  );
}
