/**
 * Reflet qui suit la souris, l'inclinaison du téléphone ou le doigt.
 *
 * Rôle : mesurer la position du reflet (0 à 1) et l'écrire dans les variables CSS `--effet-x` / `--effet-y`
 * de la racine de l'effet, au rythme de l'écran (requestAnimationFrame, avec adoucissement). React ne
 * redessine rien pendant le mouvement.
 *  - Ordinateur : la souris au-dessus de la carte.
 *  - Téléphone : le gyroscope. Sur iPhone, l'autorisation (`DeviceOrientationEvent.requestPermission`)
 *    est demandée au premier toucher de la carte (geste de l'utilisateur).
 *  - Repli (autorisation refusée, pas de gyroscope) : glisser le doigt sur la carte.
 * Rien n'est écouté si `actif` est faux. À la fin d'un geste, le reflet revient à sa pose.
 * Expose : usePointeurEffet().
 * Dépend de : react, config/effets, domain/effetsCartes, effects/socle/variablesPointeur.
 */
import { useEffect, type RefObject } from 'react';
import { INCLINAISON } from '../../config/effets';
import {
  positionDepuisInclinaison,
  rapprocher,
  type PointeurEffet,
} from '../../domain/effetsCartes';
import { POINTEUR_X, POINTEUR_Y } from './variablesPointeur';

/** Variante iOS de DeviceOrientationEvent : `requestPermission` n'est pas dans les types standards. */
interface OrientationAvecPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/** Position du pointeur dans la cible, de 0 à 1. */
function positionDans(cible: HTMLElement, e: PointerEvent): PointeurEffet {
  const zone = cible.getBoundingClientRect();
  const x = (e.clientX - zone.left) / Math.max(zone.width, 1);
  const y = (e.clientY - zone.top) / Math.max(zone.height, 1);
  return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
}

/**
 * Branche le suivi sur `cible` (la carte) et écrit les variables sur `couche` (la racine de l'effet).
 * @param pose - Position de repos du reflet.
 * @param actif - Faux : rien n'est écouté (grille, effets réduits, hors écran).
 */
export function usePointeurEffet(
  cible: RefObject<HTMLElement | null>,
  couche: HTMLElement | null,
  pose: PointeurEffet,
  actif: boolean,
): void {
  const [poseX, poseY] = [pose.x, pose.y];
  useEffect(() => {
    const zone = cible.current;
    if (!zone || !couche || !actif) return undefined;
    const repos = { x: poseX, y: poseY };
    // Le doigt qui glisse sur la carte ne doit pas faire défiler la page (zone de geste uniquement).
    const touchActionAvant = zone.style.getPropertyValue('touch-action');
    zone.style.setProperty('touch-action', 'none');
    let courante: PointeurEffet = { ...repos };
    let objectif: PointeurEffet = { ...repos };
    let image = 0;

    const ecrire = () => {
      couche.style.setProperty(POINTEUR_X, courante.x.toFixed(4));
      couche.style.setProperty(POINTEUR_Y, courante.y.toFixed(4));
    };
    const avancer = () => {
      image = 0;
      const pas = rapprocher(courante, objectif, INCLINAISON.lissage, INCLINAISON.seuilArret);
      courante = pas.position;
      ecrire();
      if (!pas.arrivee) image = requestAnimationFrame(avancer);
    };
    const viser = (position: PointeurEffet) => {
      objectif = position;
      if (image === 0) image = requestAnimationFrame(avancer);
    };

    // Souris et doigt : le reflet suit tant que le pointeur est sur la carte (ou le doigt posé).
    const surMouvement = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.buttons !== 0) viser(positionDans(zone, e));
    };
    const surFin = () => viser(repos);
    const surAppui = (e: PointerEvent) => viser(positionDans(zone, e));

    // Gyroscope : demandé au premier toucher sur iPhone, actif tout de suite ailleurs.
    const surOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      viser(
        positionDepuisInclinaison(
          e.gamma,
          e.beta,
          INCLINAISON.angleMaxDegres,
          INCLINAISON.betaReposDegres,
        ),
      );
    };
    let ecouteGyro = false;
    const ecouterGyro = () => {
      if (ecouteGyro) return;
      ecouteGyro = true;
      window.addEventListener('deviceorientation', surOrientation);
    };
    const orientation =
      typeof DeviceOrientationEvent === 'undefined'
        ? undefined
        : (DeviceOrientationEvent as unknown as OrientationAvecPermission);
    let demanderAuToucher: (() => void) | undefined;
    if (orientation?.requestPermission) {
      demanderAuToucher = () => {
        orientation
          .requestPermission?.()
          .then((reponse) => {
            if (reponse === 'granted') ecouterGyro();
          })
          .catch(() => undefined); // Refus : le glisser du doigt continue de fonctionner.
      };
      zone.addEventListener('pointerdown', demanderAuToucher, { once: true });
    } else if (orientation) {
      ecouterGyro();
    }

    zone.addEventListener('pointermove', surMouvement);
    zone.addEventListener('pointerdown', surAppui);
    zone.addEventListener('pointerleave', surFin);
    zone.addEventListener('pointerup', surFin);
    zone.addEventListener('pointercancel', surFin);
    return () => {
      cancelAnimationFrame(image);
      zone.removeEventListener('pointermove', surMouvement);
      zone.removeEventListener('pointerdown', surAppui);
      zone.removeEventListener('pointerleave', surFin);
      zone.removeEventListener('pointerup', surFin);
      zone.removeEventListener('pointercancel', surFin);
      if (demanderAuToucher) zone.removeEventListener('pointerdown', demanderAuToucher);
      window.removeEventListener('deviceorientation', surOrientation);
      if (touchActionAvant) zone.style.setProperty('touch-action', touchActionAvant);
      else zone.style.removeProperty('touch-action');
      couche.style.removeProperty(POINTEUR_X);
      couche.style.removeProperty(POINTEUR_Y);
    };
  }, [cible, couche, poseX, poseY, actif]);
}
