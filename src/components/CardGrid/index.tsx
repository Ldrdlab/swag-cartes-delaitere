/**
 * Récapitulatif des cartes obtenues.
 *
 * Rôle : afficher toutes les cartes d'un booster en grille.
 * Expose : le composant `CardGrid`.
 * Dépend de : domain/types, components/CardPlaceholder, CardGrid.module.css.
 */
import type { Card } from '../../domain/types';
import { CardPlaceholder } from '../CardPlaceholder';
import styles from './CardGrid.module.css';

interface CardGridProps {
  cards: readonly Card[];
}

/** Grille de cartes. */
export function CardGrid({ cards }: CardGridProps) {
  return (
    <ul className={styles.grid} aria-label="Cartes obtenues">
      {cards.map((card, position) => (
        // Clé = position : une même carte peut apparaître plusieurs fois dans un booster.
        <li key={position} className={styles.item}>
          <CardPlaceholder card={card} />
        </li>
      ))}
    </ul>
  );
}
