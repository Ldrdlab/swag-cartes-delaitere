/**
 * Tests de la mémoire « nouvelle version disponible ».
 *
 * Rôle : vérifier l'état initial, la signalisation, le report, et les rappels aux observateurs.
 * Dépend de : vitest, app/miseAJour.
 */
import { describe, expect, it, vi } from 'vitest';
import { creerStoreMiseAJour } from './miseAJour';

describe('creerStoreMiseAJour', () => {
  it('démarre sans mise à jour', () => {
    expect(creerStoreMiseAJour().lire()).toEqual({ disponible: false, reportee: false });
  });

  it('signale une mise à jour et prévient les observateurs', () => {
    const store = creerStoreMiseAJour();
    const rappel = vi.fn();
    store.abonner(rappel);
    store.signalerDisponible();
    expect(store.lire()).toEqual({ disponible: true, reportee: false });
    expect(rappel).toHaveBeenCalledTimes(1);
  });

  it('garde le même état (même référence) et ne prévient pas quand rien ne change', () => {
    const store = creerStoreMiseAJour();
    store.signalerDisponible();
    const avant = store.lire();
    const rappel = vi.fn();
    store.abonner(rappel);
    store.signalerDisponible();
    expect(store.lire()).toBe(avant);
    expect(rappel).not.toHaveBeenCalled();
  });

  it('permet de reporter, puis remet le bandeau pour une version encore plus récente', () => {
    const store = creerStoreMiseAJour();
    store.signalerDisponible();
    store.reporter();
    expect(store.lire()).toEqual({ disponible: true, reportee: true });
    store.signalerDisponible();
    expect(store.lire()).toEqual({ disponible: true, reportee: false });
  });

  it('cesse de prévenir un observateur qui se désabonne', () => {
    const store = creerStoreMiseAJour();
    const rappel = vi.fn();
    const arreter = store.abonner(rappel);
    arreter();
    store.signalerDisponible();
    expect(rappel).not.toHaveBeenCalled();
  });
});
