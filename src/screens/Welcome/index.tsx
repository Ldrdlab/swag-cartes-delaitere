/**
 * Écran 1 — Accueil.
 *
 * Rôle : écran d'accueil habillé (logo, cartes flottantes, invitation). Un tap, un clic n'importe où,
 * ou la touche Entrée / Espace fait passer à l'écran Profil. Tous les textes viennent de
 * content/textes.ts, les cartes décoratives de config/accueil.ts.
 * Expose : le composant `WelcomeScreen`.
 * Dépend de : react, components/FloatingCard, content/textes, config/accueil, hooks/useGlobalActivation,
 * hooks/useStorage, Welcome.module.css.
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { FloatingCard } from '../../components/FloatingCard';
import { CARTES_FLOTTANTES, REGLAGES_ANIMATION } from '../../config/accueil';
import { TEXTES } from '../../content/textes';
import { useGlobalActivation } from '../../hooks/useGlobalActivation';
import { useStorage } from '../../hooks/useStorage';
import styles from './Welcome.module.css';

/** Touches qui démarrent le parcours. */
const START_KEYS = ['Enter', ' '] as const;

/** Durées et amplitude des animations, transmises au CSS sous forme de variables. */
const VARIABLES_ANIMATION = {
  '--duree-flottement': `${REGLAGES_ANIMATION.dureeFlottementS}s`,
  '--amplitude-flottement': `${REGLAGES_ANIMATION.amplitudeFlottementPx}px`,
  '--duree-pulsation': `${REGLAGES_ANIMATION.dureePulsationS}s`,
} as CSSProperties;

interface WelcomeScreenProps {
  /** Appelé pour passer à l'écran Profil. */
  onStart: () => void;
}

/** Écran d'accueil. */
export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const textes = TEXTES.accueil;
  const storage = useStorage();
  const [pseudo, setPseudo] = useState<string | null>(null);

  // « N'importe où » : clic/tap sur toute la fenêtre (marges de l'écran ordinateur comprises) ou clavier.
  // Un double déclenchement est sans effet : la machine à états ignore le 2e événement.
  useGlobalActivation({ onActivate: onStart, keys: START_KEYS, includeClicks: true });

  // Pseudo enregistré lors d'une précédente visite (affiché en haut à gauche).
  useEffect(() => {
    let annule = false;
    storage
      .loadPlayer()
      .then((joueur) => {
        if (!annule) setPseudo(joueur?.pseudo ?? null);
      })
      .catch(() => undefined);
    return () => {
      annule = true;
    };
  }, [storage]);

  return (
    <div className={styles.page}>
      <main className={styles.ecran} style={VARIABLES_ANIMATION}>
        {/* Décor : cartes flottantes derrière le contenu (ignorées par les lecteurs d'écran). */}
        <div className={styles.cartes} aria-hidden="true">
          {CARTES_FLOTTANTES.map((carte, position) => (
            <FloatingCard key={position} carte={carte} />
          ))}
        </div>

        <p className={styles.infos}>
          <span>{textes.version}</span>
          <span className={styles.joueur}>
            {textes.labelJoueur} <strong>{pseudo ?? textes.pseudoAbsent}</strong>
          </span>
        </p>

        <h1 className={styles.logo}>
          <span className={styles.titre}>{textes.titre}</span>
          <span className={styles.sousTitre}>{textes.sousTitre}</span>
          <span className={styles.nomAppli}>{textes.nomAppli}</span>
        </h1>

        <div className={styles.bas}>
          {/* Bouton pour le clavier et les lecteurs d'écran ; le clic « n'importe où » est géré plus haut. */}
          <button type="button" className={styles.invitation}>
            {textes.invitation}
          </button>
          <p className={styles.mentions}>{textes.mentions}</p>
        </div>
      </main>
    </div>
  );
}
