/**
 * Écran 6 — Révélation des cartes (squelette de l'étape 2, finalisé à l'étape 7).
 *
 * Rôle : montrer les cartes obtenues, puis proposer de rejouer ou de revenir à l'accueil.
 * Expose : le composant `CardRevealScreen`.
 * Dépend de : components/ScreenLayout, components/Button, domain/types.
 */
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { Card } from '../../domain/types';

interface CardRevealScreenProps {
  cards: readonly Card[];
  onOpenAnother: () => void;
  onHome: () => void;
}

/** Écran de révélation des cartes. */
export function CardRevealScreen({ cards, onOpenAnother, onHome }: CardRevealScreenProps) {
  return (
    <ScreenLayout
      title="Vos cartes"
      footer={
        <>
          <Button onClick={onOpenAnother}>Ouvrir un autre booster</Button>
          <Button variant="secondary" onClick={onHome}>
            Accueil
          </Button>
        </>
      }
    >
      <p>Écran 6 — Révélation (placeholder) : {cards.length} carte(s)</p>
    </ScreenLayout>
  );
}
