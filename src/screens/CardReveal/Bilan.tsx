/**
 * Bilan de l'ouverture.
 *
 * Rôle : « Ouverture terminée ! », le nom du booster et le nombre de cartes, puis « Tes meilleures
 * cartes » (les 3 plus rares, triées par rareté décroissante, 96 px de large, avec nom et badge, une
 * lueur autour des super rares et légendaires) et « Autres cartes » (les suivantes, 72 px, nom seul).
 * Deux boutons : « Ouvrir un autre booster » et « Accueil ». Le tri est fait par domain/bilan.
 * Expose : le composant `Bilan`.
 * Dépend de : react, domain/bilan, config/raretes, config/revelation, content/textes,
 * content/formatTexte, CarteRecto, BadgeRarete, Bilan.module.css.
 */
import { useMemo, type CSSProperties } from 'react';
import { RARETES } from '../../config/raretes';
import { BILAN } from '../../config/revelation';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { composerBilan } from '../../domain/bilan';
import type { CarteTiree } from '../../domain/types';
import { BadgeRarete } from './BadgeRarete';
import styles from './Bilan.module.css';
import { CarteRecto } from './CarteRecto';

interface BilanProps {
  /** Cartes du booster, dans l'ordre du tirage. */
  cartes: readonly CarteTiree[];
  /** Nom du booster ouvert. */
  nomBooster: string;
  onOuvrirAutre: () => void;
  onAccueil: () => void;
}

interface MiniatureProps {
  carte: CarteTiree;
  largeur: number;
  /** Affiche le badge de rareté sous le nom. */
  avecBadge: boolean;
}

/** Une carte en miniature avec son nom (et son badge). */
function Miniature({ carte, largeur, avecBadge }: MiniatureProps) {
  const rarete = RARETES[carte.rarity];
  const lueur =
    rarete.lueurBilan && rarete.halo
      ? ({ '--lueur-bilan': rarete.halo.couleur } as CSSProperties)
      : undefined;
  return (
    <li className={styles.miniature} style={{ width: largeur }}>
      <div className={styles.carte} data-lueur={rarete.lueurBilan} style={lueur}>
        <CarteRecto carte={carte} taille="miniature" avecReflet={false} />
      </div>
      <p className={styles.nomCarte}>{carte.name}</p>
      {avecBadge ? <BadgeRarete rarete={carte.rarity} petit /> : null}
      {carte.nouvelle && <span className={styles.nouvelle}>{TEXTES.revelation.nouvelle}</span>}
    </li>
  );
}

/** Écran de bilan (voir le commentaire d'en-tête). */
export function Bilan({ cartes, nomBooster, onOuvrirAutre, onAccueil }: BilanProps) {
  const textes = TEXTES.revelation;
  const { meilleures, autres } = useMemo(() => composerBilan(cartes, BILAN.meilleures), [cartes]);

  return (
    <section className={styles.bilan}>
      <div className={styles.contenu}>
        <h2 className={styles.titre}>{textes.bilanTitre}</h2>
        <p className={styles.sousTitre}>
          {remplir(textes.bilanSousTitre, { booster: nomBooster, nombre: String(cartes.length) })}
        </p>

        <h3 className={styles.rubrique}>{textes.meilleuresCartes}</h3>
        <ul className={styles.rangee}>
          {meilleures.map((carte, rang) => (
            <Miniature key={rang} carte={carte} largeur={BILAN.largeurMeilleuresPx} avecBadge />
          ))}
        </ul>

        {autres.length > 0 ? (
          <>
            <h3 className={styles.rubrique}>{textes.autresCartes}</h3>
            <ul className={styles.rangee}>
              {autres.map((carte, rang) => (
                <Miniature
                  key={rang}
                  carte={carte}
                  largeur={BILAN.largeurAutresPx}
                  avecBadge={false}
                />
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className={styles.boutons}>
        <button type="button" className={styles.autre} onClick={onOuvrirAutre}>
          {textes.ouvrirAutre}
        </button>
        <button type="button" className={styles.accueil} onClick={onAccueil}>
          {textes.accueil}
        </button>
      </div>
    </section>
  );
}
