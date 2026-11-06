/**
 * Formulaire des infos d'une carte (nom, rareté, variante).
 *
 * Rôle : champs réutilisés pour une nouvelle carte (ajout) et pour une carte existante (modification).
 * La variante n'apparaît que pour les raretés qui en ont une (mythique, secrète).
 * Expose : le composant `FormulaireInfos`.
 * Dépend de : react, config/cartes, config/raretes, content/messagesCartes, content/textes,
 * domain/cartes, domain/types, Formulaire.module.css.
 */
import { useId } from 'react';
import { NOM_CARTE_MAX, NOMS_VARIANTES, VARIANTES_PAR_RARETE } from '../../config/cartes';
import { RARETES } from '../../config/raretes';
import { texteErreurInfos } from '../../content/messagesCartes';
import { TEXTES } from '../../content/textes';
import { variantesPour, type ErreursInfos, type InfosCarte } from '../../domain/cartes';
import { RARITIES, type Rarity, type Variant } from '../../domain/types';
import styles from './Formulaire.module.css';

interface FormulaireInfosProps {
  infos: InfosCarte;
  /** Erreurs à afficher sous les champs. */
  erreurs: ErreursInfos;
  onChange: (changement: Partial<InfosCarte>) => void;
  disabled?: boolean;
}

/** Champs nom / rareté / variante. */
export function FormulaireInfos({
  infos,
  erreurs,
  onChange,
  disabled = false,
}: FormulaireInfosProps) {
  const textes = TEXTES.mesCartes;
  const base = useId();
  const variantes = variantesPour(infos.rarete, VARIANTES_PAR_RARETE);

  return (
    <div className={styles.formulaire}>
      <div className={styles.champ}>
        <label htmlFor={`${base}-nom`}>{textes.labelNom}</label>
        <input
          id={`${base}-nom`}
          type="text"
          value={infos.nom}
          maxLength={NOM_CARTE_MAX}
          required
          disabled={disabled}
          aria-invalid={erreurs.nom ? true : undefined}
          aria-describedby={erreurs.nom ? `${base}-nom-erreur` : undefined}
          onChange={(event) => onChange({ nom: event.target.value })}
        />
        {erreurs.nom && (
          <p id={`${base}-nom-erreur`} className={styles.erreur} role="alert">
            {texteErreurInfos(erreurs.nom)}
          </p>
        )}
      </div>

      <div className={styles.champ}>
        <label htmlFor={`${base}-rarete`}>{textes.labelRarete}</label>
        <select
          id={`${base}-rarete`}
          value={infos.rarete}
          disabled={disabled}
          onChange={(event) => onChange({ rarete: event.target.value as Rarity })}
        >
          {RARITIES.map((rarete) => (
            <option key={rarete} value={rarete}>
              {RARETES[rarete].nom}
            </option>
          ))}
        </select>
      </div>

      {variantes.length > 0 && (
        <div className={styles.champ}>
          <label htmlFor={`${base}-variante`}>{textes.labelVariante}</label>
          <select
            id={`${base}-variante`}
            value={infos.variante ?? ''}
            disabled={disabled}
            aria-invalid={erreurs.variante ? true : undefined}
            aria-describedby={erreurs.variante ? `${base}-variante-erreur` : undefined}
            onChange={(event) => onChange({ variante: event.target.value as Variant })}
          >
            {variantes.map((variante) => (
              <option key={variante} value={variante}>
                {NOMS_VARIANTES[variante]}
              </option>
            ))}
          </select>
          {erreurs.variante && (
            <p id={`${base}-variante-erreur`} className={styles.erreur} role="alert">
              {texteErreurInfos(erreurs.variante)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
