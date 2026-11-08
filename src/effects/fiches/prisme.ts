/**
 * Prisme (Super rare) : diffraction. La teinte dépend de l'angle de vue : deux spectres coniques
 * glissent en sens opposés sur un réseau de fines stries.
 * Principe de la teinte selon l'angle (Holo Card de 21st.dev, MIT), recréé en CSS.
 * Expose : fiche (export par défaut). Dépend de : effects/socle/construction.
 */
import type { FicheEffet } from '../types';
import { calque, estEco, glisser, glisserEnSens, reflet } from '../socle/construction';

const CONIQUE =
  'repeating-conic-gradient(from 0deg at 50% 50%, #ff5fa2, #ffd36b 12%, #74ffb2 24%, #63d2ff 36%, #a87bff 48%, #ff5fa2 60%)';

/** Réseau de diffraction : stries très fines qui accrochent la lumière. */
const RESEAU = 'repeating-linear-gradient(75deg, #fff0 0 0.35cqw, #ffffff55 0.35cqw 0.5cqw)';

const fiche: FicheEffet = {
  zone: 'interieur',
  cout: 'faible',
  animeAuRepos: false,
  reglages: [],
  calques: (c) => [
    calque(c, CONIQUE, 'color-dodge', 0.45, { tailleFond: '220% 220%', positionFond: glisser(c) }),
    ...(estEco(c)
      ? []
      : [
          calque(c, CONIQUE, 'overlay', 0.4, {
            tailleFond: '180% 180%',
            positionFond: glisserEnSens(c),
          }),
        ]),
    calque(c, RESEAU, 'soft-light', 0.6, {
      tailleFond: '200% 200%',
      positionFond: glisser(c, 0.3),
    }),
    reflet(c, 40, 0.4),
  ],
};

export default fiche;
