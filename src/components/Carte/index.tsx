/**
 * Composant « Carte » : l'affichage d'un visuel de carte, utilisé partout.
 *
 * Rôle : montrer l'image d'une carte dans un cadre au ratio fixe (5:7), sans jamais la déformer
 * (`object-fit: contain`) et en gardant la transparence des coins arrondis. C'est le SEUL endroit
 * qui sait afficher une carte :
 *   - le cadre porte `data-rarete` et `data-variante` : le CSS peut s'en servir directement ;
 *   - la prop `calques` reçoit des éléments posés PAR-DESSUS l'image ;
 *   - l'effet visuel est une COUCHE ajoutée à l'affichage par <EffetCarte /> : l'image reste une photo
 *     fixe, sans effet incrusté. Sans la prop `effet`, la carte décide seule (domain/effetsCartes :
 *     resoudreEffet) : effet imposé, aucun, ou effet de sa rareté (règles lues une fois par
 *     hooks/useReglesEffets). `modeEffet` dit comment l'effet vit : animé par défaut (grilles : effets en
 *     continu et léger mouvement au repos), interactif (vue agrandie, révélation : suit aussi la souris ou
 *     le doigt) ou statique (figé).
 *   - le cadre s'incline en 3D d'après les variables CSS de l'animation (voir Carte.module.css).
 * Expose : le composant `Carte`.
 * Dépend de : react, config/cartes, config/effets, domain/types (type), domain/effetsCartes, effects,
 * hooks/useReglesEffets, Carte.module.css.
 */
import { useRef, useState, type ReactNode } from 'react';
import { RATIO_CARTE } from '../../config/cartes';
import { INTENSITE_EFFET } from '../../config/effets';
import { resoudreEffet, type EffetResolu, type ModeEffet } from '../../domain/effetsCartes';
import type { Card } from '../../domain/types';
import { EffetCarte } from '../../effects/EffetCarte';
import { useReglesEffets } from '../../hooks/useReglesEffets';
import { CLE_EFFET_AUCUN } from '../../effects/cles';
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
  /** Force « Effets réduits » (aperçu de l'admin) ; sinon, l'option de l'appareil s'applique. */
  effetsReduits?: boolean;
  /** Effet à afficher (déjà résolu) ; `null` = aucun. Absent : seul l'effet forcé de la carte. */
  effet?: EffetResolu | null;
}

/** Une carte, au ratio fixe. Elle prend toute la largeur de son conteneur. */
export function Carte({
  carte,
  taille = 'miniature',
  decorative = false,
  calques,
  modeEffet = 'anime',
  effetsReduits,
  effet,
}: CarteProps) {
  const cadre = useRef<HTMLDivElement>(null);
  const adresse = taille === 'miniature' ? (carte.thumbUrl ?? carte.imageUrl) : carte.imageUrl;
  // On retient l'adresse qui a échoué (et non un simple oui/non) : une autre carte repart de zéro.
  const [adresseEnEchec, setAdresseEnEchec] = useState<string | undefined>(undefined);
  const { regles } = useReglesEffets();
  // Effet à afficher : « aucun » ou intensité nulle n'ajoutent rien ; les autres sont chargés à la demande.
  const effetAffiche =
    effet === undefined ? resoudreEffet(carte, regles, INTENSITE_EFFET.defaut) : effet;
  const avecEffet =
    effetAffiche !== null && effetAffiche.cle !== CLE_EFFET_AUCUN && effetAffiche.intensite > 0;

  return (
    <div className={styles.scene}>
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
        {(calques || avecEffet) && (
          <div className={styles.calques}>
            {avecEffet && (
              <EffetCarte
                cle={effetAffiche.cle}
                intensite={effetAffiche.intensite}
                mode={modeEffet}
                {...(effetsReduits === undefined ? {} : { effetsReduits })}
                cible={cadre}
                graine={carte.id}
                {...(effetAffiche.zone ? { zone: effetAffiche.zone } : {})}
                {...(effetAffiche.reglages ? { reglages: effetAffiche.reglages } : {})}
              />
            )}
            {calques}
          </div>
        )}
      </div>
    </div>
  );
}
