/**
 * Contrat d'accès à la « version minimum requise ».
 *
 * Rôle : lire la version minimale de l'appli autorisée par l'administrateur. Elle est lisible AVANT la
 * connexion (fonction SQL `get_min_version()`), pour pouvoir bloquer une vieille version dès l'écran de
 * connexion. C'est un confort d'utilisation, pas une sécurité : la sécurité des données est dans la base.
 * Expose : l'interface `VersionService`.
 * Dépend de : rien.
 */

/** Service de version minimale. */
export interface VersionService {
  /** Lit la version minimum requise (ex. `0.1.0`). */
  versionMinimale(): Promise<string>;
}
