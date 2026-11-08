/**
 * Lustre (Peu commune) : reflet doux qui suit l'inclinaison, sur un grain fin de papier glacé.
 * Reflet : principe de codeweb-dev/holo-card (MIT), réécrit ; grain : bruit SVG généré.
 * Expose : fiche (export par défaut). Dépend de : effects/socle/construction, effects/socle/textures.
 */
import type { FicheEffet } from '../types';
import { calque, reflet } from '../socle/construction';
import { textureGrain } from '../socle/textures';

const fiche: FicheEffet = {
  zone: 'interieur',
  cout: 'faible',
  animeAuRepos: false,
  reglages: [],
  calques: (c) => [
    calque(c, textureGrain(), 'overlay', 0.18, { tailleFond: '40cqw 40cqw' }),
    reflet(c, 55, 0.45),
  ],
};

export default fiche;
