/**
 * Réglages forcés des effets (page d'essai de l'admin seulement).
 *
 * Rôle : permettre à la page d'essai de comparer qualités, méthodes d'orbite et nombre de dessins WebGL
 * sans toucher aux réglages enregistrés sur l'appareil. Hors de cette page, le contexte est vide et rien
 * n'est forcé.
 * Expose : SurchargeEffets, ContexteSurcharge, useSurchargeEffets().
 * Dépend de : react, domain/effetsCartes (type), effects/socle/useOrbite (type).
 */
import { createContext, useContext } from 'react';
import type { QualiteEffet } from '../domain/effetsCartes';
import type { HorlogeEssai } from './socle/useOrbite';

/** Ce que la page d'essai peut forcer. */
export interface SurchargeEffets {
  /** Qualité forcée (sinon : réglage du joueur). */
  qualite?: QualiteEffet;
  /** Méthode d'orbite (sinon : horloge JavaScript). */
  horloge?: HorlogeEssai;
  /** Nombre maximal de dessins WebGL animés dans une grille (sinon : selon la qualité). */
  webglMax?: number;
}

export const ContexteSurcharge = createContext<SurchargeEffets>({});

/** Réglages forcés en cours (vides en temps normal). */
export function useSurchargeEffets(): SurchargeEffets {
  return useContext(ContexteSurcharge);
}
