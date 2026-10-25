/**
 * Dos d'une carte (le même visuel pour toutes les cartes).
 *
 * Rôle : afficher l'image du dos. Pour une carte à animation d'attente (légendaire), une lueur dorée
 * monte progressivement sur le dos pendant que la carte tremble.
 * Expose : le composant `CarteVerso`.
 * Dépend de : react, config/revelation, screens/CardReveal/imagesCartes, CarteVerso.module.css.
 */
import type { CSSProperties } from 'react';
import { DUREES, LUEUR_DOS } from '../../config/revelation';
import { urlDosCarte } from './imagesCartes';
import styles from './CarteVerso.module.css';

interface CarteVersoProps {
  /** Nom du fichier de dos propre au booster (champ `dosImage` du thème), sinon le dos commun. */
  dosImage?: string;
  /** Cette carte a-t-elle une animation d'attente (lueur dorée possible) ? */
  avecLueur?: boolean;
  /** La lueur est-elle allumée ? Elle monte progressivement quand ça devient vrai. */
  lueurAllumee?: boolean;
}

/** Dos de carte. */
export function CarteVerso({ dosImage, avecLueur = false, lueurAllumee = false }: CarteVersoProps) {
  const variables = {
    '--lueur-centre': LUEUR_DOS.couleurCentre,
    '--lueur-milieu': LUEUR_DOS.couleurMilieu,
    '--lueur-opacite-max': LUEUR_DOS.opaciteMax,
    '--duree-lueur': `${DUREES.teaseMs}ms`,
  } as CSSProperties;

  return (
    <div className={styles.verso} style={variables}>
      <img className={styles.image} src={urlDosCarte(dosImage)} alt="" draggable={false} />
      {avecLueur ? <div className={styles.lueur} data-allumee={lueurAllumee} /> : null}
    </div>
  );
}
