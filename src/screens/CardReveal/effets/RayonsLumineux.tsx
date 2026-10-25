/**
 * Rayons de lumière qui tournent lentement derrière la carte (carte légendaire).
 *
 * Rôle : traits dorés de 6° tous les 22°, adoucis vers le bord par un masque, qui font un tour en 16 s.
 * Ils apparaissent progressivement pendant l'attente (opacity) et restent une fois la carte retournée.
 * Réglages : config/revelation.ts. Décoratif : ignoré des lecteurs d'écran et des touchers.
 * Expose : le composant `RayonsLumineux`.
 * Dépend de : react, config/revelation, RayonsLumineux.module.css.
 */
import type { CSSProperties } from 'react';
import { RAYONS } from '../../../config/revelation';
import styles from './RayonsLumineux.module.css';

interface RayonsLumineuxProps {
  /** Les rayons sont-ils allumés ? Ils apparaissent progressivement quand ça devient vrai. */
  visible: boolean;
  /** Durée de l'apparition (ms). */
  dureeMs: number;
}

/** Rayons de lumière tournants. */
export function RayonsLumineux({ visible, dureeMs }: RayonsLumineuxProps) {
  const variables = {
    '--rayons-taille': `${RAYONS.taillePx}px`,
    '--rayons-couleur': RAYONS.couleur,
    '--rayons-trait': `${RAYONS.traitDeg}deg`,
    '--rayons-periode': `${RAYONS.periodeDeg}deg`,
    '--rayons-tour': `${RAYONS.tourS}s`,
    '--rayons-duree': `${dureeMs}ms`,
  } as CSSProperties;
  return (
    <div className={styles.rayons} style={variables} data-visible={visible} aria-hidden="true">
      <div className={styles.tourne} />
    </div>
  );
}
