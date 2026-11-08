/**
 * Briques communes des effets : calques, réglages, animations, reflets, paillettes, dégradés.
 *
 * Rôle : éviter que chaque effet répète la même mécanique (opacité × intensité, valeur d'un réglage,
 * nom d'animation, reflet qui suit la position du pointeur). Les tailles de motif sont en `cqw`
 * (relatives à la largeur de la carte) : l'effet est identique à toute taille.
 * Expose : calque(), reglage(), estEco(), animer(), scintiller(), glisser(),
 * glisserEnSens(), reflet(), BALAYAGE_AU_REPOS, bandesArcEnCiel(), paillettes(), ARC_EN_CIEL, STRIES, GRAVURE, REGLAGE_VITESSE,
 * REGLAGE_DENSITE.
 * Dépend de : effects/types, effects/socle/textures, effects/socle/EffetCarte.module.css.
 *
 * Principe repris de codeweb-dev/holo-card (MIT, https://github.com/codeweb-dev/holo-card) : la
 * position du pointeur est écrite dans des variables CSS, sans nouveau rendu React. Code réécrit.
 */
import type { ContexteEffet, CalqueEffet, ReglageEffet } from '../types';
import styles from './EffetCarte.module.css';
import { POINTEUR_X, POINTEUR_Y } from './variablesPointeur';
import { textureEtoiles } from './textures';

const x = (c: ContexteEffet) => `var(${POINTEUR_X}, ${c.pointeur.x})`;
const y = (c: ContexteEffet) => `var(${POINTEUR_Y}, ${c.pointeur.y})`;
const arrondir = (valeur: number) => Math.round(valeur * 1e6) / 1e6;

/** Calque dont l'opacité suit l'intensité de l'effet. */
export function calque(
  c: ContexteEffet,
  fond: string,
  fusion: CalqueEffet['fusion'],
  opacite: number,
  extra: Partial<CalqueEffet> = {},
): CalqueEffet {
  return { fond, fusion, opacite: opacite * c.intensite, ...extra };
}

/** Valeur d'un réglage : celle de la carte, sinon celle de la fiche. */
export function reglage(
  c: ContexteEffet,
  cle: ReglageEffet['cle'],
  fiche: readonly ReglageEffet[],
): number {
  return c.reglages?.[cle] ?? fiche.find((r) => r.cle === cle)?.defaut ?? 1;
}

/** Vrai en qualité « éco » : couches secondaires et animations retirées. */
export const estEco = (c: ContexteEffet): boolean => c.qualite === 'eco';

/** Réglages usuels. */
export const REGLAGE_VITESSE: ReglageEffet = {
  cle: 'vitesse',
  min: 0.25,
  max: 3,
  pas: 0.25,
  defaut: 1,
};
export const REGLAGE_DENSITE: ReglageEffet = {
  cle: 'densite',
  min: 0.5,
  max: 2,
  pas: 0.1,
  defaut: 1,
};

/** Animations disponibles (keyframes de EffetCarte.module.css). */
export type NomAnimation = 'drift' | 'twinkle' | 'sweep' | 'pulse';

/**
 * Valeur CSS `animation` : durée divisée par la vitesse réglée ; `delai` décale les calques jumeaux.
 * Le balayage va toujours dans le même sens ; les autres font l'aller-retour (pas de saut en fin de cycle).
 */
export function animer(nom: NomAnimation, secondes: number, vitesse: number, delai = 0): string {
  const images = styles[nom] ?? nom;
  const duree = Math.round((secondes / Math.max(vitesse, 0.1)) * 100) / 100;
  const rythme = nom === 'sweep' ? 'linear' : 'ease-in-out';
  const sens = nom === 'sweep' ? 'normal' : 'alternate';
  return `${images} ${duree}s ${rythme} ${delai}s infinite ${sens}`;
}

/** Scintillement : l'opacité oscille entre `bas` et `haut` (× intensité). */
export function scintiller(
  c: ContexteEffet,
  bas: number,
  haut: number,
  secondes: number,
  vitesse: number,
  delai = 0,
): Partial<CalqueEffet> {
  return {
    animation: animer('twinkle', secondes, vitesse, delai),
    variables: {
      '--twinkle-low': String(bas * c.intensite),
      '--twinkle-high': String(haut * c.intensite),
    },
  };
}

/** Décalage de fond qui suit le reflet : l'effet « glisse » quand la carte s'incline. */
export function glisser(c: ContexteEffet, quantite = 1): string {
  const echelle = arrondir(100 * quantite);
  return `calc(${x(c)} * ${echelle}%) calc(${y(c)} * ${echelle}%)`;
}

/** Décalage de fond à contresens du reflet (deux reflets qui se croisent). */
export function glisserEnSens(c: ContexteEffet, quantite = 1): string {
  const echelle = arrondir(100 * quantite);
  return `calc((1 - ${x(c)}) * ${echelle}%) calc((1 - ${y(c)}) * ${echelle}%)`;
}

/** Tache lumineuse centrée sur le reflet : `rayon` en % (nette si petit). */
export function reflet(
  c: ContexteEffet,
  rayon: number,
  opacite: number,
  couleur = '#ffffff',
  fusion: CalqueEffet['fusion'] = 'screen',
): CalqueEffet {
  const centre = `calc(${x(c)} * 100%) calc(${y(c)} * 100%)`;
  return calque(
    c,
    `radial-gradient(circle at ${centre}, ${couleur}cc, ${couleur}00 ${rayon}%)`,
    fusion,
    opacite,
  );
}

/** Spectre arc-en-ciel, bouclant sur sa première couleur. */
export const ARC_EN_CIEL =
  'linear-gradient(115deg, #ff0080, #ff8c00, #ffe600, #2bff88, #00c8ff, #7a3cff, #ff0080)';

/** Bandes arc-en-ciel qui glissent avec le reflet. */
export function bandesArcEnCiel(
  c: ContexteEffet,
  fusion: CalqueEffet['fusion'],
  opacite: number,
): CalqueEffet {
  return calque(c, ARC_EN_CIEL, fusion, opacite, {
    tailleFond: '300% 300%',
    positionFond: glisser(c),
  });
}

/** Lignes fines parallèles (gravure). */
export const GRAVURE =
  'repeating-linear-gradient(60deg, #0000 0 0.45cqw, #00000045 0.45cqw 0.57cqw)';

/** Fines stries horizontales, façon métal brossé. */
export const STRIES =
  'repeating-linear-gradient(90deg, #ffffff00 0 0.18cqw, #ffffff30 0.18cqw 0.3cqw, #00000018 0.3cqw 0.42cqw)';

/** Position de la bande de balayage sans animation (effets figés) : hors de la carte, loin du visage. */
export const BALAYAGE_AU_REPOS = 'translate3d(120%, 0, 0) rotate(20deg)';

/** Tuile du champ d'étoiles : 10 fois l'écart moyen entre deux étoiles. */
const TUILE_ETOILES = 10;

/**
 * Étoiles ou paillettes semées au hasard (graine fixe), écartées d'environ `ecart` cqw, qui glissent
 * selon le reflet (`profondeur`). Chaque couleur et écart donne un semis différent.
 */
export function paillettes(
  c: ContexteEffet,
  ecart: number,
  opacite: number,
  couleur = '#ffffff',
  profondeur = 0.4,
  extra: Partial<CalqueEffet> = {},
): CalqueEffet {
  const graine = Math.round(ecart * 1000) + parseInt(couleur.slice(1, 7), 16);
  const tuile = Math.round(ecart * TUILE_ETOILES * 100) / 100;
  return calque(c, textureEtoiles(couleur, graine), 'screen', opacite, {
    tailleFond: `${tuile}cqw ${tuile}cqw`,
    positionFond: glisser(c, profondeur),
    ...extra,
  });
}
