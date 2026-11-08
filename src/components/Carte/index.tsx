/**
 * Composant « Carte » : l'affichage d'un visuel de carte, utilisé partout.
 *
 * Rôle : montrer l'image d'une carte dans un cadre au ratio fixe (5:7), sans jamais la déformer
 * (`object-fit: contain`) et en gardant la transparence des coins arrondis. C'est le SEUL endroit
 * qui sait afficher une carte :
 *   - le cadre porte `data-rarete` et `data-variante` : le CSS peut s'en servir directement ;
 *   - la prop `calques` reçoit des éléments posés PAR-DESSUS l'image ;
 *   - l'effet visuel de la carte (registre src/effects/, champ `carte.effect`) est une COUCHE ajoutée à
 *     l'affichage par <EffetCarte /> : l'image reste une photo fixe, sans effet incrusté. `modeEffet` dit
 *     comment l'effet vit (statique par défaut : image fixe, sans animation).
 * Expose : le composant `Carte`.
 * Dépend de : react, config/cartes, domain/types (type), domain/effetsCartes (types), effects, Carte.module.css.
 */
import { useRef, useState, type ReactNode } from 'react';
import { RATIO_CARTE } from '../../config/cartes';
import type { ModeEffet, ZoneEffet } from '../../domain/effetsCartes';
import type { Card } from '../../domain/types';
import { EffetCarte } from '../../effects/EffetCarte';
import { CLE_EFFET_AUCUN, cleDepuisBase } from '../../effects/cles';
import styles from './Carte.module.css';

interface CarteProps {
  carte: Card;
  /** `miniature` = petite image rapide (galerie) ; `grande` = image complète (vue détaillée). */
  taille?: 'miniature' | 'grande';
  /** Vrai si le nom de la carte est déjà écrit à côté : l'image est alors ignorée des lecteurs d'écran. */
  decorative?: boolean;
  /** Effets posés par-dessus l'image (voir l'en-tête). Ignorés par les lecteurs d'écran si décoratifs. */
  calques?: ReactNode;
  /** Façon dont l'effet vit : image fixe (défaut), animé, ou animé et qui suit souris / inclinaison. */
  modeEffet?: ModeEffet;
  /** Intensité de l'effet, de 0 à 100 (100 par défaut). */
  intensiteEffet?: number;
  /** Zone couverte par l'effet ; par défaut celle de l'effet. */
  zoneEffet?: ZoneEffet;
}

/** Une carte, au ratio fixe. Elle prend toute la largeur de son conteneur. */
export function Carte({
  carte,
  taille = 'miniature',
  decorative = false,
  calques,
  modeEffet = 'statique',
  intensiteEffet,
  zoneEffet,
}: CarteProps) {
  const cadre = useRef<HTMLDivElement>(null);
  const adresse = taille === 'miniature' ? (carte.thumbUrl ?? carte.imageUrl) : carte.imageUrl;
  // On retient l'adresse qui a échoué (et non un simple oui/non) : une autre carte repart de zéro.
  const [adresseEnEchec, setAdresseEnEchec] = useState<string | undefined>(undefined);
  // Effet de la carte : « aucun » n'ajoute rien ; les autres sont chargés à la demande (src/effects/).
  const cleEffet = cleDepuisBase(carte.effect);

  return (
    <div
      ref={cadre}
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
      {(calques || cleEffet !== CLE_EFFET_AUCUN) && (
        <div className={styles.calques}>
          {cleEffet !== CLE_EFFET_AUCUN && (
            <EffetCarte
              cle={cleEffet}
              mode={modeEffet}
              cible={cadre}
              {...(intensiteEffet === undefined ? {} : { intensite: intensiteEffet })}
              {...(zoneEffet ? { zone: zoneEffet } : {})}
            />
          )}
          {calques}
        </div>
      )}
    </div>
  );
}
