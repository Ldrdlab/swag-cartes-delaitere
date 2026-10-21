/**
 * Commandes sous le carrousel : flèche précédent, nom du booster courant avec ses indicateurs de
 * position, flèche suivant.
 *
 * Rôle : présentation pure. Boutons ronds de 46 px ; le nom est annoncé aux lecteurs d'écran
 * à chaque changement.
 * Expose : le composant `Controles`.
 * Dépend de : components/Icon, content/textes, content/formatTexte, BoosterSelect.module.css.
 */
import { Icon } from '../../components/Icon';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import styles from './BoosterSelect.module.css';

interface ControlesProps {
  /** Nom du booster au centre. */
  nom: string;
  /** Position du booster au centre, à partir de 0. */
  position: number;
  /** Nombre de boosters. */
  total: number;
  onPrecedent: () => void;
  onSuivant: () => void;
}

/** Flèches, nom et indicateurs de position. */
export function Controles({ nom, position, total, onPrecedent, onSuivant }: ControlesProps) {
  const textes = TEXTES.choixBooster;
  return (
    <div className={styles.controles}>
      <button
        type="button"
        className={styles.fleche}
        aria-label={textes.labelPrecedent}
        onClick={onPrecedent}
      >
        <span className={styles.gauche}>
          <Icon nom="chevron" />
        </span>
      </button>

      <div className={styles.centre}>
        <p className={styles.nom} aria-live="polite">
          {nom}
          <span className={styles.masque}>
            , {remplir(textes.position, { numero: String(position + 1), total: String(total) })}
          </span>
        </p>
        {/* Indicateurs purement visuels : le nom et la position sont déjà annoncés ci-dessus. */}
        <div className={styles.points} aria-hidden="true">
          {Array.from({ length: total }, (_, rang) => (
            <span key={rang} className={styles.point} data-actif={rang === position} />
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.fleche}
        aria-label={textes.labelSuivant}
        onClick={onSuivant}
      >
        <Icon nom="chevron" />
      </button>
    </div>
  );
}
