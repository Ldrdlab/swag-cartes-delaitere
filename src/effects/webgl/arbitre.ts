/**
 * Arbitrage des dessins WebGL : lesquels ont le droit de s'animer.
 *
 * Rôle : un seul contexte WebGL sert toute la page, et le processeur graphique ne peut pas animer tous les
 * feux d'une grille en même temps. Chaque dessin qui veut s'animer s'inscrit ici ; la règle
 * (domain/animationEffets.choisirAnimes) est : une carte agrandie ou retournée est PRIORITAIRE et seule à
 * animer ; sinon, les N cartes les plus proches du centre de l'écran. Les autres gardent leur dernière
 * image. Le choix est recalculé à chaque inscription, au défilement et au redimensionnement (au plus
 * toutes les 150 ms).
 * Expose : useAutorisationNuanceur(), statistiquesNuanceurs().
 * Dépend de : react, domain/animationEffets.
 */
import { useEffect, useState, type RefObject } from 'react';
import { choisirAnimes, type CandidatNuanceur } from '../../domain/animationEffets';

interface Candidat {
  element: HTMLElement;
  prioritaire: boolean;
  max: number;
  autorise: boolean;
  rappel: (autorise: boolean) => void;
}

const candidats = new Set<Candidat>();
let minuteur = 0;
let ecoute = false;
/** Délai minimal entre deux recalculs (défilement, redimensionnement). */
const DELAI_MS = 150;

/** Distance (px) entre le centre d'un élément et le centre de l'écran ; `Infinity` s'il est hors écran. */
function distanceAuCentre(element: HTMLElement): number {
  const r = element.getBoundingClientRect();
  const visible = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  if (!visible) return Number.POSITIVE_INFINITY;
  return Math.hypot(r.left + r.width / 2 - innerWidth / 2, r.top + r.height / 2 - innerHeight / 2);
}

function recalculer(): void {
  const liste = [...candidats];
  if (liste.length === 0) return;
  const infos: CandidatNuanceur[] = liste.map((c, id) => ({
    id,
    prioritaire: c.prioritaire,
    distance: distanceAuCentre(c.element),
  }));
  const choisis = choisirAnimes(infos, Math.min(...liste.map((c) => c.max)));
  liste.forEach((c, id) => {
    const autorise = choisis.has(id);
    if (autorise !== c.autorise) {
      c.autorise = autorise;
      c.rappel(autorise);
    }
  });
}

function planifier(): void {
  if (minuteur !== 0) return;
  minuteur = window.setTimeout(() => {
    minuteur = 0;
    recalculer();
  }, DELAI_MS);
}

function ecouter(actif: boolean): void {
  if (actif === ecoute) return;
  ecoute = actif;
  const methode = actif ? 'addEventListener' : 'removeEventListener';
  // `capture` : le défilement d'un élément de l'appli (et pas seulement de la fenêtre) est aussi vu.
  window[methode]('scroll', planifier, { capture: true, passive: true });
  window[methode]('resize', planifier, { passive: true });
}

/**
 * Dit si ce dessin WebGL peut animer son nuanceur.
 * @param ref - Élément du dessin (sert à mesurer sa distance au centre de l'écran).
 * @param souhaite - Faux : le dessin ne demande rien (figé, hors écran, effets réduits).
 * @param prioritaire - Carte agrandie ou retournée.
 * @param max - Nombre maximal de dessins animés dans une grille.
 */
export function useAutorisationNuanceur(
  ref: RefObject<HTMLElement | null>,
  souhaite: boolean,
  prioritaire: boolean,
  max: number,
): boolean {
  const [autorise, setAutorise] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!souhaite || !element) return undefined;
    const candidat: Candidat = { element, prioritaire, max, autorise: false, rappel: setAutorise };
    candidats.add(candidat);
    ecouter(true);
    recalculer();
    return () => {
      candidats.delete(candidat);
      if (candidats.size === 0) ecouter(false);
      else planifier();
      setAutorise(false);
    };
  }, [ref, souhaite, prioritaire, max]);
  return souhaite && autorise;
}

/** Mesure pour la page d'essai : dessins WebGL qui demandent à animer, et ceux qui y sont autorisés. */
export function statistiquesNuanceurs(): { demandes: number; animes: number } {
  const liste = [...candidats];
  return { demandes: liste.length, animes: liste.filter((c) => c.autorise).length };
}
