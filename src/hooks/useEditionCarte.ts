/**
 * État de la vue détaillée d'une carte : consulter, modifier, supprimer (avec confirmation).
 *
 * Rôle : gérer le mode courant, le brouillon des infos pendant la modification, la validation, les
 * erreurs et les appels d'écriture. Les composants ne font qu'afficher cet état.
 * Expose : ModeCarte, useEditionCarte().
 * Dépend de : react, config/cartes, domain/cartes, domain/types (type), hooks/useCollection (type),
 * services/CollectionService.
 */
import { useState } from 'react';
import { NOM_CARTE_MAX, VARIANTES_PAR_RARETE } from '../config/cartes';
import {
  fusionnerInfos,
  normaliserInfos,
  validerInfos,
  type ErreursInfos,
  type InfosCarte,
} from '../domain/cartes';
import type { Card } from '../domain/types';
import { ErreurCollection, type CodeErreurCollection } from '../services/CollectionService';
import type { ActionsAdmin } from './useCollection';

/** Ce que la vue détaillée montre : la carte seule, le formulaire de modification, ou la confirmation. */
export type ModeCarte = 'vue' | 'edition' | 'suppression';

/** Infos actuelles d'une carte, sous la forme du formulaire. */
function infosDe(carte: Card): InfosCarte {
  return { nom: carte.name, rarete: carte.rarity, variante: carte.variant };
}

/**
 * Gère la modification et la suppression d'une carte.
 *
 * @param carte - Carte affichée.
 * @param admin - Actions d'écriture (`null` : lecture seule).
 * @param onSupprimee - Appelé une fois la carte supprimée (pour fermer la vue).
 */
export function useEditionCarte(carte: Card, admin: ActionsAdmin | null, onSupprimee: () => void) {
  const [mode, setMode] = useState<ModeCarte>('vue');
  const [infos, setInfos] = useState<InfosCarte>(() => infosDe(carte));
  const [erreurs, setErreurs] = useState<ErreursInfos>({});
  const [erreurServeur, setErreurServeur] = useState<CodeErreurCollection | null>(null);
  const [enCours, setEnCours] = useState(false);

  /** Revient à la simple consultation. */
  const revenir = () => {
    setMode('vue');
    setErreurs({});
    setErreurServeur(null);
  };

  /** Lance une écriture : gère l'indicateur « en cours » et l'erreur éventuelle. */
  const executer = async (operation: (actions: ActionsAdmin) => Promise<void>) => {
    if (!admin) return;
    setEnCours(true);
    setErreurServeur(null);
    try {
      await operation(admin);
    } catch (erreur) {
      setErreurServeur(erreur instanceof ErreurCollection ? erreur.code : 'inconnue');
    } finally {
      setEnCours(false);
    }
  };

  return {
    mode,
    infos,
    erreurs,
    erreurServeur,
    enCours,
    commencerEdition: () => {
      setInfos(infosDe(carte));
      setMode('edition');
    },
    changer: (changement: Partial<InfosCarte>) => {
      setInfos((actuelles) => fusionnerInfos(actuelles, changement, VARIANTES_PAR_RARETE));
      setErreurs({});
    },
    sauvegarder: () => {
      const problemes = validerInfos(infos, VARIANTES_PAR_RARETE, NOM_CARTE_MAX);
      if (Object.keys(problemes).length > 0) {
        setErreurs(problemes);
        return Promise.resolve();
      }
      return executer(async (actions) => {
        await actions.modifier(carte.id, normaliserInfos(infos, VARIANTES_PAR_RARETE));
        revenir();
      });
    },
    demanderSuppression: () => setMode('suppression'),
    confirmerSuppression: () =>
      executer(async (actions) => {
        await actions.supprimer(carte.id);
        onSupprimee();
      }),
    annuler: revenir,
  };
}
