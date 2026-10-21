/**
 * Génération d'identifiants.
 *
 * Rôle : produire un identifiant unique SANS dépendre de `crypto.randomUUID()`, qui n'existe pas
 * en HTTP non sécurisé (cas du test sur téléphone via `http://192.168.x.x`).
 * Expose : generateId().
 * Dépend de : rien. Les sources d'aléatoire et d'horloge sont injectables (tests déterministes).
 */

/** Base de la représentation texte (chiffres + lettres). */
const ID_BASE = 36;
/** Nombre de caractères de la partie aléatoire. */
const ID_RANDOM_LENGTH = 10;

/**
 * Génère un identifiant du type `lq3k9x2a-4fz81b0c7d`.
 * Non cryptographique : suffisant pour distinguer des joueurs entre amis.
 *
 * @param random - Source d'aléatoire dans [0, 1[ (par défaut Math.random).
 * @param now - Horloge en millisecondes (par défaut Date.now).
 * @returns Un identifiant texte.
 */
export function generateId(
  random: () => number = Math.random,
  now: () => number = Date.now,
): string {
  const timePart = now().toString(ID_BASE);
  let randomPart = '';
  for (let i = 0; i < ID_RANDOM_LENGTH; i += 1) {
    randomPart += Math.floor(random() * ID_BASE).toString(ID_BASE);
  }
  return `${timePart}-${randomPart}`;
}
