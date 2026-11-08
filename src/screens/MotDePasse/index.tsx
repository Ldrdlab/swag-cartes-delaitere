/**
 * Écran « Choisis ton mot de passe ».
 *
 * Rôle : un joueur invité par e-mail (ou qui a demandé un lien « mot de passe oublié ») arrive déjà connecté
 * par le lien ; avant d'entrer dans l'appli, il choisit son mot de passe (saisi deux fois). Plus tard, il se
 * connectera avec son e-mail et ce mot de passe. La validation est dans domain/motDePasse.
 * Expose : le composant `MotDePasseScreen`.
 * Dépend de : react, components/Button, components/ScreenLayout, config/profile, content/*, domain/motDePasse,
 * hooks/useAuth, services/AuthService, screens/Login/Login.module.css.
 */
import { useId, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { ScreenLayout } from '../../components/ScreenLayout';
import { MOT_DE_PASSE_MIN_LENGTH } from '../../config/profile';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { validerMotDePasse } from '../../domain/motDePasse';
import { useAuth } from '../../hooks/useAuth';
import { ErreurAuth } from '../../services/AuthService';
import styles from '../Login/Login.module.css';

/** Écran de choix du mot de passe. */
export function MotDePasseScreen() {
  const textes = TEXTES.motDePasse;
  const { definirMotDePasse } = useAuth();
  const base = useId();
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const soumettre = async (event: FormEvent) => {
    event.preventDefault();
    const probleme = validerMotDePasse(motDePasse, confirmation, MOT_DE_PASSE_MIN_LENGTH);
    if (probleme) {
      setErreur(
        probleme === 'trop_court'
          ? remplir(textes.erreurTropCourt, { min: String(MOT_DE_PASSE_MIN_LENGTH) })
          : textes.erreurDifferent,
      );
      return;
    }
    setEnCours(true);
    setErreur(null);
    try {
      await definirMotDePasse(motDePasse);
      // Succès : l'appli s'ouvre toute seule (la session passe à « connecté »).
    } catch (e) {
      const code = e instanceof ErreurAuth ? e.code : 'inconnue';
      const messages: Record<string, string> = {
        mot_de_passe_faible: textes.erreurFaible,
        meme_mot_de_passe: textes.erreurMeme,
        trop_de_tentatives: textes.erreurTropDeTentatives,
        reseau: textes.erreurReseau,
      };
      setErreur(messages[code] ?? textes.erreurInconnue);
      setEnCours(false);
    }
  };

  return (
    <ScreenLayout title={textes.titre}>
      <form className={styles.formulaire} onSubmit={(event) => void soumettre(event)} noValidate>
        <p className={styles.info}>{textes.consigne}</p>

        <div className={styles.champ}>
          <label htmlFor={`${base}-nouveau`}>{textes.labelNouveau}</label>
          <input
            id={`${base}-nouveau`}
            type="password"
            autoComplete="new-password"
            value={motDePasse}
            disabled={enCours}
            onChange={(event) => setMotDePasse(event.target.value)}
          />
        </div>

        <div className={styles.champ}>
          <label htmlFor={`${base}-confirmation`}>{textes.labelConfirmation}</label>
          <input
            id={`${base}-confirmation`}
            type="password"
            autoComplete="new-password"
            value={confirmation}
            disabled={enCours}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>

        {erreur && (
          <p className={styles.erreur} role="alert">
            {erreur}
          </p>
        )}

        <Button type="submit" disabled={enCours}>
          {enCours ? textes.enCours : textes.bouton}
        </Button>
      </form>
    </ScreenLayout>
  );
}
