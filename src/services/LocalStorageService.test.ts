/**
 * Tests du service de stockage local (avec un faux stockage en mémoire).
 *
 * Dépend de : vitest, services/LocalStorageService.
 */
import { describe, expect, it } from 'vitest';
import { LocalStorageService, type KeyValueStorage } from './LocalStorageService';

/** Faux localStorage basé sur une Map. */
function creerFauxStockage(): KeyValueStorage & { contenu: Map<string, string> } {
  const contenu = new Map<string, string>();
  return {
    contenu,
    getItem: (cle) => contenu.get(cle) ?? null,
    setItem: (cle, valeur) => void contenu.set(cle, valeur),
    removeItem: (cle) => void contenu.delete(cle),
  };
}

describe('LocalStorageService', () => {
  it('renvoie null quand rien n’a été sauvegardé', async () => {
    const service = new LocalStorageService(creerFauxStockage(), 'cle');
    expect(await service.loadPlayer()).toBeNull();
  });

  it('relit le profil sauvegardé', async () => {
    const service = new LocalStorageService(creerFauxStockage(), 'cle');
    await service.savePlayer({ id: 'p1', pseudo: 'Sacha' });
    expect(await service.loadPlayer()).toEqual({ id: 'p1', pseudo: 'Sacha' });
  });

  it('renvoie null si les données sont corrompues', async () => {
    const stockage = creerFauxStockage();
    stockage.setItem('cle', '{pas du json');
    expect(await new LocalStorageService(stockage, 'cle').loadPlayer()).toBeNull();

    stockage.setItem('cle', JSON.stringify({ id: 12, pseudo: null }));
    expect(await new LocalStorageService(stockage, 'cle').loadPlayer()).toBeNull();
  });

  it('supprime le profil avec clearPlayer', async () => {
    const service = new LocalStorageService(creerFauxStockage(), 'cle');
    await service.savePlayer({ id: 'p1', pseudo: 'Sacha' });
    await service.clearPlayer();
    expect(await service.loadPlayer()).toBeNull();
  });
});
