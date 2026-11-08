/**
 * Recette commune d'Argent et d'Or (Secrète) : métal miroir.
 *
 * Couches : bandes de « studio » (plusieurs reflets qui glissent avec l'angle), teinte du métal,
 * filigrane gravé (motif original), éclats étoilés aux points de lumière, poussière précieuse qui
 * scintille, reflet net et balayage lumineux lent.
 * Principes : reflet d'un studio lumineux (Liquid Chrome de 21st.dev, MIT) et doré brossé en trois
 * couches (article d'O'Brien Media), réécrits en CSS.
 * Expose : PaletteMetal, ficheMetal(). Dépend de : effects/socle/construction, effects/socle/textures.
 */
import type { ContexteEffet, FicheEffet } from '../types';
import {
  animer,
  BALAYAGE_AU_REPOS,
  calque,
  estEco,
  glisser,
  glisserEnSens,
  paillettes,
  reglage,
  REGLAGE_DENSITE,
  REGLAGE_VITESSE,
  reflet,
  scintiller,
} from '../socle/construction';
import { textureEclats, textureFiligrane } from '../socle/textures';

/** Teintes d'un métal. */
export interface PaletteMetal {
  /** Bandes du studio, du sombre au clair, en dégradé bouclé. */
  studio: string;
  /** Aplat de teinte du métal (mode `color`) et son opacité. */
  teinte: string;
  opaciteTeinte: number;
  /** Trait du filigrane et couleur des paillettes. */
  gravure: string;
  poussiere: string;
}

const REGLAGES = [REGLAGE_VITESSE, REGLAGE_DENSITE];
/** Bande lumineuse étroite du balayage. */
const BANDE_BALAYAGE = 'linear-gradient(90deg, #fff0 40%, #ffffffaa 50%, #fff0 60%)';
const DUREE_BALAYAGE = 6;

function calquesMetal(c: ContexteEffet, p: PaletteMetal) {
  const vitesse = reglage(c, 'vitesse', REGLAGES);
  const densite = reglage(c, 'densite', REGLAGES);
  const eco = estEco(c);
  return [
    calque(c, p.teinte, 'color', p.opaciteTeinte),
    calque(c, p.studio, 'overlay', 0.7, { tailleFond: '320% 320%', positionFond: glisser(c) }),
    calque(c, p.studio, 'soft-light', 0.35, {
      tailleFond: '200% 200%',
      positionFond: glisserEnSens(c, 0.6),
    }),
    calque(c, textureFiligrane(p.gravure), 'multiply', 0.2, { tailleFond: '12cqw 12cqw' }),
    calque(c, textureEclats(), 'screen', 0.8, {
      tailleFond: '100% 100%',
      ...(eco ? {} : scintiller(c, 0.25, 1, 1.9, vitesse)),
    }),
    paillettes(
      c,
      1.6 / densite,
      0.6,
      p.poussiere,
      0.3,
      eco ? {} : scintiller(c, 0.1, 0.7, 1.3, vitesse, 0.4),
    ),
    reflet(c, 35, 0.35),
    ...(eco
      ? []
      : [
          calque(c, BANDE_BALAYAGE, 'soft-light', 0.9, {
            transformation: BALAYAGE_AU_REPOS,
            animation: animer('sweep', DUREE_BALAYAGE, vitesse),
          }),
        ]),
  ];
}

/** Fiche d'un métal précieux. */
export function ficheMetal(palette: PaletteMetal): FicheEffet {
  return {
    zone: 'interieur',
    cout: 'moyen',
    animeAuRepos: true,
    reglages: REGLAGES,
    calques: (c) => calquesMetal(c, palette),
  };
}
