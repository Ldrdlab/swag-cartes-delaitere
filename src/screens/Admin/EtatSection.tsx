/**
 * Affichage commun d'une section de l'espace admin qui charge une donnée.
 *
 * Rôle : montrer « Chargement… », un message d'erreur avec « Réessayer », ou le contenu une fois la
 * donnée prête. Évite de répéter ces trois cas dans chaque section.
 * Expose : le composant `EtatSection`.
 * Dépend de : react, components/Button, content/messagesCartes, content/textes, hooks/useChargement (type),
 * MesCartes.module.css.
 */
import type { ReactNode } from 'react';
import { Button } from '../../components/Button';
import { texteErreurCollection } from '../../content/messagesCartes';
import { TEXTES } from '../../content/textes';
import type { EtatChargement } from '../../hooks/useChargement';
import styles from './MesCartes.module.css';

interface EtatSectionProps<T> {
  etat: EtatChargement<T>;
  onReessayer: () => void;
  /** Contenu à afficher quand la donnée est prête. */
  children: (donnees: T) => ReactNode;
}

/** Chargement / erreur / contenu d'une section. */
export function EtatSection<T>({ etat, onReessayer, children }: EtatSectionProps<T>) {
  const textes = TEXTES.admin;
  if (etat.statut === 'chargement') return <p className={styles.message}>{textes.chargement}</p>;
  if (etat.statut === 'erreur') {
    return (
      <div className={styles.message} role="alert">
        <p>{textes.erreurChargement}</p>
        <p>{texteErreurCollection(etat.code)}</p>
        <Button onClick={onReessayer}>{textes.reessayer}</Button>
      </div>
    );
  }
  return <>{children(etat.donnees)}</>;
}
