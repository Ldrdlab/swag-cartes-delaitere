/**
 * Bandeau « Nouvelle version disponible ».
 *
 * Rôle : quand une nouvelle version de l'appli est prête, proposer « Mettre à jour » (installe et recharge)
 * ou « Plus tard » (reporte jusqu'au prochain lancement). Montre les nouveautés quand elles sont connues
 * (CHANGELOG.md, via version.json). Il n'apparaît jamais tant qu'il n'y a pas de nouvelle version.
 * Expose : le composant `BandeauMiseAJour`.
 * Dépend de : react, app/pwa, components/Button, content/formatTexte, content/textes, hooks/useMiseAJour,
 * BandeauMiseAJour.module.css.
 */
import { useState } from 'react';
import { appliquerMiseAJour } from '../../app/pwa';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { useMiseAJour } from '../../hooks/useMiseAJour';
import { Button } from '../Button';
import styles from './BandeauMiseAJour.module.css';

/** Bandeau de mise à jour. */
export function BandeauMiseAJour() {
  const textes = TEXTES.miseAJour;
  const { visible, version, notes, reporter } = useMiseAJour();
  const [enCours, setEnCours] = useState(false);

  if (!visible) return null;
  return (
    <aside className={styles.bandeau} role="status" aria-live="polite">
      <p className={styles.titre}>
        {textes.titre}
        {version && <span className={styles.version}>{remplir(textes.version, { version })}</span>}
      </p>
      {notes.length > 0 && (
        <ul className={styles.notes} aria-label={textes.labelNotes}>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      <div className={styles.boutons}>
        <Button
          disabled={enCours}
          onClick={() => {
            setEnCours(true);
            void appliquerMiseAJour();
          }}
        >
          {enCours ? textes.enCours : textes.boutonMettreAJour}
        </Button>
        <Button variant="secondary" disabled={enCours} onClick={reporter}>
          {textes.boutonPlusTard}
        </Button>
      </div>
    </aside>
  );
}
