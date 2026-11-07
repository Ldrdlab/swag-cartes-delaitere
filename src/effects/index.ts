/**
 * Registre des effets de cartes.
 *
 * Rôle : associer chaque CLÉ d'effet à son composant. Ce registre est lu à deux endroits :
 *   - l'espace admin (liste déroulante « Effet » de la fiche d'une carte) ;
 *   - le composant <Carte /> (pose l'effet de la carte par-dessus son image).
 * Pour l'instant il ne contient que « aucun » : aucun effet visuel n'est codé.
 *
 * ┌─ COMMENT AJOUTER UN EFFET PLUS TARD (avec Claude) ─────────────────────────────────┐
 * │ 1. Créer le composant dans src/effects/ (ex. Holo.tsx), qui reçoit `carte`.         │
 * │ 2. L'ajouter dans REGISTRE_EFFETS ci-dessous (clé en minuscules : lettres, chiffres,│
 * │    souligné ; 40 caractères maximum).                                               │
 * │ 3. L'attribuer à une carte depuis l'espace admin (fiche de la carte > Effet).       │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 * Expose : REGISTRE_EFFETS, listerEffets(), trouverEffet().
 * Dépend de : effects/aucun, effects/cles, effects/types.
 */
import { EffetAucun } from './aucun';
import { CLE_EFFET_AUCUN } from './cles';
import type { DefinitionEffet } from './types';

/** Tous les effets connus, par clé. */
export const REGISTRE_EFFETS: Readonly<Record<string, DefinitionEffet>> = {
  [CLE_EFFET_AUCUN]: { nom: 'Aucun', Composant: EffetAucun },
};

/** Les effets sous forme de liste `{ cle, nom }`, pour une liste déroulante. */
export function listerEffets(): { cle: string; nom: string }[] {
  return Object.entries(REGISTRE_EFFETS).map(([cle, effet]) => ({ cle, nom: effet.nom }));
}

/** Trouve un effet par sa clé ; une clé inconnue (effet retiré du code) donne « aucun ». */
export function trouverEffet(cle: string): DefinitionEffet {
  return REGISTRE_EFFETS[cle] ?? REGISTRE_EFFETS[CLE_EFFET_AUCUN]!;
}
