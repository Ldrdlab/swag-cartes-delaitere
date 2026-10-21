/**
 * Écran 5 — Ouverture par découpe.
 *
 * Rôle : le booster occupe l'écran ; l'utilisateur trace une ligne horizontale le long de la ligne
 * pointillée du haut pour l'ouvrir. Alternatives sans geste : bouton « Ouvrir » ou touche Entrée.
 * Une fois ouvert, le haut du booster se détache puis on passe à la révélation.
 * Expose : le composant `BoosterOpeningScreen`.
 * Dépend de : hooks/useCutGesture, hooks/cutFeedback, hooks/useGlobalActivation, components/*,
 * boosters/BoosterVisuel, boosters/taille, hooks/useElementSize, config/gestures, config/timings.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { BoosterVisuel } from '../../boosters/BoosterVisuel';
import type { BoosterCatalogue } from '../../boosters/catalogue';
import { ajusterBooster } from '../../boosters/taille';
import { Button } from '../../components/Button';
import { CutTrail } from '../../components/CutTrail';
import { ScreenLayout } from '../../components/ScreenLayout';
import { CUT_THRESHOLDS } from '../../config/gestures';
import { CUT_DETACH_MS } from '../../config/timings';
import { cutFeedback } from '../../hooks/cutFeedback';
import { useCutGesture } from '../../hooks/useCutGesture';
import { useElementSize } from '../../hooks/useElementSize';
import { useGlobalActivation } from '../../hooks/useGlobalActivation';
import styles from './BoosterOpening.module.css';

/** Touches qui ouvrent le booster sans geste. */
const OPEN_KEYS = ['Enter'] as const;

interface BoosterOpeningScreenProps {
  /** Booster à ouvrir. */
  booster: BoosterCatalogue;
  /** Appelé quand le booster est ouvert et l'animation terminée. */
  onOpened: () => void;
}

/** Écran d'ouverture du booster. */
export function BoosterOpeningScreen({ booster, onOpened }: BoosterOpeningScreenProps) {
  const [isOpened, setIsOpened] = useState(false);
  const openedRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  useEffect(() => {
    onOpenedRef.current = onOpened;
  });

  // Point d'entrée unique de l'ouverture (geste, bouton ou Entrée) ; sans effet après la première fois.
  const open = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    cutFeedback.onCutComplete();
    setIsOpened(true);
  }, []);

  const { handlers, trail } = useCutGesture({
    onCutStart: cutFeedback.onCutStart,
    onCutProgress: cutFeedback.onCutProgress,
    onCutComplete: open,
    disabled: isOpened,
  });
  useGlobalActivation({ onActivate: open, keys: OPEN_KEYS });

  // Laisse l'animation de détachement se jouer, puis passe à l'écran suivant.
  useEffect(() => {
    if (!isOpened) return;
    const timer = window.setTimeout(() => onOpenedRef.current(), CUT_DETACH_MS);
    return () => window.clearTimeout(timer);
  }, [isOpened]);

  const lineRatio = CUT_THRESHOLDS.cutLineYRatio;
  // Taille exacte du booster (proportions 172 : 320) : le haut et le corps se rejoignent sans espace.
  const { ref: cadreRef, width, height } = useElementSize<HTMLDivElement>();
  const taille = ajusterBooster(width, height);

  return (
    <ScreenLayout
      title="Tracez une ligne pour ouvrir"
      footer={
        <Button variant="secondary" onClick={open} disabled={isOpened}>
          Ouvrir
        </Button>
      }
    >
      <div ref={cadreRef} className={styles.stage}>
        <div
          className={styles.pack}
          role="group"
          aria-label={`${booster.theme.nom}. Tracez une ligne horizontale en haut du booster pour l’ouvrir, ou utilisez le bouton Ouvrir.`}
          style={
            {
              '--cut-detach-ms': `${CUT_DETACH_MS}ms`,
              width: taille.largeur,
              height: taille.hauteur,
            } as CSSProperties
          }
          {...handlers}
        >
          {/* Deux morceaux séparés : le haut se détache après la découpe, le corps reste en place. */}
          <div className={`${styles.pieceHaut} ${isOpened ? styles.detached : ''}`}>
            <BoosterVisuel booster={booster} etat="ouverture" partie="haut" />
          </div>
          <div className={styles.pieceCorps}>
            <BoosterVisuel booster={booster} etat="ouverture" partie="corps" />
          </div>
          <div
            className={styles.cutLine}
            style={{ top: `${lineRatio * 100}%` }}
            aria-hidden="true"
          />
          <CutTrail points={trail} />
        </div>
      </div>
    </ScreenLayout>
  );
}
