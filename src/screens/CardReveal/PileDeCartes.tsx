/**
 * Pile de dos de cartes derrière la carte courante.
 *
 * Rôle : montrer qu'il reste des cartes à découvrir : 1 à 2 dos empilés derrière la carte, décalés
 * vers le bas (10 px et 20 px), réduits (96,5 % et 93 %) et assombris. Les valeurs sont dans
 * config/revelation.ts. Le conteneur prend la taille de la carte ; la carte courante est passée en
 * `children`, posée par-dessus.
 * Expose : le composant `PileDeCartes`.
 * Dépend de : react, config/revelation, CarteVerso, PileDeCartes.module.css.
 */
import type { CSSProperties, ReactNode } from 'react';
import { PILE } from '../../config/revelation';
import { CarteVerso } from './CarteVerso';
import styles from './PileDeCartes.module.css';

interface PileDeCartesProps {
  /** Nombre de cartes qui restent APRÈS la carte courante. */
  cartesRestantes: number;
  /** Dos propre au booster (champ `dosImage` du thème), sinon le dos commun. */
  dosImage?: string;
  /** La carte courante, posée par-dessus la pile. */
  children: ReactNode;
}

/** Pile de dos de cartes. */
export function PileDeCartes({ cartesRestantes, dosImage, children }: PileDeCartesProps) {
  const nombreDeDos = Math.min(PILE.dosVisibles, cartesRestantes, PILE.decalagesPx.length);
  // On dessine d'abord le dos le plus lointain, pour qu'il passe derrière les autres.
  const rangs = Array.from({ length: nombreDeDos }, (_, rang) => nombreDeDos - 1 - rang);

  return (
    <div className={styles.pile}>
      {rangs.map((rang) => {
        const variables = {
          '--decalage': `${PILE.decalagesPx[rang] ?? 0}px`,
          '--echelle': PILE.echelles[rang] ?? 1,
          '--assombrissement': PILE.assombrissements[rang] ?? 0,
        } as CSSProperties;
        return (
          <div key={rang} className={styles.dos} style={variables} aria-hidden="true">
            <CarteVerso dosImage={dosImage} />
            <div className={styles.ombre} />
          </div>
        );
      })}
      <div className={styles.courante}>{children}</div>
    </div>
  );
}
