/**
 * Connexion à Supabase (comptes, base de données, stockage des images).
 *
 * Rôle : créer UN SEUL client Supabase pour toute l'appli, à partir de l'URL du projet et de la clé
 * publique « anon » (variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY du fichier `.env`).
 * La clé « anon » est faite pour être visible dans le navigateur : c'est la sécurité côté base
 * (Row Level Security, voir supabase/migrations/) qui protège les données.
 * La clé « service_role » n'est JAMAIS utilisée ici.
 * Expose : supabaseConfigure, supabase, lienAuth, redirectionAuth.
 * Dépend de : @supabase/supabase-js, services/lienAuth, env.d.ts.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { lireLienAuth } from './lienAuth';

const url = import.meta.env.VITE_SUPABASE_URL;
const cle = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Ce que dit l'adresse d'ouverture de l'appli (lien d'invitation, lien périmé…). Lu AVANT la création du
 * client, car celui-ci retire le fragment de l'adresse dès qu'il l'a utilisé.
 */
export const lienAuth = lireLienAuth(window.location.hash);

/** Adresse de l'appli : c'est là que mène le lien de l'e-mail de réinitialisation du mot de passe. */
export const redirectionAuth = `${window.location.origin}${import.meta.env.BASE_URL}`;

/** Vrai si l'URL et la clé sont renseignées (sinon l'appli reste utilisable hors connexion). */
export const supabaseConfigure: boolean = Boolean(url && cle);

/** Client Supabase, ou `null` tant que le fichier `.env` n'est pas rempli. */
export const supabase: SupabaseClient | null =
  url && cle
    ? createClient(url, cle, {
        auth: {
          // La session reste ouverte sur l'appareil et se renouvelle toute seule.
          persistSession: true,
          autoRefreshToken: true,
          // Lit le lien d'invitation / de réinitialisation du mot de passe à l'ouverture de l'appli.
          detectSessionInUrl: true,
        },
      })
    : null;
