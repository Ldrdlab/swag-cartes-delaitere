/**
 * Section « Essai » de l'espace admin : banc d'essai de fluidité des effets animés.
 *
 * Rôle : afficher une grille de cartes fictives (une de chaque rareté et variante, répétées) avec leurs
 * effets animés en continu, et un compteur d'images par seconde, pour juger la fluidité sur un vrai
 * téléphone. On peut changer le nombre de cartes, la qualité, la méthode d'orbite (une horloge JavaScript
 * ou une animation CSS `@property`), le nombre de feux WebGL animés en même temps et le mode. Rien n'est
 * enregistré : ces choix ne touchent pas aux réglages du joueur.
 * Expose : le composant `SectionEssaiEffets`.
 * Dépend de : react, components/Carte, config/effets, content/*, data/carteDemo, effects/*, hooks/useCompteurImages,
 * Essai.module.css, Formulaire.module.css.
 */
import { useId, useMemo, useState } from 'react';
import { Carte } from '../../components/Carte';
import { EFFETS_PAR_DEFAUT } from '../../config/effets';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { carteDemo } from '../../data/carteDemo';
import type { ModeEffet, QualiteEffet } from '../../domain/effetsCartes';
import { ContexteSurcharge, type SurchargeEffets } from '../../effects/surcharge';
import { statistiquesNuanceurs } from '../../effects/webgl/arbitre';
import { statistiquesHorloge } from '../../effects/socle/horloge';
import type { HorlogeEssai } from '../../effects/socle/useOrbite';
import { useCompteurImages } from '../../hooks/useCompteurImages';
import styles from './Essai.module.css';
import formulaire from './Formulaire.module.css';

const NOMBRES = [9, 18, 36, 50] as const;
const MODES: readonly ModeEffet[] = ['anime', 'interactif', 'statique'];
const HORLOGES: readonly HorlogeEssai[] = ['js', 'css', 'aucune'];

/**
 * Compteur d'images par seconde. Composant à part : son affichage se met à jour toutes les 500 ms sans
 * redessiner la grille de cartes (ce qui fausserait la mesure).
 */
function CompteurEssai({ cle }: { cle: string }) {
  const t = TEXTES.admin.essai;
  const mesure = useCompteurImages(true, cle);
  const horlogeStats = statistiquesHorloge();
  const shaders = statistiquesNuanceurs();
  return (
    <div className={styles.compteur} role="status" aria-live="off">
      <strong className={styles.fps}>{mesure ? mesure.fps : '…'}</strong> {t.imagesParSeconde}
      <span>
        {mesure && remplir(t.detail, { p95: String(mesure.p95Ms), max: String(mesure.maxMs) })}
      </span>
      <span>
        {remplir(t.animees, {
          cartes: String(horlogeStats.cartes),
          shaders: String(shaders.animes),
          demandes: String(shaders.demandes),
        })}
      </span>
    </div>
  );
}

/** Banc d'essai de la fluidité des effets. */
export function SectionEssaiEffets() {
  const t = TEXTES.admin.essai;
  const id = useId();
  const [nombre, setNombre] = useState<number>(18);
  const [qualite, setQualite] = useState<QualiteEffet | ''>('');
  const [horloge, setHorloge] = useState<HorlogeEssai>('js');
  const [webgl, setWebgl] = useState<number | ''>('');
  const [mode, setMode] = useState<ModeEffet>('anime');

  const cartes = useMemo(
    () =>
      Array.from({ length: nombre }, (_, i) => {
        const regle = EFFETS_PAR_DEFAUT[i % EFFETS_PAR_DEFAUT.length]!;
        return {
          regle,
          carte: { ...carteDemo(regle.rarete, regle.variante, ''), id: `essai-${i}` },
        };
      }),
    [nombre],
  );
  const surcharge: SurchargeEffets = {
    ...(qualite ? { qualite } : {}),
    horloge,
    ...(webgl === '' ? {} : { webglMax: webgl }),
  };
  const cle = `${nombre}|${qualite}|${horloge}|${webgl}|${mode}`;

  return (
    <section aria-labelledby={`${id}-titre`} className={styles.section}>
      <h2 id={`${id}-titre`} className={styles.titre}>
        {t.titre}
      </h2>
      <p className={styles.aide}>{t.intro}</p>

      <CompteurEssai cle={cle} />

      <div className={styles.reglages}>
        <div className={formulaire.champ}>
          <label htmlFor={`${id}-n`}>{t.nombre}</label>
          <select id={`${id}-n`} value={nombre} onChange={(e) => setNombre(Number(e.target.value))}>
            {NOMBRES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className={formulaire.champ}>
          <label htmlFor={`${id}-q`}>{t.qualite}</label>
          <select
            id={`${id}-q`}
            value={qualite}
            onChange={(e) => setQualite(e.target.value as QualiteEffet | '')}
          >
            <option value="">{t.qualiteJoueur}</option>
            <option value="haute">{t.qualiteHaute}</option>
            <option value="eco">{t.qualiteEco}</option>
          </select>
        </div>
        <div className={formulaire.champ}>
          <label htmlFor={`${id}-h`}>{t.horloge}</label>
          <select
            id={`${id}-h`}
            value={horloge}
            onChange={(e) => setHorloge(e.target.value as HorlogeEssai)}
          >
            {HORLOGES.map((h) => (
              <option key={h} value={h}>
                {t.horloges[h]}
              </option>
            ))}
          </select>
        </div>
        <div className={formulaire.champ}>
          <label htmlFor={`${id}-w`}>{t.webgl}</label>
          <select
            id={`${id}-w`}
            value={webgl}
            onChange={(e) => setWebgl(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">{t.webglQualite}</option>
            {[0, 1, 2, 3, 4, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className={formulaire.champ}>
          <label htmlFor={`${id}-m`}>{t.mode}</label>
          <select
            id={`${id}-m`}
            value={mode}
            onChange={(e) => setMode(e.target.value as ModeEffet)}
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {TEXTES.admin.effets.modes[m]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ContexteSurcharge.Provider value={surcharge}>
        <ul className={styles.grille} aria-label={t.labelGrille}>
          {cartes.map(({ regle, carte }) => (
            <li key={carte.id}>
              <Carte
                carte={carte}
                decorative
                modeEffet={mode}
                effet={{ cle: regle.cle, intensite: 100, origine: 'automatique' }}
              />
            </li>
          ))}
        </ul>
      </ContexteSurcharge.Provider>
    </section>
  );
}
