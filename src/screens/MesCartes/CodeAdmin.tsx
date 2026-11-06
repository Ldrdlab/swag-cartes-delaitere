/**
 * Panneau du code admin.
 *
 * Rôle : demander le code admin pour déverrouiller la gestion des cartes. Le code est vérifié par le
 * serveur (jamais dans le navigateur). Si aucun code n'est défini dans `.env.local`, explique comment
 * en créer un.
 * Expose : le composant `CodeAdmin`.
 * Dépend de : react, components/Button, content/*, services/CollectionService, MesCartes.module.css.
 */
import { useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { texteErreurCollection } from '../../content/messagesCartes';
import { TEXTES } from '../../content/textes';
import { ErreurCollection } from '../../services/CollectionService';
import styles from './MesCartes.module.css';

interface CodeAdminProps {
  /** `false` : aucun code n'est défini côté serveur. */
  codeDefini: boolean;
  /** Vérifie le code ; échoue avec une ErreurCollection s'il est refusé. */
  onDeverrouiller: (code: string) => Promise<void>;
}

/** Formulaire de déverrouillage. */
export function CodeAdmin({ codeDefini, onDeverrouiller }: CodeAdminProps) {
  const textes = TEXTES.mesCartes;
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  if (!codeDefini) {
    return <p className={styles.erreurCode}>{textes.erreurCodeNonDefini}</p>;
  }

  const valider = async (event: FormEvent) => {
    event.preventDefault();
    setEnCours(true);
    setErreur(null);
    try {
      await onDeverrouiller(code);
    } catch (e) {
      setErreur(texteErreurCollection(e instanceof ErreurCollection ? e.code : 'inconnue'));
      setCode('');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <form className={styles.formCode} onSubmit={(event) => void valider(event)}>
      <label className={styles.labelCode}>
        {textes.labelCode}
        <input
          type="password"
          name="code-admin"
          autoComplete="off"
          value={code}
          required
          disabled={enCours}
          onChange={(event) => setCode(event.target.value)}
        />
      </label>
      <Button type="submit" disabled={enCours || code === ''}>
        {textes.boutonDeverrouiller}
      </Button>
      {erreur && (
        <p className={styles.erreurCode} role="alert">
          {erreur}
        </p>
      )}
    </form>
  );
}
