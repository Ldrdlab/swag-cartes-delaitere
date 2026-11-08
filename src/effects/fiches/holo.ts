/**
 * Holo (Rare) : bandes arc-en-ciel qui glissent avec l'inclinaison, plus un reflet blanc doux.
 * Effet « holographique » classique de l'outil de création (deux calques, CSS pur), sur toute la carte.
 * Expose : fiche (export par défaut). Dépend de : effects/socle/construction.
 */
import type { FicheEffet } from '../types';
import { bandesArcEnCiel, calque } from '../socle/construction';
import { POINTEUR_X, POINTEUR_Y } from '../socle/variablesPointeur';

const fiche: FicheEffet = {
  zone: 'carte',
  cout: 'faible',
  animeAuRepos: false,
  reglages: [],
  calques: (c) => {
    const centre = `calc(var(${POINTEUR_X}, ${c.pointeur.x}) * 100%) calc(var(${POINTEUR_Y}, ${c.pointeur.y}) * 100%)`;
    return [
      bandesArcEnCiel(c, 'color-dodge', 0.55),
      calque(
        c,
        `radial-gradient(circle at ${centre}, #ffffffd9, #ffffff00 55%)`,
        'soft-light',
        0.8,
      ),
    ];
  },
};

export default fiche;
