/**
 * Éditeur des effets par défaut des raretés (page « Effets » de l'admin).
 *
 * Rôle : choisir, pour chaque rareté (et variante), l'effet visuel automatique, son intensité et sa zone,
 * avec un aperçu en direct sur une carte fictive (aucune photo) : mode image fixe, animé ou interactif,
 * et « Effets réduits » pour vérifier le rendu des appareils modestes. Un changement n'est enregistré
 * (pour toutes les cartes en mode « Automatique ») qu'avec le bouton « Enregistrer ».
 * Expose : le composant `EditeurEffets`.
 * Dépend de : react, components/Button, components/Carte, config/*, content/*, data/carteDemo,
 * domain/effetsCartes, effects, hooks/useEditionEffets, EffetsTable, Effets.module.css, Formulaire.module.css.
 */
import { useId, useState } from 'react';
import { Button } from '../../components/Button';
import { Carte } from '../../components/Carte';
import { INTENSITE_EFFET } from '../../config/effets';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import { carteDemo } from '../../data/carteDemo';
import {
  ZONES_EFFET,
  type ModeEffet,
  type RegleEffet,
  type ZoneEffet,
} from '../../domain/effetsCartes';
import { listerEffets } from '../../effects';
import { useEditionEffets } from '../../hooks/useEditionEffets';
import { texteErreurCollection } from '../../content/messagesCartes';
import styles from './Effets.module.css';
import { EffetsTable, nomRegle } from './EffetsTable';
import formulaire from './Formulaire.module.css';

const MODES: readonly ModeEffet[] = ['statique', 'anime', 'interactif'];

interface Props {
  regles: readonly RegleEffet[];
  enregistrer: (regle: RegleEffet) => Promise<RegleEffet>;
}

export function EditeurEffets({ regles, enregistrer }: Props) {
  const t = TEXTES.admin.effets;
  const id = useId();
  const edition = useEditionEffets(regles, enregistrer);
  const [mode, setMode] = useState<ModeEffet>('interactif');
  const [reduits, setReduits] = useState(false);
  const { brouillon } = edition;
  if (!brouillon) return null;
  const { params } = brouillon;
  const intensite = params.intensite ?? INTENSITE_EFFET.defaut;

  return (
    <section aria-labelledby={`${id}-titre`} className={styles.section}>
      <h2 id={`${id}-titre`} className={styles.titre}>
        {t.titre}
      </h2>
      <p className={styles.aide}>{t.intro}</p>

      <div className={styles.banc}>
        <div className={styles.apercu} role="group" aria-label={t.labelApercu}>
          <Carte
            carte={carteDemo(brouillon.rarete, brouillon.variante, 'aucun')}
            taille="grande"
            decorative
            modeEffet={mode}
            effetsReduits={reduits}
            effet={{
              cle: brouillon.cle,
              intensite,
              zone: params.zone,
              reglages: params.reglages,
              origine: 'automatique',
            }}
          />
          <p className={styles.aide}>{t.aideApercu}</p>
        </div>

        <div className={formulaire.formulaire}>
          <p className={styles.regleChoisie}>{nomRegle(brouillon)}</p>
          <div className={formulaire.champ}>
            <label htmlFor={`${id}-effet`}>{t.effet}</label>
            <select
              id={`${id}-effet`}
              value={brouillon.cle}
              onChange={(e) => edition.changer({ cle: e.target.value })}
            >
              {listerEffets().map((effet) => (
                <option key={effet.cle} value={effet.cle}>
                  {effet.nom}
                </option>
              ))}
            </select>
          </div>
          <div className={formulaire.champ}>
            <label htmlFor={`${id}-zone`}>{t.zone}</label>
            <select
              id={`${id}-zone`}
              value={params.zone ?? ''}
              onChange={(e) =>
                edition.changer({
                  params: {
                    ...params,
                    zone: (e.target.value || undefined) as ZoneEffet | undefined,
                  },
                })
              }
            >
              <option value="">{t.zones.defaut}</option>
              {ZONES_EFFET.map((z) => (
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
              onChange={(e) =>
                edition.changer({ params: { ...params, intensite: Number(e.target.value) } })
              }
            />
          </div>
          <p className={formulaire.aide}>{t.aideEdition}</p>

          <div className={styles.boutons}>
            <Button
              disabled={!edition.modifie || edition.enCours}
              onClick={() => void edition.sauvegarder()}
            >
              {t.enregistrer}
            </Button>
            <Button
              variant="secondary"
              disabled={!edition.modifie || edition.enCours}
              onClick={edition.annuler}
            >
              {t.annuler}
            </Button>
          </div>
          {edition.erreur && (
            <p className={formulaire.erreur} role="alert">
              {texteErreurCollection(edition.erreur)}
            </p>
          )}
          {edition.confirmation && !edition.modifie && (
            <p className={styles.succes} role="status">
              {remplir(t.enregistre, { nom: nomRegle(edition.confirmation) })}
            </p>
          )}

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
      <EffetsTable
        brouillons={edition.brouillons}
        enregistrees={edition.enregistrees}
        choisie={edition.choisie}
        onChoisir={edition.choisir}
      />
    </section>
  );
}
