/**
 * Mise en page commune à tous les écrans.
 *
 * Rôle : afficher un cadre « téléphone » centré (largeur max sur ordinateur), un titre optionnel,
 * une zone de contenu défilante et un pied de page pour les boutons d'action.
 * Expose : le composant `ScreenLayout`.
 * Dépend de : react, ScreenLayout.module.css.
 */
import { useId, type ReactNode } from 'react';
import styles from './ScreenLayout.module.css';

interface ScreenLayoutProps {
  /** Titre de l'écran (aussi utilisé comme libellé accessible de la zone principale). */
  title?: string;
  /** Contenu principal. */
  children: ReactNode;
  /** Zone d'actions en bas d'écran (reste dans le flux : jamais masquée par le clavier virtuel). */
  footer?: ReactNode;
}

/** Cadre d'écran réutilisable. */
export function ScreenLayout({ title, children, footer }: ScreenLayoutProps) {
  const titleId = useId();
  return (
    <div className={styles.page}>
      <main className={styles.screen} aria-labelledby={title ? titleId : undefined}>
        {title && (
          <h1 id={titleId} className={styles.title}>
            {title}
          </h1>
        )}
        <div className={styles.content}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </main>
    </div>
  );
}
