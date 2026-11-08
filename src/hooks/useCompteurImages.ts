/**
 * Compteur d'images par seconde (page d'essai de l'admin).
 *
 * Rôle : mesurer la fluidité réelle de la page : un `requestAnimationFrame` note le temps entre deux
 * images ; toutes les 500 ms on en tire les images par seconde, le temps de la 95e plus lente (« p95 »)
 * et le pire temps sur les 2 dernières secondes. Un temps de 16 ms = 60 images/s ; 33 ms = 30 images/s.
 * La mesure repart de zéro quand `cle` change (réglage modifié).
 * Expose : MesureImages, useCompteurImages().
 * Dépend de : react.
 */
import { useEffect, useState } from 'react';

/** Résultat d'une mesure. */
export interface MesureImages {
  fps: number;
  p95Ms: number;
  maxMs: number;
}

/** Images gardées pour le calcul (environ 2 secondes à 60 images par seconde). */
const FENETRE = 120;
/** Intervalle entre deux mises à jour de l'affichage (ms). */
const RAFRAICHIR_MS = 500;

/**
 * @param actif - Faux : aucune mesure.
 * @param cle - Change quand les réglages changent : la mesure repart de zéro.
 */
export function useCompteurImages(actif: boolean, cle: string): MesureImages | null {
  const [mesure, setMesure] = useState<MesureImages | null>(null);
  useEffect(() => {
    if (!actif) return undefined;
    let image = 0;
    let dernier = 0;
    let depuisAffichage = 0;
    const ecarts: number[] = [];
    const boucle = (maintenant: number) => {
      if (dernier !== 0) {
        ecarts.push(maintenant - dernier);
        if (ecarts.length > FENETRE) ecarts.shift();
        depuisAffichage += maintenant - dernier;
        if (depuisAffichage >= RAFRAICHIR_MS && ecarts.length >= 10) {
          depuisAffichage = 0;
          const tries = [...ecarts].sort((a, b) => a - b);
          const moyenne = ecarts.reduce((somme, e) => somme + e, 0) / ecarts.length;
          setMesure({
            fps: Math.round(1000 / moyenne),
            p95Ms: Math.round(tries[Math.floor(tries.length * 0.95)] ?? 0),
            maxMs: Math.round(tries[tries.length - 1] ?? 0),
          });
        }
      }
      dernier = maintenant;
      image = requestAnimationFrame(boucle);
    };
    image = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(image);
  }, [actif, cle]);
  return actif ? mesure : null;
}
