/**
 * Section « Effets » de l'espace admin : effet visuel par défaut de chaque rareté.
 *
 * Rôle : lire les 9 règles « rareté (+ variante) → effet » dans la base (administrateur seulement) et
 * afficher l'éditeur. Le choix de l'effet d'UNE carte se fait dans sa fiche (onglet Cartes).
 * Expose : le composant `SectionEffets`.
 * Dépend de : react, hooks/useAdministrationService, hooks/useChargement, hooks/useReglesEffets, EtatSection,
 * EditeurEffets.
 */
import { useCallback } from 'react';
import { useAdministrationService } from '../../hooks/useAdministrationService';
import { useChargement } from '../../hooks/useChargement';
import { useReglesEffets } from '../../hooks/useReglesEffets';
import { EditeurEffets } from './EditeurEffets';
import { EtatSection } from './EtatSection';

/** Effets par défaut des raretés. */
export function SectionEffets() {
  const service = useAdministrationService();
  const lire = useCallback(() => service.lireEffetsRaretes(), [service]);
  const { etat, recharger } = useChargement(lire);
  const { rafraichir } = useReglesEffets();

  return (
    <EtatSection etat={etat} onReessayer={recharger}>
      {(regles) => (
        <EditeurEffets
          regles={regles}
          enregistrer={async (regle) => {
            const retenue = await service.enregistrerEffetRarete(regle);
            // Les cartes affichées partout reprennent aussitôt le nouvel effet.
            await rafraichir();
            return retenue;
          }}
        />
      )}
    </EtatSection>
  );
}
