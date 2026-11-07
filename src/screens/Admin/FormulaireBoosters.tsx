/**
 * Formulaire des réglages de booster.
 *
 * Rôle : champs « cartes par booster », « boosters par jour » et une probabilité par rareté, avec le
 * total affiché en direct, les valeurs par défaut et l'enregistrement. L'état vient de
 * hooks/useFormulaireReglages.
 * Expose : le composant `FormulaireBoosters`.
 * Dépend de : react, components/Button, config/raretes, config/reglages, content/*, domain/administration
 * (type), domain/types, hooks/useFormulaireReglages, services/erreurs (via les messages), Admin.module.css.
 */
import { useId } from 'react';
import { Button } from '../../components/Button';
import { RARETES } from '../../config/raretes';
import { LIMITES_REGLAGES } from '../../config/reglages';
import { remplir } from '../../content/formatTexte';
import { texteErreurCollection } from '../../content/messagesCartes';
import { TEXTES } from '../../content/textes';
import type { ReglagesAdmin } from '../../domain/administration';
import { RARITIES } from '../../domain/types';
import { useFormulaireReglages } from '../../hooks/useFormulaireReglages';
import styles from './Admin.module.css';

interface FormulaireBoostersProps {
  reglages: ReglagesAdmin;
  enregistrer: (modifs: Partial<ReglagesAdmin>) => Promise<unknown>;
}

/** Affiche un nombre avec la virgule française. */
const formater = (nombre: number) => String(nombre).replace('.', ',');

/** Formulaire des réglages de booster. */
export function FormulaireBoosters({ reglages, enregistrer }: FormulaireBoostersProps) {
  const textes = TEXTES.admin.boosters;
  const base = useId();
  const f = useFormulaireReglages(reglages, enregistrer);
  const { cartesParBooster: cartes, boostersParJour: parJour } = LIMITES_REGLAGES;

  const messageTotal =
    f.ecart === null
      ? null
      : f.ecart === 0
        ? textes.totalOk
        : remplir(f.ecart > 0 ? textes.totalManque : textes.totalDepasse, {
            ecart: formater(Math.abs(f.ecart)),
          });

  return (
    <form
      className={styles.formulaire}
      onSubmit={(event) => {
        event.preventDefault();
        void f.enregistrer();
      }}
    >
      <h2 className={styles.sousTitre}>{textes.titre}</h2>

      <div className={styles.champ}>
        <label htmlFor={`${base}-cartes`}>{textes.labelCartes}</label>
        <input
          id={`${base}-cartes`}
          inputMode="numeric"
          value={f.saisie.cartes}
          aria-invalid={f.erreurs.includes('cartes_invalides') || undefined}
          onChange={(event) => f.changerCartes(event.target.value)}
        />
        <p className={styles.aide}>
          {remplir(textes.aideCartes, { min: String(cartes.min), max: String(cartes.max) })}
        </p>
      </div>

      <div className={styles.champ}>
        <label htmlFor={`${base}-jour`}>{textes.labelParJour}</label>
        <input
          id={`${base}-jour`}
          inputMode="numeric"
          value={f.saisie.parJour}
          aria-invalid={f.erreurs.includes('boosters_invalides') || undefined}
          onChange={(event) => f.changerParJour(event.target.value)}
        />
        <p className={styles.aide}>
          {remplir(textes.aideParJour, { min: String(parJour.min), max: String(parJour.max) })}
        </p>
      </div>

      <fieldset className={styles.probabilites}>
        <legend>{textes.titreProbabilites}</legend>
        <p className={styles.aide}>{textes.aideProbabilites}</p>
        {RARITIES.map((rarete) => (
          <div
            key={rarete}
            className={styles.ligneProba}
            style={{ borderColor: RARETES[rarete].couleurs.bordure }}
          >
            <label htmlFor={`${base}-${rarete}`}>{RARETES[rarete].nom}</label>
            <input
              id={`${base}-${rarete}`}
              inputMode="decimal"
              value={f.saisie.probabilites[rarete]}
              aria-invalid={f.erreurs.includes('probabilite_invalide') || undefined}
              onChange={(event) => f.changerProbabilite(rarete, event.target.value)}
            />
          </div>
        ))}
        <p
          className={f.ecart === 0 ? styles.totalOk : styles.totalKo}
          role="status"
          aria-live="polite"
        >
          {Number.isFinite(f.total) && remplir(textes.total, { total: formater(f.total) })}
          {messageTotal && ` — ${messageTotal}`}
        </p>
      </fieldset>

      {f.erreurs.includes('cartes_invalides') && (
        <p className={styles.erreur} role="alert">
          {remplir(textes.erreurCartes, { min: String(cartes.min), max: String(cartes.max) })}
        </p>
      )}
      {f.erreurs.includes('boosters_invalides') && (
        <p className={styles.erreur} role="alert">
          {remplir(textes.erreurParJour, { min: String(parJour.min), max: String(parJour.max) })}
        </p>
      )}
      {f.erreurs.includes('probabilite_invalide') && (
        <p className={styles.erreur} role="alert">
          {textes.erreurProbabilite}
        </p>
      )}
      {f.envoi.statut === 'erreur' && (
        <p className={styles.erreur} role="alert">
          {texteErreurCollection(f.envoi.code)}
        </p>
      )}
      {f.envoi.statut === 'succes' && (
        <p className={styles.succes} role="status">
          {textes.succes}
        </p>
      )}

      <div className={styles.boutons}>
        <Button type="submit" disabled={!f.peutEnregistrer}>
          {f.envoi.statut === 'envoi' ? textes.enregistrement : textes.boutonEnregistrer}
        </Button>
        <Button variant="secondary" onClick={f.valeursParDefaut}>
          {textes.boutonDefaut}
        </Button>
      </div>
    </form>
  );
}
