/**
 * Animation au repos d'une carte : inscription à l'horloge unique et inclinaison 3D.
 *
 * Rôle : tant que la carte est animée et à l'écran (`actif`), l'inscrire à l'horloge (effects/socle/horloge)
 * et marquer son cadre `data-incline="oui"` : le CSS (Carte.module.css) l'incline alors d'après les
 * variables `--effet-x` / `--effet-y`, et prépare sa couche graphique seulement à ce moment-là.
 * Quand la carte est figée, hors écran ou retirée, tout est rendu à la pose. Renvoie la poignée de
 * l'horloge, à laquelle le geste (souris, doigt) donne la position du pointeur.
 * Mode `css` (page d'essai seulement) : la même orbite est faite par une animation CSS `@property`, pour
 * comparer les deux méthodes ; mode `aucune` : pas d'orbite.
 * Expose : HorlogeEssai, useOrbite().
 * Dépend de : react, domain/animationEffets, effects/socle/horloge.
 */
import { useEffect, useRef, type RefObject } from 'react';
import { phaseDepuisTexte } from '../../domain/animationEffets';
import { inscrire, type HandleHorloge } from './horloge';

/** Façon de faire tourner l'orbite (la page d'essai de l'admin peut comparer). */
export type HorlogeEssai = 'js' | 'css' | 'aucune';

/**
 * @param cible - Cadre de la carte (porte les variables CSS) ; à défaut, la racine de l'effet.
 * @param racine - Racine de l'effet (existe une fois l'effet chargé) : relance l'inscription.
 * @param actif - Vrai si la carte est animée ET à l'écran.
 * @param graine - Texte qui fixe la phase de départ (identifiant de la carte).
 * @param intervalleMs - Intervalle minimal entre deux mises à jour (ms).
 * @param horloge - Méthode d'orbite (`js` en temps normal).
 */
export function useOrbite(
  cible: RefObject<HTMLElement | null> | undefined,
  racine: HTMLElement | null,
  actif: boolean,
  graine: string,
  intervalleMs: number,
  horloge: HorlogeEssai = 'js',
): RefObject<HandleHorloge | null> {
  const poignee = useRef<HandleHorloge | null>(null);
  useEffect(() => {
    const cadre = cible?.current ?? racine;
    if (!cadre || !racine || !actif) return undefined;
    const phase = phaseDepuisTexte(graine);
    cadre.setAttribute('data-incline', 'oui');
    if (horloge === 'css') {
      cadre.setAttribute('data-horloge-css', 'oui');
      cadre.style.setProperty('--phase', `${-(phase / (2 * Math.PI)) * 8}s`);
    }
    const h = horloge === 'js' ? inscrire(cadre, phase, intervalleMs) : null;
    poignee.current = h;
    return () => {
      h?.retirer();
      poignee.current = null;
      cadre.removeAttribute('data-incline');
      cadre.removeAttribute('data-horloge-css');
      cadre.style.removeProperty('--phase');
    };
  }, [cible, racine, actif, graine, horloge, intervalleMs]);
  return poignee;
}
