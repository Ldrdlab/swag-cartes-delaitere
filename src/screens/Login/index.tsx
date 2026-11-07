/**
 * Écran « Connexion ».
 *
 * Rôle : première porte de l'appli. Affiche, selon la situation de la session : le formulaire de connexion
 * (e-mail + mot de passe), « Chargement… », une erreur de lecture du profil avec « Réessayer » / « Se
 * déconnecter », ou un message si Supabase n'est pas configuré. Il n'y a pas d'inscription : les comptes
 * sont créés par l'administrateur.
 * Expose : le composant `LoginScreen`.
 * Dépend de : react, components/Button, components/ScreenLayout, content/textes, hooks/useAuth,
 * services/AuthService, Login.module.css.
 */
import { useId, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import { TEXTES } from '../../content/textes';
import { useAuth, type SituationAuth } from '../../hooks/useAuth';
import { ErreurAuth, type ErreurConnexion } from '../../services/AuthService';
import styles from './Login.module.css';

interface LoginScreenProps {
  /** Situation de la session (jamais « connecté » : dans ce cas on n'affiche pas cet écran). */
  etat: SituationAuth;
}

/** Texte d'une erreur de connexion. */
function texteErreur(code: ErreurConnexion | 'champs'): string {
  const textes = TEXTES.connexion;
  const messages = {
    champs: textes.erreurChamps,
    identifiants: textes.erreurIdentifiants,
    trop_de_tentatives: textes.erreurTropDeTentatives,
    reseau: textes.erreurReseau,
    inconnue: textes.erreurInconnue,
  } as const;
  return messages[code];
}

/** Écran de connexion (et ses variantes « chargement » / « erreur »). */
export function LoginScreen({ etat }: LoginScreenProps) {
  const textes = TEXTES.connexion;
  const { seConnecter, seDeconnecter, recharger } = useAuth();
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
    // En cas de succès, l'écran change tout seul (la session passe à « connecté »).
  };

  if (etat.statut === 'non_configure') {
    return (
      <ScreenLayout title={textes.titre}>
        <p className={styles.erreur} role="alert">
          {textes.nonConfigure}
        </p>
      </ScreenLayout>
    );
  }

  if (etat.statut === 'chargement') {
    return (
      <ScreenLayout title={textes.titre}>
        <p className={styles.info} role="status">
          {textes.chargement}
        </p>
      </ScreenLayout>
    );
  }

  if (etat.statut === 'erreur') {
    return (
      <ScreenLayout title={textes.titre}>
        <p className={styles.erreur} role="alert">
          {textes.erreurProfil}
        </p>
        <div className={styles.boutons}>
          <Button onClick={recharger}>{textes.reessayer}</Button>
          <Button variant="secondary" onClick={() => void seDeconnecter()}>
            {textes.deconnexion}
          </Button>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={textes.titre}>
      <form className={styles.formulaire} onSubmit={(event) => void soumettre(event)} noValidate>
        <p className={styles.info}>{textes.consigne}</p>

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
        <p className={styles.note}>{textes.note}</p>
      </form>
    </ScreenLayout>
  );
}
