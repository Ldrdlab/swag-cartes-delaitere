/**
 * Formulaire de la version minimum requise.
 *
 * Rôle : champ de saisie, vérification du format (0.1.0), avertissement si la version saisie dépasse la
 * version en ligne (tout le monde serait bloqué), enregistrement.
 * Expose : le composant `FormulaireVersion`.
 * Dépend de : react, components/Button, config/version, content/*, domain/version, services/erreurs,
 * Admin.module.css.
 */
import { useId, useState } from 'react';
import { Button } from '../../components/Button';
import { VERSION_APPLI } from '../../config/version';
import { remplir } from '../../content/formatTexte';
import { texteErreurCollection } from '../../content/messagesCartes';
import { TEXTES } from '../../content/textes';
import { estInferieure, versionValide } from '../../domain/version';
import { ErreurService, type CodeErreur } from '../../services/erreurs';
import styles from './Admin.module.css';

interface FormulaireVersionProps {
  /** Version minimum actuellement enregistrée. */
  versionMin: string;
  enregistrer: (versionMin: string) => Promise<unknown>;
}

/** Formulaire de la version minimum requise. */
export function FormulaireVersion({ versionMin, enregistrer }: FormulaireVersionProps) {
  const textes = TEXTES.admin.version;
  const base = useId();
  const [saisie, setSaisie] = useState(versionMin);
  const [confirme, setConfirme] = useState(false);
  const [envoi, setEnvoi] = useState<'repos' | 'envoi' | 'succes'>('repos');
  const [erreur, setErreur] = useState<CodeErreur | null>(null);

  const propre = saisie.trim();
  const formatValide = versionValide(propre);
  // Une version minimum plus récente que celle en ligne bloquerait tout le monde, toi compris.
  const tropHaute = formatValide && estInferieure(VERSION_APPLI, propre);
  const peutEnregistrer = formatValide && (!tropHaute || confirme) && envoi !== 'envoi';

  const valider = async () => {
    setEnvoi('envoi');
    setErreur(null);
    try {
      await enregistrer(propre);
      setEnvoi('succes');
    } catch (e) {
      setEnvoi('repos');
      setErreur(e instanceof ErreurService ? e.code : 'inconnue');
    }
  };

  return (
    <form
      className={styles.formulaire}
      onSubmit={(event) => {
        event.preventDefault();
        void valider();
      }}
    >
      <h2 className={styles.sousTitre}>{textes.titre}</h2>

      <div className={styles.champ}>
        <p className={styles.label}>{textes.labelEnLigne}</p>
        <p className={styles.valeurGrosse}>{VERSION_APPLI}</p>
        <p className={styles.aide}>{textes.aideEnLigne}</p>
      </div>

      <div className={styles.champ}>
        <label htmlFor={`${base}-min`}>{textes.labelMin}</label>
        <input
          id={`${base}-min`}
          value={saisie}
          inputMode="decimal"
          aria-invalid={!formatValide || undefined}
          onChange={(event) => {
            setSaisie(event.target.value);
            setConfirme(false);
            setEnvoi('repos');
          }}
        />
        <p className={styles.aide}>{textes.aideMin}</p>
        {!formatValide && (
          <p className={styles.erreur} role="alert">
            {textes.erreurFormat}
          </p>
        )}
      </div>

      {tropHaute && (
        <div className={styles.alerte} role="alert">
          <p>{remplir(textes.alerteTropHaute, { min: propre, enLigne: VERSION_APPLI })}</p>
          <label className={styles.caseConfirmation}>
            <input
              type="checkbox"
              checked={confirme}
              onChange={(e) => setConfirme(e.target.checked)}
            />
            {textes.confirmerTropHaute}
          </label>
        </div>
      )}

      {erreur && (
        <p className={styles.erreur} role="alert">
          {texteErreurCollection(erreur)}
        </p>
      )}
      {envoi === 'succes' && (
        <p className={styles.succes} role="status">
          {textes.succes}
        </p>
      )}

      <div className={styles.boutons}>
        <Button type="submit" disabled={!peutEnregistrer}>
          {envoi === 'envoi' ? textes.enregistrement : textes.boutonEnregistrer}
        </Button>
      </div>
    </form>
  );
}
