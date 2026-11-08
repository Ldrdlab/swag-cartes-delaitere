/**
 * Écran 2 — Profil.
 *
 * Rôle : saisir (ou reprendre) le profil du joueur — pseudo et avatar —, le sauvegarder via
 * StorageService (l'avatar est enregistré par son identifiant, dans `iconId`), puis passer au choix du
 * booster. Trois modes : chargement, reprise d'un profil existant, saisie.
 * Expose : le composant `ProfileScreen`.
 * Dépend de : react, hooks/useStorage, services/erreurs, domain/id, config/avatars, content/textes, ProfileEditor,
 * ProfileResume, ProfileLayout.
 */
import { useEffect, useState } from 'react';
import { AvatarButton } from '../../components/AvatarButton';
import { ID_AVATAR_PAR_DEFAUT, trouverAvatar } from '../../config/avatars';
import { TEXTES } from '../../content/textes';
import { generateId } from '../../domain/id';
import type { Player } from '../../domain/types';
import { useStorage } from '../../hooks/useStorage';
import { ErreurService } from '../../services/erreurs';
import { ProfileEditor } from './ProfileEditor';
import { ProfileLayout } from './ProfileLayout';
import { ProfileResume } from './ProfileResume';
import styles from './Profile.module.css';

interface ProfileScreenProps {
  /** Appelé quand le profil est prêt (repris ou sauvegardé). */
  onDone: () => void;
}

type Mode = 'loading' | 'resume' | 'edit';

/** Écran de profil. */
export function ProfileScreen({ onDone }: ProfileScreenProps) {
  const storage = useStorage();
  const [mode, setMode] = useState<Mode>('loading');
  const [storedPlayer, setStoredPlayer] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Au lancement : y a-t-il déjà un profil ? Si oui, on propose de le reprendre.
  useEffect(() => {
    let cancelled = false;
    storage
      .loadPlayer()
      .catch(() => null)
      .then((player) => {
        if (cancelled) return;
        setStoredPlayer(player);
        setMode(player ? 'resume' : 'edit');
      });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const save = async (pseudo: string, avatarId: string) => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    const player: Player = { id: storedPlayer?.id ?? generateId(), pseudo, iconId: avatarId };
    try {
      await storage.savePlayer(player);
      onDone();
    } catch (erreur) {
      // Un pseudo déjà pris par un autre joueur est refusé par la base (nom unique).
      const pris = erreur instanceof ErreurService && erreur.code === 'infos_invalides';
      setSaveError(pris ? TEXTES.profil.erreurPseudoPris : TEXTES.profil.erreurSauvegarde);
      setSaving(false);
    }
  };

  if (mode === 'loading') {
    return (
      <ProfileLayout avatar={<AvatarButton avatar={trouverAvatar(ID_AVATAR_PAR_DEFAUT)} />}>
        <p className={styles.statut} role="status">
          {TEXTES.profil.chargement}
        </p>
      </ProfileLayout>
    );
  }

  if (mode === 'resume' && storedPlayer) {
    return (
      <ProfileResume player={storedPlayer} onContinue={onDone} onEdit={() => setMode('edit')} />
    );
  }

  return (
    <ProfileEditor
      initialPseudo={storedPlayer?.pseudo ?? ''}
      initialAvatarId={trouverAvatar(storedPlayer?.iconId).id}
      saving={saving}
      saveError={saveError}
      onSubmit={(pseudo, avatarId) => void save(pseudo, avatarId)}
    />
  );
}
