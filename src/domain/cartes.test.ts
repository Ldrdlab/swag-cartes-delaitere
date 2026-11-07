/**
 * Tests de la logique de la collection de cartes.
 *
 * Rôle : vérifier le ratio, les dimensions optimisées, la validation des infos, le filtrage, le tri,
 * les compteurs, ainsi que l'effet et l'activation d'une carte.
 * Dépend de : vitest, domain/cartes, config/cartes.
 */
import { describe, expect, it } from 'vitest';
import {
  CARTE_HAUTEUR_PX,
  CARTE_LARGEUR_PX,
  EXTENSIONS_IMAGE_ACCEPTEES,
  NOM_CARTE_MAX,
  RATIO_CARTE,
  TOLERANCE_RATIO,
  TYPES_IMAGE_ACCEPTES,
  VARIANTES_PAR_RARETE,
} from '../config/cartes';
import {
  compterParRarete,
  dimensionsOptimisees,
  filtrerCartes,
  fusionnerInfos,
  nomDepuisFichier,
  normaliserInfos,
  trierCartes,
  typeImageAccepte,
  validerInfos,
  verifierRatio,
} from './cartes';
import type { Card } from './types';

describe('verifierRatio', () => {
  const verifier = (l: number, h: number) => verifierRatio(l, h, RATIO_CARTE, TOLERANCE_RATIO);

  it('accepte une carte aux dimensions exactes', () => {
    expect(verifier(CARTE_LARGEUR_PX, CARTE_HAUTEUR_PX).conforme).toBe(true);
  });

  it('accepte une version réduite ou agrandie (mêmes proportions)', () => {
    expect(verifier(372, 520).conforme).toBe(true);
    expect(verifier(1488, 2080).conforme).toBe(true);
  });

  it('accepte un écart inférieur à 2 % et refuse un écart supérieur', () => {
    expect(verifier(CARTE_LARGEUR_PX * 1.015, CARTE_HAUTEUR_PX).conforme).toBe(true);
    expect(verifier(CARTE_LARGEUR_PX * 1.03, CARTE_HAUTEUR_PX).conforme).toBe(false);
  });

  it('refuse un carré, un paysage et une image vide', () => {
    expect(verifier(800, 800).conforme).toBe(false);
    expect(verifier(1040, 744).conforme).toBe(false);
    expect(verifier(0, 0).conforme).toBe(false);
  });
});

describe('dimensionsOptimisees', () => {
  it('réduit en gardant les proportions', () => {
    expect(dimensionsOptimisees(1488, 2080, 744)).toEqual({ largeur: 744, hauteur: 1040 });
  });

  it('n’agrandit jamais une petite image', () => {
    expect(dimensionsOptimisees(300, 420, 744)).toEqual({ largeur: 300, hauteur: 420 });
  });
});

describe('typeImageAccepte', () => {
  const accepte = (type: string, nom: string) =>
    typeImageAccepte(type, nom, TYPES_IMAGE_ACCEPTES, EXTENSIONS_IMAGE_ACCEPTEES);

  it('accepte PNG, JPG et WebP', () => {
    expect(accepte('image/png', 'a.png')).toBe(true);
    expect(accepte('image/jpeg', 'a.jpg')).toBe(true);
    expect(accepte('image/webp', 'a.webp')).toBe(true);
  });

  it('refuse les autres formats', () => {
    expect(accepte('image/gif', 'a.gif')).toBe(false);
    expect(accepte('application/pdf', 'a.pdf')).toBe(false);
  });

  it('se rabat sur l’extension quand le type est inconnu', () => {
    expect(accepte('', 'CARTE.PNG')).toBe(true);
    expect(accepte('', 'notes.txt')).toBe(false);
  });
});

describe('nomDepuisFichier', () => {
  it('enlève l’extension et rend le nom lisible', () => {
    expect(nomDepuisFichier('dragon_de-feu.png', NOM_CARTE_MAX)).toBe('Dragon de feu');
  });

  it('coupe un nom trop long', () => {
    expect(nomDepuisFichier(`${'a'.repeat(100)}.png`, 10)).toHaveLength(10);
  });
});

describe('fusionnerInfos', () => {
  const fusionner = (
    infos: Parameters<typeof fusionnerInfos>[0],
    changement: Parameters<typeof fusionnerInfos>[1],
  ) => fusionnerInfos(infos, changement, VARIANTES_PAR_RARETE);

  it('propose la première variante en passant à mythique ou secrète', () => {
    expect(fusionner({ nom: 'A', rarete: 'rare' }, { rarete: 'mythique' }).variante).toBe('feu');
    expect(fusionner({ nom: 'A', rarete: 'rare' }, { rarete: 'secrete' }).variante).toBe('argent');
  });

  it('garde une variante valide et la remplace quand elle ne convient plus', () => {
    const bronze = fusionner(
      { nom: 'A', rarete: 'mythique', variante: 'feu' },
      { variante: 'bronze' },
    );
    expect(bronze.variante).toBe('bronze');
    expect(fusionner(bronze, { rarete: 'secrete' }).variante).toBe('argent');
  });

  it('retire la variante pour une rareté qui n’en a pas, et garde le nom', () => {
    const infos = fusionner(
      { nom: 'Dragon', rarete: 'mythique', variante: 'feu' },
      { rarete: 'rare' },
    );
    expect(infos).toEqual({ nom: 'Dragon', rarete: 'rare', variante: undefined });
  });

  it('conserve l’effet et l’activation lors d’un changement de rareté', () => {
    const infos = fusionner(
      { nom: 'A', rarete: 'rare', effet: 'holo', active: false },
      { rarete: 'mythique' },
    );
    expect(infos.effet).toBe('holo');
    expect(infos.active).toBe(false);
  });
});

describe('validerInfos et normaliserInfos', () => {
  const valider = (infos: Parameters<typeof validerInfos>[0]) =>
    validerInfos(infos, VARIANTES_PAR_RARETE, NOM_CARTE_MAX);

  it('exige un nom', () => {
    expect(valider({ nom: '   ', rarete: 'commune' }).nom).toBe('nom_vide');
    expect(valider({ nom: 'x'.repeat(NOM_CARTE_MAX + 1), rarete: 'commune' }).nom).toBe(
      'nom_trop_long',
    );
    expect(valider({ nom: 'Pomme', rarete: 'commune' })).toEqual({});
  });

  it('exige une variante pour mythique et secrète, et la limite à celles autorisées', () => {
    expect(valider({ nom: 'A', rarete: 'mythique' }).variante).toBe('variante_requise');
    expect(valider({ nom: 'A', rarete: 'mythique', variante: 'feu' })).toEqual({});
    expect(valider({ nom: 'A', rarete: 'mythique', variante: 'or' }).variante).toBe(
      'variante_invalide',
    );
    expect(valider({ nom: 'A', rarete: 'secrete', variante: 'or' })).toEqual({});
    expect(valider({ nom: 'A', rarete: 'secrete', variante: 'feu' }).variante).toBe(
      'variante_invalide',
    );
  });

  it('retire la variante quand la rareté n’en a pas et nettoie le nom', () => {
    const infos = normaliserInfos(
      { nom: '  Pomme ', rarete: 'rare', variante: 'feu' },
      VARIANTES_PAR_RARETE,
    );
    expect(infos).toEqual({ nom: 'Pomme', rarete: 'rare' });
  });

  it('garde l’effet et l’activation quand ils sont renseignés', () => {
    const infos = normaliserInfos(
      { nom: 'A', rarete: 'commune', effet: 'aucun', active: false },
      VARIANTES_PAR_RARETE,
    );
    expect(infos).toEqual({ nom: 'A', rarete: 'commune', effet: 'aucun', active: false });
  });
});

const cartes: Card[] = [
  { id: '1', name: 'Étoile filante', rarity: 'rare' },
  { id: '2', name: 'Abeille', rarity: 'commune' },
  { id: '3', name: 'Dragon', rarity: 'mythique', variant: 'feu' },
  { id: '4', name: 'Zèbre', rarity: 'commune' },
];

describe('compterParRarete', () => {
  it('compte chaque rareté, y compris celles à zéro', () => {
    expect(compterParRarete(cartes)).toEqual({
      commune: 2,
      peu_commune: 0,
      rare: 1,
      super_rare: 0,
      legendaire: 0,
      mythique: 1,
      secrete: 0,
    });
  });
});

describe('filtrerCartes', () => {
  it('garde tout sans critère', () => {
    expect(filtrerCartes(cartes, { rarete: 'toutes', recherche: '' })).toHaveLength(4);
  });

  it('filtre par rareté', () => {
    const resultat = filtrerCartes(cartes, { rarete: 'commune', recherche: '' });
    expect(resultat.map((c) => c.id)).toEqual(['2', '4']);
  });

  it('cherche dans le nom sans tenir compte des accents ni de la casse', () => {
    expect(filtrerCartes(cartes, { rarete: 'toutes', recherche: 'etoile' })).toHaveLength(1);
    expect(filtrerCartes(cartes, { rarete: 'toutes', recherche: 'ZEBRE' })).toHaveLength(1);
  });

  it('combine rareté et recherche', () => {
    expect(filtrerCartes(cartes, { rarete: 'rare', recherche: 'abeille' })).toHaveLength(0);
  });
});

describe('trierCartes', () => {
  it('trie par rareté puis par nom, sans modifier la liste d’origine', () => {
    expect(trierCartes(cartes).map((c) => c.id)).toEqual(['2', '4', '1', '3']);
    expect(cartes[0]?.id).toBe('1');
  });
});
