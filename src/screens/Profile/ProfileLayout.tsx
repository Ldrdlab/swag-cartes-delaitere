/**
 * Décor de l'écran Profil.
 *
 * Rôle : fond pastel, petit logo SWAG décoratif, et carte blanche centrale dont le haut est
 * chevauché par l'avatar (fourni par l'écran), puis les réglages des effets (qualité, effets réduits). Aucune autre logique.
 * Expose : le composant `ProfileLayout`.
 * Dépend de : react, content/textes, OptionsEffets, Profile.module.css.
 */
import type { ReactNode } from 'react';
import { TEXTES } from '../../content/textes';
import { OptionsEffets } from './OptionsEffets';
import styles from './Profile.module.css';

interface ProfileLayoutProps {
  /** L'avatar, posé à cheval sur le haut de la carte. */
  avatar: ReactNode;
  /** Contenu de la carte (formulaire, messages, boutons). */
  children: ReactNode;
}

/** Cadre de l'écran Profil. */
export function ProfileLayout({ avatar, children }: ProfileLayoutProps) {
  return (
    <div className={styles.page}>
      <main className={styles.ecran}>
        {/* Titre de la page pour les lecteurs d'écran (invisible à l'écran). */}
        <h1 className={styles.masque}>{TEXTES.profil.titrePage}</h1>
        {/* Petit logo purement décoratif : même mot que le titre de l'accueil. */}
        <p className={styles.logo} aria-hidden="true">
          {TEXTES.accueil.titre}
        </p>
        <div className={styles.zone}>
          <div className={styles.carte}>
            <div className={styles.avatar}>{avatar}</div>
            {children}
            <OptionsEffets />
          </div>
        </div>
      </main>
    </div>
  );
}
