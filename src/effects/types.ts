/**
 * Types du registre d'effets de cartes.
 *
 * Rôle : décrire ce qu'est un « effet » de carte (un effet visuel posé par-dessus l'image) et ce que
 * reçoit son composant. Un effet est identifié par une CLÉ texte (ex. `holo`), enregistrée dans la
 * base pour chaque carte.
 * Expose : PropsEffet, DefinitionEffet.
 * Dépend de : react (type), domain/types (type).
 */
import type { ComponentType } from 'react';
import type { Card } from '../domain/types';

/** Ce que reçoit le composant d'un effet. */
export interface PropsEffet {
  /** La carte sur laquelle l'effet est posé. */
  carte: Card;
}

/** Un effet du registre. */
export interface DefinitionEffet {
  /** Nom affiché dans la liste déroulante de l'espace admin. */
  nom: string;
  /** Composant posé par-dessus l'image de la carte (voir components/Carte). */
  Composant: ComponentType<PropsEffet>;
}
