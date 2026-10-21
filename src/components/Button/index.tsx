/**
 * Bouton réutilisable.
 *
 * Rôle : bouton accessible (zone tactile >= 44 px, focus visible) en deux variantes.
 * Expose : le composant `Button`.
 * Dépend de : react, Button.module.css.
 */
import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary` = action principale, `secondary` = action discrète. */
  variant?: 'primary' | 'secondary';
}

/** Bouton standard ; `aria-label` et les autres attributs natifs sont transmis tels quels. */
export function Button({ variant = 'primary', className, type = 'button', ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return <button type={type} className={classes} {...rest} />;
}
