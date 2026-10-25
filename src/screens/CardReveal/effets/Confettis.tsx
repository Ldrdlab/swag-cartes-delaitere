/**
 * Pluie de confettis (cartes ultra-rares et légendaires).
 *
 * Rôle : des pièces de 6-10 × 10-16 px, certaines rondes, qui tombent UNE fois depuis le haut de
 * l'écran (environ 880 px, avec dérive et rotation), puis sont retirées. Positions calculées par
 * domain/effets (aucun hasard). Ne captent aucun toucher.
 * Expose : le composant `Confettis`.
 * Dépend de : react, domain/effets, config/revelation, Confettis.module.css.
 */
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { COULEURS_CONFETTIS, GEOMETRIE_CONFETTIS } from '../../../config/revelation';
import { genererConfettis } from '../../../domain/effets';
import styles from './Confettis.module.css';

/** Marge ajoutée à la durée de la dernière chute avant de retirer les confettis (ms). */
const MARGE_RETRAIT_MS = 200;

interface ConfettisProps {
  /** Nombre de confettis à lancer (déjà réduit si les effets sont réduits). */
  nombre: number;
}

/** Pluie de confettis. */
export function Confettis({ nombre }: ConfettisProps) {
  const pieces = useMemo(
    () => genererConfettis(nombre, COULEURS_CONFETTIS, GEOMETRIE_CONFETTIS),
    [nombre],
  );
  const [termine, setTermine] = useState(false);

  // Une fois la dernière pièce tombée, on retire tout du DOM.
  useEffect(() => {
    const finMs = Math.max(0, ...pieces.map((piece) => (piece.delaiS + piece.dureeS) * 1000));
    const minuterie = window.setTimeout(() => setTermine(true), finMs + MARGE_RETRAIT_MS);
    return () => window.clearTimeout(minuterie);
  }, [pieces]);

  if (termine || pieces.length === 0) return null;
  return (
    <div className={styles.zone} aria-hidden="true">
      {pieces.map((piece) => {
        const variables = {
          left: `${piece.gauchePourcent}%`,
          width: piece.largeur,
          height: piece.hauteur,
          background: piece.couleur,
          borderRadius: piece.ronde ? '50%' : '2px',
          animationDelay: `${piece.delaiS}s`,
          animationDuration: `${piece.dureeS}s`,
          '--derive': `${piece.deriveX}px`,
          '--chute': `${piece.chutePx}px`,
          '--rotation': `${piece.rotationDeg}deg`,
        } as CSSProperties;
        return <span key={piece.id} className={styles.piece} style={variables} />;
      })}
    </div>
  );
}
