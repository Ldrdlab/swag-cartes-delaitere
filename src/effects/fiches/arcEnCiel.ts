/**
 * Arc-en-ciel (Légendaire) : iridescence pastel dont la couleur suit l'angle, seconde irisation qui
 * ondule lentement au repos, gravure fine, paillettes scintillantes et reflet.
 * Structure en couches (foil, film coloré, éclat, brillance, reflet) : principe de l'« Iridescent Foil »
 * de 21st.dev, réécrit. Expose : fiche (export par défaut). Dépend de : effects/socle/construction.
 */
import type { FicheEffet } from '../types';
import {
  animer,
  calque,
  estEco,
  glisser,
  glisserEnSens,
  GRAVURE,
  paillettes,
  reglage,
  REGLAGE_DENSITE,
  REGLAGE_VITESSE,
  reflet,
  scintiller,
} from '../socle/construction';

const REGLAGES = [REGLAGE_VITESSE, REGLAGE_DENSITE];

/** Spectre pastel (moins saturé que l'arc-en-ciel classique), bouclant sur sa première teinte. */
const PASTEL =
  'linear-gradient(120deg, #ffb3d9, #ffd9a8, #fff3a8, #b8ffcf, #a8e6ff, #c9b8ff, #ffb3d9)';

/** Même spectre, plus saturé : en mode `color`, il teinte sans éclaircir (les textes restent lisibles). */
const IRISE =
  'linear-gradient(120deg, #ff6fb5, #ffa94d, #ffe14d, #4dff9a, #4dc8ff, #9a6bff, #ff6fb5)';

const fiche: FicheEffet = {
  zone: 'interieur',
  cout: 'moyen',
  animeAuRepos: true,
  reglages: REGLAGES,
  calques: (c) => {
    const vitesse = reglage(c, 'vitesse', REGLAGES);
    const densite = reglage(c, 'densite', REGLAGES);
    const eco = estEco(c);
    return [
      calque(c, IRISE, 'color', 0.45, { tailleFond: '200% 200%', positionFond: glisser(c) }),
      calque(c, PASTEL, 'soft-light', 0.7, {
        tailleFond: '160% 160%',
        positionFond: glisserEnSens(c, 0.8),
        ...(eco ? {} : { animation: animer('drift', 9, vitesse) }),
      }),
      calque(c, GRAVURE, 'soft-light', 0.45),
      paillettes(
        c,
        2.8 / densite,
        0.75,
        '#ffffff',
        0.5,
        eco ? {} : scintiller(c, 0.15, 0.85, 2.2, vitesse),
      ),
      reflet(c, 40, 0.4),
    ];
  },
};

export default fiche;
