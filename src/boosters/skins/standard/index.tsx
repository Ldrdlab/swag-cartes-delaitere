/**
 * Skin « standard » : un paquet dessiné en CSS à partir d'un thème (aucune image).
 *
 * Anatomie, de haut en bas (référence 172 × 320) :
 *   HAUT (60) : sertis 14 · bandeau 42 (« SWAG » + badge du code) · fine bande brillante 4
 *   CORPS (260) : illustration du thème (avec le titre sur 2 lignes et la pastille de saison en bas)
 *                 · sertis du bas 14
 * Les ombres latérales (clair à gauche, sombre à droite) donnent l'effet de volume.
 * Expose : le composant `SkinStandard`.
 * Dépend de : react, boosters/effets, boosters/skins/types, content/textes, Standard.module.css.
 */
import type { CSSProperties } from 'react';
import { TEXTES } from '../../../content/textes';
import { Sertis } from '../../effets';
import type { PropsSkin } from '../types';
import styles from './Standard.module.css';

/** Skin standard (voir le commentaire d'en-tête). */
export function SkinStandard({ theme, partie }: PropsSkin) {
  const { couleurs } = theme;
  // Les couleurs du thème sont transmises au CSS sous forme de variables.
  const variables = {
    '--couleur-sertis': couleurs.sertis,
    '--paquet-debut': couleurs.paquetDebut,
    '--paquet-fin': couleurs.paquetFin,
    '--lueur': couleurs.lueur,
  } as CSSProperties;

  return (
    <div className={styles.paquet} style={variables}>
      {partie !== 'corps' && (
        <div className={styles.haut}>
          <Sertis theme={theme} />
          <div className={styles.bandeau}>
            {/* Le mot de la marque est le même que sur l'écran d'accueil. */}
            <span className={`${styles.marque} ${styles.contour}`}>{TEXTES.accueil.titre}</span>
            <span className={styles.badge}>{theme.code}</span>
          </div>
          <div className={styles.bandeBrillante} />
        </div>
      )}
      {partie !== 'haut' && (
        <div className={styles.corps}>
          <div
            className={styles.illustration}
            style={{ backgroundImage: theme.illustration.join(', ') }}
          >
            <div className={styles.pied}>
              <p className={`${styles.titre} ${styles.contourLueur}`}>
                <span>{theme.ligne1}</span>
                <span>{theme.ligne2}</span>
              </p>
              <span className={styles.saison}>{theme.saison}</span>
            </div>
          </div>
          <Sertis theme={theme} />
        </div>
      )}
      {/* Ombres latérales internes : volume du paquet. */}
      <div className={styles.volume} />
    </div>
  );
}
