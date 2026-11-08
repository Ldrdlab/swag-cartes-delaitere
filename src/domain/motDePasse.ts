/**
 * Validation du mot de passe choisi par un joueur.
 *
 * Rôle : vérifier un nouveau mot de passe (longueur minimale) et sa confirmation (même texte saisi deux
 * fois). La longueur minimale est passée en paramètre : elle vient de config/profile.ts (et doit être
 * identique au réglage « longueur minimale du mot de passe » de Supabase).
 * Expose : ErreurMotDePasse, validerMotDePasse().
 * Dépend de : rien. Aucun import React ni DOM.
 */

/** Problèmes possibles (le texte affiché dépend de l'écran). */
export type ErreurMotDePasse = 'trop_court' | 'different';

/**
 * Valide un nouveau mot de passe.
 *
 * @param motDePasse - Premier champ.
 * @param confirmation - Deuxième champ (doit être identique).
 * @param longueurMin - Nombre minimal de caractères.
 * @returns L'erreur trouvée, ou `null` si tout est valide.
 */
export function validerMotDePasse(
  motDePasse: string,
  confirmation: string,
  longueurMin: number,
): ErreurMotDePasse | null {
  if ([...motDePasse].length < longueurMin) return 'trop_court';
  if (motDePasse !== confirmation) return 'different';
  return null;
}
