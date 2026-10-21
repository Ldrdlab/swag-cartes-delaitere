/**
 * Emplacement de l'icône de profil.
 *
 * Rôle : cercle placeholder non fonctionnel qui réserve la place de la future icône.
 * Expose : le composant `AvatarPlaceholder`.
 * Dépend de : Profile.module.css.
 */
import styles from './Profile.module.css';

/** Cercle placeholder de l'icône de profil. */
export function AvatarPlaceholder() {
  // TODO: sélection d'icône (itération ultérieure)
  return <div className={styles.avatar} role="img" aria-label="Icône de profil (à venir)" />;
}
