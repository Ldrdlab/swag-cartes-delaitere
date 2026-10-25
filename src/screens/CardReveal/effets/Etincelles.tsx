/**
 * Étincelles dorées qui montent pendant l'attente d'une carte légendaire.
 *
 * Rôle : 12 petits points dorés qui montent d'environ 130 px en s'effaçant, avec des départs décalés
 * de 0,2 s, répétés tant que la carte tremble. Positions calculées par domain/effets (aucun hasard).
 * Décoratif : ignoré des lecteurs d'écran et des touchers.
 * Expose : le composant `Etincelles`.
 * Dépend de : react, domain/effets, config/revelation, Etincelles.module.css.
 */
import { useMemo, type CSSProperties } from 'react';
import { GEOMETRIE_ETINCELLES, NOMBRE_ETINCELLES } from '../../../config/revelation';
import { genererEtincelles } from '../../../domain/effets';
import styles from './Etincelles.module.css';

/** Étincelles dorées (à poser dans un parent en `position: relative`). */
export function Etincelles() {
  const etincelles = useMemo(() => genererEtincelles(NOMBRE_ETINCELLES, GEOMETRIE_ETINCELLES), []);
  return (
    <div className={styles.zone} aria-hidden="true">
      {etincelles.map((etincelle) => {
        const variables = {
          left: `${etincelle.gauchePourcent}%`,
          bottom: `${etincelle.departBasPourcent}%`,
          width: etincelle.taillePx,
          height: etincelle.taillePx,
          animationDelay: `${etincelle.delaiS}s`,
          animationDuration: `${etincelle.dureeS}s`,
          '--monte': `${etincelle.montePx}px`,
        } as CSSProperties;
        return <span key={etincelle.id} className={styles.etincelle} style={variables} />;
      })}
    </div>
  );
}
