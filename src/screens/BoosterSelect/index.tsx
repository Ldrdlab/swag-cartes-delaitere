/**
 * Écran 3 — Choix du booster (squelette de l'étape 2, finalisé à l'étape 4).
 *
 * Rôle : choisir un booster parmi ceux proposés.
 * Expose : le composant `BoosterSelectScreen`.
 * Dépend de : components/ScreenLayout, components/Button.
 */
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';

interface BoosterSelectScreenProps {
  /** Appelé avec la position du booster choisi. */
  onChoose: (boosterIndex: number) => void;
}

/** Écran de choix du booster. */
export function BoosterSelectScreen({ onChoose }: BoosterSelectScreenProps) {
  return (
    <ScreenLayout
      title="Choisissez un booster"
      footer={<Button onClick={() => onChoose(0)}>Choisir</Button>}
    >
      <p>Écran 3 — Carrousel (placeholder)</p>
    </ScreenLayout>
  );
}
