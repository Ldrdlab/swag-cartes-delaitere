/**
 * Carrousel circulaire de boosters.
 *
 * Rôle : afficher les boosters (le central en grand et devant, les deux voisins réduits, assombris et
 * derrière), les faire tourner au swipe (doigt ou souris), au tap sur un voisin et au clavier (← →), et
 * sélectionner le central au tap ou avec Entrée / Espace. Accepte n'importe quel nombre de boosters :
 * seuls le central et ses voisins immédiats sont visibles. L'état (index central) vient de
 * `useCarousel`. Sur un écran trop court, l'ensemble est réduit pour tout garder visible.
 * Expose : le composant `Carousel`.
 * Dépend de : react, hooks/useSwipe, hooks/useElementSize, domain/carousel, boosters/BoosterVisuel,
 * config/boosters, config/timings, content/textes, Carousel.module.css.
 */
import { useId, type CSSProperties, type KeyboardEvent } from 'react';
import { BoosterVisuel } from '../../boosters/BoosterVisuel';
import type { BoosterCatalogue } from '../../boosters/catalogue';
import {
  GEOMETRIE_CARROUSEL,
  HAUTEUR_AVEC_REFLET,
  HAUTEUR_REFERENCE,
  LARGEUR_REFERENCE,
} from '../../config/boosters';
import { CAROUSEL_TRANSITION_MS } from '../../config/timings';
import { TEXTES } from '../../content/textes';
import { carouselPositions } from '../../domain/carousel';
import { useElementSize } from '../../hooks/useElementSize';
import type { CarouselControls } from '../../hooks/useCarousel';
import { useSwipe } from '../../hooks/useSwipe';
import styles from './Carousel.module.css';

/** Attribut posé sur chaque booster pour retrouver lequel a été touché. */
const INDEX_ATTRIBUTE = 'data-carousel-index';

interface CarouselProps {
  boosters: readonly BoosterCatalogue[];
  carousel: CarouselControls;
  /** Appelé quand l'utilisateur choisit le booster central (tap, Entrée ou Espace). */
  onSelect: (boosterIndex: number) => void;
}

/** Carrousel de boosters (voir le commentaire d'en-tête). */
export function Carousel({ boosters, carousel, onSelect }: CarouselProps) {
  const { index, previousIndex, rotateBy, rotateTo, settle } = carousel;
  const count = boosters.length;
  const idPrefix = useId();
  const { ref: zoneRef, height: hauteurDisponible } = useElementSize<HTMLDivElement>();
  // Écran trop court : on réduit l'ensemble (jamais on n'agrandit au-delà de la taille de référence).
  const ajustement =
    hauteurDisponible > 0 ? Math.min(1, hauteurDisponible / HAUTEUR_AVEC_REFLET) : 1;

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

  const positions = carouselPositions(count, index);
  const anciennesPositions = carouselPositions(count, previousIndex);

  // Géométrie (config/boosters.ts) et durée (config/timings.ts) transmises au CSS.
  const variables = {
    '--largeur-ref': LARGEUR_REFERENCE,
    '--hauteur-ref': HAUTEUR_REFERENCE,
    '--decalage-lateral': GEOMETRIE_CARROUSEL.decalageLateralPx,
    '--abaissement-cote': GEOMETRIE_CARROUSEL.abaissementCotePx,
    '--echelle-cote': GEOMETRIE_CARROUSEL.echelleCote,
    '--ajustement': ajustement,
    '--carousel-transition-ms': `${CAROUSEL_TRANSITION_MS}ms`,
  } as CSSProperties;

  return (
    <div
      ref={zoneRef}
      className={styles.zone}
      role="listbox"
      tabIndex={0}
      aria-label={TEXTES.choixBooster.labelListe}
      aria-orientation="horizontal"
      aria-activedescendant={`${idPrefix}-${index}`}
      data-dragging={isDragging}
      style={variables}
      onKeyDown={handleKeyDown}
      {...handlers}
    >
      <div className={styles.scene}>
        {boosters.map((booster, boosterIndex) => {
          const position = positions[boosterIndex];
          const ancienne = anciennesPositions[boosterIndex];
          if (!position || !ancienne) return null;
          // Un booster qui traverse d'un bord à l'autre réapparaît sans animation.
          const isWrapping = Math.abs(position.offset - ancienne.offset) > 1;
          return (
            <div
              key={booster.theme.id}
              id={`${idPrefix}-${boosterIndex}`}
              className={styles.item}
              role="option"
              aria-selected={position.role === 'centre'}
              aria-label={booster.theme.nom}
              data-role={position.role}
              data-wrapping={isWrapping}
              {...{ [INDEX_ATTRIBUTE]: boosterIndex }}
              style={
                { '--offset': position.offset, '--drag': `${dragOffsetPx}px` } as CSSProperties
              }
            >
              <BoosterVisuel
                booster={booster}
                etat={position.role === 'centre' ? 'centre' : 'cote'}
                largeur={LARGEUR_REFERENCE}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
