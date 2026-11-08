/**
 * Coquille de l'appli : barre d'onglets et zone de contenu.
 *
 * Rôle : entourer les écrans à onglets (Accueil, Collection, Jouer, Installer, Admin) d'une barre de
 * navigation. Sur téléphone, elle est en BAS de l'écran ; sur ordinateur (à partir de 768 px), elle devient
 * un menu à GAUCHE et le contenu occupe le reste. L'onglet « Admin » n'est proposé qu'aux administrateurs.
 * Expose : le composant `AppShell`.
 * Dépend de : react, app/flowMachine (types), content/textes, AppShell.module.css.
 */
import type { ReactNode } from 'react';
import { ONGLETS, type Onglet } from '../../app/flowMachine';
import { TEXTES } from '../../content/textes';
import styles from './AppShell.module.css';

interface AppShellProps {
  /** Onglet affiché. */
  onglet: Onglet;
  /** Vrai si le compte est administrateur (propose l'onglet Admin). */
  estAdmin: boolean;
  /** Appelé quand on touche un onglet. */
  onNaviguer: (onglet: Onglet) => void;
  children: ReactNode;
}

/** Cadre avec barre d'onglets. */
export function AppShell({ onglet, estAdmin, onNaviguer, children }: AppShellProps) {
  const textes = TEXTES.navigation;
  const visibles = ONGLETS.filter((cle) => cle !== 'ADMIN' || estAdmin);

  return (
    <div className={styles.coquille}>
      {/* Le contenu redéfinit la hauteur de référence des écrans : ils remplissent la zone, barre exclue. */}
      <div className={styles.contenu}>{children}</div>
      <nav className={styles.barre} aria-label={textes.label}>
        <ul className={styles.liste}>
          {visibles.map((cle) => (
            <li key={cle} className={styles.element}>
              <button
                type="button"
                className={styles.onglet}
                aria-current={onglet === cle ? 'page' : undefined}
                onClick={() => onNaviguer(cle)}
              >
                {textes.onglets[cle]}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
