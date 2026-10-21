/**
 * Saisie du profil : pseudo + avatar.
 *
 * Rôle : garder le pseudo en cours de saisie et le choix d'avatar, valider le pseudo, et transmettre
 * le profil à enregistrer quand l'utilisateur appuie sur OK. L'avatar du profil ne change que sur
 * « Valider » dans la fenêtre de choix (voir domain/avatarSelection).
 * Expose : le composant `ProfileEditor`.
 * Dépend de : react, hooks/useAvatarSelection, domain/validatePseudo, config/avatars,
 * components/AvatarButton, components/AvatarPicker, ProfileLayout, ProfileForm.
 */
import { useState } from 'react';
import { AvatarButton } from '../../components/AvatarButton';
import { AvatarPicker } from '../../components/AvatarPicker';
import { AVATARS, trouverAvatar } from '../../config/avatars';
import { validatePseudo } from '../../domain/validatePseudo';
import { useAvatarSelection } from '../../hooks/useAvatarSelection';
import { ProfileForm } from './ProfileForm';
import { ProfileLayout } from './ProfileLayout';

interface ProfileEditorProps {
  /** Pseudo de départ (vide pour un nouveau joueur). */
  initialPseudo: string;
  /** Identifiant de l'avatar de départ. */
  initialAvatarId: string;
  saving: boolean;
  saveError: string | null;
  /** Appelé sur OK avec le pseudo nettoyé et l'identifiant de l'avatar choisi. */
  onSubmit: (pseudo: string, avatarId: string) => void;
}

/** Saisie du pseudo et de l'avatar. */
export function ProfileEditor({
  initialPseudo,
  initialAvatarId,
  saving,
  saveError,
  onSubmit,
}: ProfileEditorProps) {
  const [pseudo, setPseudo] = useState(initialPseudo);
  const selection = useAvatarSelection(initialAvatarId);
  const validation = validatePseudo(pseudo);

  const handleSubmit = () => {
    if (validation.valid) onSubmit(validation.pseudo, selection.appliedId);
  };

  return (
    <ProfileLayout
      avatar={<AvatarButton avatar={trouverAvatar(selection.appliedId)} onClick={selection.open} />}
    >
      <ProfileForm
        pseudo={pseudo}
        onPseudoChange={setPseudo}
        isValid={validation.valid}
        saving={saving}
        saveError={saveError}
        onSubmit={handleSubmit}
      />
      <AvatarPicker
        avatars={AVATARS}
        isOpen={selection.isOpen}
        selectedId={selection.draftId}
        onSelect={selection.select}
        onValidate={selection.validate}
        onClose={selection.close}
      />
    </ProfileLayout>
  );
}
