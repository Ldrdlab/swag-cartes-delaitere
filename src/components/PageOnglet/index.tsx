/**
 * Page d'un onglet (Collection, Jouer, Installer).
 *
 * Rôle : cadre commun des pages d'onglet : fond clair, titre, contenu qui défile, largeur limitée sur
 * ordinateur. (L'accueil et l'administration ont leur propre mise en page.)
 * Expose : le composant `PageOnglet`.
 * Dépend de : react, PageOnglet.module.css.
 */
import { useId, type ReactNode } from 'react';
import styles from './PageOnglet.module.css';

interface PageOngletProps {
  /** Titre de la page (aussi libellé accessible de la zone principale). */
  titre: string;
  /** Texte placé à droite du titre (ex. progression). */
  complement?: ReactNode;
  children: ReactNode;
}

/** Cadre d'une page d'onglet. */
export function PageOnglet({ titre, complement, children }: PageOngletProps) {
  const idTitre = useId();
  return (
    <div className={styles.page}>
      <main className={styles.contenu} aria-labelledby={idTitre}>
        <header className={styles.entete}>
          <h1 id={idTitre} className={styles.titre}>
            {titre}
          </h1>
          {complement && <p className={styles.complement}>{complement}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}
