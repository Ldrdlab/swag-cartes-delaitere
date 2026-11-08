/**
 * Écran « Connexion ».
 *
 * Rôle : première porte de l'appli. Affiche, selon la situation de la session : le formulaire de connexion
 * (e-mail + mot de passe) ou « Mot de passe oublié ? », « Chargement… », une erreur de lecture du profil avec
 * « Réessayer » / « Se déconnecter », ou un message si Supabase n'est pas configuré. Il n'y a pas
 * d'inscription libre : les comptes sont créés par l'administrateur.
 * Expose : le composant `LoginScreen`.
 * Dépend de : react, components/Button, components/ScreenLayout, content/textes, hooks/useAuth,
 * FormulaireConnexion, MotDePasseOublie, Login.module.css.
 */
import { useState } from 'react';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import { TEXTES } from '../../content/textes';
import { useAuth, type SituationAuth } from '../../hooks/useAuth';
import { FormulaireConnexion } from './FormulaireConnexion';
import styles from './Login.module.css';
import { MotDePasseOublie } from './MotDePasseOublie';

interface LoginScreenProps {
  /** Situation de la session (jamais « connecté » : dans ce cas on n'affiche pas cet écran). */
  etat: SituationAuth;
}

/** Écran de connexion (et ses variantes « chargement » / « erreur »). */
export function LoginScreen({ etat }: LoginScreenProps) {
  const textes = TEXTES.connexion;
  const { seDeconnecter, recharger } = useAuth();
  const [oubli, setOubli] = useState(false);

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
      {oubli ? (
        <MotDePasseOublie onRetour={() => setOubli(false)} />
      ) : (
        <FormulaireConnexion
          lienExpire={etat.statut === 'deconnecte' && etat.lienExpire === true}
          onOubli={() => setOubli(true)}
        />
      )}
    </ScreenLayout>
  );
}
