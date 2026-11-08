/**
 * Tests de la lecture du lien reçu par e-mail.
 *
 * Rôle : vérifier la reconnaissance d'une invitation, d'une réinitialisation, d'un lien périmé et d'une
 * ouverture normale de l'appli.
 * Dépend de : vitest, services/lienAuth.
 */
import { describe, expect, it } from 'vitest';
import { lireLienAuth } from './lienAuth';

describe('lireLienAuth', () => {
  it('reconnaît une invitation', () => {
    expect(lireLienAuth('#access_token=abc&refresh_token=def&type=invite')).toEqual({
      type: 'invite',
      expire: false,
    });
  });

  it('reconnaît une réinitialisation de mot de passe, avec ou sans le #', () => {
    expect(lireLienAuth('access_token=abc&type=recovery')).toEqual({
      type: 'recovery',
      expire: false,
    });
  });

  it('reconnaît un lien périmé ou déjà utilisé : aucun mot de passe à définir', () => {
    expect(
      lireLienAuth(
        '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid',
      ),
    ).toEqual({ type: null, expire: true });
  });

  it('ne fait rien pour une ouverture normale ou un type inconnu', () => {
    expect(lireLienAuth('')).toEqual({ type: null, expire: false });
    expect(lireLienAuth('#')).toEqual({ type: null, expire: false });
    expect(lireLienAuth('#type=magiclink&access_token=abc')).toEqual({ type: null, expire: false });
    expect(lireLienAuth('#/une/page')).toEqual({ type: null, expire: false });
  });
});
