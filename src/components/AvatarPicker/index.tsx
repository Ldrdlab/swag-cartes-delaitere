/**
 * Fenêtre de choix d'avatar (réutilisable).
 *
 * Rôle : sur mobile, feuille qui monte du bas sur un voile sombre ; sur ordinateur, fenêtre centrée de
 * 420 px. Grille d'avatars (5 colonnes, retour à la ligne automatique), bouton « Valider ».
 * « Fermer », la touche Échap et un toucher sur le voile ferment SANS changer l'avatar.
 * Construit sur l'élément natif <dialog> : rôle dialog, focus gardé dans la fenêtre pendant
 * qu'elle est ouverte, focus rendu à l'élément qui l'a ouverte à la fermeture.
 * L'état (ouvert, avatar coché) vient de hooks/useAvatarSelection.
 * Expose : le composant `AvatarPicker`.
 * Dépend de : react, config/avatars (type), config/timings, content/textes, components/Icon,
 * AvatarPicker.module.css.
 */
import { useEffect, useId, useRef, type CSSProperties } from 'react';
import type { Avatar } from '../../config/avatars';
import { AVATAR_PICKER_OPEN_MS } from '../../config/timings';
import { TEXTES } from '../../content/textes';
import { Icon } from '../Icon';
import styles from './AvatarPicker.module.css';

interface AvatarPickerProps {
  /** Avatars proposés (le nombre n'est limité que par cette liste). */
  avatars: readonly Avatar[];
  /** La fenêtre est-elle ouverte ? */
  isOpen: boolean;
  /** Identifiant de l'avatar actuellement coché. */
  selectedId: string;
  /** Appelé quand l'utilisateur coche un avatar. */
  onSelect: (id: string) => void;
  /** Appelé sur « Valider » : applique le choix et ferme. */
  onValidate: () => void;
  /** Appelé par « Fermer », Échap ou un toucher sur le voile : ferme sans rien changer. */
  onClose: () => void;
}

/** Fenêtre de choix d'avatar (voir le commentaire d'en-tête). */
export function AvatarPicker({
  avatars,
  isOpen,
  selectedId,
  onSelect,
  onValidate,
  onClose,
}: AvatarPickerProps) {
  const textes = TEXTES.profil;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Ouvre / ferme l'élément <dialog> selon `isOpen`, et place le focus sur l'avatar coché.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    // Un clic sur le voile atteint le <dialog> lui-même (le contenu le remplit entièrement).
    // Clavier : Échap (événement cancel) et le bouton « Fermer » offrent la même action.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      className={styles.feuille}
      aria-labelledby={titleId}
      style={{ '--duree-ouverture': `${AVATAR_PICKER_OPEN_MS}ms` } as CSSProperties}
      onCancel={(event) => {
        // Échap : on laisse React fermer la fenêtre (via isOpen) plutôt que le navigateur.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.contenu}>
        <div className={styles.entete}>
          <h2 id={titleId} className={styles.titre}>
            {textes.titreAvatar}
          </h2>
          <button
            type="button"
            className={styles.fermer}
            aria-label={textes.labelFermer}
            onClick={onClose}
          >
            <Icon nom="croix" />
          </button>
        </div>

        <div className={styles.grille}>
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              className={styles.avatar}
              aria-label={avatar.nom}
              aria-pressed={avatar.id === selectedId}
              onClick={() => onSelect(avatar.id)}
            >
              <img className={styles.image} src={avatar.image} alt="" draggable={false} />
            </button>
          ))}
        </div>

        <button type="button" className={styles.valider} onClick={onValidate}>
          {textes.boutonValider}
        </button>
      </div>
    </dialog>
  );
}
