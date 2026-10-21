/**
 * Écran 3 — Choix du booster.
 *
 * Rôle : carrousel de boosters (swipe, flèches à l'écran, clavier, tap). Choisir le booster central
 * fait passer à l'écran de confirmation.
 * Expose : le composant `BoosterSelectScreen`.
 * Dépend de : hooks/useCarousel, components/Carousel, components/Button, data/boosters.
 */
import { Button } from '../../components/Button';
import { Carousel } from '../../components/Carousel';
import { ScreenLayout } from '../../components/ScreenLayout';
import { BOOSTERS } from '../../data/boosters';
import { useCarousel } from '../../hooks/useCarousel';
import styles from './BoosterSelect.module.css';

interface BoosterSelectScreenProps {
  /** Booster à placer au centre à l'arrivée (celui choisi précédemment, ou le premier). */
  initialIndex: number;
  /** Appelé avec la position du booster choisi. */
  onChoose: (boosterIndex: number) => void;
}

/** Écran de choix du booster. */
export function BoosterSelectScreen({ initialIndex, onChoose }: BoosterSelectScreenProps) {
  const carousel = useCarousel(BOOSTERS.length, initialIndex);
  const current = BOOSTERS[carousel.index];

  return (
    <ScreenLayout title="Choisissez un booster">
      <div className={styles.layout}>
        <div className={styles.stage}>
          <Carousel boosters={BOOSTERS} carousel={carousel} onSelect={onChoose} />
        </div>
        <div className={styles.controls}>
          <Button
            variant="secondary"
            aria-label="Booster précédent"
            onClick={() => carousel.rotateBy(-1)}
          >
            ‹
          </Button>
          <p className={styles.caption} aria-live="polite">
            {current?.name} ({carousel.index + 1}/{BOOSTERS.length})
          </p>
          <Button
            variant="secondary"
            aria-label="Booster suivant"
            onClick={() => carousel.rotateBy(1)}
          >
            ›
          </Button>
        </div>
      </div>
    </ScreenLayout>
  );
}
