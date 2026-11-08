/**
 * Section « Effets » de l'espace admin : page de démonstration des effets visuels des cartes.
 *
 * Rôle : essayer chaque effet sur une carte fictive (aucune photo) : choix de l'effet, du mode (image fixe,
 * animé, interactif), de la zone, de l'intensité et de l'option « Effets réduits ». En dessous, la table
 * « effet par défaut selon la rareté » avec une petite carte en image fixe par ligne, comme dans une
 * collection. Rien n'est enregistré : c'est un banc d'essai (l'attribution viendra dans une phase suivante).
 * Expose : le composant `SectionEffets`.
 * Dépend de : react, components/Carte, config/cartes, config/effets, content/*, data/carteDemo,
 * domain/effetsCartes, domain/types, effects, Effets.module.css, Formulaire.module.css.
 */
import { useId, useState } from 'react';
import { Carte } from '../../components/Carte';
import { NOMS_VARIANTES } from '../../config/cartes';
import { EFFETS_PAR_DEFAUT, INTENSITE_EFFET } from '../../config/effets';
import { RARETES } from '../../config/raretes';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { carteDemo } from '../../data/carteDemo';
import type { ModeEffet, ZoneEffet } from '../../domain/effetsCartes';
import type { Rarity, Variant } from '../../domain/types';
import { listerEffets } from '../../effects';
import formulaire from './Formulaire.module.css';
import styles from './Effets.module.css';

const MODES: readonly ModeEffet[] = ['statique', 'anime', 'interactif'];
const ZONES: readonly ZoneEffet[] = ['carte', 'interieur', 'illustration', 'cadre'];

/** Nom d'une ligne de la table : rareté, et variante si elle existe. */
function nomLigne(rarete: Rarity, variante: Variant | undefined): string {
  const t = TEXTES.admin.effets;
  const nom = RARETES[rarete].nom;
  return variante
    ? remplir(t.avecVariante, { rarete: nom, variante: NOMS_VARIANTES[variante] })
    : remplir(t.sansVariante, { rarete: nom });
}

/** Banc d'essai des effets de cartes. */
export function SectionEffets() {
  const t = TEXTES.admin.effets;
  const id = useId();
  const [cle, setCle] = useState('holo');
  const [mode, setMode] = useState<ModeEffet>('interactif');
  const [zone, setZone] = useState<ZoneEffet | ''>('');
  const [intensite, setIntensite] = useState<number>(INTENSITE_EFFET.defaut);
  const [reduits, setReduits] = useState(false);

  const choisir = (nouvelle: string) => {
    setCle(nouvelle);
    setZone('');
  };

  return (
    <section aria-labelledby={`${id}-titre`} className={styles.section}>
      <h2 id={`${id}-titre`} className={styles.titre}>
        {t.titre}
      </h2>
      <p className={styles.aide}>{t.intro}</p>

      <div className={styles.banc}>
        <div className={styles.apercu} role="group" aria-label={t.labelApercu}>
          <Carte
            carte={carteDemo('rare', undefined, cle)}
            taille="grande"
            decorative
            modeEffet={reduits ? 'statique' : mode}
            intensiteEffet={intensite}
            {...(zone ? { zoneEffet: zone } : {})}
          />
          <p className={styles.aide}>{t.aideApercu}</p>
        </div>

        <div className={formulaire.formulaire}>
          <div className={formulaire.champ}>
            <label htmlFor={`${id}-effet`}>{t.effet}</label>
            <select id={`${id}-effet`} value={cle} onChange={(e) => choisir(e.target.value)}>
              {listerEffets().map((effet) => (
                <option key={effet.cle} value={effet.cle}>
                  {effet.nom}
                </option>
              ))}
            </select>
          </div>
          <div className={formulaire.champ}>
            <label htmlFor={`${id}-mode`}>{t.mode}</label>
            <select
              id={`${id}-mode`}
              value={mode}
              onChange={(e) => setMode(e.target.value as ModeEffet)}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {t.modes[m]}
                </option>
              ))}
            </select>
          </div>
          <div className={formulaire.champ}>
            <label htmlFor={`${id}-zone`}>{t.zone}</label>
            <select
              id={`${id}-zone`}
              value={zone}
              onChange={(e) => setZone(e.target.value as ZoneEffet | '')}
            >
              <option value="">{t.zones.defaut}</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {t.zones[z]}
                </option>
              ))}
            </select>
          </div>
          <div className={formulaire.champ}>
            <label htmlFor={`${id}-intensite`}>
              {remplir(t.intensite, { valeur: String(intensite) })}
            </label>
            <input
              id={`${id}-intensite`}
              type="range"
              min={INTENSITE_EFFET.min}
              max={INTENSITE_EFFET.max}
              value={intensite}
              onChange={(e) => setIntensite(Number(e.target.value))}
            />
          </div>
          <label className={formulaire.caseActive}>
            <input
              type="checkbox"
              checked={reduits}
              onChange={(e) => setReduits(e.target.checked)}
            />
            {t.effetsReduits}
          </label>
        </div>
      </div>

      <h3 className={styles.sousTitre}>{t.titreDefaut}</h3>
      <p className={styles.aide}>{t.aideDefaut}</p>
      <ul className={styles.table}>
        {EFFETS_PAR_DEFAUT.map((regle) => (
          <li key={`${regle.rarete}-${regle.variante ?? ''}`}>
            <button
              type="button"
              className={styles.ligne}
              aria-pressed={cle === regle.cle}
              onClick={() => choisir(regle.cle)}
            >
              <span className={styles.miniature}>
                <Carte
                  carte={carteDemo(regle.rarete, regle.variante, regle.cle)}
                  decorative
                  modeEffet="statique"
                />
              </span>
              <span className={styles.nom}>{nomLigne(regle.rarete, regle.variante)}</span>
              <span className={styles.effet}>
                {listerEffets().find((e) => e.cle === regle.cle)?.nom}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
