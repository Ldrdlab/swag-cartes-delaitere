/**
 * Tests de la machine à états de la navigation.
 *
 * Rôle : vérifier le parcours d'ouverture, les onglets, les retours, l'échec d'une ouverture et le rejet
 * des transitions interdites.
 * Dépend de : vitest, app/flowMachine.
 */
import { describe, expect, it } from 'vitest';
import type { CarteTiree } from '../domain/types';
import {
  estOnglet,
  INITIAL_FLOW_STATE,
  ONGLETS,
  transition,
  type FlowEvent,
  type FlowState,
} from './flowMachine';

const cartesDeTest: CarteTiree[] = [
  { id: 'c1', name: 'Carte 1', rarity: 'commune', nouvelle: true, quantite: 1 },
];

/** Applique une suite d'événements à partir de l'état initial. */
function jouer(...evenements: FlowEvent[]): FlowState {
  return evenements.reduce(transition, INITIAL_FLOW_STATE);
}

/** Les événements qui mènent de l'accueil à la confirmation du 3e booster. */
const jusqueConfirmation: FlowEvent[] = [
  { type: 'START' },
  { type: 'BOOSTER_CHOSEN', boosterIndex: 2 },
];

describe('parcours d’ouverture', () => {
  it('suit le parcours nominal de l’accueil à la révélation', () => {
    const etat = jouer(
      ...jusqueConfirmation,
      { type: 'OPEN_CONFIRMED' },
      { type: 'OPENING_DONE', cards: cartesDeTest },
    );
    expect(etat.screen).toBe('CARD_REVEAL');
    expect(etat.selectedBoosterIndex).toBe(2);
    expect(etat.drawnCards).toEqual(cartesDeTest);
  });

  it('démarre depuis l’accueil et permet de quitter le choix du booster', () => {
    expect(jouer({ type: 'START' }).screen).toBe('BOOSTER_SELECT');
    expect(jouer({ type: 'START' }, { type: 'LEAVE_SELECT' }).screen).toBe('HOME');
  });

  it('revient au choix du booster en conservant la position choisie (BACK)', () => {
    const etat = jouer(
      { type: 'START' },
      { type: 'BOOSTER_CHOSEN', boosterIndex: 1 },
      { type: 'BACK' },
    );
    expect(etat.screen).toBe('BOOSTER_SELECT');
    expect(etat.selectedBoosterIndex).toBe(1);
  });

  it('« Ouvrir un autre booster » ramène au choix et efface les cartes', () => {
    const etat = jouer(
      ...jusqueConfirmation,
      { type: 'OPEN_CONFIRMED' },
      { type: 'OPENING_DONE', cards: cartesDeTest },
      { type: 'OPEN_ANOTHER' },
    );
    expect(etat.screen).toBe('BOOSTER_SELECT');
    expect(etat.drawnCards).toEqual([]);
  });

  it('« Accueil » ramène à l’accueil depuis la révélation', () => {
    const etat = jouer(
      ...jusqueConfirmation,
      { type: 'OPEN_CONFIRMED' },
      { type: 'OPENING_DONE', cards: cartesDeTest },
      { type: 'GO_HOME' },
    );
    expect(etat.screen).toBe('HOME');
    expect(etat.drawnCards).toEqual([]);
  });
});

describe('échec d’une ouverture', () => {
  it('revient à la confirmation avec la raison, puis l’efface au nouvel essai', () => {
    const echec = jouer(
      ...jusqueConfirmation,
      { type: 'OPEN_CONFIRMED' },
      { type: 'OPENING_FAILED', code: 'limite_atteinte' },
    );
    expect(echec.screen).toBe('BOOSTER_CONFIRM');
    expect(echec.erreurOuverture).toBe('limite_atteinte');
    expect(echec.drawnCards).toEqual([]);
    expect(transition(echec, { type: 'OPEN_CONFIRMED' }).erreurOuverture).toBeNull();
    expect(transition(echec, { type: 'BACK' }).erreurOuverture).toBeNull();
  });
});

describe('onglets', () => {
  it('passe d’un onglet à l’autre depuis n’importe quel onglet', () => {
    for (const depart of ONGLETS) {
      const etat = { ...INITIAL_FLOW_STATE, screen: depart };
      for (const arrivee of ONGLETS) {
        expect(transition(etat, { type: 'GO_TAB', tab: arrivee }).screen).toBe(arrivee);
      }
    }
  });

  it('ignore un changement d’onglet pendant le parcours d’ouverture ou le profil', () => {
    for (const screen of [
      'PROFILE',
      'BOOSTER_SELECT',
      'BOOSTER_CONFIRM',
      'BOOSTER_OPENING',
      'CARD_REVEAL',
    ] as const) {
      const etat = { ...INITIAL_FLOW_STATE, screen };
      expect(transition(etat, { type: 'GO_TAB', tab: 'COLLECTION' })).toBe(etat);
    }
  });

  it('reconnaît les écrans à onglets', () => {
    expect(ONGLETS.every((onglet) => estOnglet(onglet))).toBe(true);
    expect(estOnglet('BOOSTER_SELECT')).toBe(false);
    expect(estOnglet('PROFILE')).toBe(false);
  });
});

describe('profil', () => {
  it('s’ouvre depuis l’accueil et y revient', () => {
    const ouvert = jouer({ type: 'OPEN_PROFILE' });
    expect(ouvert.screen).toBe('PROFILE');
    expect(transition(ouvert, { type: 'PROFILE_DONE' }).screen).toBe('HOME');
  });

  it('ne s’ouvre que depuis l’accueil', () => {
    const enCollection = jouer({ type: 'GO_TAB', tab: 'COLLECTION' });
    expect(transition(enCollection, { type: 'OPEN_PROFILE' })).toBe(enCollection);
  });
});

describe('transitions interdites', () => {
  it('ignore un événement interdit depuis l’écran courant (même référence d’état)', () => {
    const interdits: FlowEvent[] = [
      { type: 'PROFILE_DONE' },
      { type: 'LEAVE_SELECT' },
      { type: 'BOOSTER_CHOSEN', boosterIndex: 1 },
      { type: 'BACK' },
      { type: 'OPEN_CONFIRMED' },
      { type: 'OPENING_DONE', cards: cartesDeTest },
      { type: 'OPENING_FAILED', code: 'reseau' },
      { type: 'OPEN_ANOTHER' },
      { type: 'GO_HOME' },
      { type: 'GO_TAB', tab: 'HOME' },
    ];
    for (const evenement of interdits) {
      expect(transition(INITIAL_FLOW_STATE, evenement)).toBe(INITIAL_FLOW_STATE);
    }
  });

  it('ne modifie jamais l’état d’origine', () => {
    const copie = structuredClone(INITIAL_FLOW_STATE);
    transition(INITIAL_FLOW_STATE, { type: 'START' });
    expect(INITIAL_FLOW_STATE).toEqual(copie);
  });
});
