/**
 * Écran 5 — Ouverture par découpe (squelette de l'étape 2, finalisé à l'étape 6).
 *
 * Rôle : ouvrir le booster en traçant une ligne dans la zone de découpe.
 * Expose : le composant `BoosterOpeningScreen`.
 * Dépend de : components/ScreenLayout, components/Button, domain/types.
 */
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { Card } from '../../domain/types';

interface BoosterOpeningScreenProps {
  /** Appelé quand le booster est ouvert, avec les cartes tirées. */
  onDone: (cards: readonly Card[]) => void;
}

/** Écran d'ouverture du booster. */
export function BoosterOpeningScreen({ onDone }: BoosterOpeningScreenProps) {
  return (
    <ScreenLayout title="Ouverture" footer={<Button onClick={() => onDone([])}>Ouvrir</Button>}>
      <p>Écran 5 — Découpe (placeholder)</p>
    </ScreenLayout>
  );
}
