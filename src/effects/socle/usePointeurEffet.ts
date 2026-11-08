/**
 * Geste sur la carte : le reflet et l'inclinaison suivent la souris ou le doigt.
 *
 * Rôle : mesurer la position du pointeur sur la carte (0 à 1) et la donner à l'horloge unique
 * (effects/socle/horloge), qui la lisse, l'écrit dans les variables CSS `--effet-x` / `--effet-y` et
 * ramène la carte en douceur à son orbite quand le geste se termine. React ne redessine rien. Pointer
 * Events uniquement (souris, doigt et stylet par les mêmes événements).
 *  - `survol` (grilles) : seulement la SOURIS qui passe sur la carte. Le doigt n'est jamais écouté et
 *    rien n'est bloqué : la page défile normalement.
 *  - `complet` (vue agrandie, carte retournée) : la souris, et le doigt qui glisse. À l'appui, le pointeur
 *    est CAPTURÉ (`setPointerCapture`) : le geste continue même si le doigt sort de la carte. `touch-action:
 *    none` n'est posé que sur la carte (le reste de l'écran défile), le menu d'appui long est supprimé, et un
 *    mouvement de plus de quelques pixels est un GLISSÉ : le clic qui suivrait est annulé (sinon on
 *    retournerait ou fermerait la carte par erreur) ; en dessous, c'est un APPUI et le clic passe.
 * Le gyroscope n'est plus utilisé (V0.2). Rien n'est écouté si `actif` est faux ou sans type de geste.
 * Expose : TypeGeste, usePointeurEffet().
 * Dépend de : react, config/effets, domain/animationEffets, domain/effetsCartes (type), effects/socle/horloge (type).
 */
import { useEffect, type RefObject } from 'react';
import { SEUIL_APPUI_PX } from '../../config/effets';
import { estGlisse } from '../../domain/animationEffets';
import type { PointeurEffet } from '../../domain/effetsCartes';
import type { HandleHorloge } from './horloge';

/** Type de geste : seulement le survol de la souris (grilles), ou le geste complet (souris et doigt). */
export type TypeGeste = 'survol' | 'complet';

/** Durée pendant laquelle le clic qui suit un glissé est annulé (ms). */
const DELAI_CLIC_ANNULE_MS = 400;

/** Position du pointeur dans la cible, de 0 à 1. */
function positionDans(cible: HTMLElement, e: PointerEvent): PointeurEffet {
  const zone = cible.getBoundingClientRect();
  const x = (e.clientX - zone.left) / Math.max(zone.width, 1);
  const y = (e.clientY - zone.top) / Math.max(zone.height, 1);
  return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
}

/** Annule le prochain clic (celui que le navigateur envoie après un glissé), pendant un court instant. */
function annulerProchainClic(): void {
  const annuler = (evenement: Event) => {
    evenement.stopPropagation();
    evenement.preventDefault();
    retirer();
  };
  const minuteur = window.setTimeout(() => retirer(), DELAI_CLIC_ANNULE_MS);
  function retirer() {
    document.removeEventListener('click', annuler, true);
    window.clearTimeout(minuteur);
  }
  // `capture` : on passe avant tous les autres écouteurs de la page (ouverture, retournement…).
  document.addEventListener('click', annuler, true);
}

/**
 * Branche le geste sur `cible` (la carte) et le transmet à la poignée de l'horloge.
 * @param poignee - Poignée de l'horloge pour cette carte (voir useOrbite).
 * @param type - Type de geste ; `null` : aucun (carte figée).
 * @param actif - Faux : rien n'est écouté (hors écran).
 */
export function usePointeurEffet(
  cible: RefObject<HTMLElement | null>,
  poignee: RefObject<HandleHorloge | null>,
  type: TypeGeste | null,
  actif: boolean,
): void {
  useEffect(() => {
    const zone = cible.current;
    if (!zone || !actif || type === null) return undefined;
    const complet = type === 'complet';
    const viser = (position: PointeurEffet | null) => poignee.current?.definirGeste(position);

    // Seule la carte manipulable bloque le défilement et le menu d'appui long.
    const touchActionAvant = zone.style.getPropertyValue('touch-action');
    if (complet) zone.style.setProperty('touch-action', 'none');
    const surMenu = (e: Event) => e.preventDefault();
    if (complet) zone.addEventListener('contextmenu', surMenu);

    let debut: { x: number; y: number; id: number } | null = null;
    let glisse = false;

    const surAppui = (e: PointerEvent) => {
      if (!complet && e.pointerType !== 'mouse') return;
      viser(positionDans(zone, e));
      if (!complet) return;
      debut = { x: e.clientX, y: e.clientY, id: e.pointerId };
      glisse = false;
      // Le geste continue même si le doigt sort de la carte ; sans effet si le navigateur refuse.
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {
        // Pointeur déjà relâché : rien à faire.
      }
    };
    const surMouvement = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || (complet && e.buttons !== 0)) viser(positionDans(zone, e));
      if (complet && debut && e.pointerId === debut.id && !glisse) {
        glisse = estGlisse(debut, { x: e.clientX, y: e.clientY }, SEUIL_APPUI_PX);
      }
    };
    const surRelache = (e: PointerEvent) => {
      if (glisse) annulerProchainClic();
      debut = null;
      glisse = false;
      // La souris reste au-dessus de la carte : le reflet continue de la suivre. Le doigt se lève : retour.
      if (e.pointerType !== 'mouse') viser(null);
    };
    const surSortie = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.buttons !== 0 && complet) return; // glissé en cours (capturé)
      viser(null);
    };
    const surAnnulation = () => {
      debut = null;
      glisse = false;
      viser(null);
    };

    zone.addEventListener('pointerdown', surAppui);
    zone.addEventListener('pointermove', surMouvement);
    zone.addEventListener('pointerup', surRelache);
    zone.addEventListener('pointerleave', surSortie);
    zone.addEventListener('pointercancel', surAnnulation);
    return () => {
      viser(null);
      zone.removeEventListener('pointerdown', surAppui);
      zone.removeEventListener('pointermove', surMouvement);
      zone.removeEventListener('pointerup', surRelache);
      zone.removeEventListener('pointerleave', surSortie);
      zone.removeEventListener('pointercancel', surAnnulation);
      zone.removeEventListener('contextmenu', surMenu);
      if (touchActionAvant) zone.style.setProperty('touch-action', touchActionAvant);
      else zone.style.removeProperty('touch-action');
    };
  }, [cible, poignee, type, actif]);
}
