/**
 * Carte qui se retourne en 3D (dos → face).
 *
 * Rôle : montrer le dos d'une carte, la faire pivoter quand l'utilisateur la touche, et faire trembler
 * les cartes à animation d'attente. Structure (de l'extérieur vers l'intérieur) :
 *   scene   — `perspective: 1000px` (la 3D se voit)
 *   tremble — reçoit le tremblement (SURTOUT PAS le même élément que celui qui pivote)
 *   pivot   — `preserve-3d`, tourne de 0 à 180° ; c'est lui qui est cliquable (div role="button",
 *             pas un <button> : preserve-3d y est peu fiable)
 *   faces   — dos et face, `backface-visibility: hidden` sur les DEUX ; la face est déjà tournée à 180°
 * Le pivot n'a de transition que pendant RETOURNE et FACE : au retour en DOS (carte suivante), aucune
 * transition, la nouvelle carte apparaît dos visible sans qu'on voie l'ancienne se retourner.
 * Expose : le composant `Carte3D`.
 * Dépend de : react, hooks/useTremblement, domain/revelation (type), config/raretes, config/revelation,
 * content/textes, content/formatTexte, CarteVerso, CarteRecto, Carte3D.module.css.
 */
import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { RARETES } from '../../config/raretes';
import { DUREES } from '../../config/revelation';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import type { EtapeRevelation } from '../../domain/revelation';
import type { Card } from '../../domain/types';
import { useTremblement } from '../../hooks/useTremblement';
import styles from './Carte3D.module.css';
import { CarteRecto } from './CarteRecto';
import { CarteVerso } from './CarteVerso';

interface Carte3DProps {
  carte: Card;
  /** Position de la carte dans le booster (à partir de 0) et nombre de cartes du booster. */
  indice: number;
  total: number;
  etape: EtapeRevelation;
  /** Durée du retournement (ms). */
  dureeRetournementMs: number;
  /** L'utilisateur veut-il moins de mouvement ? (pas de tremblement) */
  mouvementReduit: boolean;
  dosImage?: string;
  /** Toucher / clic / Entrée / Espace. */
  onToucher: () => void;
}

/** Carte 3D (voir le commentaire d'en-tête). */
export function Carte3D({
  carte,
  indice,
  total,
  etape,
  dureeRetournementMs,
  mouvementReduit,
  dosImage,
  onToucher,
}: Carte3DProps) {
  const rarete = RARETES[carte.rarity];
  const trembleRef = useRef<HTMLDivElement>(null);
  const tremble = etape === 'TREMBLE';
  useTremblement(trembleRef, tremble && !mouvementReduit, DUREES.teaseMs);

  const retournee = etape === 'RETOURNE' || etape === 'FACE';
  const avecTransition = retournee; // pas de transition au retour en DOS
  const variables = {
    '--duree-retournement': `${dureeRetournementMs}ms`,
    '--duree-fondu': `${DUREES.fonduReduitMs}ms`,
  } as CSSProperties;

  const surClavier = (evenement: KeyboardEvent<HTMLDivElement>) => {
    if (evenement.key !== 'Enter' && evenement.key !== ' ') return;
    evenement.preventDefault();
    onToucher();
  };

  const libelle =
    etape === 'DOS'
      ? remplir(TEXTES.revelation.labelCarteDos, {
          numero: String(indice + 1),
          total: String(total),
        })
      : remplir(TEXTES.revelation.annonce, { nom: carte.name, rarete: rarete.nom });

  return (
    <div className={styles.scene} style={variables}>
      <div ref={trembleRef} className={styles.tremble} data-tremble={tremble}>
        <div
          className={styles.pivot}
          role="button"
          tabIndex={0}
          aria-label={libelle}
          data-retournee={retournee}
          data-transition={avecTransition}
          onClick={onToucher}
          onKeyDown={surClavier}
        >
          <div className={styles.faceDos}>
            <CarteVerso
              dosImage={dosImage}
              avecLueur={rarete.tease}
              lueurAllumee={tremble || etape === 'RETOURNE'}
            />
          </div>
          <div className={styles.faceRecto}>
            <CarteRecto
              carte={carte}
              avecReflet={etape === 'FACE'}
              modeEffet={retournee ? 'interactif' : 'statique'}
              retournee={retournee}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
