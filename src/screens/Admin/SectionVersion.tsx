/**
 * Section « Version » de l'espace admin : version en ligne et version minimum requise.
 *
 * Rôle : afficher la version de l'appli publiée et régler la « version minimum requise » (les joueurs
 * dont l'appli est plus ancienne verront l'écran « Mise à jour obligatoire »). Si la version minimum
 * saisie est plus récente que la version en ligne, tout le monde serait bloqué : un avertissement et
 * une confirmation sont alors demandés.
 * Expose : le composant `SectionVersion`.
 * Dépend de : react, config/version, content/*, domain/version, hooks/useAdministrationService,
 * hooks/useChargement, EtatSection, FormulaireVersion.
 */
import { useCallback } from 'react';
import { useAdministrationService } from '../../hooks/useAdministrationService';
import { useChargement } from '../../hooks/useChargement';
import { EtatSection } from './EtatSection';
import { FormulaireVersion } from './FormulaireVersion';

/** Version de l'appli et version minimum requise. */
export function SectionVersion() {
  const service = useAdministrationService();
  const lire = useCallback(() => service.lireReglages(), [service]);
  const { etat, recharger } = useChargement(lire);

  return (
    <EtatSection etat={etat} onReessayer={recharger}>
      {(reglages) => (
        <FormulaireVersion
          versionMin={reglages.versionMin}
          enregistrer={(versionMin) => service.enregistrerReglages({ versionMin })}
        />
      )}
    </EtatSection>
  );
}
