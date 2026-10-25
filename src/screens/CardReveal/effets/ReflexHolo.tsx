/**
 * Reflet holographique qui balaie une carte.
 *
 * Rôle : une bande de lumière diagonale traverse la carte en boucle (3,8 s), avec un très léger voile
 * irisé fixe. Décoratif : ignoré des lecteurs d'écran et des touchers.
 * Les rayons et le reflet sont suspendus quand la page n'est pas visible (voir CardReveal).
 * Expose : le composant `ReflexHolo`.
 * Dépend de : react, config/revelation, ReflexHolo.module.css.
 */
import type { CSSProperties } from 'react';
import { REFLET_DUREE_MS } from '../../../config/revelation';
import styles from './ReflexHolo.module.css';

/** Reflet holographique (à poser dans un parent en `position: relative`). */
export function ReflexHolo() {
  const style = { '--duree-reflet': `${REFLET_DUREE_MS}ms` } as CSSProperties;
  return (
    <div className={styles.reflet} style={style} aria-hidden="true">
      <div className={styles.voile} />
      <div className={styles.balayage} />
    </div>
  );
}
