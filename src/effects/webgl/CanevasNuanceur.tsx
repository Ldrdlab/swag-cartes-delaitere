/**
 * Canevas d'un effet WebGL sur une carte : affiche l'image du nuanceur dessinée par le moteur partagé.
 *
 * Rôle : tant que l'effet est animé (`fige` faux) et que la carte a la main (prioriteNuanceur.ts), une
 * boucle `requestAnimationFrame` redessine le nuanceur puis recopie l'image ici ; sinon une seule image
 * est dessinée (pose figée : carte hors écran, onglet masqué, effets réduits, grille de collection).
 * La définition suit la taille affichée, bornée pour rester légère.
 * Expose : CanevasNuanceur.
 * Dépend de : react, effects/webgl/glPartage, effects/webgl/prioriteNuanceur.
 *
 * Sans WebGL2, rien n'est dessiné : les calques CSS de l'effet servent de repli.
 */
import { useEffect, useRef, type CSSProperties } from 'react';
import { dessinerNuanceur, type UniformeValeur } from './glPartage';
import { useMainNuanceur } from './prioriteNuanceur';

/** Définition maximale du canevas (pixels sur le grand côté) : au-delà, le gain est invisible. */
const TAILLE_MAX_PX = 1040;

interface Props {
  /** Nuanceur de fragments (GLSL ES 3.0) ; reçoit `u_resolution` et `u_time` (secondes). */
  fragments: string;
  /** Uniformes propres à l'effet (intensité, vitesse…). */
  uniformes: Readonly<Record<string, UniformeValeur>>;
  /** Vrai : une seule image, au temps `tempsPose`. */
  fige: boolean;
  /** Instant (secondes) de la pose figée. */
  tempsPose: number;
  fusion?: CSSProperties['mixBlendMode'];
}

/** Définition du canevas pour sa taille affichée. */
function taille(canevas: HTMLCanvasElement): [number, number] {
  const ratio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const largeur = Math.max(1, Math.round(canevas.clientWidth * ratio));
  const hauteur = Math.max(1, Math.round(canevas.clientHeight * ratio));
  const echelle = Math.min(1, TAILLE_MAX_PX / Math.max(largeur, hauteur));
  return [Math.max(1, Math.round(largeur * echelle)), Math.max(1, Math.round(hauteur * echelle))];
}

export function CanevasNuanceur({
  fragments,
  uniformes,
  fige,
  tempsPose,
  fusion = 'normal',
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dejaDessine = useRef(false);
  const vivant = useMainNuanceur(!fige);
  // La boucle lit toujours les derniers uniformes sans redémarrer.
  const derniers = useRef(uniformes);
  useEffect(() => {
    derniers.current = uniformes;
  });
  // Figé, l'image ne se redessine que si un réglage change.
  const empreinte = vivant ? '' : JSON.stringify(uniformes);

  useEffect(() => {
    const canevas = ref.current;
    const contexte = canevas?.getContext('2d');
    if (!canevas || !contexte) return undefined;
    const dessiner = (temps: number) => {
      const [largeur, hauteur] = taille(canevas);
      if (canevas.width !== largeur || canevas.height !== hauteur) {
        canevas.width = largeur;
        canevas.height = hauteur;
      }
      return dessinerNuanceur(
        fragments,
        { ...derniers.current, u_time: temps, u_still: vivant ? 0 : 1 },
        contexte,
      );
    };
    if (!vivant) {
      // Sans la main : la dernière image reste ; une carte jamais dessinée montre sa pose.
      if (fige || !dejaDessine.current) dessiner(tempsPose);
      dejaDessine.current = true;
      return undefined;
    }
    dejaDessine.current = true;
    let image = 0;
    const debut = performance.now();
    const boucle = (maintenant: number) => {
      if (!dessiner((maintenant - debut) / 1000 + tempsPose)) return;
      image = requestAnimationFrame(boucle);
    };
    image = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(image);
  }, [fragments, fige, tempsPose, vivant, empreinte]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        mixBlendMode: fusion,
      }}
    />
  );
}
