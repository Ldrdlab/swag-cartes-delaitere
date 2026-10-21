/**
 * Formulaire de saisie du pseudonyme (partie présentation de l'écran Profil).
 *
 * Rôle : afficher le champ « Pseudonyme » et son message d'erreur. Aucune logique de validation
 * ni de sauvegarde ici : tout est piloté par ProfileScreen.
 * Expose : le composant `ProfileForm`.
 * Dépend de : react, screens/Profile/AvatarPlaceholder, Profile.module.css.
 */
import { useId, useState, type FormEvent } from 'react';
import { AvatarPlaceholder } from './AvatarPlaceholder';
import styles from './Profile.module.css';

interface ProfileFormProps {
  /** Identifiant du <form>, pour y rattacher le bouton OK placé dans le pied de page. */
  formId: string;
  pseudo: string;
  onPseudoChange: (pseudo: string) => void;
  /** Message d'erreur de validation (`null` si le pseudo est valide). */
  validationError: string | null;
  /** Erreur de sauvegarde éventuelle. */
  saveError: string | null;
  onSubmit: () => void;
}

/** Champ pseudo + emplacement d'icône. L'erreur n'apparaît qu'après la première interaction. */
export function ProfileForm({
  formId,
  pseudo,
  onPseudoChange,
  validationError,
  saveError,
  onSubmit,
}: ProfileFormProps) {
  const inputId = useId();
  const errorId = useId();
  const [touched, setTouched] = useState(false);
  const visibleError = (touched ? validationError : null) ?? saveError;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    onSubmit();
  };

  return (
    <form id={formId} className={styles.form} onSubmit={handleSubmit} noValidate>
      <AvatarPlaceholder />
      <label htmlFor={inputId} className={styles.label}>
        Pseudonyme
      </label>
      <input
        id={inputId}
        className={styles.input}
        type="text"
        value={pseudo}
        onChange={(event) => {
          setTouched(true);
          onPseudoChange(event.target.value);
        }}
        autoComplete="nickname"
        enterKeyHint="done"
        aria-invalid={visibleError !== null}
        aria-describedby={errorId}
        // Le clavier virtuel peut masquer le champ : on le recentre dans la zone défilante.
        onFocus={(event) => event.currentTarget.scrollIntoView({ block: 'center' })}
      />
      <p id={errorId} className={styles.error} role="alert">
        {visibleError}
      </p>
    </form>
  );
}
