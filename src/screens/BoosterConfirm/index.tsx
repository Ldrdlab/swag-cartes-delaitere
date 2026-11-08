/**
 * Écran 4 — Confirmation.
 *
 * Rôle : montrer seul, en grand, le booster choisi, puis proposer de l'ouvrir ou de revenir au choix.
 * Si la dernière ouverture a échoué (limite du jour atteinte, réseau…), la raison est affichée ici.
 * Expose : le composant `BoosterConfirmScreen`.
 * Dépend de : boosters/BoosterVisuel, boosters/catalogue (type), boosters/taille, hooks/useElementSize,
 * components/ScreenLayout, components/Button, content/messagesCartes, services/erreurs (type).
 */
import { BoosterVisuel } from '../../boosters/BoosterVisuel';
import type { BoosterCatalogue } from '../../boosters/catalogue';
import { ajusterBooster } from '../../boosters/taille';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import { texteErreurCollection } from '../../content/messagesCartes';
import type { CodeErreur } from '../../services/erreurs';
import { useElementSize } from '../../hooks/useElementSize';
import styles from './BoosterConfirm.module.css';

interface BoosterConfirmScreenProps {
  /** Booster choisi à l'écran précédent. */
  booster: BoosterCatalogue;
  /** Passe à l'écran d'ouverture. */
  onOpen: () => void;
  /** Revient au carrousel (qui retrouve la position de ce booster). */
  onBack: () => void;
  /** Pourquoi la dernière ouverture a échoué, ou `null`. */
  erreur: CodeErreur | null;
}

/** Écran de confirmation du booster. */
export function BoosterConfirmScreen({
  booster,
  onOpen,
  onBack,
  erreur,
}: BoosterConfirmScreenProps) {
  // Plus grande taille qui tient dans la place disponible, sans déformer le booster.
  const { ref: cadreRef, width, height } = useElementSize<HTMLDivElement>();
  const taille = ajusterBooster(width, height);

  return (
    <ScreenLayout
      title={booster.theme.nom}
      footer={
        <>
          {erreur && (
            <p className={styles.erreur} role="alert">
              {texteErreurCollection(erreur)}
            </p>
          )}
          <Button onClick={onOpen} disabled={erreur === 'limite_atteinte'}>
            Ouvrir ce booster
          </Button>
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
