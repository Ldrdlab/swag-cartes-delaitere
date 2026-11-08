/**
 * Options d'affichage des effets : « Effets réduits » et « Qualité des effets », retenues sur l'appareil.
 *
 * Rôle : un interrupteur par appareil (stockage local). Quand il est actif, les effets passent en
 * qualité « éco », sans animation ni suivi de l'inclinaison. Le réglage système « réduire les
 * animations » (prefers-reduced-motion) a le même effet, sans rien enregistrer.
 * La qualité (Auto / Élevée / Économie) est lue par tous les effets ; « Effets réduits » force la qualité
 * « économie ».
 * Expose : lireEffetsReduits(), ecrireEffetsReduits(), useOptionEffetsReduits(), useEffetsReduits(),
 * lirePreferenceQualite(), ecrirePreferenceQualite(), usePreferenceQualite().
 * Dépend de : react, config/effets, domain/effetsCartes, hooks/useMouvementReduit.
 */
import { useSyncExternalStore } from 'react';
import { CLE_STOCKAGE_EFFETS_REDUITS, CLE_STOCKAGE_QUALITE_EFFETS } from '../config/effets';
import { PREFERENCES_QUALITE, type PreferenceQualite } from '../domain/effetsCartes';
import { useMouvementReduit } from '../hooks/useMouvementReduit';

const ecouteurs = new Set<() => void>();

/** Valeur enregistrée sur l'appareil (faux si le stockage est inaccessible). */
export function lireEffetsReduits(): boolean {
  try {
    return window.localStorage.getItem(CLE_STOCKAGE_EFFETS_REDUITS) === 'oui';
  } catch {
    return false;
  }
}

/** Enregistre l'option sur l'appareil et prévient les effets affichés. */
export function ecrireEffetsReduits(valeur: boolean): void {
  try {
    if (valeur) window.localStorage.setItem(CLE_STOCKAGE_EFFETS_REDUITS, 'oui');
    else window.localStorage.removeItem(CLE_STOCKAGE_EFFETS_REDUITS);
  } catch {
    // Stockage refusé (navigation privée) : l'option vaut pour la session seulement.
  }
  ecouteurs.forEach((ecouteur) => ecouteur());
}

/** Qualité choisie sur l'appareil (« auto » si rien n'est enregistré ou si le stockage est inaccessible). */
export function lirePreferenceQualite(): PreferenceQualite {
  try {
    const valeur = window.localStorage.getItem(CLE_STOCKAGE_QUALITE_EFFETS);
    return PREFERENCES_QUALITE.find((p) => p === valeur) ?? 'auto';
  } catch {
    return 'auto';
  }
}

/** Enregistre la qualité sur l'appareil et prévient les effets affichés. */
export function ecrirePreferenceQualite(valeur: PreferenceQualite): void {
  try {
    if (valeur === 'auto') window.localStorage.removeItem(CLE_STOCKAGE_QUALITE_EFFETS);
    else window.localStorage.setItem(CLE_STOCKAGE_QUALITE_EFFETS, valeur);
  } catch {
    // Stockage refusé (navigation privée) : le choix vaut pour la session seulement.
  }
  ecouteurs.forEach((ecouteur) => ecouteur());
}

function sAbonner(rappel: () => void): () => void {
  ecouteurs.add(rappel);
  window.addEventListener('storage', rappel);
  return () => {
    ecouteurs.delete(rappel);
    window.removeEventListener('storage', rappel);
  };
}

/** Valeur de la case « Effets réduits » (l'option de l'appli seule, sans le réglage du système). */
export function useOptionEffetsReduits(): boolean {
  return useSyncExternalStore(sAbonner, lireEffetsReduits, () => false);
}

/** Vrai si les effets doivent être réduits : option de l'appli ou réglage « réduire les animations » du système. */
export function useEffetsReduits(): boolean {
  const option = useOptionEffetsReduits();
  const systeme = useMouvementReduit();
  return option || systeme;
}

/** Qualité choisie par le joueur (Auto, Élevée ou Économie). */
export function usePreferenceQualite(): PreferenceQualite {
  return useSyncExternalStore(sAbonner, lirePreferenceQualite, () => 'auto');
}
