/**
 * Avatar rond du joueur.
 *
 * Rôle : afficher l'avatar (136 px, bordure blanche). Avec `onClick`, tout l'avatar est un vrai bouton
 * (avec une pastille crayon) ; sans `onClick`, c'est une simple image.
 * Expose : le composant `AvatarButton`.
 * Dépend de : config/avatars (type), content/textes, components/Icon, AvatarButton.module.css.
 */
import type { MouseEvent } from 'react';
import type { Avatar } from '../../config/avatars';
import { TEXTES } from '../../content/textes';
import { Icon } from '../Icon';
import styles from './AvatarButton.module.css';

interface AvatarButtonProps {
  /** Avatar à afficher. */
  avatar: Avatar;
  /** Si présent : l'avatar devient un bouton qui appelle cette fonction (ouvre le sélecteur). */
  onClick?: () => void;
}

/** Avatar rond, cliquable ou non. */
export function AvatarButton({ avatar, onClick }: AvatarButtonProps) {
  const image = <img className={styles.image} src={avatar.image} alt="" draggable={false} />;

  if (!onClick) {
    return (
      <div className={styles.avatar} role="img" aria-label={avatar.nom}>
        {image}
      </div>
    );
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Safari ne donne pas le focus à un bouton cliqué : on le fait nous-mêmes pour que le focus
    // revienne bien ici quand la fenêtre de choix se referme.
    event.currentTarget.focus();
    onClick();
  };

  return (
    <button
      type="button"
      className={`${styles.avatar} ${styles.bouton}`}
      aria-label={TEXTES.profil.labelChangerAvatar}
      aria-haspopup="dialog"
      onClick={handleClick}
    >
      {image}
      <span className={styles.pastille}>
        <Icon nom="crayon" />
      </span>
    </button>
  );
}
