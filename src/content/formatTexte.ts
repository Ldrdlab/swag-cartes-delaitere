/**
 * Insertion de valeurs dans un texte de content/textes.ts.
 *
 * Rôle : remplacer les repères comme `{pseudo}` d'un texte par la vraie valeur.
 * Expose : remplir().
 * Dépend de : rien.
 */

/**
 * Remplace chaque `{nom}` du texte par la valeur correspondante.
 * Un repère inconnu est laissé tel quel (pour qu'une faute de frappe se voie à l'écran).
 *
 * @param texte - Texte contenant des repères, ex. `'Bon retour, {pseudo} !'`.
 * @param valeurs - Valeurs à insérer, ex. `{ pseudo: 'Sacha' }`.
 * @returns Le texte complété, ex. `'Bon retour, Sacha !'`.
 */
export function remplir(texte: string, valeurs: Record<string, string>): string {
  return texte.replace(/\{(\w+)\}/g, (repere, nom: string) => valeurs[nom] ?? repere);
}
