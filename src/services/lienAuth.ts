/**
 * Lecture du lien reçu par e-mail (invitation ou réinitialisation du mot de passe).
 *
 * Rôle : quand un ami clique sur le lien de son e-mail d'invitation (ou de « mot de passe oublié »), il arrive
 * sur l'appli avec, dans l'adresse, un fragment du type `#access_token=…&type=invite`. Ce fichier lit ce
 * fragment pour savoir de quel type de lien il s'agit (afin de lui demander de choisir son mot de passe) ou
 * si le lien est périmé (`#error=access_denied&error_code=otp_expired`).
 * Expose : TypeLienAuth, LienAuth, lireLienAuth().
 * Dépend de : rien (le fragment est passé en paramètre : testable sans navigateur).
 */

/** Type de lien reçu par e-mail. */
export type TypeLienAuth = 'invite' | 'recovery';

/** Ce que dit l'adresse de l'appli à son ouverture. */
export interface LienAuth {
  /** Type du lien (invitation ou réinitialisation), ou `null` si l'appli est ouverte normalement. */
  type: TypeLienAuth | null;
  /** Vrai si le lien est périmé ou déjà utilisé. */
  expire: boolean;
}

/**
 * Lit le fragment de l'adresse (ce qui suit le `#`).
 *
 * @param fragment - `window.location.hash`, avec ou sans le `#`.
 */
export function lireLienAuth(fragment: string): LienAuth {
  const parametres = new URLSearchParams(fragment.replace(/^#/, ''));
  const type = parametres.get('type');
  const typeConnu: TypeLienAuth | null = type === 'invite' || type === 'recovery' ? type : null;
  const erreur = parametres.get('error') !== null || parametres.get('error_code') !== null;
  return {
    // Un lien avec erreur n'ouvre aucune session : pas de mot de passe à définir.
    type: erreur ? null : typeConnu,
    expire: erreur,
  };
}
