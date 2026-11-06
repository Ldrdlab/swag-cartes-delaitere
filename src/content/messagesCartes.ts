/**
 * Messages d'erreur de l'espace « Mes cartes ».
 *
 * Rôle : associer chaque code d'erreur technique au texte à afficher (les textes eux-mêmes sont dans
 * content/textes.ts, section `mesCartes`).
 * Expose : texteErreurCollection(), texteErreurInfos(), texteErreurFichier(), texteTotal().
 * Dépend de : config/cartes, content/textes, content/formatTexte, domain/cartes (type),
 * hooks/useAjoutCartes (type), services/CollectionService (type).
 */
import { NOM_CARTE_MAX } from '../config/cartes';
import type { ErreurInfos } from '../domain/cartes';
import type { ErreurFichier } from '../hooks/useAjoutCartes';
import type { CodeErreurCollection } from '../services/CollectionService';
import { remplir } from './formatTexte';
import { TEXTES } from './textes';

const textes = TEXTES.mesCartes;

/** Texte d'une erreur renvoyée par le service (code admin, réseau, serveur…). */
export function texteErreurCollection(code: CodeErreurCollection): string {
  const messages: Record<CodeErreurCollection, string> = {
    code_incorrect: textes.erreurCodeIncorrect,
    code_non_defini: textes.erreurCodeNonDefini,
    infos_invalides: textes.erreurInfosInvalides,
    image_invalide: textes.erreurImageInvalide,
    trop_gros: textes.erreurTropGros,
    introuvable: textes.erreurIntrouvable,
    reseau: textes.erreurReseau,
    inconnue: textes.erreurInconnue,
  };
  return messages[code];
}

/** Texte d'une erreur de saisie (nom, variante). */
export function texteErreurInfos(erreur: ErreurInfos): string {
  const messages: Record<ErreurInfos, string> = {
    nom_vide: textes.erreurNomVide,
    nom_trop_long: remplir(textes.erreurNomTropLong, { max: String(NOM_CARTE_MAX) }),
    variante_requise: textes.erreurVarianteRequise,
    variante_invalide: textes.erreurVarianteInvalide,
  };
  return messages[erreur];
}

/** Texte du compteur total (« 1 carte » / « 12 cartes »). */
export function texteTotal(nombre: number): string {
  return remplir(nombre > 1 ? textes.totalPlusieurs : textes.totalUne, { nombre: String(nombre) });
}

/** Texte d'une image refusée avant l'enregistrement. */
export function texteErreurFichier(erreur: ErreurFichier): string {
  const messages: Record<ErreurFichier, string> = {
    format: textes.erreurFormat,
    taille: textes.erreurTaille,
    illisible: textes.erreurIllisible,
  };
  return messages[erreur];
}
