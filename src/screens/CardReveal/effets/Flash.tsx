/**
 * Flash blanc-doré plein écran (retournement d'une carte légendaire).
 *
 * Rôle : un éclair qui couvre tout l'écran pendant 800 ms, avec son pic de luminosité à 45 % de la
 * durée, donc au milieu du retournement. L'animation est lancée à l'affichage et ne capte aucun
 * toucher. Réglages : config/revelation.ts (FLASH, DUREES).
 * Expose : le composant `Flash`.
 * Dépend de : react, config/revelation, Flash.module.css.
 */
import { useEffect, useRef, type CSSProperties } from 'react';
import { DUREES, FLASH } from '../../../config/revelation';
import styles from './Flash.module.css';

/** Flash plein écran. */
export function Flash() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof element.animate !== 'function') return;
    // Les images-clés sont construites ici car le pic (45 %) vient de la configuration.
    const animation = element.animate(
      [
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: FLASH.picPourcent / 100 },
        { opacity: 0, offset: 1 },
      ],
      { duration: DUREES.flashMs, easing: 'ease-out', fill: 'both' },
    );
    return () => animation.cancel();
  }, []);

  const variables = {
    '--flash-centre': FLASH.couleurCentre,
    '--flash-bord': FLASH.couleurBord,
  } as CSSProperties;
  return <div ref={ref} className={styles.flash} style={variables} aria-hidden="true" />;
}
