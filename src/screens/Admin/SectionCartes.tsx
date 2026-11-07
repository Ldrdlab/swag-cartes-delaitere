/**
 * Section « Cartes » de l'espace admin.
 *
 * Rôle : galerie de toutes les cartes (y compris les désactivées), ajout de plusieurs visuels,
 * fiche détaillée (modifier / désactiver / supprimer avec confirmation). L'état vient de
 * hooks/useCollection ; les droits sont vérifiés par la base de données.
 * Expose : le composant `SectionCartes`.
 * Dépend de : react, components/Button, content/*, hooks/useCollection, Galerie, AjoutCartes,
 * CarteDetail, MesCartes.module.css.
 */
import { useState } from 'react';
import { Button } from '../../components/Button';
import { texteTotal } from '../../content/messagesCartes';
import { TEXTES } from '../../content/textes';
import type { Card } from '../../domain/types';
import { useCollection } from '../../hooks/useCollection';
import { AjoutCartes } from './AjoutCartes';
import { CarteDetail } from './CarteDetail';
import { Galerie } from './Galerie';
import styles from './MesCartes.module.css';

/** Gestion des cartes. */
export function SectionCartes() {
  const textes = TEXTES.mesCartes;
  const collection = useCollection(true);
  const { admin } = collection;
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  // La carte ouverte est relue dans la liste : une modification se voit tout de suite.
  const selection = collection.cartes.find((c: Card) => c.id === selectionId) ?? null;

  return (
    <>
      <div className={styles.actions}>
        <Button onClick={() => setAjoutOuvert(true)} disabled={ajoutOuvert}>
          {textes.boutonAjouter}
        </Button>
        <p className={styles.total}>{texteTotal(collection.cartes.length)}</p>
      </div>

      {admin && ajoutOuvert && <AjoutCartes admin={admin} onFermer={() => setAjoutOuvert(false)} />}

      {collection.chargement === 'chargement' && (
        <p className={styles.message}>{textes.chargement}</p>
      )}
      {collection.chargement === 'erreur' && (
        <div className={styles.message}>
          <p>{textes.erreurChargement}</p>
          <Button onClick={collection.recharger}>{textes.reessayer}</Button>
        </div>
      )}
      {collection.chargement === 'pret' && (
        <Galerie
          cartes={collection.cartes}
          administrateur={admin !== null}
          onOuvrir={(carte) => setSelectionId(carte.id)}
        />
      )}

      {selection && (
        <CarteDetail
          key={selection.id}
          carte={selection}
          admin={admin}
          onFermer={() => setSelectionId(null)}
        />
      )}
    </>
  );
}
