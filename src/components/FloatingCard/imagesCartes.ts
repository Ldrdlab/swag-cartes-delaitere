/**
 * Recherche des photos des cartes décoratives.
 *
 * Rôle : transformer le nom d'une photo (ex. `'photo1.png'`, écrit dans config/accueil.ts) en adresse
 * utilisable par la page. Vite repère tout seul les fichiers du dossier
 * `src/assets/images/welcome/cartes/` : il suffit d'y copier la photo.
 * Expose : urlImageCarte().
 * Dépend de : Vite (import.meta.glob).
 */

/** Toutes les images du dossier, indexées par chemin de fichier (rempli automatiquement par Vite). */
const IMAGES_DU_DOSSIER = import.meta.glob<string>(
  '../../assets/images/welcome/cartes/*.{png,jpg,jpeg,webp,avif,svg}',
  { eager: true, query: '?url', import: 'default' },
);

/**
 * Renvoie l'adresse d'une photo du dossier des cartes, ou `undefined` si le nom est absent ou inconnu.
 *
 * @param nomFichier - Nom exact du fichier, extension comprise (ex. `'photo1.png'`).
 * @returns L'adresse de l'image, ou `undefined` (la carte garde alors son dégradé).
 */
export function urlImageCarte(nomFichier: string | undefined): string | undefined {
  if (!nomFichier) return undefined;
  const trouve = Object.entries(IMAGES_DU_DOSSIER).find(([chemin]) =>
    chemin.endsWith(`/${nomFichier}`),
  );
  return trouve?.[1];
}
