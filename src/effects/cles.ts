/**
 * Clés d'effets : passage entre la valeur enregistrée en base et la clé du registre.
 *
 * Rôle : en base, « pas d'effet » s'écrit avec un texte VIDE (valeur par défaut) ; dans le registre et
 * dans l'espace admin, c'est la clé `aucun`. Ces deux petites fonctions font la traduction.
 * Expose : CLE_EFFET_AUCUN, cleDepuisBase(), baseDepuisCle().
 * Dépend de : rien. Aucun import React ni DOM.
 */

/** Clé de l'effet « aucun » dans le registre. */
export const CLE_EFFET_AUCUN = 'aucun';

/** Valeur de la base (`''` = aucun effet) vers la clé du registre. */
export function cleDepuisBase(valeurBase: string | null | undefined): string {
  return valeurBase ? valeurBase : CLE_EFFET_AUCUN;
}

/** Clé du registre vers la valeur à enregistrer en base (`aucun` devient le texte vide). */
export function baseDepuisCle(cle: string): string {
  return cle === CLE_EFFET_AUCUN ? '' : cle;
}
