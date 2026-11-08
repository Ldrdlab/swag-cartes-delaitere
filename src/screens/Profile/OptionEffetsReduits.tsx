/**
 * Case « Effets réduits » de l'écran Profil.
 *
 * Rôle : alléger les effets visuels des cartes (qualité simple, aucune animation, pas de suivi de
 * l'inclinaison). L'option est retenue sur l'appareil (effects/preferences). Si le système demande déjà de
 * réduire les animations, un message le dit.
 * Expose : le composant `OptionEffetsReduits`.
 * Dépend de : react, content/textes, effects/preferences, hooks/useMouvementReduit, Profile.module.css.
 */
import { useId } from 'react';
import { TEXTES } from '../../content/textes';
import { ecrireEffetsReduits, useOptionEffetsReduits } from '../../effects/preferences';
import { useMouvementReduit } from '../../hooks/useMouvementReduit';
import styles from './Profile.module.css';

/** Option d'affichage des effets de cartes. */
export function OptionEffetsReduits() {
  const id = useId();
  const active = useOptionEffetsReduits();
  const systeme = useMouvementReduit();
  return (
    <div className={styles.option}>
      <label className={styles.optionCase} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={active}
          aria-describedby={`${id}-aide`}
          onChange={(event) => ecrireEffetsReduits(event.target.checked)}
        />
        {TEXTES.profil.effetsReduits}
      </label>
      <p id={`${id}-aide`} className={styles.optionAide}>
        {TEXTES.profil.effetsReduitsAide}
        {systeme ? ` ${TEXTES.profil.effetsReduitsSysteme}` : ''}
      </p>
    </div>
  );
}
