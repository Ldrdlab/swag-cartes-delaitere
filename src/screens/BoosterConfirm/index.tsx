/**
 * Écran 4 — Confirmation (squelette de l'étape 2, finalisé à l'étape 5).
 *
 * Rôle : confirmer le booster choisi avant l'ouverture.
 * Expose : le composant `BoosterConfirmScreen`.
 * Dépend de : components/ScreenLayout, components/Button.
 */
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';

interface BoosterConfirmScreenProps {
  onOpen: () => void;
  onBack: () => void;
}

/** Écran de confirmation du booster. */
export function BoosterConfirmScreen({ onOpen, onBack }: BoosterConfirmScreenProps) {
  return (
    <ScreenLayout
      title="Confirmation"
      footer={
        <>
          <Button onClick={onOpen}>Ouvrir ce booster</Button>
          <Button variant="secondary" onClick={onBack}>
            Retour
          </Button>
        </>
      }
    >
      <p>Écran 4 — Confirmation (placeholder)</p>
    </ScreenLayout>
  );
}
