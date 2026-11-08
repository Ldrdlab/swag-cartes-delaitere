/**
 * Éclat sobre de révélation (raretés élevées).
 *
 * Rôle : un éclair de lumière doux qui passe sur la carte au moment où elle se retourne : un seul
 * passage, puis la carte reste telle quelle. Seule l'opacité change (`opacity`) ; coupé par « Effets
 * réduits » et par le réglage système « réduire les animations » (voir CarteRecto et le CSS).
 * Réglages : config/effets.ts (REVELATION_EFFETS, GEOMETRIE_ZONES).
 * Expose : le composant `EclatRevelation`.
 * Dépend de : react, config/effets, domain/effetsCartes, EclatRevelation.module.css.
 */
import type { CSSProperties } from 'react';
import { GEOMETRIE_ZONES, REVELATION_EFFETS } from '../../../config/effets';
import { zoneVersClipPath } from '../../../domain/effetsCartes';
import styles from './EclatRevelation.module.css';

/** Éclat posé sur la carte (à l'intérieur du cadre). */
export function EclatRevelation() {
  const variables = {
    '--eclat-duree': `${REVELATION_EFFETS.dureeMs}ms`,
    '--eclat-force': String(REVELATION_EFFETS.force),
    '--eclat-couleur': REVELATION_EFFETS.couleur,
    clipPath: zoneVersClipPath('interieur', GEOMETRIE_ZONES),
  } as CSSProperties;
  return <div className={styles.eclat} style={variables} aria-hidden="true" />;
}
