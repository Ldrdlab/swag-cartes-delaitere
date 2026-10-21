/**
 * Écran 4 — Confirmation.
 *
 * Rôle : montrer seul, en grand, le booster choisi, puis proposer de l'ouvrir ou de revenir au choix.
 * Expose : le composant `BoosterConfirmScreen`.
 * Dépend de : components/BoosterPlaceholder, components/ScreenLayout, components/Button, domain/types.
 */
import { BoosterPlaceholder } from '../../components/BoosterPlaceholder';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { Booster } from '../../domain/types';
import styles from './BoosterConfirm.module.css';

interface BoosterConfirmScreenProps {
  /** Booster choisi à l'écran précédent. */
  booster: Booster;
  /** Passe à l'écran d'ouverture. */
  onOpen: () => void;
  /** Revient au carrousel (qui retrouve la position de ce booster). */
  onBack: () => void;
}

/** Écran de confirmation du booster. */
export function BoosterConfirmScreen({ booster, onOpen, onBack }: BoosterConfirmScreenProps) {
  return (
    <ScreenLayout
      title={booster.name}
      footer={
        <>
          <Button onClick={onOpen}>Ouvrir ce booster</Button>
          <Button variant="secondary" onClick={onBack}>
            Retour
          </Button>
        </>
      }
    >
      <div className={styles.stage}>
        <div className={styles.pack}>
          <BoosterPlaceholder booster={booster} />
        </div>
      </div>
    </ScreenLayout>
  );
}
