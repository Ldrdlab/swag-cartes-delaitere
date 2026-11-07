/**
 * Section « Boosters » de l'espace admin : cartes par booster, boosters par jour, probabilités.
 *
 * Rôle : charger les réglages et afficher le formulaire. Le formulaire vérifie que le total des
 * probabilités fait exactement 100 % (et la base le vérifie aussi).
 * Expose : le composant `SectionBoosters`.
 * Dépend de : react, hooks/useAdministrationService, hooks/useChargement, EtatSection, FormulaireBoosters.
 */
import { useCallback } from 'react';
import { useAdministrationService } from '../../hooks/useAdministrationService';
import { useChargement } from '../../hooks/useChargement';
import { EtatSection } from './EtatSection';
import { FormulaireBoosters } from './FormulaireBoosters';

/** Réglages des boosters. */
export function SectionBoosters() {
  const service = useAdministrationService();
  const lire = useCallback(() => service.lireReglages(), [service]);
  const { etat, recharger } = useChargement(lire);

  return (
    <EtatSection etat={etat} onReessayer={recharger}>
      {(reglages) => (
        <FormulaireBoosters
          reglages={reglages}
          enregistrer={(modifs) => service.enregistrerReglages(modifs)}
        />
      )}
    </EtatSection>
  );
}
