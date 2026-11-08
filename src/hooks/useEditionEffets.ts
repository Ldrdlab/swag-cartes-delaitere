/**
 * État de la page « Effets » de l'admin : la règle choisie, son brouillon et son enregistrement.
 *
 * Rôle : garder les 9 règles « rareté → effet » lues dans la base, la règle sélectionnée, les changements
 * pas encore enregistrés (affichés en direct sur l'aperçu), et enregistrer / annuler. Les composants ne
 * font qu'afficher cet état.
 * Expose : useEditionEffets().
 * Dépend de : react, domain/effetsCartes, services/erreurs.
 */
import { useState } from 'react';
import type { RegleEffet } from '../domain/effetsCartes';
import { ErreurService, type CodeErreur } from '../services/erreurs';

/** Deux règles désignent le même cas (même rareté et même variante). */
export const memeCas = (a: RegleEffet, b: RegleEffet): boolean =>
  a.rarete === b.rarete && a.variante === b.variante;

/** Vrai si deux règles ont le même effet et les mêmes réglages. */
export function memeRegle(a: RegleEffet, b: RegleEffet): boolean {
  return a.cle === b.cle && JSON.stringify(a.params) === JSON.stringify(b.params);
}

/**
 * @param initiales - Règles lues dans la base.
 * @param enregistrer - Enregistre une règle et renvoie ce que la base a retenu.
 */
export function useEditionEffets(
  initiales: readonly RegleEffet[],
  enregistrer: (regle: RegleEffet) => Promise<RegleEffet>,
) {
  const [enregistrees, setEnregistrees] = useState<readonly RegleEffet[]>(initiales);
  const [brouillons, setBrouillons] = useState<readonly RegleEffet[]>(initiales);
  const [choisie, setChoisie] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<CodeErreur | null>(null);
  const [confirmation, setConfirmation] = useState<RegleEffet | null>(null);

  const brouillon = brouillons[choisie];
  const reference = enregistrees[choisie];
  const modifie =
    brouillon !== undefined && reference !== undefined && !memeRegle(brouillon, reference);

  const remplacer = (liste: readonly RegleEffet[], rang: number, regle: RegleEffet) =>
    liste.map((r, i) => (i === rang ? regle : r));

  return {
    enregistrees,
    brouillons,
    choisie,
    brouillon,
    modifie,
    enCours,
    erreur,
    confirmation,
    /** Choisit une règle (les changements pas enregistrés des autres sont gardés). */
    choisir: (rang: number) => {
      setChoisie(rang);
      setErreur(null);
      setConfirmation(null);
    },
    /** Modifie la règle choisie (aperçu en direct). */
    changer: (changement: Partial<RegleEffet>) => {
      if (!brouillon) return;
      setBrouillons((liste) => remplacer(liste, choisie, { ...brouillon, ...changement }));
      setConfirmation(null);
    },
    annuler: () => {
      if (!reference) return;
      setBrouillons((liste) => remplacer(liste, choisie, reference));
      setErreur(null);
    },
    sauvegarder: async () => {
      if (!brouillon || enCours) return;
      setEnCours(true);
      setErreur(null);
      try {
        const retenue = await enregistrer(brouillon);
        setEnregistrees((liste) => remplacer(liste, choisie, retenue));
        setBrouillons((liste) => remplacer(liste, choisie, retenue));
        setConfirmation(retenue);
      } catch (e) {
        setErreur(e instanceof ErreurService ? e.code : 'inconnue');
      } finally {
        setEnCours(false);
      }
    },
  };
}
