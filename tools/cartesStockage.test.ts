/**
 * Tests de l'enregistrement des cartes et du code admin.
 *
 * Rôle : vérifier, dans un dossier temporaire, l'ajout / la modification / la suppression de cartes,
 * le refus des données invalides et des fichiers qui ne sont pas des images, et la vérification du code.
 * Dépend de : vitest, node:fs, node:os, tools/cartesStockage, tools/codeAdmin.
 */
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { creerStockageCartes, ErreurCartes, type StockageCartes } from './cartesStockage';
import { verifierCodeAdmin } from './codeAdmin';

/** Octets d'un faux WebP (seul l'en-tête est vérifié). */
const FAUX_WEBP = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([0, 0, 0, 0]),
  Buffer.from('WEBP'),
  Buffer.from('contenu'),
]).toString('base64');
/** Octets d'un faux PNG. */
const FAUX_PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from('contenu'),
]).toString('base64');

const demandeValide = {
  nom: '  Dragon ',
  rarete: 'mythique',
  variante: 'feu',
  largeur: 744,
  hauteur: 1040,
  image: FAUX_WEBP,
  miniature: FAUX_WEBP,
};

let dossierPublic: string;
let stockage: StockageCartes;

beforeEach(async () => {
  dossierPublic = await mkdtemp(join(tmpdir(), 'cartes-test-'));
  stockage = creerStockageCartes(dossierPublic);
});

afterEach(async () => {
  await rm(dossierPublic, { recursive: true, force: true });
});

/** Attend qu'une promesse échoue avec une ErreurCartes et renvoie son code. */
async function codeErreur(promesse: Promise<unknown>): Promise<string> {
  try {
    await promesse;
  } catch (erreur) {
    if (erreur instanceof ErreurCartes) return erreur.code;
    throw erreur;
  }
  throw new Error('Une erreur était attendue.');
}

describe('stockage des cartes', () => {
  it('commence avec une collection vide', async () => {
    expect(await stockage.lire()).toEqual([]);
  });

  it('ajoute une carte : images écrites, liste mise à jour, nom nettoyé', async () => {
    const carte = await stockage.ajouter(demandeValide);
    expect(carte).toMatchObject({
      name: 'Dragon',
      rarity: 'mythique',
      variant: 'feu',
      width: 744,
      height: 1040,
    });
    expect(existsSync(join(dossierPublic, carte.imageUrl ?? ''))).toBe(true);
    expect(existsSync(join(dossierPublic, carte.thumbUrl ?? ''))).toBe(true);
    expect(await stockage.lire()).toEqual([carte]);
    const fichier = JSON.parse(
      await readFile(join(dossierPublic, 'cartes', 'cartes.json'), 'utf8'),
    );
    expect(fichier.version).toBe(1);
  });

  it('accepte un PNG (repli des navigateurs qui ne savent pas écrire du WebP)', async () => {
    const carte = await stockage.ajouter({
      ...demandeValide,
      image: FAUX_PNG,
      miniature: FAUX_PNG,
    });
    expect(carte.imageUrl).toMatch(/\.png$/);
  });

  it('enregistre plusieurs ajouts simultanés sans en perdre', async () => {
    await Promise.all(
      Array.from({ length: 6 }, (_, i) =>
        stockage.ajouter({
          ...demandeValide,
          nom: `Carte ${i}`,
          rarete: 'commune',
          variante: undefined,
        }),
      ),
    );
    expect(await stockage.lire()).toHaveLength(6);
  });

  it('refuse un fichier qui n’est pas une image (même avec un faux nom)', async () => {
    const texte = Buffer.from('<script>alert(1)</script>').toString('base64');
    expect(await codeErreur(stockage.ajouter({ ...demandeValide, image: texte }))).toBe(
      'image_invalide',
    );
    expect(await stockage.lire()).toEqual([]);
  });

  it('refuse un nom vide, une rareté inconnue et une variante manquante', async () => {
    expect(await codeErreur(stockage.ajouter({ ...demandeValide, nom: ' ' }))).toBe(
      'infos_invalides',
    );
    expect(await codeErreur(stockage.ajouter({ ...demandeValide, rarete: 'diamant' }))).toBe(
      'infos_invalides',
    );
    expect(await codeErreur(stockage.ajouter({ ...demandeValide, variante: undefined }))).toBe(
      'infos_invalides',
    );
  });

  it('refuse des dimensions absurdes', async () => {
    expect(await codeErreur(stockage.ajouter({ ...demandeValide, largeur: -5 }))).toBe(
      'dimensions_invalides',
    );
    expect(await codeErreur(stockage.ajouter({ ...demandeValide, hauteur: 'grand' }))).toBe(
      'dimensions_invalides',
    );
  });

  it('modifie le nom, la rareté et la variante', async () => {
    const carte = await stockage.ajouter(demandeValide);
    const modifiee = await stockage.modifier(carte.id, {
      nom: 'Dragon d’argent',
      rarete: 'secrete',
      variante: 'argent',
    });
    expect(modifiee).toMatchObject({
      name: 'Dragon d’argent',
      rarity: 'secrete',
      variant: 'argent',
    });
    expect(modifiee.imageUrl).toBe(carte.imageUrl);

    const simple = await stockage.modifier(carte.id, { nom: 'Dragon', rarete: 'rare' });
    expect(simple.variant).toBeUndefined();
  });

  it('supprime la carte et ses deux images', async () => {
    const carte = await stockage.ajouter(demandeValide);
    await stockage.supprimer(carte.id);
    expect(await stockage.lire()).toEqual([]);
    expect(existsSync(join(dossierPublic, carte.imageUrl ?? ''))).toBe(false);
    expect(existsSync(join(dossierPublic, carte.thumbUrl ?? ''))).toBe(false);
  });

  it('refuse une carte inconnue ou un identifiant piégé (chemin ../)', async () => {
    expect(await codeErreur(stockage.supprimer('nexiste-pas'))).toBe('introuvable');
    expect(await codeErreur(stockage.supprimer('../../package'))).toBe('introuvable');
    expect(await codeErreur(stockage.modifier('..%2f', { nom: 'A', rarete: 'rare' }))).toBe(
      'introuvable',
    );
  });

  it('n’écrase pas un fichier de liste abîmé', async () => {
    await mkdir(join(dossierPublic, 'cartes'), { recursive: true });
    const fichier = join(dossierPublic, 'cartes', 'cartes.json');
    await writeFile(fichier, '{ pas du json');
    expect(await codeErreur(stockage.ajouter(demandeValide))).toBe('liste_illisible');
    expect(await readFile(fichier, 'utf8')).toBe('{ pas du json');
  });
});

describe('verifierCodeAdmin', () => {
  it('accepte le bon code', () => {
    expect(verifierCodeAdmin('secret', 'secret')).toBe(true);
  });

  it('refuse un mauvais code, un code absent ou une longueur différente', () => {
    expect(verifierCodeAdmin('secret', 'secreT')).toBe(false);
    expect(verifierCodeAdmin('secret', undefined)).toBe(false);
    expect(verifierCodeAdmin('secret', 'secret-plus-long')).toBe(false);
  });

  it('refuse tout quand aucun code n’est défini', () => {
    expect(verifierCodeAdmin(undefined, 'x')).toBe(false);
    expect(verifierCodeAdmin('', '')).toBe(false);
  });
});
