/**
 * Tests des conversions d'administration (profil, réglages, joueurs).
 *
 * Rôle : vérifier la lecture des lignes de la base, y compris les cas limites (rôle inconnu, rareté
 * absente des probabilités, nombres renvoyés en texte).
 * Dépend de : vitest, domain/administration.
 */
import { describe, expect, it } from 'vitest';
import {
  champsDepuisReglages,
  joueurDepuisLigne,
  profilDepuisLigne,
  reglagesDepuisLigne,
} from './administration';

describe('profilDepuisLigne', () => {
  const base = { id: 'u1', email: 'a@b.c', pseudo: 'Alice', avatar_id: 'avatar-01' };

  it('lit un profil admin', () => {
    expect(profilDepuisLigne({ ...base, role: 'admin' })).toEqual({
      id: 'u1',
      email: 'a@b.c',
      pseudo: 'Alice',
      avatarId: 'avatar-01',
      role: 'admin',
    });
  });

  it('traite tout rôle inconnu comme « joueur »', () => {
    expect(profilDepuisLigne({ ...base, role: 'superadmin' }).role).toBe('joueur');
    expect(profilDepuisLigne({ ...base, role: '' }).role).toBe('joueur');
  });
});

describe('réglages', () => {
  const ligne = {
    cards_per_booster: 5,
    boosters_per_day: 3,
    rarity_weights: {
      commune: 60,
      peu_commune: 25,
      rare: 10,
      super_rare: 3,
      legendaire: 1,
      mythique: 0.6,
      secrete: 0.4,
    },
    min_version: '0.1.0',
  };

  it('lit la ligne app_config et la réécrit à l’identique', () => {
    const reglages = reglagesDepuisLigne(ligne);
    expect(reglages.cartesParBooster).toBe(5);
    expect(reglages.versionMin).toBe('0.1.0');
    expect(reglages.probabilites.mythique).toBe(0.6);
    expect(champsDepuisReglages(reglages)).toEqual(ligne);
  });

  it('n’enregistre que les réglages fournis', () => {
    expect(champsDepuisReglages({ versionMin: '0.2.0' })).toEqual({ min_version: '0.2.0' });
    expect(champsDepuisReglages({ boostersParJour: 4 })).toEqual({ boosters_per_day: 4 });
    expect(champsDepuisReglages({})).toEqual({});
  });

  it('compte une rareté absente pour 0 %', () => {
    const reglages = reglagesDepuisLigne({ ...ligne, rarity_weights: { commune: 100 } });
    expect(reglages.probabilites.commune).toBe(100);
    expect(reglages.probabilites.secrete).toBe(0);
  });
});

describe('joueurDepuisLigne', () => {
  it('convertit les nombres renvoyés en texte et le rôle', () => {
    expect(
      joueurDepuisLigne({
        player_id: 'u1',
        email: null,
        pseudo: null,
        role: 'joueur',
        created_at: '2026-11-07T10:00:00Z',
        total_cards: '12',
        distinct_cards: 7,
      }),
    ).toEqual({
      id: 'u1',
      email: null,
      pseudo: null,
      role: 'joueur',
      creeLe: '2026-11-07T10:00:00Z',
      nombreCartes: 12,
      cartesDistinctes: 7,
    });
  });
});
