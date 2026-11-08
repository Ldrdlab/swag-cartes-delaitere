/**
 * Couche d'effet posée par-dessus l'image d'une carte.
 *
 * Rôle : charger l'effet demandé (code téléchargé à la demande), empiler ses calques CSS (et son dessin
 * WebGL éventuel) dans la zone choisie, et le faire vivre selon le mode :
 *   - `statique` : image fixe, aucune animation ;
 *   - `anime` (grilles) : animations CSS en continu, et reflets qui bougent au repos (orbite lente, cadence
 *     de 30 images par seconde) ; le tout est suspendu hors écran et onglet masqué ;
 *   - `interactif` (vue agrandie, carte retournée) : comme `anime` à pleine cadence, et le reflet suit en
 *     plus la souris ou le doigt (priorité absolue pour le dessin WebGL).
 * L'option « Effets réduits » (ou le réglage système) force le mode statique et la qualité « éco ». La
 * qualité (Auto / Élevée / Économie) est celle du joueur (effects/preferences).
 * Les couches ne bougent que par `transform` et `opacity` ; la position du reflet vient de l'horloge
 * unique (effects/socle/horloge), sans nouveau rendu React.
 * Expose : EffetCarte, indicesAppareil().
 * Dépend de : react, config/effets, domain/effetsCartes, effects (registre), effects/preferences,
 * effects/surcharge, effects/types, effects/socle/*.
 */
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import {
  GEOMETRIE_ZONES,
  INTERVALLE_MS,
  POSE_REFLET,
  SEUILS_APPAREIL_MODESTE,
  WEBGL_ANIMES_MAX,
} from '../config/effets';
import {
  facteurIntensite,
  resoudreQualite,
  zoneVersClipPath,
  type IndicesAppareil,
  type ModeEffet,
  type ZoneEffet,
} from '../domain/effetsCartes';
import { chargerEffet, ficheChargee } from './index';
import { useEffetsReduits, usePreferenceQualite } from './preferences';
import { useSurchargeEffets } from './surcharge';
import styles from './socle/EffetCarte.module.css';
import { useActivite } from './socle/useActivite';
import { useOrbite } from './socle/useOrbite';
import { usePointeurEffet } from './socle/usePointeurEffet';
import type { CalqueEffet, FicheEffet, ReglagesEffet } from './types';

/** Ce que l'on lit du navigateur pour juger si l'appareil est modeste. */
export function indicesAppareil(): IndicesAppareil {
  if (typeof navigator === 'undefined') return {};
  const etendu = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return {
    coeurs: navigator.hardwareConcurrency,
    memoireGo: etendu.deviceMemory,
    economieDonnees: etendu.connection?.saveData,
  };
}

/** Un aplat (`#rrggbb`, `rgb()`, `hsl()`) va dans `backgroundColor`, un dégradé ou une image dans `backgroundImage`. */
const COULEUR_UNIE = /^(#|rgb|hsl)/i;

function styleCalque(c: CalqueEffet): CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    ...(COULEUR_UNIE.test(c.fond) ? { backgroundColor: c.fond } : { backgroundImage: c.fond }),
    mixBlendMode: c.fusion,
    opacity: c.opacite,
    backgroundSize: c.tailleFond,
    backgroundPosition: c.positionFond,
    ...(c.transformation ? { transform: c.transformation } : {}),
    ...(c.animation ? { animation: c.animation } : {}),
    ...(c.variables ?? {}),
  };
}

/** Fiche de l'effet, chargée à la demande (`undefined` tant qu'elle arrive, ou si l'effet n'existe pas). */
function useFiche(cle: string): FicheEffet | undefined {
  const [chargee, setChargee] = useState<{ cle: string; fiche: FicheEffet | null }>();
  useEffect(() => {
    if (ficheChargee(cle)) return undefined;
    let annule = false;
    void chargerEffet(cle).then((fiche) => {
      if (!annule) setChargee({ cle, fiche });
    });
    return () => {
      annule = true;
    };
  }, [cle]);
  return ficheChargee(cle) ?? (chargee?.cle === cle ? (chargee.fiche ?? undefined) : undefined);
}

interface Props {
  /** Clé de l'effet dans le registre (`aucun` : rien n'est affiché). */
  cle: string;
  /** Intensité de 0 à 100 (100 par défaut). */
  intensite?: number;
  /** Zone couverte ; par défaut celle de la fiche de l'effet. */
  zone?: ZoneEffet;
  mode?: ModeEffet;
  reglages?: ReglagesEffet;
  /** Force « Effets réduits » (aperçu de l'admin) ; sinon on lit l'option de l'appareil. */
  effetsReduits?: boolean;
  /** Élément qui reçoit souris et doigt en mode interactif (la carte) ; sans lui, pas de suivi. */
  cible?: RefObject<HTMLElement | null>;
  /** Texte qui fixe le point de départ de l'orbite (identifiant de la carte) : chaque carte bouge différemment. */
  graine?: string;
}

export function EffetCarte({
  cle,
  intensite = 100,
  zone,
  mode = 'anime',
  reglages,
  effetsReduits,
  cible,
  graine,
}: Props) {
  // Élément (et non simple référence) : la couche n'existe qu'une fois l'effet chargé.
  const [racine, setRacine] = useState<HTMLDivElement | null>(null);
  const fiche = useFiche(cle);
  const actif = useActivite(racine);
  const optionReduits = useEffetsReduits();
  const reduits = effetsReduits ?? optionReduits;
  const preference = usePreferenceQualite();
  const surcharge = useSurchargeEffets();
  const modeEffectif: ModeEffet = reduits ? 'statique' : mode;
  const anime = modeEffectif !== 'statique' && actif;
  const interactif = modeEffectif === 'interactif';
  const vide = useRef<HTMLElement | null>(null);
  // Orbite au repos (horloge unique) puis geste : la carte agrandie est mise à jour à chaque image.
  const poignee = useOrbite(
    cible,
    racine,
    anime,
    graine ?? cle,
    interactif ? INTERVALLE_MS.agrandie : INTERVALLE_MS.grille,
    surcharge.horloge,
  );
  usePointeurEffet(cible ?? vide, poignee, interactif && actif);

  const facteur = facteurIntensite(intensite);
  if (!fiche || facteur === 0) return null;
  const qualite =
    surcharge.qualite ??
    resoudreQualite(indicesAppareil(), SEUILS_APPAREIL_MODESTE, reduits, preference);
  const calques = fiche.calques({ intensite: facteur, pointeur: POSE_REFLET, qualite, reglages });
  const clip = zoneVersClipPath(zone ?? fiche.zone, GEOMETRIE_ZONES);
  const Dessin = fiche.Composant;
  return (
    <div
      ref={setRacine}
      className={styles.racine}
      data-effet={cle}
      data-actif={actif}
      data-fige={anime ? 'non' : 'oui'}
      aria-hidden="true"
      style={clip ? { clipPath: clip } : undefined}
    >
      {calques.map((calque, rang) => (
        <div key={rang} style={styleCalque(calque)} />
      ))}
      {Dessin ? (
        <Dessin
          intensite={facteur}
          reglages={reglages ?? {}}
          qualite={qualite}
          fige={!anime}
          prioritaire={interactif}
          maxAnimes={surcharge.webglMax ?? WEBGL_ANIMES_MAX[qualite]}
        />
      ) : null}
    </div>
  );
}
