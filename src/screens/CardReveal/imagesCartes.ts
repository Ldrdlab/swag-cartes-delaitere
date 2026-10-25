/**
 * Recherche de l'image du dos des cartes.
 *
 * Rôle : toutes les cartes ont le même dos (`dos-carte.webp`). Un booster peut en imposer un autre
 * grâce au champ `dosImage` de son thème : il suffit de déposer l'image dans
 * `src/assets/images/cartes/` et d'écrire son nom.
 * POUR CHANGER LE DOS DES CARTES : remplace `src/assets/images/cartes/dos-carte.webp` par une image du
 * même format (418 × 597 px, coins arrondis transparents, WebP de moins de 60 Ko).
 * Les PNG ne sont volontairement PAS chargés : `dos-carte.png` est l'original conservé (574 Ko), l'appli
 * utilise sa version WebP (49 Ko). Pour un dos personnalisé, déposer une image WebP.
 * Expose : urlDosCarte().
 * Dépend de : Vite (import.meta.glob).
 */
import dosParDefaut from '../../assets/images/cartes/dos-carte.webp';

/** Toutes les images du dossier, indexées par chemin de fichier (rempli automatiquement par Vite). */
const IMAGES_DES_CARTES = import.meta.glob<string>(
  '../../assets/images/cartes/*.{webp,avif,jpg,jpeg,svg}',
  { eager: true, query: '?url', import: 'default' },
);

/**
 * Renvoie l'adresse de l'image du dos des cartes.
 *
 * @param nomFichier - Nom d'un fichier du dossier des cartes (champ `dosImage` du thème), ou rien.
 * @returns L'image demandée, ou le dos commun si le nom est absent ou inconnu.
 */
export function urlDosCarte(nomFichier?: string): string {
  if (!nomFichier) return dosParDefaut;
  const trouve = Object.entries(IMAGES_DES_CARTES).find(([chemin]) =>
    chemin.endsWith(`/${nomFichier}`),
  );
  return trouve?.[1] ?? dosParDefaut;
}
