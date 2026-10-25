/**
 * Icône en traits, colorée comme le texte qui l'entoure.
 *
 * Rôle : afficher une icône du dossier src/assets/icons/ avec la couleur courante (`currentColor`).
 * L'image sert de « pochoir » : la couleur vient du CSS (propriété `color` du parent), ce qui
 * permet de la changer sans toucher au fichier SVG. La taille suit `font-size` (1em).
 * Expose : le composant `Icon`, le type `NomIcone`.
 * Dépend de : react, assets/icons/*.svg, Icon.module.css.
 */
import type { CSSProperties } from 'react';
import appareilPhoto from '../../assets/icons/appareil-photo.svg';
import chevron from '../../assets/icons/chevron.svg';
import croix from '../../assets/icons/croix.svg';
import crayon from '../../assets/icons/crayon.svg';
import styles from './Icon.module.css';

/** Icônes disponibles. Pour en ajouter une : déposer le SVG dans assets/icons/ et l'inscrire ici. */
const ICONES = { 'appareil-photo': appareilPhoto, chevron, crayon, croix } as const;

/** Nom d'une icône disponible. */
export type NomIcone = keyof typeof ICONES;

interface IconProps {
  /** Quelle icône afficher. */
  nom: NomIcone;
}

/** Icône décorative (ignorée par les lecteurs d'écran : l'élément parent porte le libellé). */
export function Icon({ nom }: IconProps) {
  return (
    <span
      className={styles.icone}
      style={{ '--icone': `url("${ICONES[nom]}")` } as CSSProperties}
      aria-hidden="true"
    />
  );
}
