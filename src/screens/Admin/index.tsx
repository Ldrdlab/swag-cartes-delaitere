/**
 * Écran « Administration » (réservé aux administrateurs).
 *
 * Rôle : cadre de l'espace admin avec ses six sections (Cartes, Boosters, Joueurs, Effets, Essai, Version) sous forme
 * d'onglets. L'écran ne s'affiche que si le profil lu dans la base a le rôle « admin » ; mais la vraie
 * protection est dans la base : même en contournant l'écran, un joueur est refusé.
 * Expose : le composant `AdminScreen`.
 * Dépend de : react, content/textes, hooks/useAuth, SectionCartes, SectionBoosters,
 * SectionJoueurs, SectionEffets, SectionEssaiEffets, SectionVersion, MesCartes.module.css, Admin.module.css.
 */
import { useRef, useState, type KeyboardEvent } from 'react';
import { TEXTES } from '../../content/textes';
import { useAuth } from '../../hooks/useAuth';
import adminStyles from './Admin.module.css';
import styles from './MesCartes.module.css';
import { SectionBoosters } from './SectionBoosters';
import { SectionCartes } from './SectionCartes';
import { SectionEffets } from './SectionEffets';
import { SectionEssaiEffets } from './SectionEssaiEffets';
import { SectionJoueurs } from './SectionJoueurs';
import { SectionVersion } from './SectionVersion';

type Onglet = 'cartes' | 'boosters' | 'joueurs' | 'effets' | 'essai' | 'version';
const ONGLETS: readonly Onglet[] = ['cartes', 'boosters', 'joueurs', 'effets', 'essai', 'version'];

/** Espace d'administration. */
export function AdminScreen() {
  const textes = TEXTES.admin;
  const { etat } = useAuth();
  const [onglet, setOnglet] = useState<Onglet>('cartes');
  const boutons = useRef<Partial<Record<Onglet, HTMLButtonElement | null>>>({});

  const estAdmin = etat.statut === 'connecte' && etat.profil.role === 'admin';

  /** Flèches gauche / droite : passe à l'onglet voisin (clavier). */
  const naviguer = (event: KeyboardEvent, position: number) => {
    const decalage = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (decalage === 0) return;
    event.preventDefault();
    const suivant = ONGLETS[(position + decalage + ONGLETS.length) % ONGLETS.length];
    if (!suivant) return;
    setOnglet(suivant);
    boutons.current[suivant]?.focus();
  };

  return (
    <div className={styles.page}>
      <main className={styles.contenu} aria-labelledby="titre-admin">
        <header className={styles.entete}>
          <h1 id="titre-admin" className={styles.titre}>
            {textes.titre}
          </h1>
        </header>

        {!estAdmin ? (
          <p className={styles.message} role="alert">
            {textes.refuse}
          </p>
        ) : (
          <>
            <div className={adminStyles.onglets} role="tablist" aria-label={textes.labelOnglets}>
              {ONGLETS.map((cle, position) => (
                <button
                  key={cle}
                  ref={(element) => {
                    boutons.current[cle] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`onglet-${cle}`}
                  aria-selected={onglet === cle}
                  aria-controls={`panneau-${cle}`}
                  tabIndex={onglet === cle ? 0 : -1}
                  className={adminStyles.onglet}
                  onClick={() => setOnglet(cle)}
                  onKeyDown={(event) => naviguer(event, position)}
                >
                  {textes.onglets[cle]}
                </button>
              ))}
            </div>
            <div role="tabpanel" id={`panneau-${onglet}`} aria-labelledby={`onglet-${onglet}`}>
              {onglet === 'cartes' && <SectionCartes />}
              {onglet === 'boosters' && <SectionBoosters />}
              {onglet === 'joueurs' && <SectionJoueurs />}
              {onglet === 'effets' && <SectionEffets />}
              {onglet === 'essai' && <SectionEssaiEffets />}
              {onglet === 'version' && <SectionVersion />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
