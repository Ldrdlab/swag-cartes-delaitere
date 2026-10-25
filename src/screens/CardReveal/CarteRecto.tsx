/**
 * Face d'une carte (recto).
 *
 * Rôle : afficher une carte avec les couleurs de sa rareté (config/raretes.ts) : étoiles, zone image
 * (photo si `imageUrl`, sinon pictogramme « Photo à venir »), trois barres grises de description et
 * pied « SWAG · 004 / 120 ». Un reflet holographique balaie les raretés qui en ont un.
 * Toutes les mesures sont en « unités de carte » (une carte de 228 px de large = 1 unité par pixel),
 * donc le recto reste net de la grande carte aux miniatures du bilan.
 * Expose : le composant `CarteRecto`.
 * Dépend de : react, hooks/useElementSize, components/Icon, config/raretes, config/revelation,
 * content/textes, content/formatTexte, domain/types, effets/ReflexHolo, CarteRecto.module.css.
 */
import type { CSSProperties } from 'react';
import { Icon } from '../../components/Icon';
import { RARETES } from '../../config/raretes';
import { RATIO_CARTE, TAILLE_CARTE } from '../../config/revelation';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import type { Card } from '../../domain/types';
import { useElementSize } from '../../hooks/useElementSize';
import { ReflexHolo } from './effets/ReflexHolo';
import styles from './CarteRecto.module.css';

interface CarteRectoProps {
  carte: Card;
  /** Numéro de la carte dans la collection (affiché au pied). */
  numero: number;
  /** Nombre de cartes de la collection (affiché au pied). */
  totalCollection: number;
  /** Affiche le reflet holographique (pour les raretés qui en ont un). */
  avecReflet?: boolean;
}

/** Recto d'une carte. */
export function CarteRecto({ carte, numero, totalCollection, avecReflet = true }: CarteRectoProps) {
  const rarete = RARETES[carte.rarity];
  const { ref, width } = useElementSize<HTMLDivElement>();
  const couleurs = rarete.couleurs;
  const variables = {
    '--uc': `${width / TAILLE_CARTE.largeurPx}px`,
    '--bordure': couleurs.bordure,
    '--fond-carte': couleurs.fondCarte,
    '--fond-image': couleurs.fondImage,
    '--couleur-etoiles': couleurs.etoiles,
    aspectRatio: String(RATIO_CARTE),
  } as CSSProperties;
  const pied = remplir(TEXTES.revelation.pied, {
    numero: String(numero).padStart(3, '0'),
    total: String(totalCollection).padStart(3, '0'),
  });

  return (
    <div ref={ref} className={styles.recto} style={variables}>
      <p className={styles.etoiles} aria-hidden="true">
        {'★'.repeat(rarete.etoiles)}
      </p>
      <div className={styles.zoneImage}>
        {carte.imageUrl ? (
          <img className={styles.photo} src={carte.imageUrl} alt="" draggable={false} />
        ) : (
          <div className={styles.aVenir}>
            <span className={styles.pictogramme}>
              <Icon nom="appareil-photo" />
            </span>
            <span>{TEXTES.revelation.photoAVenir}</span>
          </div>
        )}
      </div>
      <div className={styles.barres} aria-hidden="true">
        <span className={styles.barre} />
        <span className={`${styles.barre} ${styles.barreMoyenne}`} />
        <span className={`${styles.barre} ${styles.barreCourte}`} />
      </div>
      <p className={styles.pied}>{pied}</p>
      {avecReflet && rarete.reflet ? <ReflexHolo /> : null}
    </div>
  );
}
