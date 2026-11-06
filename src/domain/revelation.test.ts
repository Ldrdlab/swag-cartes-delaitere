/**
 * Tests de la machine à états de la révélation.
 *
 * Dépend de : vitest, domain/revelation, domain/types.
 */
import { describe, expect, it } from 'vitest';
import {
  appliquerForcage,
  demarrerRevelation,
  estDerniereCarte,
  lireForcage,
  reduireRevelation,
  type EtapeRevelation,
  type EtatRevelation,
  type EvenementRevelation,
} from './revelation';
import type { Card } from './types';

/** Applique une suite d'événements à partir d'un état de départ. */
function jouer(depart: EtatRevelation, ...evenements: EvenementRevelation[]): EtatRevelation {
  return evenements.reduce(reduireRevelation, depart);
}

const departTroisCartes = demarrerRevelation(3);

describe('demarrerRevelation', () => {
  it('démarre sur le dos de la première carte', () => {
    expect(departTroisCartes).toEqual({ etape: 'DOS', indiceCarte: 0, total: 3 });
  });

  it('va directement au bilan s’il n’y a aucune carte', () => {
    expect(demarrerRevelation(0).etape).toBe('BILAN');
  });
});

describe('séquence sans tease', () => {
  it('DOS → RETOURNE → FACE', () => {
    const etat = jouer(
      departTroisCartes,
      { type: 'TOUCHER', tease: false },
      { type: 'RETOURNEMENT_TERMINE' },
    );
    expect(etat.etape).toBe('FACE');
  });

  it('passe directement par RETOURNE, sans TREMBLE', () => {
    expect(jouer(departTroisCartes, { type: 'TOUCHER', tease: false }).etape).toBe('RETOURNE');
  });
});

describe('séquence avec tease', () => {
  it('DOS → TREMBLE → RETOURNE → FACE', () => {
    let etat = jouer(departTroisCartes, { type: 'TOUCHER', tease: true });
    expect(etat.etape).toBe('TREMBLE');
    etat = jouer(etat, { type: 'TREMBLE_TERMINE' });
    expect(etat.etape).toBe('RETOURNE');
    etat = jouer(etat, { type: 'RETOURNEMENT_TERMINE' });
    expect(etat.etape).toBe('FACE');
  });
});

describe('toucher pendant l’animation', () => {
  it('est ignoré pendant TREMBLE, RETOURNE et FACE (même état renvoyé)', () => {
    const tremble = jouer(departTroisCartes, { type: 'TOUCHER', tease: true });
    const retourne = jouer(departTroisCartes, { type: 'TOUCHER', tease: false });
    const face = jouer(retourne, { type: 'RETOURNEMENT_TERMINE' });
    for (const etat of [tremble, retourne, face]) {
      expect(reduireRevelation(etat, { type: 'TOUCHER', tease: true })).toBe(etat);
    }
  });
});

describe('carte suivante', () => {
  const face = jouer(
    departTroisCartes,
    { type: 'TOUCHER', tease: false },
    { type: 'RETOURNEMENT_TERMINE' },
  );

  it('« Suivant » remet une carte face cachée avec l’indice suivant', () => {
    expect(jouer(face, { type: 'SUIVANT' })).toEqual({ etape: 'DOS', indiceCarte: 1, total: 3 });
  });

  it('« Suivant » après la dernière carte mène au bilan', () => {
    const derniere: EtatRevelation = { etape: 'FACE', indiceCarte: 2, total: 3 };
    expect(estDerniereCarte(derniere)).toBe(true);
    expect(jouer(derniere, { type: 'SUIVANT' }).etape).toBe('BILAN');
  });

  it('« Suivant » est ignoré tant que la carte n’est pas retournée', () => {
    expect(reduireRevelation(departTroisCartes, { type: 'SUIVANT' })).toBe(departTroisCartes);
  });

  it('parcourt tout le booster jusqu’au bilan', () => {
    let etat = departTroisCartes;
    for (let i = 0; i < 3; i += 1) {
      etat = jouer(
        etat,
        { type: 'TOUCHER', tease: false },
        { type: 'RETOURNEMENT_TERMINE' },
        { type: 'SUIVANT' },
      );
    }
    expect(etat.etape).toBe('BILAN');
  });
});

describe('« Passer »', () => {
  const departs: [EtapeRevelation, EtatRevelation][] = [
    ['DOS', { etape: 'DOS', indiceCarte: 1, total: 3 }],
    ['TREMBLE', { etape: 'TREMBLE', indiceCarte: 1, total: 3 }],
    ['RETOURNE', { etape: 'RETOURNE', indiceCarte: 1, total: 3 }],
    ['FACE', { etape: 'FACE', indiceCarte: 1, total: 3 }],
  ];

  it.each(departs)('mène au bilan depuis %s', (_nom, etat) => {
    expect(reduireRevelation(etat, { type: 'PASSER' }).etape).toBe('BILAN');
  });

  it('ne change rien quand on est déjà au bilan', () => {
    const bilan: EtatRevelation = { etape: 'BILAN', indiceCarte: 2, total: 3 };
    expect(reduireRevelation(bilan, { type: 'PASSER' })).toBe(bilan);
  });
});

describe('événements hors séquence', () => {
  it('ignore les fins d’animation qui n’ont pas lieu d’être', () => {
    expect(reduireRevelation(departTroisCartes, { type: 'TREMBLE_TERMINE' })).toBe(
      departTroisCartes,
    );
    expect(reduireRevelation(departTroisCartes, { type: 'RETOURNEMENT_TERMINE' })).toBe(
      departTroisCartes,
    );
  });
});

describe('mode développeur ?forcer=', () => {
  const commune: Card = { id: 'a', name: 'A', rarity: 'commune' };
  const legendaire: Card = { id: 'l', name: 'L', rarity: 'legendaire' };
  const catalogue = [commune, legendaire];

  it('lit la rareté demandée dans l’adresse', () => {
    expect(lireForcage('?forcer=legendaire')).toBe('legendaire');
    expect(lireForcage('?autre=1&forcer=super-rare')).toBe('super_rare');
    expect(lireForcage('?forcer=Légendaire')).toBe('legendaire');
  });

  it('renvoie null sans paramètre ou avec une rareté inconnue', () => {
    expect(lireForcage('')).toBeNull();
    expect(lireForcage('?forcer=diamant')).toBeNull();
  });

  it('remplace la première carte par une carte de la rareté demandée', () => {
    const resultat = appliquerForcage([commune, commune], 'legendaire', catalogue);
    expect(resultat[0]?.rarity).toBe('legendaire');
    expect(resultat).toHaveLength(2);
  });

  it('ne change rien si la première carte a déjà cette rareté', () => {
    const tirage = [legendaire];
    expect(appliquerForcage(tirage, 'legendaire', catalogue)).toBe(tirage);
  });

  it('ne change rien si le catalogue n’a aucune carte de cette rareté', () => {
    const tirage = [commune];
    expect(appliquerForcage(tirage, 'super_rare', catalogue)).toBe(tirage);
  });
});
