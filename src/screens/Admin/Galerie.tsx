/**
 * Galerie des cartes : filtres, compteurs et grille.
 *
 * Rôle : afficher toutes les cartes dans une grille alignée (chaque carte dans un cadre 5:7),
 * avec une recherche par nom, un filtre par rareté, un filtre par effet (automatique, forcé, aucun) et
 * les compteurs (total et par rareté). Une carte dont l'effet n'est pas celui de sa rareté porte un badge.
 * Un clic sur une carte demande son ouverture en grand.
 * Expose : le composant `Galerie`.
 * Dépend de : react, components/Carte, config/cartes, config/raretes, content/*, domain/cartes,
 * domain/effetsCartes, domain/types, effects, MesCartes.module.css.
 */
import { useMemo, useState } from 'react';
import { Carte } from '../../components/Carte';
import { RATIO_CARTE, TOLERANCE_RATIO } from '../../config/cartes';
import { RARETES } from '../../config/raretes';
import { remplir } from '../../content/formatTexte';
import { TEXTES } from '../../content/textes';
import {
  compterParRarete,
  filtrerCartes,
  trierCartes,
  verifierRatio,
  type FiltreCartes,
} from '../../domain/cartes';
import { origineEffet, type OrigineEffet } from '../../domain/effetsCartes';
import { RARITIES, type Card, type Rarity } from '../../domain/types';
import { trouverEffet } from '../../effects';
import styles from './MesCartes.module.css';

interface GalerieProps {
  cartes: readonly Card[];
  /** Vrai si l'administration est déverrouillée (change le message « aucune carte »). */
  administrateur: boolean;
  onOuvrir: (carte: Card) => void;
}

/** Galerie avec filtres et compteurs. */
export function Galerie({ cartes, administrateur, onOuvrir }: GalerieProps) {
  const textes = TEXTES.mesCartes;
  const [filtre, setFiltre] = useState<FiltreCartes>({ rarete: 'toutes', recherche: '' });

  const comptes = useMemo(() => compterParRarete(cartes), [cartes]);
  const visibles = useMemo(() => trierCartes(filtrerCartes(cartes, filtre)), [cartes, filtre]);

  return (
    <section className={styles.galerie}>
      <ul className={styles.compteurs} aria-label={textes.labelCompteurs}>
        {RARITIES.map((rarete) => (
          <li
            key={rarete}
            className={
              comptes[rarete] === 0 ? `${styles.compteur} ${styles.vide}` : styles.compteur
            }
            style={{ borderColor: RARETES[rarete].couleurs.bordure }}
          >
            {RARETES[rarete].nom} <strong>{comptes[rarete]}</strong>
          </li>
        ))}
      </ul>

      <div className={styles.filtres}>
        <input
          type="search"
          className={styles.recherche}
          aria-label={textes.labelRecherche}
          placeholder={textes.placeholderRecherche}
          value={filtre.recherche}
          onChange={(event) => setFiltre({ ...filtre, recherche: event.target.value })}
        />
        <select
          className={styles.selecteur}
          aria-label={textes.labelFiltreRarete}
          value={filtre.rarete}
          onChange={(event) =>
            setFiltre({ ...filtre, rarete: event.target.value as Rarity | 'toutes' })
          }
        >
          <option value="toutes">{textes.toutesRaretes}</option>
          {RARITIES.map((rarete) => (
            <option key={rarete} value={rarete}>
              {RARETES[rarete].nom}
            </option>
          ))}
        </select>
        <select
          className={styles.selecteur}
          aria-label={textes.labelFiltreEffet}
          value={filtre.effet ?? 'tous'}
          onChange={(event) =>
            setFiltre({ ...filtre, effet: event.target.value as OrigineEffet | 'tous' })
          }
        >
          <option value="tous">{textes.tousEffets}</option>
          <option value="automatique">{textes.effetsAutomatique}</option>
          <option value="force">{textes.effetsForce}</option>
          <option value="aucun">{textes.effetsAucun}</option>
        </select>
      </div>

      {cartes.length === 0 && (
        <p className={styles.message}>
          {textes.vide} {administrateur && textes.videAdmin}
        </p>
      )}
      {cartes.length > 0 && visibles.length === 0 && (
        <p className={styles.message}>{textes.aucunResultat}</p>
      )}

      <ul className={styles.grille} aria-label={textes.labelGalerie}>
        {visibles.map((carte) => {
          const ratioAnormal =
            carte.width !== undefined &&
            carte.height !== undefined &&
            !verifierRatio(carte.width, carte.height, RATIO_CARTE, TOLERANCE_RATIO).conforme;
          return (
            <li key={carte.id}>
              <button type="button" className={styles.vignette} onClick={() => onOuvrir(carte)}>
                <Carte carte={carte} taille="miniature" decorative />
                <span className={styles.nomCarte}>{carte.name}</span>
                <span className={styles.rareteCarte}>{RARETES[carte.rarity].nom}</span>
                {origineEffet(carte.effect) === 'force' && (
                  <span className={styles.badgeEffet}>
                    {remplir(textes.badgeEffetForce, { nom: trouverEffet(carte.effect ?? '').nom })}
                  </span>
                )}
                {origineEffet(carte.effect) === 'aucun' && (
                  <span className={styles.badgeEffet}>{textes.badgeSansEffet}</span>
                )}
                {carte.active === false && (
                  <span className={styles.badgeRatio}>{textes.badgeInactive}</span>
                )}
                {ratioAnormal && <span className={styles.badgeRatio}>{textes.badgeRatio}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
