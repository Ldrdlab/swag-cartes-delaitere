/**
 * Formulaire de l'écran Profil (partie présentation).
 *
 * Rôle : champ pseudo en pilule (un toucher n'importe où dedans place le curseur), consigne, remarque
 * et bouton OK. Aucune règle de validation ici : tout est piloté par ProfileEditor.
 * Expose : le composant `ProfileForm`.
 * Dépend de : react, content/textes, components/Icon, Profile.module.css.
 */
import { useId, useState, type FormEvent } from 'react';
import { Icon } from '../../components/Icon';
import { TEXTES } from '../../content/textes';
import styles from './Profile.module.css';

interface ProfileFormProps {
  pseudo: string;
  onPseudoChange: (pseudo: string) => void;
  /** Le pseudo respecte-t-il les règles (le bouton OK n'est actif que si oui) ? */
  isValid: boolean;
  /** Enregistrement en cours : le bouton est bloqué pour éviter un double envoi. */
  saving: boolean;
  /** Erreur d'enregistrement éventuelle. */
  saveError: string | null;
  onSubmit: () => void;
}

/** Formulaire pseudo + OK. Le message d'erreur n'apparaît qu'après une première saisie invalide. */
export function ProfileForm({
  pseudo,
  onPseudoChange,
  isValid,
  saving,
  saveError,
  onSubmit,
}: ProfileFormProps) {
  const textes = TEXTES.profil;
  const errorId = useId();
  const [hasTyped, setHasTyped] = useState(false);
  const errorMessage = hasTyped && !isValid ? textes.erreurPseudo : saveError;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className={styles.formulaire} onSubmit={handleSubmit} noValidate>
      {/* Toute la pilule est un <label> : toucher le crayon ou le bord active aussi le champ. */}
      <label className={styles.pilule} data-invalide={errorMessage !== null}>
        <span className={styles.masque}>{textes.labelPseudo}</span>
        <input
          className={styles.champ}
          type="text"
          value={pseudo}
          placeholder={textes.placeholderPseudo}
          onChange={(event) => {
            setHasTyped(true);
            onPseudoChange(event.target.value);
          }}
          autoComplete="nickname"
          enterKeyHint="done"
          aria-invalid={errorMessage !== null}
          aria-describedby={errorMessage ? errorId : undefined}
          // Le clavier virtuel peut masquer le champ : on le recentre dans la zone défilante.
          onFocus={(event) => event.currentTarget.scrollIntoView({ block: 'center' })}
        />
        <span className={styles.crayon}>
          <Icon nom="crayon" />
        </span>
      </label>

      {errorMessage ? (
        <p id={errorId} className={styles.erreur} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <p className={styles.consigne}>{textes.consigne}</p>
      <p className={styles.remarque}>{textes.remarque}</p>
      <hr className={styles.separateur} />

      <button type="submit" className={styles.boutonOk} disabled={!isValid || saving}>
        {textes.boutonOk}
      </button>
    </form>
  );
}
