/**
 * Carte placeholder.
 *
 * Rôle : afficher une carte (rectangle gris avec son nom et sa rareté) en attendant les vraies
 * illustrations. Si la carte a une `imageUrl`, l'image est affichée. Remplit son parent, qui fixe la taille.
 * Expose : le composant `CardPlaceholder`.
 * Dépend de : domain/types, config/game (libellés de rareté), CardPlaceholder.module.css.
 */
import { RARITY_LABELS } from '../../config/game';
import type { Card } from '../../domain/types';
import styles from './CardPlaceholder.module.css';

interface CardPlaceholderProps {
  card: Card;
}

/** Affichage provisoire d'une carte. */
export function CardPlaceholder({ card }: CardPlaceholderProps) {
  return (
    <div className={styles.card} data-rarity={card.rarity}>
      <span className={styles.rarity}>{RARITY_LABELS[card.rarity]}</span>
      {card.imageUrl ? (
        <img className={styles.image} src={card.imageUrl} alt="" draggable={false} />
      ) : null}
      <span className={styles.name}>{card.name}</span>
    </div>
  );
}
