/**
 * Une carte en cours d'ajout (aperçu, avertissements, infos à compléter).
 *
 * Rôle : afficher l'état d'une image choisie : optimisation en cours, refus (format…), avertissement
 * de proportions, formulaire des infos, erreur d'envoi. Les données viennent de hooks/useAjoutCartes.
 * Expose : le composant `BrouillonCarte`.
 * Dépend de : components/Button, components/Carte, config/cartes, content/*, domain/types (type),
 * hooks/useAjoutCartes (type), FormulaireInfos, Ajout.module.css.
 */
import { Button } from '../../components/Button';
import { Carte } from '../../components/Carte';
import { DIMENSIONS_CARTE_TEXTE } from '../../config/cartes';
import { remplir } from '../../content/formatTexte';
import { texteErreurCollection, texteErreurFichier } from '../../content/messagesCartes';
import { TEXTES } from '../../content/textes';
import type { InfosCarte } from '../../domain/cartes';
import type { Brouillon } from '../../hooks/useAjoutCartes';
import styles from './Ajout.module.css';
import { FormulaireInfos } from './FormulaireInfos';

interface BrouillonCarteProps {
  brouillon: Brouillon;
  onChangerInfos: (cle: string, changement: Partial<InfosCarte>) => void;
  onRetirer: (cle: string) => void;
}

/** Une ligne de la liste « cartes à enregistrer ». */
export function BrouillonCarte({ brouillon, onChangerInfos, onRetirer }: BrouillonCarteProps) {
  const textes = TEXTES.mesCartes;
  const { etat, infos, optimisee, ratio, apercuUrl } = brouillon;
  const occupe = etat === 'envoi';

  return (
    <li className={styles.brouillon}>
      <div className={styles.apercu}>
        {apercuUrl ? (
          // La carte d'aperçu utilise le même composant que la galerie.
          <Carte
            carte={{
              id: brouillon.cle,
              name: infos.nom || brouillon.nomFichier,
              rarity: infos.rarete,
              imageUrl: apercuUrl,
            }}
            taille="grande"
          />
        ) : (
          <p className={styles.attente}>
            {etat === 'refuse' ? brouillon.nomFichier : textes.optimisation}
          </p>
        )}
      </div>

      <div className={styles.details}>
        {etat === 'refuse' && brouillon.erreurFichier && (
          <p className={styles.erreur} role="alert">
            {brouillon.nomFichier} : {texteErreurFichier(brouillon.erreurFichier)}
          </p>
        )}

        {optimisee && ratio && !ratio.conforme && (
          <p className={styles.alerte} role="alert">
            {remplir(textes.alerteRatio, {
              largeur: String(optimisee.largeurOrigine),
              hauteur: String(optimisee.hauteurOrigine),
              attendu: DIMENSIONS_CARTE_TEXTE,
            })}
          </p>
        )}

        {(etat === 'pret' || etat === 'envoi') && (
          <FormulaireInfos
            infos={infos}
            erreurs={brouillon.erreurs}
            onChange={(changement) => onChangerInfos(brouillon.cle, changement)}
            disabled={occupe}
          />
        )}

        {brouillon.erreurEnvoi && (
          <p className={styles.erreur} role="alert">
            {texteErreurCollection(brouillon.erreurEnvoi)}
          </p>
        )}
        {occupe && <p className={styles.attente}>{textes.envoi}</p>}

        <Button variant="secondary" disabled={occupe} onClick={() => onRetirer(brouillon.cle)}>
          {textes.retirer}
        </Button>
      </div>
    </li>
  );
}
