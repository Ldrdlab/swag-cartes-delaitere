/**
 * En-tête de la révélation : nom du booster, bouton « Passer » et progression.
 *
 * Rôle : en haut de l'écran, le nom du booster (Lilita One) avec sa saison, le bouton « Passer »
 * (qui saute directement au bilan) et une ligne de segments : un par carte, pleins pour les cartes
 * déjà vues. Présentation pure.
 * Expose : le composant `EnTete`.
 * Dépend de : react, content/textes, content/formatTexte, EnTete.module.css.
 */
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import styles from './EnTete.module.css';

interface EnTeteProps {
  /** Nom du booster. */
  nomBooster: string;
  /** Saison du booster (ex. « Saison 1 »). */
  saison: string;
  /** Nombre de cartes du booster. */
  total: number;
  /** Nombre de cartes déjà vues (segments pleins). */
  vues: number;
  /** Affiche le bouton « Passer » (caché au bilan). */
  avecPasser: boolean;
  onPasser: () => void;
}

/** En-tête de l'écran de révélation. */
export function EnTete({ nomBooster, saison, total, vues, avecPasser, onPasser }: EnTeteProps) {
  const textes = TEXTES.revelation;
  return (
    <header className={styles.enTete}>
      <div className={styles.ligne}>
        <div className={styles.titres}>
          <p className={styles.nom}>{nomBooster}</p>
          <p className={styles.saison}>{saison}</p>
        </div>
        {avecPasser ? (
          <button
            type="button"
            className={styles.passer}
            aria-label={textes.passerLabel}
            onClick={onPasser}
          >
            {textes.passer}
          </button>
        ) : null}
      </div>
      <div
        className={styles.progression}
        role="img"
        aria-label={remplir(textes.labelProgression, {
          numero: String(Math.min(vues, total)),
          total: String(total),
        })}
      >
        {Array.from({ length: total }, (_, rang) => (
          <span key={rang} className={styles.segment} data-vu={rang < vues} />
        ))}
      </div>
    </header>
  );
}
