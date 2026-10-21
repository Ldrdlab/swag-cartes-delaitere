/**
 * Carte décorative flottante de l'écran d'accueil.
 *
 * Rôle : dessiner une petite carte (dégradé, zone « photo », deux barres grises) à la position, taille,
 * rotation et profondeur décrites dans config/accueil.ts. Purement décoratif : invisible pour les
 * lecteurs d'écran (le parent porte aria-hidden) et sans effet sur les clics.
 * Expose : le composant `FloatingCard`.
 * Dépend de : react, config/accueil (type), components/FloatingCard/imagesCartes, FloatingCard.module.css.
 */
import type { CSSProperties } from 'react';
import type { CarteFlottante } from '../../config/accueil';
import styles from './FloatingCard.module.css';
import { urlImageCarte } from './imagesCartes';

interface FloatingCardProps {
  carte: CarteFlottante;
}

/** Carte décorative (voir le commentaire d'en-tête). */
export function FloatingCard({ carte }: FloatingCardProps) {
  const imageUrl = urlImageCarte(carte.image);
  const variables = {
    left: `${carte.x}%`,
    top: `${carte.y}%`,
    '--largeur': `${carte.largeur}px`,
    '--rotation': `${carte.rotation}deg`,
    '--degrade': `var(--degrade-${carte.couleur})`,
    '--decalage': `${carte.decalage ?? 0}s`,
  } as CSSProperties;

  return (
    // Le conteneur extérieur place et incline la carte ; la carte intérieure est celle qui flotte.
    <div className={styles.position} style={variables} data-profondeur={carte.profondeur}>
      <div className={styles.carte}>
        <div className={styles.photo}>
          {imageUrl ? (
            <img className={styles.image} src={imageUrl} alt="" draggable={false} />
          ) : null}
        </div>
        <span className={styles.barre} />
        <span className={`${styles.barre} ${styles.barreCourte}`} />
      </div>
    </div>
  );
}
