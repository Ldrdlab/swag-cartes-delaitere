/**
 * Carte de démonstration pour tester les effets (aucune photo : un dessin neutre généré).
 *
 * Rôle : fournir une carte « fausse » (cadre, paysage, silhouette, bandeau de nom) à la bonne taille
 * (744 × 1040), sans effet incrusté, pour juger les effets dans l'espace admin sans toucher aux vraies
 * photos. Le cadre fait 28 px, comme les vraies cartes.
 * Expose : carteDemo().
 * Dépend de : config/cartes, domain/types (types).
 */
import { CARTE_HAUTEUR_PX, CARTE_LARGEUR_PX } from '../config/cartes';
import type { Card, Rarity, Variant } from '../domain/types';

/** Dessin de la carte : cadre gris, paysage, silhouette, bandeaux de texte. */
const SVG =
  `<svg xmlns='http://www.w3.org/2000/svg' width='${CARTE_LARGEUR_PX}' height='${CARTE_HAUTEUR_PX}' ` +
  `viewBox='0 0 ${CARTE_LARGEUR_PX} ${CARTE_HAUTEUR_PX}'>` +
  "<defs><linearGradient id='c' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#8a93a3'/>" +
  "<stop offset='1' stop-color='#4b5361'/></linearGradient>" +
  "<linearGradient id='p' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#5aa0d8'/>" +
  "<stop offset='0.55' stop-color='#a7d3f0'/><stop offset='0.56' stop-color='#4f8a4a'/>" +
  "<stop offset='1' stop-color='#2f5d33'/></linearGradient></defs>" +
  "<rect width='744' height='1040' rx='36' fill='url(#c)'/>" +
  "<rect x='28' y='28' width='688' height='984' rx='12' fill='#eef1f6'/>" +
  "<rect x='56' y='99' width='636' height='395' rx='8' fill='url(#p)'/>" +
  "<circle cx='372' cy='250' r='62' fill='#2b3140'/>" +
  "<path d='M262 494 C262 360 482 360 482 494Z' fill='#2b3140'/>" +
  "<rect x='56' y='52' width='360' height='30' rx='8' fill='#2b3140'/>" +
  "<rect x='56' y='540' width='636' height='20' rx='6' fill='#9aa3b2'/>" +
  "<rect x='56' y='580' width='520' height='20' rx='6' fill='#b8bfcc'/>" +
  "<rect x='56' y='640' width='636' height='14' rx='6' fill='#c8ceda'/>" +
  "<rect x='56' y='672' width='560' height='14' rx='6' fill='#c8ceda'/>" +
  "<rect x='56' y='704' width='600' height='14' rx='6' fill='#c8ceda'/>" +
  '</svg>';

/** Adresse de l'image de démonstration. */
const IMAGE_DEMO = `data:image/svg+xml;utf8,${encodeURIComponent(SVG)}`;

/** Carte de démonstration de la rareté (et de la variante) donnée, avec l'effet donné. */
export function carteDemo(rarete: Rarity, variante: Variant | undefined, effet: string): Card {
  return {
    id: `demo-${rarete}-${variante ?? 'x'}`,
    name: 'Carte de démonstration',
    rarity: rarete,
    ...(variante ? { variant: variante } : {}),
    imageUrl: IMAGE_DEMO,
    width: CARTE_LARGEUR_PX,
    height: CARTE_HAUTEUR_PX,
    effect: effet === 'aucun' ? '' : effet,
  };
}
