/**
 * Thème « Apéro Soleil » : un coucher de soleil orange, grand soleil crème.
 *
 * ┌─ POUR CRÉER UN NOUVEAU BOOSTER (pour débutant) ─────────────────────────────────┐
 * │ 1. Copie ce fichier dans le même dossier et renomme-le (ex. `ma-soiree.ts`).     │
 * │ 2. Change les couleurs et les textes (id, nom, ligne1, ligne2, saison, code).    │
 * │    Garde les virgules et les guillemets. L'`id` doit être UNIQUE.                │
 * │ 3. Change le nom de l'export (ligne `export const aperoSoleil`) : ex. `maSoiree`.│
 * │ 4. Ajoute une ligne dans `src/boosters/catalogue.ts` (lis le mode d'emploi).     │
 * └──────────────────────────────────────────────────────────────────────────────┘
 *
 * Expose : aperoSoleil.
 * Dépend de : themes/types.
 */
import type { ThemeBooster } from './types';

export const aperoSoleil: ThemeBooster = {
  // Identifiant unique (jamais deux thèmes avec le même).
  id: 'apero-soleil',
  // Le nom affiché sous le carrousel.
  nom: 'Apéro Soleil',
  // Les deux lignes du titre sur le paquet (en majuscules).
  ligne1: 'APÉRO',
  ligne2: 'SOLEIL',
  // La pastille sous le titre, et le badge en haut à droite du paquet.
  saison: 'Saison 1',
  code: 'S1',
  couleurs: {
    // Dégradé du paquet : de la première couleur à la seconde.
    paquetDebut: '#FF6B4A',
    paquetFin: '#FF8A5B',
    // Bords striés du haut et du bas.
    sertis: '#E8573A',
    // Ombre sous le paquet.
    ombre: 'rgba(232, 87, 58, 0.55)',
    // Lueur autour du titre.
    lueur: '#FF8A3D',
  },
  // Illustration : du calque le plus haut au calque le plus bas (le ciel).
  illustration: [
    // Disque du soleil (crème).
    'radial-gradient(circle calc(30 * var(--u)) at 50% 34%, #FFF8DE 0 96%, transparent 100%)',
    // Halo lumineux autour du soleil.
    'radial-gradient(circle calc(95 * var(--u)) at 50% 34%, rgba(255, 248, 222, 0.8), rgba(255, 226, 154, 0.35) 45%, transparent 72%)',
    // Rayons : un secteur clair tous les 22 degrés.
    'repeating-conic-gradient(from 8deg at 50% 34%, rgba(255, 248, 222, 0.3) 0deg 7deg, transparent 7deg 22deg)',
    // Ciel : orange en haut, doré en bas.
    'linear-gradient(180deg, #FF7A50 0%, #FFB347 55%, #FFE29A 100%)',
  ],
  effets: {
    foil: true,
    foilIntensite: 0.7,
    foilCouleur: 'rgba(255, 255, 255, 0.9)',
    sertis: true,
    reflet: true,
  },
};
