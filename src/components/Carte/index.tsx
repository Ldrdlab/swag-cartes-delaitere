/**
 * Composant « Carte » : l'affichage d'un visuel de carte, utilisé partout.
 *
 * Rôle : montrer l'image d'une carte dans un cadre au ratio fixe (5:7), sans jamais la déformer
 * (`object-fit: contain`) et en gardant la transparence des coins arrondis. C'est le SEUL endroit
 * qui sait afficher une carte : pour ajouter plus tard un effet visuel selon la rareté (holographique,
 * feu, brillance…), c'est ici qu'il faudra le brancher :
 *   - le cadre porte `data-rarete` et `data-variante` : le CSS peut s'en servir directement ;
 *   - la prop `calques` reçoit des éléments posés PAR-DESSUS l'image (effets, reflets…).
 * Expose : le composant `Carte`.
 * Dépend de : react, config/cartes, domain/types (type), Carte.module.css.
 */
import { useState, type ReactNode } from 'react';
import { RATIO_CARTE } from '../../config/cartes';
import type { Card } from '../../domain/types';
import styles from './Carte.module.css';

interface CarteProps {
  carte: Card;
  /** `miniature` = petite image rapide (galerie) ; `grande` = image complète (vue détaillée). */
  taille?: 'miniature' | 'grande';
  /** Vrai si le nom de la carte est déjà écrit à côté : l'image est alors ignorée des lecteurs d'écran. */
  decorative?: boolean;
  /** Effets posés par-dessus l'image (voir l'en-tête). Ignorés par les lecteurs d'écran si décoratifs. */
  calques?: ReactNode;
}

/** Une carte, au ratio fixe. Elle prend toute la largeur de son conteneur. */
export function Carte({ carte, taille = 'miniature', decorative = false, calques }: CarteProps) {
  const adresse = taille === 'miniature' ? (carte.thumbUrl ?? carte.imageUrl) : carte.imageUrl;
  // On retient l'adresse qui a échoué (et non un simple oui/non) : une autre carte repart de zéro.
  const [adresseEnEchec, setAdresseEnEchec] = useState<string | undefined>(undefined);

  return (
    <div
      className={styles.cadre}
      style={{ aspectRatio: String(RATIO_CARTE) }}
      data-rarete={carte.rarity}
      data-variante={carte.variant}
    >
      {adresse && adresse !== adresseEnEchec ? (
        <img
          className={styles.image}
          src={adresse}
          alt={decorative ? '' : carte.name}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setAdresseEnEchec(adresse)}
        />
      ) : (
        // Image absente ou illisible : un repli neutre, avec le nom de la carte.
        <span
          className={styles.repli}
          {...(decorative ? {} : { role: 'img', 'aria-label': carte.name })}
        >
          {carte.name}
        </span>
      )}
      {calques && <div className={styles.calques}>{calques}</div>}
    </div>
  );
}
