/**
 * Types des variables d'environnement de l'appli.
 *
 * Rôle : déclarer les variables `VITE_*` lues par le navigateur (fichier `.env` ou secrets GitHub).
 * Seules l'URL du projet Supabase et la clé PUBLIQUE « anon » (ou « publishable ») y ont leur place.
 * La clé « service_role » (ou « secret ») ne doit JAMAIS être ajoutée ici ni ailleurs dans le projet.
 * Expose : rien (déclaration de types uniquement).
 * Dépend de : vite/client.
 */
interface ImportMetaEnv {
  /** Adresse du projet Supabase, ex. https://abcdefgh.supabase.co */
  readonly VITE_SUPABASE_URL?: string;
  /** Clé publique « anon » du projet Supabase (conçue pour être visible dans le navigateur). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
