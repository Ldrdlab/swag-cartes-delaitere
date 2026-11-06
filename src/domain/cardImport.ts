/**
 * Validation et import de cartes depuis un fichier JSON externe.
 *
 * Rôle : transformer un JSON exporté par un outil de création de cartes en liste de `Card` fiable,
 * ou renvoyer la liste précise des erreurs. Fonction isolée : pas encore branchée à l'interface.
 *
 * Formats acceptés : un tableau de cartes, ou un objet `{ "cards": [ ... ] }`.
 * Chaque carte : `id` et `name` (texte non vide), `rarity` ("commune", "peu commune", "rare",
 * "super-rare" ; majuscules, espaces, tirets et underscores tolérés), `imageUrl` optionnel. Tout autre
 * champ est conservé dans `extra` (champs libres), avec le contenu d'un éventuel champ `extra`.
 *
 * Expose : CardImportResult, importCards().
 * Dépend de : domain/types. Aucun import React ni DOM.
 */
import { RARITIES, type Card, type Rarity } from './types';

/** Résultat d'un import : toutes les cartes sont valides, ou aucune n'est importée. */
export type CardImportResult = { ok: true; cards: Card[] } | { ok: false; errors: string[] };

/** Champs reconnus : tout le reste va dans `extra`. */
const KNOWN_FIELDS = new Set(['id', 'name', 'rarity', 'imageUrl', 'extra']);

/** Reconnaît une rareté écrite de façons variées ("Peu commune", "super-rare"...). */
function parseRarity(value: unknown): Rarity | null {
  if (typeof value !== 'string') return null;
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return RARITIES.find((rarity) => rarity === normalized) ?? null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Valide une carte ; renvoie la carte ou la liste de ses erreurs.
 * @param raw - Valeur lue dans le JSON.
 * @param position - Position dans le tableau (pour des messages d'erreur précis).
 */
function parseCard(raw: unknown, position: number): Card | string[] {
  const label = `Carte n°${position + 1}`;
  if (!isPlainObject(raw)) return [`${label} : ce n’est pas un objet.`];

  const errors: string[] = [];
  if (!isNonEmptyString(raw.id)) errors.push(`${label} : "id" manquant ou vide.`);
  if (!isNonEmptyString(raw.name)) errors.push(`${label} : "name" manquant ou vide.`);
  const rarity = parseRarity(raw.rarity);
  if (!rarity) errors.push(`${label} : "rarity" invalide (attendu : ${RARITIES.join(', ')}).`);
  if (raw.imageUrl !== undefined && typeof raw.imageUrl !== 'string') {
    errors.push(`${label} : "imageUrl" doit être un texte.`);
  }
  if (raw.extra !== undefined && !isPlainObject(raw.extra)) {
    errors.push(`${label} : "extra" doit être un objet.`);
  }
  if (errors.length > 0 || !isNonEmptyString(raw.id) || !isNonEmptyString(raw.name) || !rarity) {
    return errors;
  }

  const extra: Record<string, unknown> = isPlainObject(raw.extra) ? { ...raw.extra } : {};
  for (const [key, value] of Object.entries(raw)) {
    if (!KNOWN_FIELDS.has(key)) extra[key] = value;
  }
  const card: Card = { id: raw.id.trim(), name: raw.name.trim(), rarity };
  if (typeof raw.imageUrl === 'string') card.imageUrl = raw.imageUrl;
  if (Object.keys(extra).length > 0) card.extra = extra;
  return card;
}

/**
 * Valide et convertit des données JSON en cartes.
 *
 * @param json - Données déjà décodées (résultat de `JSON.parse`).
 * @returns `{ ok: true, cards }` si tout est valide, sinon `{ ok: false, errors }` (rien n'est importé).
 */
export function importCards(json: unknown): CardImportResult {
  const list = isPlainObject(json) && 'cards' in json ? json.cards : json;
  if (!Array.isArray(list)) {
    return { ok: false, errors: ['Le fichier doit contenir un tableau de cartes.'] };
  }

  const cards: Card[] = [];
  const errors: string[] = [];
  const seenIds = new Set<string>();

  list.forEach((raw: unknown, position) => {
    const result = parseCard(raw, position);
    if (Array.isArray(result)) {
      errors.push(...result);
      return;
    }
    if (seenIds.has(result.id)) {
      errors.push(`Carte n°${position + 1} : l’identifiant "${result.id}" est déjà utilisé.`);
      return;
    }
    seenIds.add(result.id);
    cards.push(result);
  });

  return errors.length > 0 ? { ok: false, errors } : { ok: true, cards };
}
