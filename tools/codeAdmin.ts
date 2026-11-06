/**
 * Vérification du code admin (côté serveur de développement).
 *
 * Rôle : comparer le code reçu avec le code secret défini dans `.env.local` (variable ADMIN_CODE),
 * sans révéler d'information par le temps de réponse.
 * Expose : verifierCodeAdmin().
 * Dépend de : node:crypto.
 */
import { createHash, timingSafeEqual } from 'node:crypto';

/** Empreinte SHA-256 d'un texte : deux empreintes ont toujours la même longueur, donc comparables. */
function empreinte(texte: string): Buffer {
  return createHash('sha256').update(texte, 'utf8').digest();
}

/**
 * Compare le code reçu au code attendu en temps constant.
 *
 * @param attendu - Code défini dans `.env.local` (`undefined` ou vide = aucun code défini).
 * @param recu - Code envoyé par le navigateur (en-tête HTTP).
 * @returns `true` seulement si un code est défini ET que `recu` est identique.
 */
export function verifierCodeAdmin(attendu: string | undefined, recu: string | undefined): boolean {
  if (!attendu || !recu) return false;
  return timingSafeEqual(empreinte(attendu), empreinte(recu));
}
