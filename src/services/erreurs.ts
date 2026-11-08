/**
 * Erreurs des services (cartes, réglages, joueurs, connexion).
 *
 * Rôle : transformer une erreur brute de Supabase (base de données, stockage, réseau) en un CODE
 * simple, que les écrans savent expliquer en français (textes dans content/messagesCartes.ts).
 * Expose : CodeErreur, ErreurService, ErreurBrute, traduireErreur().
 * Dépend de : rien (fonctions pures, testables sans réseau).
 */

/** Raisons possibles d'un échec. */
export type CodeErreur =
  | 'non_connecte' // session expirée : il faut se reconnecter
  | 'non_autorise' // la base refuse (droits insuffisants)
  | 'infos_invalides' // la base refuse les informations saisies
  | 'image_invalide' // format d'image refusé
  | 'trop_gros' // fichier trop lourd
  | 'introuvable' // la carte n'existe plus
  | 'carte_possedee' // suppression impossible : un joueur possède cette carte
  | 'limite_atteinte' // tous les boosters du jour sont déjà ouverts
  | 'aucune_carte' // aucune carte active : rien à tirer
  | 'reseau' // pas de connexion au serveur
  | 'inconnue';

/** Échec d'une opération. */
export class ErreurService extends Error {
  readonly code: CodeErreur;

  constructor(code: CodeErreur, message: string = code) {
    super(message);
    this.code = code;
  }
}

/** Erreur telle que la renvoie Supabase (les champs varient selon l'origine : base, stockage, réseau). */
export interface ErreurBrute {
  code?: string | undefined;
  message?: string | undefined;
  status?: number | undefined;
  statusCode?: string | number | undefined;
  name?: string | undefined;
}

/**
 * Traduit une erreur brute en `ErreurService`.
 *
 * @param erreur - Erreur renvoyée par Supabase, ou exception interceptée.
 */
export function traduireErreur(erreur: ErreurBrute | null | undefined): ErreurService {
  const message = erreur?.message ?? '';
  const code = erreur?.code ?? '';
  const statut = Number(erreur?.statusCode ?? erreur?.status ?? 0);

  // Erreurs levées par nos fonctions SQL (open_booster…) : le message contient le mot-clé.
  if (/daily_limit_reached/.test(message)) return new ErreurService('limite_atteinte', message);
  if (/no_cards_available/.test(message)) return new ErreurService('aucune_carte', message);
  if (/not_authenticated/.test(message)) return new ErreurService('non_connecte', message);
  if (code === 'PGRST301' || /jwt expired/i.test(message))
    return new ErreurService('non_connecte', message);
  if (
    code === '42501' ||
    statut === 401 ||
    statut === 403 ||
    /row-level security|permission denied|not_admin/i.test(message)
  ) {
    return new ErreurService('non_autorise', message);
  }
  if (code === '23503') return new ErreurService('carte_possedee', message);
  if (['23514', '22P02', '22001', '23502', '23505'].includes(code)) {
    return new ErreurService('infos_invalides', message);
  }
  if (statut === 413 || /too large|maximum allowed size/i.test(message)) {
    return new ErreurService('trop_gros', message);
  }
  if (/mime type|not supported|invalid image/i.test(message)) {
    return new ErreurService('image_invalide', message);
  }
  if (code === 'PGRST116' || statut === 404) return new ErreurService('introuvable', message);
  if (
    /failed to fetch|network|load failed|fetch failed/i.test(message) ||
    erreur?.name === 'TypeError'
  ) {
    return new ErreurService('reseau', message);
  }
  return new ErreurService('inconnue', message);
}
