/**
 * Écran « Mes cartes ».
 *
 * Rôle : galerie de toutes les cartes (visible par tout le monde) et, une fois le code admin saisi
 * (`npm run dev` seulement), ajout / modification / suppression. Assemble Galerie, CodeAdmin,
 * AjoutCartes et CarteDetail ; l'état vient de hooks/useCollection.
 * Expose : le composant `MesCartesScreen`.
 * Dépend de : react, components/Button, content/textes, hooks/useCollection, Galerie, CodeAdmin,
 * AjoutCartes, CarteDetail, MesCartes.module.css.
 */
import { useState } from 'react';
import { Button } from '../../components/Button';
import { texteTotal } from '../../content/messagesCartes';
import { TEXTES } from '../../content/textes';
import { useCollection } from '../../hooks/useCollection';
import type { Card } from '../../domain/types';
import { AjoutCartes } from './AjoutCartes';
import { CarteDetail } from './CarteDetail';
import { CodeAdmin } from './CodeAdmin';
import { Galerie } from './Galerie';
import styles from './MesCartes.module.css';

interface MesCartesScreenProps {
  /** Appelé par « Retour » : revient à l'accueil. */
  onBack: () => void;
}

/** Écran de gestion et de consultation des cartes. */
export function MesCartesScreen({ onBack }: MesCartesScreenProps) {
  const textes = TEXTES.mesCartes;
  const collection = useCollection();
  const { statutAdmin, admin } = collection;
  const [codeOuvert, setCodeOuvert] = useState(false);
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  // La carte ouverte est relue dans la liste : une modification se voit tout de suite.
  const selection = collection.cartes.find((c: Card) => c.id === selectionId) ?? null;

  return (
    <div className={styles.page}>
      <main className={styles.contenu} aria-labelledby="titre-mes-cartes">
        <header className={styles.entete}>
          <Button variant="secondary" onClick={onBack}>
            {textes.retour}
          </Button>
          <h1 id="titre-mes-cartes" className={styles.titre}>
            {textes.titre}
          </h1>
          <p className={styles.total}>{texteTotal(collection.cartes.length)}</p>
        </header>

        <div className={styles.actions}>
          {statutAdmin === 'deverrouille' ? (
            <>
              <Button onClick={() => setAjoutOuvert(true)} disabled={ajoutOuvert}>
                {textes.boutonAjouter}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  collection.verrouiller();
                  setAjoutOuvert(false);
                  setCodeOuvert(false);
                }}
              >
                {textes.boutonVerrouiller}
              </Button>
            </>
          ) : (
            (statutAdmin === 'verrouille' || statutAdmin === 'sans_code') && (
              <Button variant="secondary" onClick={() => setCodeOuvert(!codeOuvert)}>
                {textes.boutonGerer}
              </Button>
            )
          )}
        </div>

        {codeOuvert && statutAdmin !== 'deverrouille' && (
          <CodeAdmin
            codeDefini={statutAdmin === 'verrouille'}
            onDeverrouiller={collection.deverrouiller}
          />
        )}

        {admin && ajoutOuvert && (
          <AjoutCartes admin={admin} onFermer={() => setAjoutOuvert(false)} />
        )}

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
      </main>

      {selection && (
        <CarteDetail
          key={selection.id}
          carte={selection}
          admin={admin}
          onFermer={() => setSelectionId(null)}
        />
      )}
    </div>
  );
}
