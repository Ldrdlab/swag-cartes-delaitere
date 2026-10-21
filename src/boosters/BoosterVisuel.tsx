/**
 * LE composant d'affichage d'un booster : tous les écrans l'utilisent, aucun ne dessine un booster
 * autrement.
 *
 * Rôle : lire la skin du booster dans le registre et l'afficher, à la bonne taille, avec les effets
 * (foil, reflet au sol) activés par le thème. Il remplit la largeur de son parent (ou prend la
 * `largeur` demandée) ; la hauteur en découle (rapport 172 : 320).
 * `partie` permet d'afficher seulement le haut ou le corps (écran d'ouverture).
 * Le booster est décoratif pour les lecteurs d'écran : c'est l'écran qui l'étiquette.
 * Expose : le composant `BoosterVisuel`.
 * Dépend de : react, boosters/catalogue (type), boosters/skins/registre, boosters/effets,
 * hooks/useElementSize, config/boosters, BoosterVisuel.module.css.
 */
import type { CSSProperties } from 'react';
import { HAUTEUR_HAUT_REFERENCE, HAUTEUR_REFERENCE, LARGEUR_REFERENCE } from '../config/boosters';
import { useElementSize } from '../hooks/useElementSize';
import type { BoosterCatalogue } from './catalogue';
import { Foil, Reflet } from './effets';
import { SKINS } from './skins/registre';
import type { EtatBooster, PartieBooster } from './skins/types';
import styles from './BoosterVisuel.module.css';

interface BoosterVisuelProps {
  /** Le booster à afficher (une ligne du catalogue). */
  booster: BoosterCatalogue;
  /** Où se trouve le booster à l'écran (centre, côté, confirmation, ouverture). */
  etat: EtatBooster;
  /** Quelle partie afficher : tout (par défaut), seulement le haut, ou seulement le corps. */
  partie?: PartieBooster;
  /** Largeur en pixels. Sans elle, le booster prend toute la largeur de son parent. */
  largeur?: number;
}

/** Hauteur de chaque partie, en unités de référence. */
const HAUTEURS: Record<PartieBooster, number> = {
  complet: HAUTEUR_REFERENCE,
  haut: HAUTEUR_HAUT_REFERENCE,
  corps: HAUTEUR_REFERENCE - HAUTEUR_HAUT_REFERENCE,
};

/** Le balayage du foil ne tourne que pour un booster « mis en avant » (centre du carrousel, confirmation). */
const ETATS_MIS_EN_AVANT: readonly EtatBooster[] = ['centre', 'confirmation'];

/** Affichage d'un booster (voir le commentaire d'en-tête). */
export function BoosterVisuel({ booster, etat, partie = 'complet', largeur }: BoosterVisuelProps) {
  const { ref, width: largeurMesuree } = useElementSize<HTMLDivElement>();
  const largeurAffichee = largeur ?? largeurMesuree;
  const unite = largeurAffichee / LARGEUR_REFERENCE;
  const Skin = SKINS[booster.skin];
  const { theme } = booster;
  const misEnAvant = ETATS_MIS_EN_AVANT.includes(etat);

  const variables = {
    '--u': `${unite}px`,
    '--nb-hauteur': HAUTEURS[partie],
    '--couleur-ombre': theme.couleurs.ombre,
    ...(largeur ? { width: largeur } : {}),
  } as CSSProperties;

  return (
    <div ref={ref} className={styles.racine} style={variables} aria-hidden="true">
      <div className={styles.paquet} data-partie={partie}>
        <Skin theme={theme} etat={etat} partie={partie} unite={unite} />
        <Foil theme={theme} anime={misEnAvant} />
      </div>
      {/* Reflet au sol : seulement sous le booster au centre du carrousel. */}
      {etat === 'centre' && partie !== 'haut' ? <Reflet theme={theme} /> : null}
    </div>
  );
}
