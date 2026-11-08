/**
 * Tests du registre d'effets.
 *
 * Rôle : vérifier que le registre contient « aucun » et les 8 effets de la V0.1.5, que les clés sont
 * valides pour la base, que chaque effet se charge à la demande et produit des calques cohérents, et que
 * la traduction clé ↔ valeur de la base fonctionne.
 * Dépend de : vitest, effects/index, effects/cles, config/effets, domain/types.
 */
import { describe, expect, it } from 'vitest';
import { EFFETS_PAR_DEFAUT } from '../config/effets';
import { RARITIES, VARIANTS } from '../domain/types';
import { CLE_EFFET_AUCUN } from './cles';
import { chargerEffet, listerEffets, REGISTRE_EFFETS, trouverEffet } from './index';
import type { ContexteEffet } from './types';

const CLES_ATTENDUES = [
  'aucun',
  'lustre',
  'holo',
  'prisme',
  'arc_en_ciel',
  'feu',
  'bronze',
  'argent',
  'or',
];
const CLES_EFFETS = CLES_ATTENDUES.filter((cle) => cle !== 'aucun');

const CONTEXTE: ContexteEffet = {
  intensite: 1,
  pointeur: { x: 0.5, y: 0.5 },
  qualite: 'haute',
};

describe('registre d’effets', () => {
  it('contient « aucun » et les 8 effets de la V0.1.5', () => {
    expect(Object.keys(REGISTRE_EFFETS)).toEqual(CLES_ATTENDUES);
    expect(listerEffets()[0]).toEqual({ cle: 'aucun', nom: 'Aucun' });
  });

  it('n’utilise que des clés acceptées par la base (minuscules, chiffres, souligné)', () => {
    for (const cle of Object.keys(REGISTRE_EFFETS)) expect(cle).toMatch(/^[a-z0-9_]{1,40}$/);
  });

  it('retombe sur « aucun » pour une clé inconnue', async () => {
    expect(trouverEffet('effet_retire')).toBe(REGISTRE_EFFETS[CLE_EFFET_AUCUN]);
    expect(await chargerEffet('effet_retire')).toBeNull();
  });

  it('ne charge rien pour « aucun »', async () => {
    expect(await chargerEffet('aucun')).toBeNull();
  });

  it.each(CLES_EFFETS)(
    'charge « %s » à la demande et produit des calques qui suivent l’intensité',
    async (cle) => {
      const fiche = await chargerEffet(cle);
      expect(fiche).not.toBeNull();
      const calques = fiche!.calques(CONTEXTE);
      expect(calques.length).toBeGreaterThan(0);
      // Intensité nulle : plus rien de visible.
      for (const calque of fiche!.calques({ ...CONTEXTE, intensite: 0 })) {
        expect(calque.opacite).toBe(0);
      }
      // Qualité « éco » : jamais plus de calques qu’en qualité haute, et aucune animation.
      const eco = fiche!.calques({ ...CONTEXTE, qualite: 'eco' });
      expect(eco.length).toBeLessThanOrEqual(calques.length);
      expect(eco.filter((calque) => calque.animation)).toEqual([]);
    },
  );

  it('ne charge un effet qu’une seule fois', async () => {
    expect(await chargerEffet('holo')).toBe(await chargerEffet('holo'));
  });

  it('n’anime que par transform et opacity (jamais de changement de mise en page)', async () => {
    for (const cle of CLES_EFFETS) {
      const fiche = await chargerEffet(cle);
      for (const calque of fiche!.calques(CONTEXTE)) {
        expect(calque.animation ?? '').not.toMatch(/\b(width|height|top|left)\b/);
      }
    }
  });
});

describe('table rareté → effet par défaut', () => {
  it('ne renvoie que des effets du registre', () => {
    for (const regle of EFFETS_PAR_DEFAUT) expect(REGISTRE_EFFETS[regle.cle]).toBeDefined();
  });

  it('couvre chaque rareté, et chaque variante de Mythique et Secrète', () => {
    for (const rarete of RARITIES) {
      expect(EFFETS_PAR_DEFAUT.some((r) => r.rarete === rarete)).toBe(true);
    }
    for (const variante of VARIANTS) {
      expect(EFFETS_PAR_DEFAUT.some((r) => r.variante === variante)).toBe(true);
    }
  });
});
