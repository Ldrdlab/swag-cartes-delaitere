/**
 * Écran 6 — Révélation des cartes.
 *
 * Rôle : chaque carte arrive DOS visible ; l'utilisateur la touche, elle se retourne (avec une
 * animation d'attente pour les légendaires), puis il appuie sur « Suivant ». Après la dernière carte
 * (ou sur « Passer »), le bilan s'affiche avec « Ouvrir un autre booster » et « Accueil ».
 * La séquence est pilotée par domain/revelation (machine à états pure) via hooks/useRevealSequence.
 * Mode développeur : `?forcer=legendaire` dans l'adresse fait commencer par une carte de cette rareté.
 * Expose : le composant `CardRevealScreen`.
 * Dépend de : react, hooks/useRevealSequence, hooks/useMouvementReduit, hooks/usePageVisible,
 * domain/revelation, data/cards, config/raretes, config/revelation, content/*, boosters/catalogue,
 * EnTete, Scene, Bilan, PaquetSortant, effets/Flash, CardReveal.module.css.
 */
import { useMemo, type CSSProperties } from 'react';
import type { BoosterCatalogue } from '../../boosters/catalogue';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { TAILLE_CARTE } from '../../config/revelation';
import { CARDS } from '../../data/cards';
import { appliquerForcage, lireForcage } from '../../domain/revelation';
import type { Card } from '../../domain/types';
import { useMouvementReduit } from '../../hooks/useMouvementReduit';
import { usePageVisible } from '../../hooks/usePageVisible';
import { useRevealSequence } from '../../hooks/useRevealSequence';
import { Bilan } from './Bilan';
import { Flash } from './effets/Flash';
import { EnTete } from './EnTete';
import { PaquetSortant } from './PaquetSortant';
import { Scene } from './Scene';
import styles from './CardReveal.module.css';

interface CardRevealScreenProps {
  /** Cartes tirées, dans l'ordre de révélation. */
  cards: readonly Card[];
  /** Booster qui vient d'être ouvert (nom, saison, dos des cartes). */
  booster: BoosterCatalogue;
  /** Retour au choix du booster. */
  onOpenAnother: () => void;
  /** Retour à l'écran d'accueil. */
  onHome: () => void;
}

/** Largeur de la carte : de 168 px à 228 px selon la largeur ET la hauteur de l'écran (clamp). */
const LARGEUR_CARTE = `clamp(${TAILLE_CARTE.largeurMinPx}px, min(${TAILLE_CARTE.largeurVw}vw, ${TAILLE_CARTE.largeurDvh}dvh), ${TAILLE_CARTE.largeurPx}px)`;

/** Écran de révélation des cartes. */
export function CardRevealScreen({ cards, booster, onOpenAnother, onHome }: CardRevealScreenProps) {
  const mouvementReduit = useMouvementReduit();
  const pageVisible = usePageVisible();
  // Mode développeur : ?forcer=legendaire (lu une seule fois à l'ouverture de l'écran).
  const forcage = useMemo(() => lireForcage(window.location.search), []);
  const cartes = useMemo(
    () => (forcage ? appliquerForcage(cards, forcage, CARDS) : cards),
    [cards, forcage],
  );

  const sequence = useRevealSequence({ cartes, mouvementReduit });
  const { etat, carte, rarete } = sequence;
  const { etape, indiceCarte, total } = etat;
  const { theme } = booster;
  const textes = TEXTES.revelation;

  const vues = etape === 'BILAN' ? total : indiceCarte + (etape === 'FACE' ? 1 : 0);
  // Annonce pour les lecteurs d'écran, une fois la carte retournée.
  const annonce =
    etape === 'FACE' && carte && rarete
      ? remplir(textes.annonce, { nom: carte.name, rarete: rarete.nom })
      : '';
  const variables = {
    '--carte-largeur': LARGEUR_CARTE,
  } as CSSProperties;

  return (
    <div className={styles.page}>
      {/* data-pause : les animations en boucle (reflet, rayons) s'arrêtent si la page n'est pas visible. */}
      <main className={styles.ecran} style={variables} data-pause={!pageVisible}>
        <h1 className={styles.masque}>{textes.titrePage}</h1>
        <EnTete
          nomBooster={theme.nom}
          saison={theme.saison}
          total={total}
          vues={vues}
          avecPasser={etape !== 'BILAN'}
          onPasser={sequence.passer}
        />
        {etape === 'BILAN' ? (
          <Bilan
            cartes={cartes}
            nomBooster={theme.nom}
            onOuvrirAutre={onOpenAnother}
            onAccueil={onHome}
          />
        ) : (
          <Scene sequence={sequence} dosImage={theme.dosImage} mouvementReduit={mouvementReduit} />
        )}
        <p className={styles.masque} aria-live="polite">
          {annonce}
        </p>
        {/* Flash plein écran au milieu du retournement d'une carte à animation d'attente. */}
        {etape === 'RETOURNE' && rarete?.tease && !mouvementReduit ? (
          <Flash key={indiceCarte} />
        ) : null}
        <PaquetSortant booster={booster} />
      </main>
    </div>
  );
}
