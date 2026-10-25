/**
 * Badge de rareté (pilule colorée avec le nom de la rareté).
 *
 * Rôle : afficher le nom d'une rareté aux couleurs de config/raretes.ts (fond et texte du badge).
 * Expose : le composant `BadgeRarete`.
 * Dépend de : react, config/raretes, domain/types, BadgeRarete.module.css.
 */
import type { CSSProperties } from 'react';
import { RARETES } from '../../config/raretes';
import type { Rarity } from '../../domain/types';
import styles from './BadgeRarete.module.css';

interface BadgeRareteProps {
  rarete: Rarity;
  /** Version compacte (bilan). */
  petit?: boolean;
}

/** Badge de rareté. */
export function BadgeRarete({ rarete, petit = false }: BadgeRareteProps) {
  const { nom, couleurs } = RARETES[rarete];
  const style = { background: couleurs.badgeFond, color: couleurs.badgeTexte } as CSSProperties;
  return (
    <span className={petit ? `${styles.badge} ${styles.petit}` : styles.badge} style={style}>
      {nom}
    </span>
  );
}
