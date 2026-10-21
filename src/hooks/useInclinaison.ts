/**
 * Inclinaison 3D qui suit la souris ou l'orientation du téléphone.
 *
 * Rôle : mesurer une inclinaison comprise entre -1 et +1 (horizontale `--tx`, verticale `--ty`) et la
 * publier en variables CSS sur l'élément donné. C'est le CSS qui s'en sert pour pencher et décaler
 * des calques (donc uniquement transform) : aucun rendu React à chaque mouvement.
 *  - Ordinateur : suit la souris dans la fenêtre.
 *  - Téléphone : suit l'orientation. Sur iPhone, l'autorisation doit être demandée par un geste de
 *    l'utilisateur : on la demande au premier toucher de l'élément. Sans autorisation, rien ne bouge.
 * Rien ne tourne si `actif` est faux ou si l'utilisateur a demandé de réduire les animations.
 * Expose : useInclinaison().
 * Dépend de : react.
 */
import { useEffect, type RefObject } from 'react';

/** Angle d'inclinaison du téléphone (en degrés) qui correspond à une inclinaison maximale (1). */
const ANGLE_MAXIMAL_TELEPHONE = 30;

/** Ramène une valeur dans [-1, 1]. */
function borner(valeur: number): number {
  return Math.max(-1, Math.min(1, valeur));
}

/** Variante iOS de DeviceOrientationEvent : `requestPermission` n'existe pas dans les types standards. */
interface DeviceOrientationAvecPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/**
 * Publie l'inclinaison dans les variables CSS `--tx` et `--ty` de l'élément.
 *
 * @param ref - Élément qui reçoit les variables CSS.
 * @param actif - Vrai tant que l'inclinaison doit suivre (ex. booster au centre).
 */
export function useInclinaison(ref: RefObject<HTMLElement | null>, actif: boolean): void {
  useEffect(() => {
    const element = ref.current;
    if (!element || !actif) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const publier = (tx: number, ty: number) => {
      element.style.setProperty('--tx', borner(tx).toFixed(3));
      element.style.setProperty('--ty', borner(ty).toFixed(3));
    };

    // --- Souris (ordinateur) ---
    const surSouris = (evenement: PointerEvent) => {
      if (evenement.pointerType !== 'mouse') return;
      const zone = element.getBoundingClientRect();
      const centreX = zone.left + zone.width / 2;
      const centreY = zone.top + zone.height / 2;
      publier(
        (evenement.clientX - centreX) / window.innerWidth,
        (evenement.clientY - centreY) / window.innerHeight,
      );
    };
    window.addEventListener('pointermove', surSouris);

    // --- Orientation du téléphone ---
    const surOrientation = (evenement: DeviceOrientationEvent) => {
      publier(
        (evenement.gamma ?? 0) / ANGLE_MAXIMAL_TELEPHONE,
        (evenement.beta ?? 0) / ANGLE_MAXIMAL_TELEPHONE - 1,
      );
    };
    let ecouteOrientation = false;
    const ecouterOrientation = () => {
      if (ecouteOrientation) return;
      ecouteOrientation = true;
      window.addEventListener('deviceorientation', surOrientation);
    };

    const orientation =
      typeof DeviceOrientationEvent === 'undefined'
        ? undefined
        : (DeviceOrientationEvent as unknown as DeviceOrientationAvecPermission);
    let demanderAuToucher: (() => void) | undefined;
    if (orientation?.requestPermission) {
      // iPhone : l'autorisation se demande au premier toucher (geste de l'utilisateur).
      demanderAuToucher = () => {
        orientation
          .requestPermission?.()
          .then((reponse) => {
            if (reponse === 'granted') ecouterOrientation();
          })
          .catch(() => undefined);
      };
      element.addEventListener('pointerdown', demanderAuToucher, { once: true });
    } else if (orientation) {
      ecouterOrientation();
    }

    return () => {
      window.removeEventListener('pointermove', surSouris);
      window.removeEventListener('deviceorientation', surOrientation);
      if (demanderAuToucher) element.removeEventListener('pointerdown', demanderAuToucher);
      element.style.removeProperty('--tx');
      element.style.removeProperty('--ty');
    };
  }, [ref, actif]);
}
