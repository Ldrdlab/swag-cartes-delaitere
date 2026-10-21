/**
 * Trace de la découpe.
 *
 * Rôle : dessiner en temps réel la ligne suivie par le doigt ou la souris. Se superpose au booster
 * (même repère en pixels que les coordonnées du geste) et ne capte aucun événement.
 * Expose : le composant `CutTrail`.
 * Dépend de : domain/cutGesture (type Point), CutTrail.module.css.
 */
import type { Point } from '../../domain/cutGesture';
import styles from './CutTrail.module.css';

interface CutTrailProps {
  /** Points à relier, relatifs au coin haut-gauche du booster. Vide = rien n'est dessiné. */
  points: readonly Point[];
}

/** Ligne de trace superposée au booster. */
export function CutTrail({ points }: CutTrailProps) {
  if (points.length < 2) return null;
  const path = points.map((point) => `${point.x},${point.y}`).join(' ');
  return (
    <svg className={styles.trail} aria-hidden="true">
      <polyline points={path} className={styles.line} />
    </svg>
  );
}
