/**
 * Recherche des images d'un booster.
 *
 * Rôle : retrouver, par son nom, une image du dossier `src/assets/images/boosters/<id-du-booster>/`.
 * Vite repère tout seul les fichiers de ce dossier : il suffit d'y déposer l'image.
 * Expose : urlImageBooster().
 * Dépend de : Vite (import.meta.glob).
 */

/** Toutes les images des boosters, indexées par chemin de fichier (rempli automatiquement par Vite). */
const IMAGES_DES_BOOSTERS = import.meta.glob<string>(
  '../../assets/images/boosters/*/*.{webp,png,jpg,jpeg,avif,svg}',
  { eager: true, query: '?url', import: 'default' },
);

/**
 * Renvoie l'adresse d'une image d'un booster, ou `undefined` si elle n'existe pas.
 *
 * @param idBooster - Identifiant du booster = nom du dossier (ex. `'ma-soiree'`).
 * @param nomFichier - Nom du fichier SANS extension (ex. `'paquet'`, `'haut'`, `'fond'`).
 * @returns L'adresse de l'image, ou `undefined`.
 */
export function urlImageBooster(idBooster: string, nomFichier: string): string | undefined {
  const motif = new RegExp(`/${idBooster}/${nomFichier}\\.[a-z]+$`);
  const trouve = Object.entries(IMAGES_DES_BOOSTERS).find(([chemin]) => motif.test(chemin));
  return trouve?.[1];
}
