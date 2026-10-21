/**
 * Booster placeholder.
 *
 * Rôle : rectangle coloré avec le nom du booster, en attendant les vraies illustrations.
 * La bande sombre du haut a la hauteur de la zone de découpe (config/gestures).
 * Il remplit tout l'espace de son parent (qui fixe la taille).
 * Expose : le composant `BoosterPlaceholder`.
 * Dépend de : domain/types, config/gestures, BoosterPlaceholder.module.css.
 */
import { CUT_THRESHOLDS } from '../../config/gestures';
import type { Booster } from '../../domain/types';
import styles from './BoosterPlaceholder.module.css';

interface BoosterPlaceholderProps {
  booster: Booster;
}

/** Affichage provisoire d'un booster. */
export function BoosterPlaceholder({ booster }: BoosterPlaceholderProps) {
  return (
    <div className={styles.pack} style={{ backgroundColor: booster.color }}>
      <div
        className={styles.cutZone}
        style={{ flexBasis: `${CUT_THRESHOLDS.cutLineYRatio * 100}%` }}
      />
      <span className={styles.name}>{booster.name}</span>
    </div>
  );
}
