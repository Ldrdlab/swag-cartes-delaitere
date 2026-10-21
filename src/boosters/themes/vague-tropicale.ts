/**
 * Thème « Vague Tropicale » : mer turquoise, petit soleil, ondes qui montent du bas.
 *
 * Pour créer un nouveau booster à partir de ce fichier : voir le mode d'emploi en tête de
 * `apero-soleil.ts` et de `src/boosters/catalogue.ts`.
 *
 * Expose : vagueTropicale.
 * Dépend de : themes/types.
 */
import type { ThemeBooster } from './types';

export const vagueTropicale: ThemeBooster = {
  // Identifiant unique.
  id: 'vague-tropicale',
  // Le nom affiché sous le carrousel.
  nom: 'Vague Tropicale',
  // Les deux lignes du titre sur le paquet (en majuscules).
  ligne1: 'VAGUE',
  ligne2: 'TROPICALE',
  // La pastille sous le titre, et le badge en haut à droite du paquet.
  saison: 'Saison 1',
  code: 'S1',
  couleurs: {
    paquetDebut: '#12867F',
    paquetFin: '#1FA39A',
    sertis: '#16928A',
    ombre: 'rgba(18, 134, 127, 0.55)',
    lueur: '#3FE0C5',
  },
  // Illustration : du calque le plus haut au calque le plus bas (la mer).
  illustration: [
    // Petit soleil en haut à droite.
    'radial-gradient(circle calc(13 * var(--u)) at 80% 15%, #FFF6D0 0 96%, transparent 100%)',
    'radial-gradient(circle calc(42 * var(--u)) at 80% 15%, rgba(255, 246, 208, 0.65), transparent 72%)',
    // Ondes concentriques qui montent du bas : un anneau clair tous les 16 unités.
    'repeating-radial-gradient(circle at 50% 125%, rgba(255, 255, 255, 0.24) 0 calc(3 * var(--u)), transparent calc(3 * var(--u)) calc(16 * var(--u)))',
    // La mer : bleu profond, turquoise, écume.
    'linear-gradient(180deg, #0B6F7A 0%, #2CB9A6 55%, #BDF3E4 100%)',
  ],
  effets: {
    foil: true,
    foilIntensite: 0.6,
    foilCouleur: 'rgba(230, 255, 250, 0.9)',
    sertis: true,
    reflet: true,
  },
};
