/**
 * Halo lumineux derrière la carte.
 *
 * Rôle : une grande lueur de la couleur de la rareté, derrière la carte. Pour une carte à animation
 * d'attente, le halo grossit et apparaît pendant le tremblement ; sinon il apparaît au retournement.
 * Décoratif : ignoré des lecteurs d'écran et des touchers.
 * Expose : le composant `Halo`.
 * Dépend de : react, config/raretes (type), config/revelation, Halo.module.css.
 */
import type { CSSProperties } from 'react';
import type { HaloRarete } from '../../../config/raretes';
import { HALO } from '../../../config/revelation';
import styles from './Halo.module.css';

interface HaloProps {
  /** Halo de la rareté de la carte (config/raretes.ts). */
  halo: HaloRarete;
  /** Le halo est-il allumé ? */
  visible: boolean;
  /** Durée de l'apparition (ms). */
  dureeMs: number;
}

/** Halo derrière la carte. */
export function Halo({ halo, visible, dureeMs }: HaloProps) {
  const variables = {
    '--halo-couleur': halo.couleur,
    '--halo-opacite': halo.opacite,
    '--halo-taille': `${HALO.taillePx}px`,
    '--halo-echelle-depart': HALO.echelleDepart,
    '--halo-duree': `${dureeMs}ms`,
  } as CSSProperties;
  return (
    <div className={styles.halo} style={variables} data-visible={visible} aria-hidden="true" />
  );
}
