/**
 * Textures générées des effets : grain, éclats étoilés, champ d'étoiles, filigrane.
 *
 * Rôle : aucune image ni texture externe (donc rien à télécharger, 0 octet de texture) : ce sont de
 * petits SVG écrits en `data:` URL. Les textures aléatoires viennent d'un générateur à graine fixe : la
 * même texture à chaque affichage.
 * Expose : tirageGraine(), textureGrain(), textureEclats(), textureEclatsRares(), textureEtoiles(),
 * textureFiligrane().
 * Dépend de : rien.
 *
 * mulberry32 (Tommy Ettinger, domaine public). Attention : `encodeURIComponent` laisse passer
 * l'apostrophe ; on l'encode à la main pour que l'adresse `data:` reste valable dans `url("…")`.
 */

/** Générateur pseudo-aléatoire à graine (mulberry32) : suite reproductible. */
export function tirageGraine(graine: number): () => number {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Un SVG en image CSS. */
function urlSvg(corps: string, largeur: number, hauteur: number): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${largeur}' height='${hauteur}' ` +
    `viewBox='0 0 ${largeur} ${hauteur}' preserveAspectRatio='none'>${corps}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg).replaceAll("'", '%27')}")`;
}

const un = (valeur: number) => Math.round(valeur * 10) / 10;

/** Mémorise une texture : elle n'est construite qu'une fois. */
function unefois(construire: () => string): () => string {
  let memo: string | undefined;
  return () => (memo ??= construire());
}

/** Grain fin en niveaux de gris (bruit fractal), tuile de 200 px. */
export const textureGrain = unefois(() =>
  urlSvg(
    "<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' " +
      "seed='7' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter>" +
      "<rect width='100%' height='100%' filter='url(#g)'/>",
    200,
    200,
  ),
);

/** Filigrane ornemental (volutes et losange), tuile répétée, trait de couleur `couleur`. */
export function textureFiligrane(couleur: string): string {
  return urlSvg(
    `<g fill='none' stroke='${couleur}' stroke-width='0.9' stroke-linecap='round'>` +
      "<path d='M20 4C26 10 26 16 20 20C14 16 14 10 20 4Z'/>" +
      "<path d='M20 36C26 30 26 24 20 20C14 24 14 30 20 36Z'/>" +
      "<path d='M4 20C10 14 16 14 20 20C16 26 10 26 4 20Z'/>" +
      "<path d='M36 20C30 14 24 14 20 20C24 26 30 26 36 20Z'/>" +
      "<path d='M0 0Q8 2 9 9M40 0Q32 2 31 9M0 40Q8 38 9 31M40 40Q32 38 31 31'/>" +
      "<circle cx='20' cy='20' r='1.6'/></g>",
    40,
    40,
  );
}

/** Éclats étoilés à quatre pointes, semés au hasard (graine fixe). */
function eclats(graine: number, nombre: number): string {
  const tirer = tirageGraine(graine);
  let etoiles = '';
  for (let i = 0; i < nombre; i += 1) {
    const cx = un(tirer() * 100);
    const cy = un(tirer() * 140);
    const taille = un(1.2 + tirer() * 2.8);
    const fin = un(taille * 0.12);
    etoiles +=
      `<path d='M${cx} ${un(cy - taille)}L${un(cx + fin)} ${un(cy - fin)}L${un(cx + taille)} ${cy}` +
      `L${un(cx + fin)} ${un(cy + fin)}L${cx} ${un(cy + taille)}L${un(cx - fin)} ${un(cy + fin)}` +
      `L${un(cx - taille)} ${cy}L${un(cx - fin)} ${un(cy - fin)}Z'/>`;
  }
  return urlSvg(`<g fill='#ffffff'>${etoiles}</g>`, 100, 140);
}

/** Éclats étoilés aux points de lumière (Argent et Or). */
export const textureEclats = unefois(() => eclats(29, 14));
/** Éclats rares (Bronze) : environ 30 % de la densité de `textureEclats`. */
export const textureEclatsRares = unefois(() => eclats(41, 4));

const champs = new Map<string, string>();
/** Champ d'étoiles semées au hasard dans une tuile carrée : une tuile par couleur et par graine. */
export function textureEtoiles(couleur: string, graine: number): string {
  const cle = `${couleur}|${graine}`;
  const memo = champs.get(cle);
  if (memo) return memo;
  const tirer = tirageGraine(graine);
  let etoiles = '';
  for (let i = 0; i < 60; i += 1) {
    const rayon = un(0.35 + tirer() * tirer() * 1.1);
    const opacite = un(0.45 + tirer() * 0.55);
    etoiles += `<circle cx='${un(tirer() * 100)}' cy='${un(tirer() * 100)}' r='${rayon}' opacity='${opacite}'/>`;
  }
  const texture = urlSvg(`<g fill='${couleur}'>${etoiles}</g>`, 100, 100);
  champs.set(cle, texture);
  return texture;
}
