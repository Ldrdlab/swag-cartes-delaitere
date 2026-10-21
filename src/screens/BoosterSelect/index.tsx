/**
 * Écran 3 — Choix du booster.
 *
 * Rôle : carrousel de boosters (swipe, flèches à l'écran, clavier, tap). Choisir le booster central
 * fait passer à l'écran de confirmation. La liste des boosters vient de boosters/catalogue.ts.
 * Expose : le composant `BoosterSelectScreen`.
 * Dépend de : hooks/useCarousel, components/Carousel, boosters/catalogue, content/textes, Controles,
 * BoosterSelect.module.css.
 */
import { CATALOGUE, getBoosterAt } from '../../boosters/catalogue';
import { Carousel } from '../../components/Carousel';
import { TEXTES } from '../../content/textes';
import { useCarousel } from '../../hooks/useCarousel';
import styles from './BoosterSelect.module.css';
import { Controles } from './Controles';

interface BoosterSelectScreenProps {
  /** Booster à placer au centre à l'arrivée (celui choisi précédemment, ou le premier). */
  initialIndex: number;
  /** Appelé avec la position du booster choisi. */
  onChoose: (boosterIndex: number) => void;
}

/** Écran de choix du booster. */
export function BoosterSelectScreen({ initialIndex, onChoose }: BoosterSelectScreenProps) {
  const carousel = useCarousel(CATALOGUE.length, initialIndex);
  const courant = getBoosterAt(carousel.index);

  return (
    <div className={styles.page}>
      <main className={styles.ecran}>
        {/* Moitié haute irisée, coupée en diagonale (décor). */}
        <div className={styles.fondHaut} aria-hidden="true" />
        <h1 className={styles.bandeau}>{TEXTES.choixBooster.titre}</h1>
        <div className={styles.scene}>
          <Carousel boosters={CATALOGUE} carousel={carousel} onSelect={onChoose} />
        </div>
        <Controles
          nom={courant.theme.nom}
          position={carousel.index}
          total={CATALOGUE.length}
          onPrecedent={() => carousel.rotateBy(-1)}
          onSuivant={() => carousel.rotateBy(1)}
        />
      </main>
    </div>
  );
}
