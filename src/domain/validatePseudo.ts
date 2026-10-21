/**
 * Validation du pseudonyme.
 *
 * Rôle : nettoyer (espaces de début/fin) et valider le pseudo saisi, avec un message d'erreur clair.
 * Expose : PseudoValidation, validatePseudo().
 * Dépend de : config/profile (bornes de longueur). Aucun import React ni DOM.
 */
import { PSEUDO_MAX_LENGTH, PSEUDO_MIN_LENGTH } from '../config/profile';

/** Résultat de la validation : soit le pseudo nettoyé, soit un message d'erreur. */
export type PseudoValidation = { valid: true; pseudo: string } | { valid: false; error: string };

/**
 * Valide un pseudonyme saisi par l'utilisateur.
 *
 * Les espaces de début et de fin sont retirés avant le contrôle. La longueur est comptée en
 * caractères visibles (un emoji compte pour 1).
 *
 * @param rawPseudo - Texte brut du champ de saisie.
 * @returns `{ valid: true, pseudo }` avec le pseudo nettoyé, ou `{ valid: false, error }`.
 */
export function validatePseudo(rawPseudo: string): PseudoValidation {
  const pseudo = rawPseudo.trim();
  const length = [...pseudo].length;

  if (length === 0) {
    return { valid: false, error: 'Le pseudonyme est obligatoire.' };
  }
  if (length < PSEUDO_MIN_LENGTH) {
    return {
      valid: false,
      error: `Le pseudonyme doit contenir au moins ${PSEUDO_MIN_LENGTH} caractères.`,
    };
  }
  if (length > PSEUDO_MAX_LENGTH) {
    return {
      valid: false,
      error: `Le pseudonyme ne doit pas dépasser ${PSEUDO_MAX_LENGTH} caractères.`,
    };
  }
  return { valid: true, pseudo };
}
