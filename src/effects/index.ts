/**
 * Registre des effets de cartes.
 *
 * Rôle : associer chaque CLÉ d'effet à son nom et au chargement de son code. Le code d'un effet n'est
 * téléchargé que lorsqu'une carte l'affiche (import dynamique) : un joueur qui n'a pas de carte « feu »
 * ne télécharge jamais le feu. Ce registre est lu par l'espace admin (liste déroulante « Effet ») et par
 * le composant <Carte /> (via effects/EffetCarte).
 *
 * ┌─ COMMENT AJOUTER UN EFFET PLUS TARD (avec Claude) ─────────────────────────────────┐
 * │ 1. Écrire sa fiche dans src/effects/fiches/ (voir lustre.ts : ~20 lignes).          │
 * │ 2. L'ajouter dans REGISTRE_EFFETS ci-dessous (clé en minuscules : lettres, chiffres,│
 * │    souligné ; 40 caractères maximum).                                               │
 * │ 3. Le choisir dans l'espace admin ; ajouter ses crédits dans CREDITS.md.            │
 * └─────────────────────────────────────────────────────────────────────────────────┘
 * Expose : REGISTRE_EFFETS, listerEffets(), trouverEffet(), chargerEffet().
 * Dépend de : effects/cles, effects/types.
 */
import { CLE_EFFET_AUCUN } from './cles';
import type { DefinitionEffet, FicheEffet } from './types';

/** Tous les effets connus, par clé. */
export const REGISTRE_EFFETS: Readonly<Record<string, DefinitionEffet>> = {
  [CLE_EFFET_AUCUN]: { nom: 'Aucun', charger: null },
  lustre: { nom: 'Lustre', charger: () => import('./fiches/lustre').then((m) => m.default) },
  holo: { nom: 'Holo', charger: () => import('./fiches/holo').then((m) => m.default) },
  prisme: { nom: 'Prisme', charger: () => import('./fiches/prisme').then((m) => m.default) },
  arc_en_ciel: {
    nom: 'Arc-en-ciel',
    charger: () => import('./fiches/arcEnCiel').then((m) => m.default),
  },
  feu: { nom: 'Feu', charger: () => import('./fiches/feu').then((m) => m.default) },
  bronze: { nom: 'Bronze', charger: () => import('./fiches/bronze').then((m) => m.default) },
  argent: { nom: 'Argent', charger: () => import('./fiches/argent').then((m) => m.default) },
  or: { nom: 'Or', charger: () => import('./fiches/or').then((m) => m.default) },
};

/** Les effets sous forme de liste `{ cle, nom }`, pour une liste déroulante. */
export function listerEffets(): { cle: string; nom: string }[] {
  return Object.entries(REGISTRE_EFFETS).map(([cle, effet]) => ({ cle, nom: effet.nom }));
}

/** Trouve un effet par sa clé ; une clé inconnue (effet retiré du code) donne « aucun ». */
export function trouverEffet(cle: string): DefinitionEffet {
  return REGISTRE_EFFETS[cle] ?? REGISTRE_EFFETS[CLE_EFFET_AUCUN]!;
}

/** Fiches déjà chargées, et chargements en cours : chaque effet n'est téléchargé qu'une fois. */
const fiches = new Map<string, FicheEffet>();
const chargements = new Map<string, Promise<FicheEffet | null>>();

/** Fiche déjà chargée (lecture immédiate), sinon `undefined`. */
export function ficheChargee(cle: string): FicheEffet | undefined {
  return fiches.get(cle);
}

/** Charge la fiche d'un effet (`null` pour « aucun », clé inconnue ou téléchargement échoué). */
export function chargerEffet(cle: string): Promise<FicheEffet | null> {
  const { charger } = trouverEffet(cle);
  if (!charger) return Promise.resolve(null);
  const deja = fiches.get(cle);
  if (deja) return Promise.resolve(deja);
  let attente = chargements.get(cle);
  if (!attente) {
    attente = charger()
      .then((fiche) => {
        fiches.set(cle, fiche);
        return fiche;
      })
      .catch(() => {
        // Hors ligne ou fichier introuvable : la carte reste sans effet, on réessaiera plus tard.
        chargements.delete(cle);
        return null;
      });
    chargements.set(cle, attente);
  }
  return attente;
}
