/**
 * Écran 6 — Révélation des cartes.
 *
 * Rôle : révéler les cartes une à une (tap, swipe ou clavier), puis afficher le récapitulatif en
 * grille avec les boutons « Ouvrir un autre booster » et « Accueil ».
 * Expose : le composant `CardRevealScreen`.
 * Dépend de : react, components/CardStack, components/CardGrid, components/ScreenLayout, components/Button.
 */
import { useState } from 'react';
import { Button } from '../../components/Button';
import { CardGrid } from '../../components/CardGrid';
import { CardStack } from '../../components/CardStack';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { Card } from '../../domain/types';
import styles from './CardReveal.module.css';

interface CardRevealScreenProps {
  /** Cartes tirées, dans l'ordre de révélation. */
  cards: readonly Card[];
  /** Retour au choix du booster. */
  onOpenAnother: () => void;
  /** Retour à l'écran d'accueil. */
  onHome: () => void;
}

/** Écran de révélation des cartes. */
export function CardRevealScreen({ cards, onOpenAnother, onHome }: CardRevealScreenProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const isSummary = revealedCount >= cards.length;

  if (isSummary) {
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
        <CardGrid cards={cards} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Vos cartes">
      <div className={styles.layout}>
        <div className={styles.stage}>
          <CardStack
            cards={cards}
            currentIndex={revealedCount}
            onNext={() => setRevealedCount((count) => count + 1)}
          />
        </div>
        <p className={styles.hint} aria-live="polite">
          Carte {revealedCount + 1}/{cards.length} — touchez ou glissez pour la suivante
        </p>
      </div>
    </ScreenLayout>
  );
}
