/**
 * Paquet découpé qui s'efface vers le bas à l'arrivée sur l'écran.
 *
 * Rôle : transition depuis l'ouverture du booster : le corps du paquet (le haut a déjà été détaché)
 * glisse vers le bas en s'effaçant pendant 300 ms, tandis que la pile de dos monte à sa place. Il se
 * retire ensuite tout seul. Décoratif : ignoré des lecteurs d'écran et des touchers.
 * Expose : le composant `PaquetSortant`.
 * Dépend de : react, boosters/BoosterVisuel, config/revelation, PaquetSortant.module.css.
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { BoosterVisuel } from '../../boosters/BoosterVisuel';
import type { BoosterCatalogue } from '../../boosters/catalogue';
import { DUREES } from '../../config/revelation';
import styles from './PaquetSortant.module.css';

interface PaquetSortantProps {
  booster: BoosterCatalogue;
}

/** Paquet qui s'efface (voir le commentaire d'en-tête). */
export function PaquetSortant({ booster }: PaquetSortantProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const minuterie = window.setTimeout(() => setVisible(false), DUREES.sortiePaquetMs);
    return () => window.clearTimeout(minuterie);
  }, []);

  if (!visible) return null;
  const style = { '--duree-sortie': `${DUREES.sortiePaquetMs}ms` } as CSSProperties;
  return (
    <div className={styles.paquet} style={style} aria-hidden="true">
      <BoosterVisuel booster={booster} etat="ouverture" partie="corps" />
    </div>
  );
}
