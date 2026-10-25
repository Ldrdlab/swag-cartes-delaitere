/**
 * Scène centrale de la révélation : la carte, sa pile de dos, les effets et le bouton « Suivant ».
 *
 * Rôle : assembler, pour la carte courante, le halo, les rayons, les étincelles, la pile de dos, la
 * carte 3D, le texte en dessous (indication ou nom + badge) et le bouton « Suivant » (« Voir le
 * bilan » pour la dernière carte). Quand la carte est retournée, le focus passe sur « Suivant ».
 * Les effets propres à chaque rareté (halo, rayons, confettis, étincelles) sont décidés par
 * config/raretes.ts ; les durées par config/revelation.ts.
 * Expose : le composant `Scene`.
 * Dépend de : react, hooks/useRevealSequence (type), domain/effets, data/cards, config/revelation,
 * content/textes, Carte3D, PileDeCartes, BadgeRarete, effets/*, Scene.module.css.
 */
import { useEffect, useRef, type CSSProperties } from 'react';
import { DUREES, EFFETS_REDUITS, ENTREE_CARTE, RATIO_CARTE } from '../../config/revelation';
import { CARDS } from '../../data/cards';
import { TEXTES } from '../../content/textes';
import { nombreConfettis } from '../../domain/effets';
import type { RevealSequence } from '../../hooks/useRevealSequence';
import { BadgeRarete } from './BadgeRarete';
import { Carte3D } from './Carte3D';
import { Confettis } from './effets/Confettis';
import { Etincelles } from './effets/Etincelles';
import { Halo } from './effets/Halo';
import { RayonsLumineux } from './effets/RayonsLumineux';
import { PileDeCartes } from './PileDeCartes';
import styles from './Scene.module.css';

interface SceneProps {
  sequence: RevealSequence;
  /** Dos propre au booster (champ `dosImage` du thème), sinon le dos commun. */
  dosImage?: string;
  /** L'utilisateur veut-il moins de mouvement ? */
  mouvementReduit: boolean;
}

/** Scène centrale (voir le commentaire d'en-tête). */
export function Scene({ sequence, dosImage, mouvementReduit }: SceneProps) {
  const { etat, carte, rarete, dureeRetournementMs, estDerniere, toucher, suivant } = sequence;
  const { etape, indiceCarte, total } = etat;
  const boutonRef = useRef<HTMLButtonElement>(null);

  // Carte retournée : le focus passe sur « Suivant » (clavier et lecteurs d'écran).
  useEffect(() => {
    if (etape === 'FACE') boutonRef.current?.focus();
  }, [etape]);

  if (!carte || !rarete) return null;
  const textes = TEXTES.revelation;
  const tease = rarete.tease && !mouvementReduit;
  const allume = etape === 'TREMBLE' || etape === 'RETOURNE' || etape === 'FACE';
  const numero = CARDS.findIndex((candidate) => candidate.id === carte.id) + 1 || indiceCarte + 1;
  const confettis = nombreConfettis(rarete.confettis, EFFETS_REDUITS);

  const variables = {
    '--duree-entree': `${DUREES.entreeCarteMs}ms`,
    '--entree-monte': `${ENTREE_CARTE.montePx}px`,
    '--entree-echelle': ENTREE_CARTE.echelleDepart,
    '--duree-pulsation': `${DUREES.pulsationMs}ms`,
  } as CSSProperties;

  return (
    <section className={styles.scene} style={variables}>
      <div className={styles.zoneCarte} style={{ aspectRatio: String(RATIO_CARTE) }}>
        {rarete.halo ? (
          <Halo
            halo={rarete.halo}
            visible={allume}
            dureeMs={tease ? DUREES.teaseMs : DUREES.apparitionHaloMs}
          />
        ) : null}
        {rarete.rayons && !EFFETS_REDUITS && !mouvementReduit ? (
          <RayonsLumineux visible={allume} dureeMs={DUREES.teaseMs} />
        ) : null}
        {tease && etape === 'TREMBLE' ? <Etincelles /> : null}
        {/* Une nouvelle carte arrive : elle monte, apparaît et grossit légèrement. */}
        <div key={indiceCarte} className={styles.entree}>
          <PileDeCartes cartesRestantes={total - indiceCarte - 1} dosImage={dosImage}>
            <Carte3D
              carte={carte}
              indice={indiceCarte}
              total={total}
              numeroCollection={numero}
              totalCollection={CARDS.length}
              etape={etape}
              dureeRetournementMs={dureeRetournementMs}
              mouvementReduit={mouvementReduit}
              dosImage={dosImage}
              onToucher={toucher}
            />
          </PileDeCartes>
        </div>
      </div>

      <div className={styles.legende}>
        {etape === 'DOS' ? <p className={styles.indication}>{textes.indicationDos}</p> : null}
        {etape === 'TREMBLE' ? <p className={styles.attente}>{textes.indicationTease}</p> : null}
        {etape === 'FACE' ? (
          <>
            <h2 className={styles.nom}>{carte.name}</h2>
            <BadgeRarete rarete={carte.rarity} />
          </>
        ) : null}
      </div>

      <div className={styles.action}>
        <button
          ref={boutonRef}
          type="button"
          className={styles.suivant}
          data-visible={etape === 'FACE'}
          aria-label={estDerniere ? textes.voirBilan : textes.suivant}
          onClick={suivant}
        >
          {estDerniere ? textes.voirBilan : textes.suivant}
        </button>
      </div>

      {/* Confettis des raretés qui en ont, une fois la carte retournée. */}
      {etape === 'FACE' && confettis > 0 && !mouvementReduit ? (
        <Confettis key={indiceCarte} nombre={confettis} />
      ) : null}
    </section>
  );
}
