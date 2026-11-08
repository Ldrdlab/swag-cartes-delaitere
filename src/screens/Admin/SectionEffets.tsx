/**
 * Section « Effets » de l'espace admin : effet visuel par défaut de chaque rareté.
 *
 * Rôle : lire les 9 règles « rareté (+ variante) → effet » dans la base (administrateur seulement) et
 * afficher l'éditeur. Le choix de l'effet d'UNE carte se fait dans sa fiche (onglet Cartes).
 * Expose : le composant `SectionEffets`.
 * Dépend de : react, hooks/useAdministrationService, hooks/useChargement, EtatSection, EditeurEffets.
 */
import { useCallback } from 'react';
import { useAdministrationService } from '../../hooks/useAdministrationService';
import { useChargement } from '../../hooks/useChargement';
import { EditeurEffets } from './EditeurEffets';
import { EtatSection } from './EtatSection';

/** Effets par défaut des raretés. */
export function SectionEffets() {
  const service = useAdministrationService();
  const lire = useCallback(() => service.lireEffetsRaretes(), [service]);
  const { etat, recharger } = useChargement(lire);

  return (
    <EtatSection etat={etat} onReessayer={recharger}>
      {(regles) => (
        <EditeurEffets
          regles={regles}
          enregistrer={(regle) => service.enregistrerEffetRarete(regle)}
        />
      )}
    </EtatSection>
  );
}
