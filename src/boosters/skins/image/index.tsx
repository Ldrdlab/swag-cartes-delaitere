/**
 * Skin « image » : le paquet est une illustration complète.
 *
 * ┌─ COMMENT FAIRE UN BOOSTER AVEC UNE ILLUSTRATION (pour débutant) ──────────────────┐
 * │ 1. Dessine ton paquet : image de 344 × 640 px (format 172 × 320 × 2), en WebP,     │
 * │    de moins de 120 Ko. Nomme-la `paquet.webp`.                                     │
 * │ 2. Crée le dossier `src/assets/images/boosters/<id-de-ton-theme>/` et mets-y       │
 * │    `paquet.webp`.                                                                  │
 * │ 3. (Facultatif) Ajoute `haut.webp` : seulement la bande du haut (344 × 120 px)     │
 * │    pour la partie qui se découpe. Sans lui, on utilise le haut de `paquet.webp`.   │
 * │ 4. Dans le catalogue, mets `skin: 'image'` pour ce booster.                        │
 * └──────────────────────────────────────────────────────────────────────────────┘
 * Les effets foil et reflet s'appliquent par-dessus (ils sont ajoutés par BoosterVisuel).
 * Si l'image est introuvable, un paquet de secours aux couleurs du thème s'affiche.
 *
 * Expose : le composant `SkinImage`.
 * Dépend de : react, boosters/skins/Fenetre, boosters/skins/imagesBoosters, Image.module.css.
 */
import type { CSSProperties } from 'react';
import { Fenetre } from '../Fenetre';
import { urlImageBooster } from '../imagesBoosters';
import type { PropsSkin } from '../types';
import styles from './Image.module.css';

/** Skin « image » (voir le commentaire d'en-tête). */
export function SkinImage({ theme, partie }: PropsSkin) {
  const paquet = urlImageBooster(theme.id, 'paquet');
  const haut = urlImageBooster(theme.id, 'haut');

  // Image absente : paquet de secours (dégradé du thème + nom du fichier attendu).
  if (!paquet) {
    const secours = {
      background: `linear-gradient(160deg, ${theme.couleurs.paquetDebut}, ${theme.couleurs.paquetFin})`,
    } as CSSProperties;
    return (
      <div className={styles.secours} style={secours}>
        <span>assets/images/boosters/{theme.id}/paquet.webp</span>
      </div>
    );
  }

  // Un fichier haut.webp dédié remplace le haut de paquet.webp pour la partie découpée.
  if (partie === 'haut' && haut) {
    return <div className={styles.image} style={{ backgroundImage: `url("${haut}")` }} />;
  }

  return (
    <Fenetre partie={partie}>
      <div className={styles.image} style={{ backgroundImage: `url("${paquet}")` }} />
    </Fenetre>
  );
}
