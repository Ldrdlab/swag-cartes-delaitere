/**
 * Tests de la conversion cartes de la base ↔ cartes de l'appli.
 *
 * Rôle : vérifier la lecture d'une ligne, les adresses d'images signées et les champs à enregistrer.
 * Dépend de : vitest, domain/cartesBase.
 */
import { describe, expect, it } from 'vitest';
import { champsDepuisInfos, cheminsImages, ligneVersCarte, type LigneCarte } from './cartesBase';

const ligne: LigneCarte = {
  id: 'abc',
  name: 'Dragon',
  rarity: 'mythique',
  variant: 'feu',
  effect_override: '',
  effect_params: {},
  image_path: 'abc.webp',
  thumb_path: 'abc-mini.webp',
  active: true,
};

describe('ligneVersCarte', () => {
  it('construit la carte avec ses adresses signées', () => {
    const adresses = new Map([
      ['abc.webp', 'https://x/abc?token=1'],
      ['abc-mini.webp', 'https://x/abc-mini?token=2'],
    ]);
    expect(ligneVersCarte(ligne, adresses)).toEqual({
      id: 'abc',
      name: 'Dragon',
      rarity: 'mythique',
      variant: 'feu',
      effect: '',
      active: true,
      imageUrl: 'https://x/abc?token=1',
      thumbUrl: 'https://x/abc-mini?token=2',
    });
  });

  it('omet la variante, les adresses et la miniature quand ils manquent', () => {
    const carte = ligneVersCarte(
      { ...ligne, variant: null, thumb_path: null, active: false },
      new Map(),
    );
    expect(carte.variant).toBeUndefined();
    expect(carte.imageUrl).toBeUndefined();
    expect(carte.thumbUrl).toBeUndefined();
    expect(carte.active).toBe(false);
  });

  it('lit l’effet imposé et ses réglages (vide = automatique, aucun réglage)', () => {
    const automatique = ligneVersCarte(ligne, new Map());
    expect(automatique.effect).toBe('');
    expect(automatique.effectParams).toBeUndefined();
    const forcee = ligneVersCarte(
      {
        ...ligne,
        effect_override: 'feu',
        effect_params: { intensity: 60, zone: 'carte', settings: { vitesse: 2 } },
      },
      new Map(),
    );
    expect(forcee.effect).toBe('feu');
    expect(forcee.effectParams).toEqual({
      intensite: 60,
      zone: 'carte',
      reglages: { vitesse: 2 },
    });
  });
});

describe('cheminsImages', () => {
  it('liste chaque chemin une seule fois et ignore les miniatures absentes', () => {
    const chemins = cheminsImages([
      ligne,
      { ...ligne, id: 'def', image_path: 'abc.webp', thumb_path: null },
    ]);
    expect(chemins).toEqual(['abc.webp', 'abc-mini.webp']);
  });
});

describe('champsDepuisInfos', () => {
  it('met la variante à null quand elle est absente', () => {
    expect(champsDepuisInfos({ nom: 'Pomme', rarete: 'commune' })).toEqual({
      name: 'Pomme',
      rarity: 'commune',
      variant: null,
    });
  });

  it('transmet l’effet imposé et ses réglages (en JSON de la base)', () => {
    const champs = champsDepuisInfos({
      nom: 'Dragon',
      rarete: 'mythique',
      variante: 'feu',
      effet: 'bronze',
      parametres: { intensite: 40, zone: 'illustration', reglages: { densite: 1.5 } },
    });
    expect(champs.effect_override).toBe('bronze');
    expect(champs.effect_params).toEqual({
      intensity: 40,
      zone: 'illustration',
      settings: { densite: 1.5 },
    });
  });

  it('« revenir à l’automatique » efface l’effet et les réglages', () => {
    const champs = champsDepuisInfos({ nom: 'A', rarete: 'rare', effet: '', parametres: {} });
    expect(champs.effect_override).toBe('');
    expect(champs.effect_params).toEqual({});
  });

  it('transmet la variante, l’effet et l’activation quand ils sont fournis', () => {
    expect(
      champsDepuisInfos({
        nom: 'Dragon',
        rarete: 'mythique',
        variante: 'feu',
        effet: '',
        active: false,
      }),
    ).toEqual({
      name: 'Dragon',
      rarity: 'mythique',
      variant: 'feu',
      effect_override: '',
      active: false,
    });
  });
});
