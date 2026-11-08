/**
 * Table « effet par défaut selon la rareté » (page « Effets » de l'admin).
 *
 * Rôle : une ligne par cas (rareté, et variante pour Mythique et Secrète) avec une petite carte en image
 * fixe, comme dans une collection, le nom de l'effet et une étiquette quand le changement n'est pas encore
 * enregistré. Choisir une ligne la charge dans l'éditeur.
 * Expose : nomRegle(), EffetsTable.
 * Dépend de : components/Carte, config/cartes, config/raretes, content/*, data/carteDemo,
 * domain/effetsCartes (types), effects, hooks/useEditionEffets, Effets.module.css.
 */
import { Carte } from '../../components/Carte';
import { NOMS_VARIANTES } from '../../config/cartes';
import { RARETES } from '../../config/raretes';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { carteDemo } from '../../data/carteDemo';
import type { RegleEffet } from '../../domain/effetsCartes';
import { trouverEffet } from '../../effects';
import { memeRegle } from '../../hooks/useEditionEffets';
import styles from './Effets.module.css';

/** Nom d'une règle : rareté, et variante si elle existe. */
export function nomRegle(regle: RegleEffet): string {
  const t = TEXTES.admin.effets;
  const rarete = RARETES[regle.rarete].nom;
  return regle.variante
    ? remplir(t.avecVariante, { rarete, variante: NOMS_VARIANTES[regle.variante] })
    : remplir(t.sansVariante, { rarete });
}

interface Props {
  brouillons: readonly RegleEffet[];
  enregistrees: readonly RegleEffet[];
  choisie: number;
  onChoisir: (rang: number) => void;
}

export function EffetsTable({ brouillons, enregistrees, choisie, onChoisir }: Props) {
  const t = TEXTES.admin.effets;
  return (
    <ul className={styles.table}>
      {brouillons.map((regle, rang) => {
        const modifie = enregistrees[rang] !== undefined && !memeRegle(regle, enregistrees[rang]);
        return (
          <li key={`${regle.rarete}-${regle.variante ?? ''}`}>
            <button
              type="button"
              className={styles.ligne}
              aria-pressed={rang === choisie}
              onClick={() => onChoisir(rang)}
            >
              <span className={styles.miniature}>
                <Carte
                  carte={carteDemo(regle.rarete, regle.variante, 'aucun')}
                  decorative
                  effet={{
                    cle: regle.cle,
                    intensite: regle.params.intensite ?? 100,
                    zone: regle.params.zone,
                    reglages: regle.params.reglages,
                    origine: 'automatique',
                  }}
                />
              </span>
              <span className={styles.nom}>{nomRegle(regle)}</span>
              <span className={styles.effet}>{trouverEffet(regle.cle).nom}</span>
              {modifie && <span className={styles.modifie}>{t.nonEnregistre}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
