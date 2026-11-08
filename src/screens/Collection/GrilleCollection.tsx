/**
 * Grille des cartes de la collection du joueur.
 *
 * Rôle : une carte possédée s'affiche via <Carte /> (avec « ×N » si plusieurs exemplaires) et s'ouvre en
 * grand au toucher ; une carte pas encore obtenue est un EMPLACEMENT VIDE grisé, sans nom ni visuel
 * (seule sa rareté se devine à la couleur du cadre).
 * Expose : le composant `GrilleCollection`.
 * Dépend de : components/Carte, config/cartes, config/raretes, content/*, domain/collection (type),
 * domain/types (type), Collection.module.css.
 */
import { Carte } from '../../components/Carte';
import { RATIO_CARTE } from '../../config/cartes';
import { RARETES } from '../../config/raretes';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import type { EntreeCollection } from '../../domain/collection';
import type { Card } from '../../domain/types';
import styles from './Collection.module.css';

interface GrilleCollectionProps {
  entrees: readonly EntreeCollection[];
  /** Appelé au toucher d'une carte possédée. */
  onOuvrir: (carte: Card) => void;
}

/** Grille de la collection. */
export function GrilleCollection({ entrees, onOuvrir }: GrilleCollectionProps) {
  const textes = TEXTES.collection;
  return (
    <ul className={styles.grille} aria-label={textes.labelGrille}>
      {entrees.map(({ carte, quantite }) => (
        <li key={carte.id}>
          {quantite > 0 ? (
            <button type="button" className={styles.vignette} onClick={() => onOuvrir(carte)}>
              <Carte carte={carte} taille="miniature" decorative />
              <span className={styles.nomCarte}>{carte.name}</span>
              {quantite > 1 && (
                <span className={styles.quantite}>
                  {remplir(textes.exemplaires, { quantite: String(quantite) })}
                </span>
              )}
            </button>
          ) : (
            <div
              className={styles.emplacement}
              style={{
                aspectRatio: String(RATIO_CARTE),
                borderColor: RARETES[carte.rarity].couleurs.bordure,
              }}
              role="img"
              aria-label={remplir(textes.nonObtenue, { rarete: RARETES[carte.rarity].nom })}
            >
              <span aria-hidden="true">?</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
