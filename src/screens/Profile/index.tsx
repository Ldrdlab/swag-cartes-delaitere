/**
 * Écran 2 — Profil.
 *
 * Rôle : saisir (ou reprendre) le profil du joueur, le sauvegarder via StorageService, puis
 * passer au choix du booster. Trois modes : chargement, reprise d'un profil existant, saisie.
 * Expose : le composant `ProfileScreen`.
 * Dépend de : react, hooks/useStorage, domain/validatePseudo, domain/id, components/*, ProfileForm.
 */
import { useEffect, useId, useState } from 'react';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import { generateId } from '../../domain/id';
import type { Player } from '../../domain/types';
import { validatePseudo } from '../../domain/validatePseudo';
import { useStorage } from '../../hooks/useStorage';
import { AvatarPlaceholder } from './AvatarPlaceholder';
import { ProfileForm } from './ProfileForm';
import styles from './Profile.module.css';

interface ProfileScreenProps {
  /** Appelé quand le profil est prêt (repris ou sauvegardé). */
  onDone: () => void;
}

type Mode = 'loading' | 'resume' | 'edit';

/** Écran de profil. */
export function ProfileScreen({ onDone }: ProfileScreenProps) {
  const storage = useStorage();
  const formId = useId();
  const [mode, setMode] = useState<Mode>('loading');
  const [storedPlayer, setStoredPlayer] = useState<Player | null>(null);
  const [pseudo, setPseudo] = useState('');
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
        setPseudo(player?.pseudo ?? '');
        setMode(player ? 'resume' : 'edit');
      });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const validation = validatePseudo(pseudo);

  const save = async () => {
    if (!validation.valid || saving) return;
    setSaving(true);
    setSaveError(null);
    const player: Player = {
      id: storedPlayer?.id ?? generateId(),
      pseudo: validation.pseudo,
      iconId: storedPlayer?.iconId,
    };
    try {
      await storage.savePlayer(player);
      onDone();
    } catch {
      setSaveError('Impossible d’enregistrer le profil sur cet appareil. Réessayez.');
      setSaving(false);
    }
  };

  if (mode === 'loading') {
    return (
      <ScreenLayout title="Profil">
        <p className={styles.status}>Chargement…</p>
      </ScreenLayout>
    );
  }

  if (mode === 'resume' && storedPlayer) {
    return (
      <ScreenLayout
        title="Profil"
        footer={
          <>
            <Button onClick={onDone}>Continuer en tant que {storedPlayer.pseudo}</Button>
            <Button variant="secondary" onClick={() => setMode('edit')}>
              Modifier mon profil
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <AvatarPlaceholder />
          <p className={styles.status}>Bon retour, {storedPlayer.pseudo} !</p>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title="Profil"
      footer={
        <Button type="submit" form={formId} disabled={!validation.valid || saving}>
          OK
        </Button>
      }
    >
      <ProfileForm
        formId={formId}
        pseudo={pseudo}
        onPseudoChange={setPseudo}
        validationError={validation.valid ? null : validation.error}
        saveError={saveError}
        onSubmit={() => void save()}
      />
    </ScreenLayout>
  );
}
