/**
 * Catalogue des boosters disponibles.
 *
 * Rôle : la liste de TOUS les boosters du jeu. C'est le SEUL fichier à modifier pour ajouter ou retirer
 * un booster : le carrousel, la confirmation et l'ouverture s'adaptent tout seuls.
 *
 * ┌─ POUR CRÉER UN NOUVEAU BOOSTER (pour débutant) ───────────────────────────────────┐
 * │ 1. Dans `src/boosters/themes/`, copie un fichier de thème (ex. `apero-soleil.ts`),  │
 * │    renomme-le (ex. `ma-soiree.ts`), change les couleurs et les textes, et le nom    │
 * │    de l'export (ex. `maSoiree`). L'`id` du thème doit être unique.                  │
 * │ 2. Ici, en haut, ajoute une ligne `import` pour ton thème :                         │
 * │       import { maSoiree } from './themes/ma-soiree';                                │
 * │ 3. Dans la liste CATALOGUE, copie une ligne `{ theme: …, skin: …, cardIds: […] },`  │
 * │    et change `theme` (ton thème) et `cardIds` (les cartes qui peuvent sortir :      │
 * │    leurs `id` sont dans src/data/cards.ts).                                         │
 * │ 4. `skin` choisit le MODÈLE de dessin : 'standard' (paquet dessiné en CSS à partir  │
 * │    du thème) ou 'image' (illustration complète, voir skins/image/index.tsx).        │
 * │ 5. Pour RETIRER un booster : efface sa ligne de la liste.                           │
 * └──────────────────────────────────────────────────────────────────────────────┘
 * (Plusieurs boosters peuvent partager des cartes. L'ordre de la liste = l'ordre du carrousel.)
 *
 * Expose : BoosterCatalogue, CATALOGUE, getBoosterAt().
 * Dépend de : boosters/themes/*, boosters/skins/types, domain/types, domain/carousel.
 */
import { wrapIndex } from '../domain/carousel';
import type { NomSkin } from './skins/types';
import { aperoSoleil } from './themes/apero-soleil';
import { nuitBlanche } from './themes/nuit-blanche';
import type { ThemeBooster } from './themes/types';
import { vagueTropicale } from './themes/vague-tropicale';

/** Une ligne du catalogue : un booster complet. */
export interface BoosterCatalogue {
  /** Apparence : couleurs, textes, illustration, effets. */
  theme: ThemeBooster;
  /** Modèle de dessin (doit exister dans skins/registre.ts). */
  skin: NomSkin;
}

/** Les boosters, dans l'ordre d'affichage du carrousel. */
export const CATALOGUE: readonly BoosterCatalogue[] = [
  {
    theme: aperoSoleil,
    skin: 'standard',
  },
  {
    theme: nuitBlanche,
    skin: 'standard',
  },
  {
    theme: vagueTropicale,
    skin: 'standard',
  },
];

/**
 * Renvoie le booster à une position donnée du catalogue (la position est ramenée dans la liste).
 *
 * @param index - Position du booster (ex. `selectedBoosterIndex` de la machine à états).
 * @returns Le booster correspondant.
 * @throws Si le catalogue est vide (erreur de configuration).
 */
export function getBoosterAt(index: number): BoosterCatalogue {
  const booster = CATALOGUE[wrapIndex(index, CATALOGUE.length)];
  if (!booster) {
    throw new Error('Aucun booster défini dans src/boosters/catalogue.ts');
  }
  return booster;
}
