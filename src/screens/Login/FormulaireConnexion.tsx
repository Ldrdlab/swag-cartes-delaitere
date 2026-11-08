/**
 * Formulaire de connexion (e-mail + mot de passe).
 *
 * Rôle : saisie de l'e-mail et du mot de passe, envoi, message d'erreur clair, et lien « Mot de passe
 * oublié ? ». En cas de succès, l'écran change tout seul (la session passe à « connecté »).
 * Expose : le composant `FormulaireConnexion`.
 * Dépend de : react, components/Button, content/textes, hooks/useAuth, services/AuthService,
 * Login.module.css.
 */
import { useId, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { TEXTES } from '../../content/textes';
import { useAuth } from '../../hooks/useAuth';
import { ErreurAuth, type ErreurConnexion } from '../../services/AuthService';
import styles from './Login.module.css';

interface FormulaireConnexionProps {
  /** Le joueur a cliqué sur un lien d'e-mail périmé : un message l'explique. */
  lienExpire: boolean;
  /** Appelé par « Mot de passe oublié ? ». */
  onOubli: () => void;
}

/** Texte d'une erreur de connexion. */
function texteErreur(code: ErreurConnexion | 'champs'): string {
  const textes = TEXTES.connexion;
  const messages = {
    champs: textes.erreurChamps,
    identifiants: textes.erreurIdentifiants,
    trop_de_tentatives: textes.erreurTropDeTentatives,
    reseau: textes.erreurReseau,
    mot_de_passe_faible: textes.erreurInconnue,
    meme_mot_de_passe: textes.erreurInconnue,
    inconnue: textes.erreurInconnue,
  } as const;
  return messages[code];
}

/** Formulaire de connexion. */
export function FormulaireConnexion({ lienExpire, onOubli }: FormulaireConnexionProps) {
  const textes = TEXTES.connexion;
  const { seConnecter } = useAuth();
  const base = useId();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<ErreurConnexion | 'champs' | null>(null);

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    if (email.trim() === '' || motDePasse === '') {
      setErreur('champs');
      return;
    }
    setEnCours(true);
    setErreur(null);
    try {
      await seConnecter(email.trim(), motDePasse);
    } catch (e) {
      setErreur(e instanceof ErreurAuth ? e.code : 'inconnue');
      setEnCours(false);
    }
  };

  return (
    <form className={styles.formulaire} onSubmit={(event) => void soumettre(event)} noValidate>
      <p className={styles.info}>{textes.consigne}</p>
      {lienExpire && (
        <p className={styles.erreur} role="alert">
          {textes.lienExpire}
        </p>
      )}

      <div className={styles.champ}>
        <label htmlFor={`${base}-email`}>{textes.labelEmail}</label>
        <input
          id={`${base}-email`}
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          disabled={enCours}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className={styles.champ}>
        <label htmlFor={`${base}-mdp`}>{textes.labelMotDePasse}</label>
        <input
          id={`${base}-mdp`}
          type="password"
          autoComplete="current-password"
          value={motDePasse}
          disabled={enCours}
          onChange={(event) => setMotDePasse(event.target.value)}
        />
      </div>

      {erreur && (
        <p className={styles.erreur} role="alert">
          {texteErreur(erreur)}
        </p>
      )}

      <Button type="submit" disabled={enCours}>
        {enCours ? textes.enCours : textes.boutonConnecter}
      </Button>
      <button type="button" className={styles.lien} onClick={onOubli}>
        {textes.oubli.lien}
      </button>
      <p className={styles.note}>{textes.note}</p>
    </form>
  );
}
