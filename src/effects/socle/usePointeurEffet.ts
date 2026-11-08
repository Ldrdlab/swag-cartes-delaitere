/**
 * Geste sur la carte : le reflet et l'inclinaison suivent la souris ou le doigt.
 *
 * Rôle : mesurer la position du pointeur sur la carte (0 à 1) et la donner à l'horloge unique
 * (effects/socle/horloge), qui la lisse, l'écrit dans les variables CSS `--effet-x` / `--effet-y` et
 * ramène la carte en douceur à son orbite quand le geste se termine. React ne redessine rien.
 *  - Ordinateur : la souris au-dessus de la carte.
 *  - Téléphone : le doigt qui glisse sur la carte (la page ne défile pas pendant le geste).
 * Le gyroscope n'est plus utilisé (V0.2) : le doigt suffit et la carte reste calme dans la main.
 * Rien n'est écouté si `actif` est faux.
 * Expose : usePointeurEffet().
 * Dépend de : react, domain/effetsCartes (type), effects/socle/horloge (type).
 */
import { useEffect, type RefObject } from 'react';
import type { PointeurEffet } from '../../domain/effetsCartes';
import type { HandleHorloge } from './horloge';

/** Position du pointeur dans la cible, de 0 à 1. */
function positionDans(cible: HTMLElement, e: PointerEvent): PointeurEffet {
  const zone = cible.getBoundingClientRect();
  const x = (e.clientX - zone.left) / Math.max(zone.width, 1);
  const y = (e.clientY - zone.top) / Math.max(zone.height, 1);
  return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
}

/**
 * Branche le geste sur `cible` (la carte) et le transmet à la poignée de l'horloge.
 * @param poignee - Poignée de l'horloge pour cette carte (voir useOrbite).
 * @param actif - Faux : rien n'est écouté (grille, effets réduits, hors écran).
 */
export function usePointeurEffet(
  cible: RefObject<HTMLElement | null>,
  poignee: RefObject<HandleHorloge | null>,
  actif: boolean,
): void {
  useEffect(() => {
    const zone = cible.current;
    if (!zone || !actif) return undefined;
    // Le doigt qui glisse sur la carte ne doit pas faire défiler la page (zone de geste uniquement).
    const touchActionAvant = zone.style.getPropertyValue('touch-action');
    zone.style.setProperty('touch-action', 'none');

    const viser = (position: PointeurEffet | null) => poignee.current?.definirGeste(position);
    const surMouvement = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.buttons !== 0) viser(positionDans(zone, e));
    };
    const surAppui = (e: PointerEvent) => viser(positionDans(zone, e));
    const surFin = () => viser(null);

    zone.addEventListener('pointermove', surMouvement);
    zone.addEventListener('pointerdown', surAppui);
    zone.addEventListener('pointerleave', surFin);
    zone.addEventListener('pointerup', surFin);
    zone.addEventListener('pointercancel', surFin);
    return () => {
      viser(null);
      zone.removeEventListener('pointermove', surMouvement);
      zone.removeEventListener('pointerdown', surAppui);
      zone.removeEventListener('pointerleave', surFin);
      zone.removeEventListener('pointerup', surFin);
      zone.removeEventListener('pointercancel', surFin);
      if (touchActionAvant) zone.style.setProperty('touch-action', touchActionAvant);
      else zone.style.removeProperty('touch-action');
    };
  }, [cible, poignee, actif]);
}
