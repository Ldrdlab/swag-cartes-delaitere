/**
 * Horloge unique de l'animation des effets.
 *
 * Rôle : UN SEUL `requestAnimationFrame` pour toutes les cartes animées de la page. À chaque image, pour
 * chaque carte inscrite (uniquement celles qui sont à l'écran), elle calcule la position du « pointeur
 * virtuel » — orbite au repos, remplacée en douceur par le doigt ou la souris pendant un geste, puis
 * retour en fondu — et l'écrit dans les variables CSS `--effet-x` / `--effet-y` de la carte. Le CSS fait
 * le reste (reflets, inclinaison 3D) : React ne redessine rien. L'horloge s'arrête seule quand plus aucune
 * carte n'est inscrite, et se met en pause quand la page est masquée.
 * Expose : HandleHorloge, inscrire(), statistiquesHorloge().
 * Dépend de : config/effets, domain/animationEffets, domain/effetsCartes (type), effects/socle/variablesPointeur.
 */
import { GESTE, ORBITE } from '../../config/effets';
import {
  adoucir,
  avancerPoids,
  lisserVers,
  melanger,
  positionOrbite,
} from '../../domain/animationEffets';
import type { PointeurEffet } from '../../domain/effetsCartes';
import { POINTEUR_X, POINTEUR_Y } from './variablesPointeur';

/** Ce que l'on peut faire d'une carte inscrite à l'horloge. */
export interface HandleHorloge {
  /** Position du doigt ou de la souris sur la carte (0 à 1), ou `null` quand le geste est terminé. */
  definirGeste: (position: PointeurEffet | null) => void;
  /** Intervalle minimal entre deux mises à jour de cette carte (ms) ; 0 = à chaque image. */
  definirIntervalle: (ms: number) => void;
  /** Retire la carte de l'horloge et rend ses reflets à leur pose. */
  retirer: () => void;
}

interface Entree {
  element: HTMLElement;
  phase: number;
  intervalleMs: number;
  geste: PointeurEffet | null;
  /** Position lissée du geste ; `null` tant qu'aucun geste n'a eu lieu. */
  gesteLisse: PointeurEffet | null;
  poids: number;
  dernierMs: number;
  /** Dernière position écrite (point de départ du geste, pour éviter tout saut). */
  affichee: PointeurEffet;
}

const entrees = new Set<Entree>();
let image = 0;

/** Écrit la position dans les variables CSS de la carte. */
function ecrire(element: HTMLElement, position: PointeurEffet): void {
  element.style.setProperty(POINTEUR_X, position.x.toFixed(4));
  element.style.setProperty(POINTEUR_Y, position.y.toFixed(4));
}

/** Met à jour une carte pour l'image `maintenant` (ms). */
function mettreAJour(e: Entree, maintenant: number, dtMs: number): void {
  const repos = positionOrbite(maintenant / 1000, e.phase, ORBITE);
  const geste = e.geste !== null;
  if (geste && e.geste) {
    // Début d'un geste : on part de la position affichée, la prise de main se fait en fondu.
    e.gesteLisse = lisserVers(e.gesteLisse ?? e.affichee, e.geste, dtMs, GESTE.lissageMs);
  }
  e.poids = avancerPoids(e.poids, geste, dtMs, GESTE);
  let position = repos;
  if (e.gesteLisse && e.poids > 0) position = melanger(repos, e.gesteLisse, adoucir(e.poids));
  else if (e.gesteLisse) e.gesteLisse = null;
  e.affichee = position;
  ecrire(e.element, position);
}

function boucle(maintenant: number): void {
  for (const e of entrees) {
    const dt = maintenant - e.dernierMs;
    if (e.intervalleMs > 0 && dt < e.intervalleMs) continue;
    e.dernierMs = maintenant;
    mettreAJour(e, maintenant, dt);
  }
  image = requestAnimationFrame(boucle);
}

/**
 * Inscrit une carte à l'horloge.
 * @param element - Élément qui porte les variables CSS (le cadre de la carte).
 * @param phase - Point de départ de l'orbite (radians) : différent pour chaque carte.
 * @param intervalleMs - Intervalle minimal entre deux mises à jour (0 = à chaque image).
 */
export function inscrire(element: HTMLElement, phase: number, intervalleMs: number): HandleHorloge {
  const entree: Entree = {
    element,
    phase,
    intervalleMs,
    geste: null,
    gesteLisse: null,
    poids: 0,
    dernierMs: 0,
    affichee: { x: 0.5, y: 0.5 },
  };
  entrees.add(entree);
  if (image === 0) image = requestAnimationFrame(boucle);
  return {
    definirGeste: (position) => {
      entree.geste = position;
    },
    definirIntervalle: (ms) => {
      entree.intervalleMs = ms;
    },
    retirer: () => {
      entrees.delete(entree);
      element.style.removeProperty(POINTEUR_X);
      element.style.removeProperty(POINTEUR_Y);
      if (entrees.size === 0 && image !== 0) {
        cancelAnimationFrame(image);
        image = 0;
      }
    },
  };
}

/** Mesure pour la page d'essai : cartes animées en ce moment par l'horloge. */
export function statistiquesHorloge(): { cartes: number } {
  return { cartes: entrees.size };
}
