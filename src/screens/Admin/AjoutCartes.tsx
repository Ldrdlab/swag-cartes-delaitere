/**
 * Panneau d'ajout de cartes.
 *
 * Rôle : zone de choix de fichiers (bouton + glisser-déposer sur ordinateur), liste des cartes en
 * cours d'ajout et bouton d'enregistrement. Plusieurs images peuvent être envoyées d'un coup. Toute
 * la logique est dans hooks/useAjoutCartes.
 * Expose : le composant `AjoutCartes`.
 * Dépend de : react, components/Button, config/cartes, content/*, hooks/useAjoutCartes,
 * hooks/useCollection (type), BrouillonCarte, Ajout.module.css.
 */
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '../../components/Button';
import { EXTENSIONS_IMAGE_ACCEPTEES, TYPES_IMAGE_ACCEPTES } from '../../config/cartes';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { useAjoutCartes } from '../../hooks/useAjoutCartes';
import type { ActionsAdmin } from '../../hooks/useCollection';
import styles from './Ajout.module.css';
import { BrouillonCarte } from './BrouillonCarte';

/** Valeur de l'attribut `accept` du champ fichier. */
const ACCEPT = [...TYPES_IMAGE_ACCEPTES, ...EXTENSIONS_IMAGE_ACCEPTEES].join(',');

interface AjoutCartesProps {
  admin: ActionsAdmin;
  onFermer: () => void;
}

/** Panneau d'ajout de cartes. */
export function AjoutCartes({ admin, onFermer }: AjoutCartesProps) {
  const textes = TEXTES.mesCartes;
  const ajout = useAjoutCartes(admin);
  const champFichier = useRef<HTMLInputElement>(null);
  const [survol, setSurvol] = useState(false);
  const [bilan, setBilan] = useState<number | null>(null);

  const prets = ajout.brouillons.filter((b) => b.etat === 'pret').length;

  const choisir = (event: ChangeEvent<HTMLInputElement>) => {
    const fichiers = Array.from(event.target.files ?? []);
    event.target.value = ''; // permet de re-choisir le même fichier ensuite
    setBilan(null);
    void ajout.ajouterFichiers(fichiers);
  };

  const deposer = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setSurvol(false);
    setBilan(null);
    void ajout.ajouterFichiers(Array.from(event.dataTransfer.files));
  };

  const enregistrer = async () => setBilan(await ajout.enregistrer());

  return (
    <section className={styles.panneau} aria-labelledby="titre-ajout">
      <div className={styles.entete}>
        <h2 id="titre-ajout" className={styles.titre}>
          {textes.boutonAjouter}
        </h2>
        <Button variant="secondary" onClick={onFermer}>
          {textes.fermerAjout}
        </Button>
      </div>

      <div
        className={survol ? `${styles.zone} ${styles.survol}` : styles.zone}
        onDragOver={(event) => {
          event.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={deposer}
      >
        <p className={styles.consigne}>{textes.zoneConsigne}</p>
        <p className={styles.aide}>{textes.zoneOu}</p>
        <Button onClick={() => champFichier.current?.click()}>{textes.zoneChoisir}</Button>
        <p className={styles.aide}>{textes.zoneFormats}</p>
        <input ref={champFichier} type="file" accept={ACCEPT} multiple hidden onChange={choisir} />
      </div>

      {bilan !== null && bilan > 0 && (
        <p className={styles.succes} role="status">
          {remplir(bilan === 1 ? textes.bilanUne : textes.bilanPlusieurs, {
            nombre: String(bilan),
          })}
        </p>
      )}

      {ajout.brouillons.length > 0 && (
        <>
          <ul className={styles.liste}>
            {ajout.brouillons.map((brouillon) => (
              <BrouillonCarte
                key={brouillon.cle}
                brouillon={brouillon}
                onChangerInfos={ajout.changerInfos}
                onRetirer={ajout.retirer}
              />
            ))}
          </ul>
          <Button disabled={prets === 0 || ajout.enregistrement} onClick={() => void enregistrer()}>
            {prets > 1 ? textes.enregistrerTout : textes.enregistrerUne}
          </Button>
        </>
      )}
    </section>
  );
}
