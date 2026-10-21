/**
 * Pile de cartes à révéler une à une.
 *
 * Rôle : montrer la carte du dessus (et le bord de celles dessous). Un tap, un swipe, ou la touche
 * Entrée / Espace / → passe à la suivante. La carte du dessus suit le doigt pendant le glissement.
 * Expose : le composant `CardStack`.
 * Dépend de : react, hooks/useSwipe, components/CardPlaceholder, config/game, config/timings.
 */
import type { CSSProperties, KeyboardEvent } from 'react';
import { STACK_VISIBLE_CARDS } from '../../config/game';
import { STACK_TRANSITION_MS } from '../../config/timings';
import type { Card } from '../../domain/types';
import { useSwipe } from '../../hooks/useSwipe';
import { CardPlaceholder } from '../CardPlaceholder';
import styles from './CardStack.module.css';

/** Touches qui révèlent la carte suivante. */
const NEXT_KEYS = ['Enter', ' ', 'ArrowRight'];

interface CardStackProps {
  /** Toutes les cartes du booster, dans l'ordre de révélation. */
  cards: readonly Card[];
  /** Position de la carte du dessus (0 = première). */
  currentIndex: number;
  /** Appelé pour révéler la carte suivante. */
  onNext: () => void;
}

/** Pile de cartes (voir le commentaire d'en-tête). */
export function CardStack({ cards, currentIndex, onNext }: CardStackProps) {
  const { handlers, dragOffsetPx, isDragging } = useSwipe({
    onSwipe: onNext,
    onTap: onNext,
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!NEXT_KEYS.includes(event.key)) return;
    event.preventDefault();
    onNext();
  };

  const current = cards[currentIndex];
  const visibleCards = cards.slice(currentIndex, currentIndex + STACK_VISIBLE_CARDS);

  return (
    <div
      className={styles.zone}
      role="button"
      tabIndex={0}
      aria-label={`Révéler la carte suivante. Carte ${currentIndex + 1} sur ${cards.length}${
        current ? ` : ${current.name}` : ''
      }`}
      data-dragging={isDragging}
      style={{ '--stack-transition-ms': `${STACK_TRANSITION_MS}ms` } as CSSProperties}
      onKeyDown={handleKeyDown}
      {...handlers}
    >
      {visibleCards.map((card, depth) => (
        // Clé = position dans le booster (et non l'id) : une même carte peut sortir plusieurs fois.
        <div
          key={currentIndex + depth}
          className={styles.card}
          style={
            {
              '--depth': depth,
              '--drag': depth === 0 ? `${dragOffsetPx}px` : '0px',
            } as CSSProperties
          }
        >
          <CardPlaceholder card={card} />
        </div>
      ))}
    </div>
  );
}
