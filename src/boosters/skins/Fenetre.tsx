/**
 * « Fenêtre » sur un paquet complet : permet de n'afficher que le haut ou que le corps.
 *
 * Rôle : les skins « image » et « exemple-ultra » dessinent le paquet ENTIER (une image, des calques).
 * Pour respecter le contrat (deux parties séparées), on le place derrière une fenêtre :
 *   - `complet` : on voit tout ;
 *   - `haut`    : la fenêtre ne montre que les 60 premières unités ;
 *   - `corps`   : la scène est remontée de 60 unités, la fenêtre montre le reste.
 * Expose : le composant `Fenetre`.
 * Dépend de : react, config/boosters, boosters/skins/types, Fenetre.module.css.
 */
import type { ReactNode } from 'react';
import { HAUTEUR_HAUT_REFERENCE, HAUTEUR_REFERENCE } from '../../config/boosters';
import type { PartieBooster } from './types';
import styles from './Fenetre.module.css';

interface FenetreProps {
  /** Quelle partie du paquet laisser visible. */
  partie: PartieBooster;
  /** Le paquet entier (taille de référence × unité), dessiné en dessous. */
  children: ReactNode;
}

/** Fenêtre qui découpe un paquet complet en haut / corps. */
export function Fenetre({ partie, children }: FenetreProps) {
  const decalage = partie === 'corps' ? -HAUTEUR_HAUT_REFERENCE : 0;
  return (
    <div className={styles.fenetre}>
      <div
        className={styles.scene}
        style={{
          height: `calc(${HAUTEUR_REFERENCE} * var(--u))`,
          transform: `translateY(calc(${decalage} * var(--u)))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
