/**
 * Écran 4 — Confirmation.
 *
 * Rôle : montrer seul, en grand, le booster choisi, puis proposer de l'ouvrir ou de revenir au choix.
 * Expose : le composant `BoosterConfirmScreen`.
 * Dépend de : boosters/BoosterVisuel, boosters/catalogue (type), boosters/taille, hooks/useElementSize,
 * components/ScreenLayout, components/Button.
 */
import { BoosterVisuel } from '../../boosters/BoosterVisuel';
import type { BoosterCatalogue } from '../../boosters/catalogue';
import { ajusterBooster } from '../../boosters/taille';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import { useElementSize } from '../../hooks/useElementSize';
import styles from './BoosterConfirm.module.css';

interface BoosterConfirmScreenProps {
  /** Booster choisi à l'écran précédent. */
  booster: BoosterCatalogue;
  /** Passe à l'écran d'ouverture. */
  onOpen: () => void;
  /** Revient au carrousel (qui retrouve la position de ce booster). */
  onBack: () => void;
}

/** Écran de confirmation du booster. */
export function BoosterConfirmScreen({ booster, onOpen, onBack }: BoosterConfirmScreenProps) {
  // Plus grande taille qui tient dans la place disponible, sans déformer le booster.
  const { ref: cadreRef, width, height } = useElementSize<HTMLDivElement>();
  const taille = ajusterBooster(width, height);

  return (
    <ScreenLayout
      title={booster.theme.nom}
      footer={
        <>
          <Button onClick={onOpen}>Ouvrir ce booster</Button>
          <Button variant="secondary" onClick={onBack}>
            Retour
          </Button>
        </>
      }
    >
      <div ref={cadreRef} className={styles.stage}>
        <div style={{ width: taille.largeur }}>
          <BoosterVisuel booster={booster} etat="confirmation" />
        </div>
      </div>
    </ScreenLayout>
  );
}
