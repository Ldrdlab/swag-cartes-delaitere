/**
 * Optimisation des images de cartes dans le navigateur.
 *
 * Rôle : lire une image (PNG, JPG ou WebP), la réduire à 744 px de large au maximum (sans jamais
 * l'agrandir ni la déformer), la réencoder en WebP en gardant la transparence, et fabriquer une
 * miniature pour la galerie. Aucun envoi sur Internet : tout se passe sur l'appareil.
 * Expose : ImageOptimisee, optimiserImage().
 * Dépend de : config/cartes, domain/cartes. Utilise l'API Canvas du navigateur.
 */
import type { OPTIMISATION } from '../config/cartes';
import { dimensionsOptimisees } from '../domain/cartes';

/** Résultat de l'optimisation. */
export interface ImageOptimisee {
  /** Image principale (WebP, ou PNG si le navigateur ne sait pas écrire du WebP). */
  image: Blob;
  /** Miniature pour la galerie. */
  miniature: Blob;
  /** Dimensions de l'image principale (px). */
  largeur: number;
  hauteur: number;
  /** Dimensions du fichier d'origine (px), pour vérifier ses proportions. */
  largeurOrigine: number;
  hauteurOrigine: number;
}

/** Crée un canvas (zone de dessin) de la taille voulue. */
function creerCanvas(largeur: number, hauteur: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = largeur;
  canvas.height = hauteur;
  return canvas;
}

/** Dessine une source dans un nouveau canvas redimensionné (lissage de bonne qualité). */
function redessiner(
  source: CanvasImageSource,
  largeur: number,
  hauteur: number,
): HTMLCanvasElement {
  const canvas = creerCanvas(largeur, hauteur);
  const contexte = canvas.getContext('2d');
  if (!contexte) throw new Error('Le navigateur ne permet pas de traiter les images.');
  contexte.imageSmoothingEnabled = true;
  contexte.imageSmoothingQuality = 'high';
  // Le canvas est transparent au départ : les coins arrondis restent transparents.
  contexte.drawImage(source, 0, 0, largeur, hauteur);
  return canvas;
}

/** Encode un canvas en WebP ; repli en PNG (sans perte) si le navigateur ne sait pas faire du WebP. */
function encoder(canvas: HTMLCanvasElement, qualite: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (webp) => {
        if (webp && webp.type === 'image/webp') {
          resolve(webp);
          return;
        }
        canvas.toBlob(
          (png) => (png ? resolve(png) : reject(new Error('Encodage de l’image impossible.'))),
          'image/png',
        );
      },
      'image/webp',
      qualite,
    );
  });
}

/**
 * Optimise une image de carte.
 *
 * @param fichier - Fichier choisi par l'utilisateur.
 * @param reglages - Largeurs maximales et qualités (config/cartes.ts, `OPTIMISATION`).
 * @returns Les images optimisées et les dimensions d'origine.
 * @throws Si le fichier n'est pas une image lisible.
 */
export async function optimiserImage(
  fichier: File,
  reglages: typeof OPTIMISATION,
): Promise<ImageOptimisee> {
  const bitmap = await createImageBitmap(fichier);
  try {
    const { largeur, hauteur } = dimensionsOptimisees(
      bitmap.width,
      bitmap.height,
      reglages.largeurMaxPx,
    );
    const principale = redessiner(bitmap, largeur, hauteur);
    const tailleMiniature = dimensionsOptimisees(largeur, hauteur, reglages.largeurMiniaturePx);
    // La miniature est faite à partir de l'image déjà réduite (plus rapide, même résultat visible).
    const petite =
      tailleMiniature.largeur === largeur
        ? principale
        : redessiner(principale, tailleMiniature.largeur, tailleMiniature.hauteur);

    return {
      image: await encoder(principale, reglages.qualite),
      miniature: await encoder(petite, reglages.qualiteMiniature),
      largeur,
      hauteur,
      largeurOrigine: bitmap.width,
      hauteurOrigine: bitmap.height,
    };
  } finally {
    bitmap.close();
  }
}
