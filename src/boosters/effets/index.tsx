/**
 * Effets partagés : foil, sertis, reflet au sol.
 *
 * Rôle : petits composants indépendants des skins, activés par les options du thème
 * (`theme.effets`). BoosterVisuel ajoute le foil et le reflet à TOUTES les skins ; la skin « standard »
 * utilise les sertis.
 * Expose : Foil, Sertis, Reflet.
 * Dépend de : react, config/timings, boosters/themes/types, foil/sertis/reflet.module.css.
 */
import type { CSSProperties } from 'react';
import { FOIL_BALAYAGE_MS } from '../../config/timings';
import type { ThemeBooster } from '../themes/types';
import foil from './foil.module.css';
import reflet from './reflet.module.css';
import sertis from './sertis.module.css';

interface FoilProps {
  theme: ThemeBooster;
  /** Le balayage ne tourne que si vrai (booster au centre) ; sinon seul le voile irisé reste. */
  anime: boolean;
}

/** Reflet holographique. Ne s'affiche que si `theme.effets.foil` est vrai. */
export function Foil({ theme, anime }: FoilProps) {
  if (!theme.effets.foil) return null;
  const style = {
    '--foil-intensite': theme.effets.foilIntensite,
    '--foil-couleur': theme.effets.foilCouleur,
    '--foil-duree': `${FOIL_BALAYAGE_MS}ms`,
  } as CSSProperties;
  return (
    <div className={foil.foil} style={style} aria-hidden="true">
      <div className={foil.voile} />
      {anime ? <div className={foil.balayage} /> : null}
    </div>
  );
}

interface SertisProps {
  theme: ThemeBooster;
}

/** Bord du paquet (14 unités). Strié si `theme.effets.sertis` est vrai, uni sinon. */
export function Sertis({ theme }: SertisProps) {
  const classes = theme.effets.sertis ? `${sertis.sertis} ${sertis.rayure}` : sertis.sertis;
  return <div className={classes} />;
}

interface RefletProps {
  theme: ThemeBooster;
}

/** Reflet au sol sous le paquet. Ne s'affiche que si `theme.effets.reflet` est vrai. */
export function Reflet({ theme }: RefletProps) {
  if (!theme.effets.reflet) return null;
  const style = {
    '--reflet-debut': theme.couleurs.paquetDebut,
    '--reflet-fin': theme.couleurs.paquetFin,
  } as CSSProperties;
  return <div className={reflet.reflet} style={style} aria-hidden="true" />;
}
