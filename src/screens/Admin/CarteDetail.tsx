/**
 * Vue détaillée d'une carte (fenêtre).
 *
 * Rôle : montrer une carte en grand avec ses infos. Pour un administrateur, propose « Modifier »
 * (formulaire), « Désactiver » / « Activer » et « Supprimer » (les deux avec confirmation). Construite sur l'élément natif
 * <dialog> : Échap et le bouton « Fermer » ferment ; le focus reste dans la fenêtre.
 * L'état (mode, brouillon, erreurs) vient de hooks/useEditionCarte.
 * Expose : le composant `CarteDetail`.
 * Dépend de : react, components/Button, components/Carte, config/cartes, content/*, domain/cartes,
 * hooks/useApercuEffet, hooks/useEditionCarte, hooks/useCollection (type), screens/CardReveal/BadgeRarete, Detail.module.css.
 */
import { useEffect, useId, useRef } from 'react';
import { Button } from '../../components/Button';
import { Carte } from '../../components/Carte';
import { NOMS_VARIANTES, RATIO_CARTE, TOLERANCE_RATIO } from '../../config/cartes';
import { texteErreurCollection } from '../../content/messagesCartes';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { verifierRatio } from '../../domain/cartes';
import type { Card } from '../../domain/types';
import type { ActionsAdmin } from '../../hooks/useCollection';
import { useApercuEffet } from '../../hooks/useApercuEffet';
import { useEditionCarte } from '../../hooks/useEditionCarte';
import { BadgeRarete } from '../CardReveal/BadgeRarete';
import styles from './Detail.module.css';
import { FormulaireInfos } from './FormulaireInfos';

interface CarteDetailProps {
  carte: Card;
  /** Actions d'écriture, ou `null` en lecture seule. */
  admin: ActionsAdmin | null;
  /** Quantité possédée par le joueur (collection) : affichée sous les badges. */
  quantite?: number;
  onFermer: () => void;
}

/** Fenêtre de détail d'une carte. */
export function CarteDetail({ carte, admin, quantite, onFermer }: CarteDetailProps) {
  const textes = TEXTES.mesCartes;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titreId = useId();
  const edition = useEditionCarte(carte, admin, onFermer);
  // Pendant la modification, la grande carte montre l'effet du brouillon (aperçu en direct).
  const apercu = useApercuEffet(edition.mode === 'edition' ? edition.infos : undefined);
  const ratioAnormal =
    carte.width !== undefined &&
    carte.height !== undefined &&
    !verifierRatio(carte.width, carte.height, RATIO_CARTE, TOLERANCE_RATIO).conforme;

  // Ouvre la fenêtre à l'affichage ; la ferme proprement (focus rendu) quand on la retire.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    // Un clic sur le voile atteint le <dialog> lui-même ; le bouton « Fermer » et Échap font la même chose.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      className={styles.fenetre}
      aria-labelledby={titreId}
      onCancel={(event) => {
        event.preventDefault();
        onFermer();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onFermer();
      }}
    >
      <div className={styles.contenu}>
        <div className={styles.carte}>
          <Carte
            carte={carte}
            taille="grande"
            modeEffet="interactif"
            {...(apercu.effet ? { effet: apercu.effet } : {})}
          />
        </div>

        <div className={styles.infos}>
          <h2 id={titreId} className={styles.titre}>
            {carte.name}
          </h2>
          <p className={styles.etiquettes}>
            <BadgeRarete rarete={carte.rarity} />
            {carte.variant && (
              <span className={styles.variante}>{NOMS_VARIANTES[carte.variant]}</span>
            )}
            {!edition.active && <span className={styles.variante}>{textes.badgeInactive}</span>}
          </p>
          {quantite !== undefined && (
            <p>
              {quantite === 1
                ? textes.exemplairesUn
                : remplir(textes.exemplairesPlusieurs, { quantite: String(quantite) })}
            </p>
          )}
          {ratioAnormal && carte.width && carte.height && (
            <p className={styles.alerte}>
              {remplir(textes.infoRatio, {
                largeur: String(carte.width),
                hauteur: String(carte.height),
              })}
            </p>
          )}

          {edition.mode === 'edition' && (
            <FormulaireInfos
              infos={edition.infos}
              erreurs={edition.erreurs}
              onChange={edition.changer}
              disabled={edition.enCours}
              regles={apercu.regles}
            />
          )}

          {edition.mode === 'suppression' && (
            <p className={styles.confirmation} role="alert">
              {remplir(textes.confirmerSuppression, { nom: carte.name })}
            </p>
          )}

          {edition.mode === 'desactivation' && (
            <p className={styles.confirmation} role="alert">
              {remplir(textes.confirmerDesactivation, { nom: carte.name })}
            </p>
          )}

          {edition.erreurServeur && (
            <p className={styles.erreur} role="alert">
              {texteErreurCollection(edition.erreurServeur)}
            </p>
          )}

          <div className={styles.boutons}>
            {edition.mode === 'vue' && admin && (
              <>
                <Button onClick={edition.commencerEdition}>{textes.modifier}</Button>
                {edition.active ? (
                  <Button variant="secondary" onClick={edition.demanderDesactivation}>
                    {textes.desactiver}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    disabled={edition.enCours}
                    onClick={() => void edition.reactiver()}
                  >
                    {textes.activer}
                  </Button>
                )}
                <Button variant="secondary" onClick={edition.demanderSuppression}>
                  {textes.supprimer}
                </Button>
              </>
            )}
            {edition.mode === 'edition' && (
              <>
                <Button disabled={edition.enCours} onClick={() => void edition.sauvegarder()}>
                  {textes.enregistrer}
                </Button>
                <Button variant="secondary" disabled={edition.enCours} onClick={edition.annuler}>
                  {textes.annuler}
                </Button>
              </>
            )}
            {edition.mode === 'desactivation' && (
              <>
                <Button
                  disabled={edition.enCours}
                  onClick={() => void edition.confirmerDesactivation()}
                >
                  {textes.confirmerDesactiverOui}
                </Button>
                <Button variant="secondary" disabled={edition.enCours} onClick={edition.annuler}>
                  {textes.annuler}
                </Button>
              </>
            )}
            {edition.mode === 'suppression' && (
              <>
                <Button
                  className={styles.danger}
                  disabled={edition.enCours}
                  onClick={() => void edition.confirmerSuppression()}
                >
                  {textes.confirmerOui}
                </Button>
                <Button variant="secondary" disabled={edition.enCours} onClick={edition.annuler}>
                  {textes.annuler}
                </Button>
              </>
            )}
            {edition.mode === 'vue' && (
              <Button variant="secondary" onClick={onFermer}>
                {textes.fermer}
              </Button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
