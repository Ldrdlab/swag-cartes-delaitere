/**
 * Réglages d'affichage des effets de cartes, dans l'écran Profil.
 *
 * Rôle : deux réglages retenus sur l'appareil (effects/preferences) :
 *   - « Qualité des effets » : Auto (l'appli choisit selon l'appareil), Élevée (tous les détails) ou Économie
 *     (moins de détails, moins de feux animés) ;
 *   - « Effets réduits » : cartes plus simples et sans mouvement (ni orbite, ni inclinaison) ; les reflets suivent
 *     encore le doigt. Si le système demande déjà de réduire les animations, un message le dit.
 * Expose : le composant `OptionsEffets`.
 * Dépend de : react, config/effets, content/*, domain/effetsCartes, effects/EffetCarte (indicesAppareil),
 * effects/preferences, hooks/useMouvementReduit, Profile.module.css.
 */
import { useId } from 'react';
import { SEUILS_APPAREIL_MODESTE } from '../../config/effets';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import {
  PREFERENCES_QUALITE,
  resoudreQualite,
  type PreferenceQualite,
} from '../../domain/effetsCartes';
import { indicesAppareil } from '../../effects/EffetCarte';
import {
  ecrireEffetsReduits,
  ecrirePreferenceQualite,
  useOptionEffetsReduits,
  usePreferenceQualite,
} from '../../effects/preferences';
import { useMouvementReduit } from '../../hooks/useMouvementReduit';
import styles from './Profile.module.css';

/** Qualité, puis effets réduits. */
export function OptionsEffets() {
  const t = TEXTES.profil;
  const id = useId();
  const qualite = usePreferenceQualite();
  const reduits = useOptionEffetsReduits();
  const systeme = useMouvementReduit();

  // Ce que « Auto » donne sur cet appareil, pour que le joueur sache ce qu'il choisit.
  const niveauAuto = resoudreQualite(indicesAppareil(), SEUILS_APPAREIL_MODESTE, false, 'auto');
  const noms: Record<PreferenceQualite, string> = {
    auto: t.qualiteAuto,
    haute: t.qualiteHaute,
    eco: t.qualiteEco,
  };
  const aides: Record<PreferenceQualite, string> = {
    auto: remplir(t.qualiteAutoAide, {
      niveau: niveauAuto === 'haute' ? t.qualiteHaute : t.qualiteEco,
    }),
    haute: t.qualiteHauteAide,
    eco: t.qualiteEcoAide,
  };

  return (
    <div className={styles.option}>
      <fieldset className={styles.optionGroupe}>
        <legend className={styles.optionTitre}>{t.qualiteEffets}</legend>
        {PREFERENCES_QUALITE.map((valeur) => (
          <div key={valeur} className={styles.optionChoix}>
            <input
              id={`${id}-qualite-${valeur}`}
              type="radio"
              name={`${id}-qualite`}
              checked={qualite === valeur}
              onChange={() => ecrirePreferenceQualite(valeur)}
            />
            <label htmlFor={`${id}-qualite-${valeur}`}>
              <strong>{noms[valeur]}</strong>
              <span className={styles.optionAide}>{aides[valeur]}</span>
            </label>
          </div>
        ))}
        {reduits && <p className={styles.optionAide}>{t.qualiteForceeParReduits}</p>}
      </fieldset>

      <label className={styles.optionCase} htmlFor={`${id}-reduits`}>
        <input
          id={`${id}-reduits`}
          type="checkbox"
          checked={reduits}
          aria-describedby={`${id}-reduits-aide`}
          onChange={(event) => ecrireEffetsReduits(event.target.checked)}
        />
        {t.effetsReduits}
      </label>
      <p id={`${id}-reduits-aide`} className={styles.optionAide}>
        {t.effetsReduitsAide}
        {systeme ? ` ${t.effetsReduitsSysteme}` : ''}
      </p>
    </div>
  );
}
