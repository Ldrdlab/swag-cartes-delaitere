/**
 * Champ « Effet visuel » d'une carte : Automatique / Autre effet / Aucun, intensité et zone.
 *
 * Rôle : choisir comment l'effet de la carte est décidé. « Automatique » : c'est l'effet de sa rareté
 * (page Effets). « Autre effet » : un effet choisi pour cette carte seulement. « Aucun » : pas d'effet,
 * quelle que soit la rareté. L'intensité et la zone peuvent être réglées dans les deux premiers cas ;
 * « Revenir à l'automatique » efface le choix et les réglages. L'aperçu en direct est la carte affichée
 * à côté (CarteDetail). Rien n'est enregistré ici : le formulaire parent le fait.
 * Expose : le composant `ChampEffet`.
 * Dépend de : react, config/effets, content/*, domain/cartes (type), domain/effetsCartes, effects,
 * Formulaire.module.css.
 */
import { useId } from 'react';
import { INTENSITE_EFFET } from '../../config/effets';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import type { InfosCarte } from '../../domain/cartes';
import {
  origineEffet,
  ZONES_EFFET,
  type OrigineEffet,
  type ZoneEffet,
} from '../../domain/effetsCartes';
import { CLE_EFFET_AUCUN } from '../../effects/cles';
import { listerEffets } from '../../effects';
import styles from './Formulaire.module.css';

interface ChampEffetProps {
  infos: InfosCarte;
  onChange: (changement: Partial<InfosCarte>) => void;
  /** Nom de l'effet automatique de la rareté (affiché dans le choix « Automatique »), s'il est connu. */
  nomAuto?: string | undefined;
  disabled?: boolean;
}

const MODES: readonly OrigineEffet[] = ['automatique', 'force', 'aucun'];

/** Choix de l'effet d'une carte. */
export function ChampEffet({ infos, onChange, nomAuto, disabled = false }: ChampEffetProps) {
  const t = TEXTES.mesCartes;
  const tz = TEXTES.admin.effets;
  const base = useId();
  const mode = origineEffet(infos.effet);
  const parametres = infos.parametres ?? {};
  const effets = listerEffets().filter((effet) => effet.cle !== CLE_EFFET_AUCUN);
  const intensite = parametres.intensite ?? INTENSITE_EFFET.defaut;
  const modifie = mode !== 'automatique' || Object.keys(parametres).length > 0;

  const libelle: Record<OrigineEffet, string> = {
    automatique: nomAuto ? remplir(t.effetAutomatique, { nom: nomAuto }) : t.effetAutomatiqueSimple,
    force: t.effetAutre,
    aucun: t.effetAucun,
  };

  const choisirMode = (nouveau: OrigineEffet) => {
    if (nouveau === 'automatique') onChange({ effet: '' });
    else if (nouveau === 'aucun') onChange({ effet: CLE_EFFET_AUCUN });
    else onChange({ effet: mode === 'force' ? infos.effet : (effets[0]?.cle ?? CLE_EFFET_AUCUN) });
  };

  return (
    <fieldset className={styles.champ} disabled={disabled}>
      <legend>{t.effetTitre}</legend>
      {MODES.map((m) => (
        <label key={m} className={styles.caseActive}>
          <input
            type="radio"
            name={`${base}-mode`}
            checked={mode === m}
            onChange={() => choisirMode(m)}
          />
          {libelle[m]}
        </label>
      ))}

      {mode === 'force' && (
        <div className={styles.champ}>
          <label htmlFor={`${base}-effet`}>{t.labelEffet}</label>
          <select
            id={`${base}-effet`}
            value={infos.effet}
            onChange={(event) => onChange({ effet: event.target.value })}
          >
            {effets.map((effet) => (
              <option key={effet.cle} value={effet.cle}>
                {effet.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode !== 'aucun' && (
        <>
          <div className={styles.champ}>
            <label htmlFor={`${base}-intensite`}>
              {remplir(tz.intensite, { valeur: String(intensite) })}
            </label>
            <input
              id={`${base}-intensite`}
              type="range"
              min={INTENSITE_EFFET.min}
              max={INTENSITE_EFFET.max}
              value={intensite}
              onChange={(event) =>
                onChange({ parametres: { ...parametres, intensite: Number(event.target.value) } })
              }
            />
          </div>
          <div className={styles.champ}>
            <label htmlFor={`${base}-zone`}>{tz.zone}</label>
            <select
              id={`${base}-zone`}
              value={parametres.zone ?? ''}
              onChange={(event) =>
                onChange({
                  parametres: {
                    ...parametres,
                    zone: (event.target.value || undefined) as ZoneEffet | undefined,
                  },
                })
              }
            >
              <option value="">{tz.zones.defaut}</option>
              {ZONES_EFFET.map((zone) => (
                <option key={zone} value={zone}>
                  {tz.zones[zone]}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <p className={styles.aide}>{t.effetAide}</p>
      {modifie && (
        <button
          type="button"
          className={styles.lien}
          onClick={() => onChange({ effet: '', parametres: {} })}
        >
          {t.effetRevenir}
        </button>
      )}
    </fieldset>
  );
}
