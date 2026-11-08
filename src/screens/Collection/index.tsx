/**
 * Onglet « Collection » du joueur.
 *
 * Rôle : montrer toutes les cartes du jeu : celles que le joueur possède (avec la quantité) et des
 * emplacements vides grisés pour les autres. Progression « X / Y cartes », compteur par rareté, filtre par
 * rareté et vue agrandie d'une carte possédée. La logique est dans domain/collection.
 * Expose : le composant `CollectionScreen`.
 * Dépend de : react, components/Button, components/PageOnglet, config/raretes, content/*,
 * domain/collection, domain/types, hooks/useCollectionJoueur, screens/Admin/CarteDetail, EtatSection
 * (Admin), GrilleCollection, Collection.module.css.
 */
import { useMemo, useState } from 'react';
import { PageOnglet } from '../../components/PageOnglet';
import { RARETES } from '../../config/raretes';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import {
  filtrerParRarete,
  progression,
  progressionParRarete,
  trierEntrees,
} from '../../domain/collection';
import { RARITIES, type Rarity } from '../../domain/types';
import { useCollectionJoueur } from '../../hooks/useCollectionJoueur';
import { CarteDetail } from '../Admin/CarteDetail';
import { EtatSection } from '../Admin/EtatSection';
import styles from './Collection.module.css';
import { GrilleCollection } from './GrilleCollection';

/** Collection du joueur. */
export function CollectionScreen() {
  const textes = TEXTES.collection;
  const { etat, recharger } = useCollectionJoueur();
  const [rarete, setRarete] = useState<Rarity | 'toutes'>('toutes');
  const [selectionId, setSelectionId] = useState<string | null>(null);

  const entrees = useMemo(() => (etat.statut === 'pret' ? etat.donnees : []), [etat]);
  const total = progression(entrees);
  const parRarete = useMemo(() => progressionParRarete(entrees), [entrees]);
  const visibles = useMemo(
    () => trierEntrees(filtrerParRarete(entrees, rarete)),
    [entrees, rarete],
  );
  const selection = entrees.find((entree) => entree.carte.id === selectionId) ?? null;
  const pourcentage = total.total === 0 ? 0 : Math.round((total.possedees / total.total) * 100);

  return (
    <PageOnglet
      titre={textes.titre}
      complement={
        etat.statut === 'pret'
          ? remplir(textes.progression, {
              possedees: String(total.possedees),
              total: String(total.total),
            })
          : undefined
      }
    >
      <EtatSection etat={etat} onReessayer={recharger}>
        {() => (
          <>
            <div
              className={styles.barre}
              role="progressbar"
              aria-label={textes.labelProgression}
              aria-valuemin={0}
              aria-valuemax={total.total}
              aria-valuenow={total.possedees}
            >
              <div className={styles.remplissage} style={{ width: `${pourcentage}%` }} />
            </div>

            <ul className={styles.compteurs} aria-label={textes.labelCompteurs}>
              {RARITIES.map((cle) => (
                <li
                  key={cle}
                  className={parRarete[cle].total === 0 ? styles.compteurVide : styles.compteur}
                  style={{ borderColor: RARETES[cle].couleurs.bordure }}
                >
                  {RARETES[cle].nom}{' '}
                  <strong>
                    {remplir(textes.compteurRarete, {
                      possedees: String(parRarete[cle].possedees),
                      total: String(parRarete[cle].total),
                    })}
                  </strong>
                </li>
              ))}
            </ul>

            <select
              className={styles.filtre}
              aria-label={textes.labelFiltre}
              value={rarete}
              onChange={(event) => setRarete(event.target.value as Rarity | 'toutes')}
            >
              <option value="toutes">{textes.toutesRaretes}</option>
              {RARITIES.map((cle) => (
                <option key={cle} value={cle}>
                  {RARETES[cle].nom}
                </option>
              ))}
            </select>

            {entrees.length === 0 && <p className={styles.message}>{textes.vide}</p>}
            {entrees.length > 0 && visibles.length === 0 && (
              <p className={styles.message}>{textes.videFiltre}</p>
            )}
            <GrilleCollection entrees={visibles} onOuvrir={(carte) => setSelectionId(carte.id)} />
          </>
        )}
      </EtatSection>

      {selection && selection.quantite > 0 && (
        <CarteDetail
          key={selection.carte.id}
          carte={selection.carte}
          admin={null}
          quantite={selection.quantite}
          onFermer={() => setSelectionId(null)}
        />
      )}
    </PageOnglet>
  );
}
