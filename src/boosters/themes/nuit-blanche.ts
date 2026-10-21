/**
 * Thème « Nuit Blanche » : nuit violette, lune claire, faisceaux de projecteurs.
 *
 * Pour créer un nouveau booster à partir de ce fichier : voir le mode d'emploi en tête de
 * `apero-soleil.ts` et de `src/boosters/catalogue.ts`.
 *
 * Expose : nuitBlanche.
 * Dépend de : themes/types.
 */
import type { ThemeBooster } from './types';

export const nuitBlanche: ThemeBooster = {
  // Identifiant unique.
  id: 'nuit-blanche',
  // Le nom affiché sous le carrousel.
  nom: 'Nuit Blanche',
  // Les deux lignes du titre sur le paquet (en majuscules).
  ligne1: 'NUIT',
  ligne2: 'BLANCHE',
  // La pastille sous le titre, et le badge en haut à droite du paquet.
  saison: 'Saison 1',
  code: 'S1',
  couleurs: {
    paquetDebut: '#4B2DBF',
    paquetFin: '#6C4CE6',
    sertis: '#5A3FD6',
    ombre: 'rgba(75, 45, 191, 0.6)',
    lueur: '#FF6FC8',
  },
  // Illustration : du calque le plus haut au calque le plus bas (la nuit).
  illustration: [
    // Étoiles (petits points blancs).
    'radial-gradient(circle calc(1.6 * var(--u)) at 16% 12%, #fff 0 90%, transparent 100%)',
    'radial-gradient(circle calc(1.2 * var(--u)) at 34% 22%, #fff 0 90%, transparent 100%)',
    'radial-gradient(circle calc(1.8 * var(--u)) at 84% 10%, #fff 0 90%, transparent 100%)',
    'radial-gradient(circle calc(1.2 * var(--u)) at 90% 36%, #fff 0 90%, transparent 100%)',
    'radial-gradient(circle calc(1.4 * var(--u)) at 10% 40%, #fff 0 90%, transparent 100%)',
    'radial-gradient(circle calc(1.2 * var(--u)) at 46% 8%, #fff 0 90%, transparent 100%)',
    // La lune (claire) et son halo rose.
    'radial-gradient(circle calc(22 * var(--u)) at 62% 26%, #F4EFFF 0 96%, transparent 100%)',
    'radial-gradient(circle calc(75 * var(--u)) at 62% 26%, rgba(255, 111, 200, 0.6), rgba(255, 111, 200, 0.2) 55%, transparent 76%)',
    // Deux faisceaux de projecteurs qui montent depuis le bas.
    'conic-gradient(from -22deg at 20% 108%, transparent 0deg, rgba(255, 255, 255, 0.2) 0deg 10deg, transparent 10deg 360deg)',
    'conic-gradient(from 10deg at 80% 108%, transparent 0deg, rgba(255, 255, 255, 0.16) 0deg 10deg, transparent 10deg 360deg)',
    // La nuit : violet foncé, violet, rose en bas.
    'linear-gradient(180deg, #24164A 0%, #5A3FD6 60%, #FF6FC8 100%)',
  ],
  effets: {
    foil: true,
    foilIntensite: 0.65,
    foilCouleur: 'rgba(255, 220, 245, 0.9)',
    sertis: true,
    reflet: true,
  },
};
