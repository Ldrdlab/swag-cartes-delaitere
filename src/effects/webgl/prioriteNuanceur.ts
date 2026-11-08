/**
 * Arbitrage de la boucle WebGL : une seule carte anime son nuanceur à la fois.
 *
 * Rôle : chaque canevas qui veut s'animer s'inscrit ; le dernier inscrit a la main (par exemple la vue
 * agrandie, ouverte par-dessus la collection). Quand il se retire, la main revient au précédent. Les
 * autres gardent leur dernière image : le processeur graphique ne travaille que pour une carte.
 * Expose : useMainNuanceur().
 * Dépend de : react.
 */
import { useEffect, useState } from 'react';

/** Demandes en cours ; la dernière a la main. */
const demandes: object[] = [];
const ecouteurs = new Set<() => void>();

const prevenir = () => ecouteurs.forEach((ecouteur) => ecouteur());

/**
 * Vrai si le composant peut animer son nuanceur.
 * @param souhaite - Faux : le composant ne demande rien (effet figé).
 */
export function useMainNuanceur(souhaite: boolean): boolean {
  const [jeton] = useState(() => ({}));
  const [aLaMain, setALaMain] = useState(false);
  useEffect(() => {
    if (!souhaite) return undefined;
    const maj = () => setALaMain(demandes[demandes.length - 1] === jeton);
    ecouteurs.add(maj);
    demandes.push(jeton);
    prevenir();
    return () => {
      const rang = demandes.indexOf(jeton);
      if (rang >= 0) demandes.splice(rang, 1);
      ecouteurs.delete(maj);
      prevenir();
      setALaMain(false);
    };
  }, [souhaite, jeton]);
  return souhaite && aLaMain;
}
