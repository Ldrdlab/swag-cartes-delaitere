/**
 * Formulaire « Mot de passe oublié ».
 *
 * Rôle : demander l'e-mail du compte et lui envoyer un lien pour choisir un nouveau mot de passe. Le
 * message de succès est le même que l'adresse existe ou non (on ne révèle jamais qui a un compte).
 * Expose : le composant `MotDePasseOublie`.
 * Dépend de : react, components/Button, content/textes, hooks/useAuth, services/AuthService,
 * Login.module.css.
 */
import { useId, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { TEXTES } from '../../content/textes';
import { useAuth } from '../../hooks/useAuth';
import { ErreurAuth } from '../../services/AuthService';
import styles from './Login.module.css';

interface MotDePasseOublieProps {
  /** Appelé par « Retour à la connexion ». */
  onRetour: () => void;
}

/** Formulaire de demande de lien de réinitialisation. */
export function MotDePasseOublie({ onRetour }: MotDePasseOublieProps) {
  const textes = TEXTES.connexion.oubli;
  const { envoyerLienReinitialisation } = useAuth();
  const base = useId();
  const [email, setEmail] = useState('');
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'envoye'>('repos');
  const [erreur, setErreur] = useState<string | null>(null);

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    if (email.trim() === '') {
      setErreur(textes.erreurChamp);
      return;
    }
    setEtat('envoi');
    setErreur(null);
    try {
      await envoyerLienReinitialisation(email.trim());
      setEtat('envoye');
    } catch (e) {
      const code = e instanceof ErreurAuth ? e.code : 'inconnue';
      setErreur(
        code === 'trop_de_tentatives'
          ? textes.erreurTropDeTentatives
          : code === 'reseau'
            ? textes.erreurReseau
            : textes.erreurInconnue,
      );
      setEtat('repos');
    }
  };

  return (
    <form className={styles.formulaire} onSubmit={(event) => void soumettre(event)} noValidate>
      <p className={styles.info}>{textes.consigne}</p>

      <div className={styles.champ}>
        <label htmlFor={`${base}-email`}>{TEXTES.connexion.labelEmail}</label>
        <input
          id={`${base}-email`}
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          disabled={etat !== 'repos'}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      {erreur && (
        <p className={styles.erreur} role="alert">
          {erreur}
        </p>
      )}
      {etat === 'envoye' && (
        <p className={styles.succes} role="status">
          {textes.envoye}
        </p>
      )}

      <Button type="submit" disabled={etat !== 'repos'}>
        {etat === 'envoi' ? textes.enCours : textes.bouton}
      </Button>
      <button type="button" className={styles.lien} onClick={onRetour}>
        {textes.retour}
      </button>
    </form>
  );
}
