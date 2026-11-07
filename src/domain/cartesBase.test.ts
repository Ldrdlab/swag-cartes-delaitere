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
  effect: '',
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

  it('transmet la variante, l’effet et l’activation quand ils sont fournis', () => {
    expect(
      champsDepuisInfos({
        nom: 'Dragon',
        rarete: 'mythique',
        variante: 'feu',
        effet: '',
        active: false,
      }),
    ).toEqual({ name: 'Dragon', rarity: 'mythique', variant: 'feu', effect: '', active: false });
  });
});
