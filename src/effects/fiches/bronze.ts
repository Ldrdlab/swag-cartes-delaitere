/**
 * Bronze (Mythique, variante Bronze) : métal satiné, bien plus discret qu'Argent et Or : reflets larges
 * et doux, éclats rares, stries brossées, balayage lent.
 * Principe du « studio » réfléchi : Liquid Chrome de 21st.dev (MIT), réécrit en CSS.
 * Expose : fiche (export par défaut). Dépend de : effects/socle/construction, effects/socle/textures.
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
  STRIES,
} from '../socle/construction';
import { textureEclatsRares } from '../socle/textures';

const REGLAGES = [REGLAGE_VITESSE, REGLAGE_DENSITE];
const TEINTE = '#8c5a2b';
/** Vert-de-gris : en mode `lighten`, il n'agit que sur les pixels plus sombres que lui. */
const VERT_DE_GRIS = '#3f6b5a';
/** Éclat crème : reflet et poussière. */
const CREME = '#f3d2a2';
/** Bandes du studio, du sombre au clair : sans blanc pur, le pic reste sous celui d'Argent. */
const STUDIO =
  'linear-gradient(115deg, #4a2e15 0%, #f3d2a2 14%, #8c5a2b 28%, #e8a86b 42%, #8c5a2b 58%, #cd7f32 74%, #4a2e15 100%)';
const BANDE_BALAYAGE = 'linear-gradient(90deg, #f3d2a200 30%, #f3d2a288 50%, #f3d2a200 70%)';
/** Écart de la poussière (cqw) et durée du balayage (s). */
const ECART_POUSSIERE = 2.9;
const DUREE_BALAYAGE = 10;

const fiche: FicheEffet = {
  zone: 'interieur',
  cout: 'moyen',
  animeAuRepos: true,
  reglages: REGLAGES,
  calques: (c: ContexteEffet) => {
    const vitesse = reglage(c, 'vitesse', REGLAGES);
    const densite = reglage(c, 'densite', REGLAGES);
    const eco = estEco(c);
    return [
      calque(c, TEINTE, 'color', 0.45),
      calque(c, VERT_DE_GRIS, 'lighten', 0.1),
      calque(c, STUDIO, 'overlay', 0.42, { tailleFond: '420% 420%', positionFond: glisser(c) }),
      calque(c, STUDIO, 'soft-light', 0.2, {
        tailleFond: '260% 260%',
        positionFond: glisserEnSens(c, 0.6),
      }),
      calque(c, STRIES, 'overlay', 0.1),
      calque(c, textureEclatsRares(), 'screen', 0.33, {
        tailleFond: '100% 100%',
        ...(eco ? {} : scintiller(c, 0.1, 0.4, 3, vitesse)),
      }),
      paillettes(
        c,
        ECART_POUSSIERE / densite,
        0.25,
        CREME,
        0.3,
        eco ? {} : scintiller(c, 0.05, 0.3, 2.2, vitesse, 0.4),
      ),
      reflet(c, 45, 0.25, CREME),
      ...(eco
        ? []
        : [
            calque(c, BANDE_BALAYAGE, 'soft-light', 0.5, {
              transformation: BALAYAGE_AU_REPOS,
              animation: animer('sweep', DUREE_BALAYAGE, vitesse),
            }),
          ]),
    ];
  },
};

export default fiche;
