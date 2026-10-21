/**
 * Reprise d'un profil existant.
 *
 * Rôle : quand un profil est déjà enregistré, proposer de continuer avec lui ou de le modifier.
 * Expose : le composant `ProfileResume`.
 * Dépend de : domain/types (type), config/avatars, content/textes, content/formatTexte,
 * components/AvatarButton, ProfileLayout, Profile.module.css.
 */
import { AvatarButton } from '../../components/AvatarButton';
import { trouverAvatar } from '../../config/avatars';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import type { Player } from '../../domain/types';
import { ProfileLayout } from './ProfileLayout';
import styles from './Profile.module.css';

interface ProfileResumeProps {
  /** Profil enregistré sur l'appareil. */
  player: Player;
  /** Continuer avec ce profil. */
  onContinue: () => void;
  /** Passer à la modification du profil. */
  onEdit: () => void;
}

/** Écran « Bon retour » avec les deux choix. */
export function ProfileResume({ player, onContinue, onEdit }: ProfileResumeProps) {
  const textes = TEXTES.profil;
  const valeurs = { pseudo: player.pseudo };

  return (
    <ProfileLayout avatar={<AvatarButton avatar={trouverAvatar(player.iconId)} />}>
      <div className={styles.formulaire}>
        <p className={styles.consigne}>{remplir(textes.bonRetour, valeurs)}</p>
        <hr className={styles.separateur} />
        <button
          type="button"
          className={`${styles.boutonOk} ${styles.boutonLarge}`}
          onClick={onContinue}
        >
          {remplir(textes.continuer, valeurs)}
        </button>
        <button type="button" className={styles.boutonLien} onClick={onEdit}>
          {textes.modifierProfil}
        </button>
      </div>
    </ProfileLayout>
  );
}
