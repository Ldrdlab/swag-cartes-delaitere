/**
 * Carrousel circulaire de boosters.
 *
 * Rôle : afficher les boosters (le central en grand, les voisins réduits), les faire tourner au
 * swipe (doigt ou souris), au tap sur un voisin et au clavier (← →), et sélectionner le central
 * au tap ou avec Entrée / Espace. L'état (index central) est fourni par `useCarousel`.
 * Expose : le composant `Carousel`.
 * Dépend de : react, hooks/useSwipe, domain/carousel, components/BoosterPlaceholder, config/timings.
 */
import { useId, type CSSProperties, type KeyboardEvent } from 'react';
import { CAROUSEL_TRANSITION_MS } from '../../config/timings';
import { relativeOffset } from '../../domain/carousel';
import type { Booster } from '../../domain/types';
import type { CarouselControls } from '../../hooks/useCarousel';
import { useSwipe } from '../../hooks/useSwipe';
import { BoosterPlaceholder } from '../BoosterPlaceholder';
import styles from './Carousel.module.css';

/** Attribut posé sur chaque booster pour retrouver lequel a été touché. */
const INDEX_ATTRIBUTE = 'data-carousel-index';

interface CarouselProps {
  boosters: readonly Booster[];
  carousel: CarouselControls;
  /** Appelé quand l'utilisateur choisit le booster central (tap, Entrée ou Espace). */
  onSelect: (boosterIndex: number) => void;
}

/** Position visuelle d'un booster selon son décalage par rapport au centre. */
function positionName(offset: number): 'center' | 'side' | 'hidden' {
  if (offset === 0) return 'center';
  return Math.abs(offset) === 1 ? 'side' : 'hidden';
}

/** Carrousel de boosters (voir le commentaire d'en-tête). */
export function Carousel({ boosters, carousel, onSelect }: CarouselProps) {
  const { index, previousIndex, rotateBy, rotateTo, settle } = carousel;
  const count = boosters.length;
  const idPrefix = useId();

  const { handlers, dragOffsetPx, isDragging } = useSwipe({
    // Swipe vers la gauche : le booster suivant vient au centre.
    onSwipe: (direction) => rotateBy(direction === 'left' ? 1 : -1),
    onDragStart: settle,
    onTap: (target) => {
      const touched = target instanceof Element ? target.closest(`[${INDEX_ATTRIBUTE}]`) : null;
      const touchedIndex = Number(touched?.getAttribute(INDEX_ATTRIBUTE));
      if (!touched || Number.isNaN(touchedIndex)) return;
      if (touchedIndex === index) onSelect(index);
      else rotateTo(touchedIndex);
    },
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') rotateBy(-1);
    else if (event.key === 'ArrowRight') rotateBy(1);
    else if (event.key === 'Enter' || event.key === ' ') onSelect(index);
    else return;
    event.preventDefault();
  };

  return (
    <div
      className={styles.zone}
      role="listbox"
      tabIndex={0}
      aria-label="Boosters disponibles"
      aria-orientation="horizontal"
      aria-activedescendant={`${idPrefix}-${index}`}
      data-dragging={isDragging}
      style={{ '--carousel-transition-ms': `${CAROUSEL_TRANSITION_MS}ms` } as CSSProperties}
      onKeyDown={handleKeyDown}
      {...handlers}
    >
      {boosters.map((booster, boosterIndex) => {
        const offset = relativeOffset(boosterIndex, index, count);
        const previousOffset = relativeOffset(boosterIndex, previousIndex, count);
        // Un booster qui traverse d'un bord à l'autre (offset -1 → +1) réapparaît sans animation.
        const isWrapping = Math.abs(offset - previousOffset) > 1;
        return (
          <div
            key={booster.id}
            id={`${idPrefix}-${boosterIndex}`}
            className={styles.item}
            role="option"
            aria-selected={offset === 0}
            aria-label={booster.name}
            data-position={positionName(offset)}
            data-wrapping={isWrapping}
            {...{ [INDEX_ATTRIBUTE]: boosterIndex }}
            style={{ '--offset': offset, '--drag': `${dragOffsetPx}px` } as CSSProperties}
          >
            <BoosterPlaceholder booster={booster} />
          </div>
        );
      })}
    </div>
  );
}
