/**
 * Booster placeholder.
 *
 * Rôle : rectangle coloré avec le nom du booster, en attendant les vraies illustrations.
 * Il remplit tout l'espace de son parent (qui fixe la taille).
 * Expose : le composant `BoosterPlaceholder`.
 * Dépend de : domain/types, BoosterPlaceholder.module.css.
 */
import type { Booster } from '../../domain/types';
import styles from './BoosterPlaceholder.module.css';

interface BoosterPlaceholderProps {
  booster: Booster;
}

/** Affichage provisoire d'un booster. */
export function BoosterPlaceholder({ booster }: BoosterPlaceholderProps) {
  return (
    <div className={styles.pack} style={{ backgroundColor: booster.color }}>
      <div className={styles.cutZone} />
      <span className={styles.name}>{booster.name}</span>
    </div>
  );
}
