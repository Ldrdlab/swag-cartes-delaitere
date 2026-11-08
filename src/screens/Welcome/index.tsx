/**
 * Écran d'accueil (onglet « Accueil »).
 *
 * Rôle : écran d'accueil habillé (logo, cartes flottantes) qui sert aussi de point de départ pour ouvrir
 * un booster : il montre combien de boosters il reste aujourd'hui, le temps avant la remise à zéro quand il
 * n'en reste plus, et le bouton « Ouvrir un booster ». En haut : version, pseudo (touche pour modifier le
 * profil) et « Se déconnecter ». Tous les textes viennent de content/textes.ts.
 * Expose : le composant `WelcomeScreen`.
 * Dépend de : react, components/FloatingCard, content/textes, content/formatTexte, config/accueil,
 * config/version, domain/temps, hooks/useBoosters, hooks/useStorage, Welcome.module.css.
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { FloatingCard } from '../../components/FloatingCard';
import { CARTES_FLOTTANTES, REGLAGES_ANIMATION } from '../../config/accueil';
import { VERSION_APPLI } from '../../config/version';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { formaterDuree } from '../../domain/temps';
import { useBoosters } from '../../hooks/useBoosters';
import { useStorage } from '../../hooks/useStorage';
import styles from './Welcome.module.css';

/** Durées et amplitude des animations, transmises au CSS sous forme de variables. */
const VARIABLES_ANIMATION = {
  '--duree-flottement': `${REGLAGES_ANIMATION.dureeFlottementS}s`,
  '--amplitude-flottement': `${REGLAGES_ANIMATION.amplitudeFlottementPx}px`,
  '--duree-pulsation': `${REGLAGES_ANIMATION.dureePulsationS}s`,
} as CSSProperties;

interface WelcomeScreenProps {
  /** Appelé pour passer au choix du booster. */
  onStart: () => void;
  /** Appelé pour ouvrir l'écran Profil (pseudo et avatar). */
  onOpenProfile: () => void;
  /** Appelé pour fermer la session. */
  onLogout: () => void;
}

/** Écran d'accueil. */
export function WelcomeScreen({ onStart, onOpenProfile, onLogout }: WelcomeScreenProps) {
  const textes = TEXTES.accueil;
  const storage = useStorage();
  const boosters = useBoosters();
  const [pseudo, setPseudo] = useState<string | null>(null);

  // Pseudo du compte (affiché en haut à gauche).
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

  const { etat, secondesAvantReset, recharger } = boosters;
  // Plus aucun booster aujourd'hui : le bouton est grisé. En cas d'erreur de lecture, on laisse essayer
  // (le serveur décide).
  const epuise = etat.statut === 'pret' && etat.donnees.restants === 0;

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
          <span>{remplir(textes.version, { version: VERSION_APPLI })}</span>
          <button
            type="button"
            className={styles.joueur}
            aria-label={textes.labelProfil}
            onClick={onOpenProfile}
          >
            {textes.labelJoueur} <strong>{pseudo ?? textes.pseudoAbsent}</strong>
          </button>
        </p>

        <div className={styles.actionsHaut}>
          <button type="button" className={styles.boutonHaut} onClick={onLogout}>
            {textes.boutonDeconnexion}
          </button>
        </div>

        <h1 className={styles.logo}>
          <span className={styles.titre}>{textes.titre}</span>
          <span className={styles.sousTitre}>{textes.sousTitre}</span>
          <span className={styles.nomAppli}>{textes.nomAppli}</span>
        </h1>

        <div className={styles.bas}>
          <div className={styles.statut} role="status" aria-live="polite">
            {etat.statut === 'chargement' && <p>{textes.chargementBoosters}</p>}
            {etat.statut === 'erreur' && (
              <p>
                {textes.erreurBoosters}{' '}
                <button type="button" className={styles.lien} onClick={recharger}>
                  {textes.reessayer}
                </button>
              </p>
            )}
            {etat.statut === 'pret' && (
              <>
                <p>
                  {remplir(textes.restants, {
                    restants: String(etat.donnees.restants),
                    parJour: String(etat.donnees.parJour),
                  })}
                </p>
                {epuise && (
                  <p>
                    {remplir(textes.prochain, {
                      duree: formaterDuree(secondesAvantReset, textes.duree),
                    })}
                  </p>
                )}
              </>
            )}
          </div>
          <button type="button" className={styles.ouvrir} disabled={epuise} onClick={onStart}>
            {textes.boutonOuvrir}
          </button>
          <p className={styles.mentions}>{textes.mentions}</p>
        </div>
      </main>
    </div>
  );
}
