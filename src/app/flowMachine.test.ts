/**
 * Tests de la machine à états du parcours.
 *
 * Rôle : vérifier le parcours nominal, les retours et le rejet des transitions interdites.
 * Dépend de : vitest, app/flowMachine.
 */
import { describe, expect, it } from 'vitest';
import type { Card } from '../domain/types';
import { INITIAL_FLOW_STATE, transition, type FlowEvent, type FlowState } from './flowMachine';

const cartesDeTest: Card[] = [{ id: 'c1', name: 'Carte 1', rarity: 'commune' }];

/** Applique une suite d'événements à partir de l'état initial. */
function jouer(...evenements: FlowEvent[]): FlowState {
  return evenements.reduce(transition, INITIAL_FLOW_STATE);
}

describe('transition', () => {
  it('suit le parcours nominal de l’accueil à la révélation', () => {
    const etat = jouer(
      { type: 'START' },
      { type: 'PROFILE_DONE' },
      { type: 'BOOSTER_CHOSEN', boosterIndex: 2 },
      { type: 'OPEN_CONFIRMED' },
      { type: 'OPENING_DONE', cards: cartesDeTest },
    );
    expect(etat.screen).toBe('CARD_REVEAL');
    expect(etat.selectedBoosterIndex).toBe(2);
    expect(etat.drawnCards).toEqual(cartesDeTest);
  });

  it('revient au choix du booster en conservant la position choisie (BACK)', () => {
    const etat = jouer(
      { type: 'START' },
      { type: 'PROFILE_DONE' },
      { type: 'BOOSTER_CHOSEN', boosterIndex: 1 },
      { type: 'BACK' },
    );
    expect(etat.screen).toBe('BOOSTER_SELECT');
    expect(etat.selectedBoosterIndex).toBe(1);
  });

  it('« Ouvrir un autre booster » ramène au choix et efface les cartes', () => {
    const etat = jouer(
      { type: 'START' },
      { type: 'PROFILE_DONE' },
      { type: 'BOOSTER_CHOSEN', boosterIndex: 0 },
      { type: 'OPEN_CONFIRMED' },
      { type: 'OPENING_DONE', cards: cartesDeTest },
      { type: 'OPEN_ANOTHER' },
    );
    expect(etat.screen).toBe('BOOSTER_SELECT');
    expect(etat.drawnCards).toEqual([]);
  });

  it('« Accueil » ramène à l’écran de bienvenue depuis la révélation', () => {
    const etat = jouer(
      { type: 'START' },
      { type: 'PROFILE_DONE' },
      { type: 'BOOSTER_CHOSEN', boosterIndex: 0 },
      { type: 'OPEN_CONFIRMED' },
      { type: 'OPENING_DONE', cards: cartesDeTest },
      { type: 'GO_HOME' },
    );
    expect(etat.screen).toBe('WELCOME');
    expect(etat.drawnCards).toEqual([]);
  });

  it('ouvre « Mes cartes » depuis l’accueil et en revient', () => {
    const ouvert = jouer({ type: 'OPEN_CARDS' });
    expect(ouvert.screen).toBe('MES_CARTES');
    expect(transition(ouvert, { type: 'CLOSE_CARDS' }).screen).toBe('WELCOME');
  });

  it('n’ouvre « Mes cartes » que depuis l’accueil', () => {
    const enProfil = jouer({ type: 'START' });
    expect(transition(enProfil, { type: 'OPEN_CARDS' })).toBe(enProfil);
    expect(transition(INITIAL_FLOW_STATE, { type: 'CLOSE_CARDS' })).toBe(INITIAL_FLOW_STATE);
  });

  it('ignore un événement interdit depuis l’écran courant (même référence d’état)', () => {
    const interdits: FlowEvent[] = [
      { type: 'PROFILE_DONE' },
      { type: 'BOOSTER_CHOSEN', boosterIndex: 1 },
      { type: 'BACK' },
      { type: 'OPEN_CONFIRMED' },
      { type: 'OPENING_DONE', cards: cartesDeTest },
      { type: 'OPEN_ANOTHER' },
      { type: 'GO_HOME' },
      { type: 'CLOSE_CARDS' },
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
