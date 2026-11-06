/**
 * Enregistrement des cartes dans le dossier du projet (côté serveur de développement).
 *
 * Rôle : lire / ajouter / modifier / supprimer des cartes. Les images sont écrites dans
 * `public/cartes/` et la liste des cartes dans `public/cartes/cartes.json`. Ces fichiers sont ensuite
 * publiés avec l'appli, ce qui rend les cartes visibles sur tous les appareils.
 * Expose : ErreurCartes, StockageCartes, creerStockageCartes().
 * Dépend de : node:fs, node:path, config/cartes, domain/cartes, domain/id, domain/types.
 * Ne tourne que dans Node (jamais dans le navigateur).
 */
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { NOM_CARTE_MAX, STOCKAGE_CARTES, VARIANTES_PAR_RARETE } from '../src/config/cartes.ts';
import {
  lireListeCartes,
  normaliserInfos,
  validerInfos,
  type InfosCarte,
} from '../src/domain/cartes.ts';
import { generateId } from '../src/domain/id.ts';
import { RARITIES, VARIANTS, type Card } from '../src/domain/types.ts';

/** Erreur « attendue » (mauvaise demande, carte introuvable…) : son code HTTP est prêt à être renvoyé. */
export class ErreurCartes extends Error {
  // Champs déclarés à part (pas dans le constructeur) : la config Vite est lue par Node sans transformation.
  readonly statut: number;
  readonly code: string;

  constructor(statut: number, code: string, message: string) {
    super(message);
    this.statut = statut;
    this.code = code;
  }
}

/**
 * Données reçues du navigateur (JSON non vérifié). Pour ajouter une carte : nom, rarete, variante,
 * largeur, hauteur, image et miniature (images encodées en base64). Tout est validé ici.
 */
export type DonneesBrutes = Record<string, unknown>;

/** Opérations disponibles sur la collection. */
export interface StockageCartes {
  lire(): Promise<Card[]>;
  ajouter(demande: DonneesBrutes): Promise<Card>;
  modifier(id: string, infos: DonneesBrutes): Promise<Card>;
  supprimer(id: string): Promise<void>;
}

/** Un identifiant sûr : lettres minuscules, chiffres et tirets (jamais de `/` ni de `..`). */
const ID_VALIDE = /^[a-z0-9-]{1,64}$/;
/** Dimension maximale acceptée pour une image (px) : écarte les valeurs absurdes. */
const DIMENSION_MAX_PX = 20000;

/** Reconnaît le format réel d'une image d'après ses premiers octets (et non d'après son nom). */
function formatImage(octets: Buffer): 'webp' | 'png' | null {
  if (
    octets.length > 12 &&
    octets.toString('ascii', 0, 4) === 'RIFF' &&
    octets.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  if (
    octets.length > 8 &&
    octets.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }
  return null;
}

/** Décode une image en base64 et vérifie qu'il s'agit bien d'un WebP ou d'un PNG. */
function decoderImage(valeur: unknown): { octets: Buffer; extension: 'webp' | 'png' } {
  if (typeof valeur !== 'string' || valeur === '') {
    throw new ErreurCartes(400, 'image_manquante', 'Image manquante.');
  }
  const octets = Buffer.from(valeur, 'base64');
  const extension = formatImage(octets);
  if (!extension) throw new ErreurCartes(400, 'image_invalide', 'Format d’image non reconnu.');
  return { octets, extension };
}

/** Lit et valide nom / rareté / variante envoyés par le navigateur. */
function lireInfos(brut: DonneesBrutes): InfosCarte {
  const rarete = RARITIES.find((r) => r === brut.rarete);
  if (typeof brut.nom !== 'string' || !rarete) {
    throw new ErreurCartes(400, 'infos_invalides', 'Nom ou rareté invalide.');
  }
  const variante = VARIANTS.find((v) => v === brut.variante);
  const infos = normaliserInfos({ nom: brut.nom, rarete, variante }, VARIANTES_PAR_RARETE);
  if (Object.keys(validerInfos(infos, VARIANTES_PAR_RARETE, NOM_CARTE_MAX)).length > 0) {
    throw new ErreurCartes(400, 'infos_invalides', 'Nom ou variante invalide.');
  }
  return infos;
}

/** Une dimension valide : nombre entier positif et raisonnable. */
function lireDimension(valeur: unknown): number {
  if (
    typeof valeur !== 'number' ||
    !Number.isInteger(valeur) ||
    valeur < 1 ||
    valeur > DIMENSION_MAX_PX
  ) {
    throw new ErreurCartes(400, 'dimensions_invalides', 'Dimensions de l’image invalides.');
  }
  return valeur;
}

/**
 * Crée l'accès au dossier des cartes.
 *
 * @param dossierPublic - Chemin absolu du dossier `public/` du projet.
 * @returns Les opérations de lecture et d'écriture (les écritures sont exécutées l'une après l'autre).
 */
export function creerStockageCartes(dossierPublic: string): StockageCartes {
  const dossier = join(dossierPublic, STOCKAGE_CARTES.dossier);
  const fichierListe = join(dossier, STOCKAGE_CARTES.fichierListe);
  /** Suite des écritures en cours : chacune attend la précédente (évite de s'écraser mutuellement). */
  let fileAttente: Promise<unknown> = Promise.resolve();

  async function lireListe(): Promise<Card[]> {
    let texte: string;
    try {
      texte = await readFile(fichierListe, 'utf8');
    } catch {
      return []; // Pas encore de fichier : collection vide.
    }
    try {
      return lireListeCartes(JSON.parse(texte), VARIANTES_PAR_RARETE).cartes;
    } catch {
      // Fichier abîmé : on refuse d'écrire par-dessus pour ne rien perdre.
      throw new ErreurCartes(
        500,
        'liste_illisible',
        `${STOCKAGE_CARTES.fichierListe} est illisible.`,
      );
    }
  }

  /** Écrit la liste d'un seul coup (fichier temporaire puis renommage : jamais à moitié écrit). */
  async function ecrireListe(cartes: Card[]): Promise<void> {
    await mkdir(dossier, { recursive: true });
    const contenu = JSON.stringify({ version: STOCKAGE_CARTES.versionListe, cartes }, null, 2);
    const temporaire = `${fichierListe}.tmp`;
    await writeFile(temporaire, `${contenu}\n`, 'utf8');
    await rename(temporaire, fichierListe);
  }

  /** Met une opération d'écriture dans la file. */
  function enFile<T>(operation: () => Promise<T>): Promise<T> {
    const suite = fileAttente.then(operation, operation);
    fileAttente = suite.catch(() => undefined);
    return suite;
  }

  /** Efface un fichier du dossier des cartes (le nom est réduit à son dernier segment par sécurité). */
  async function effacerFichier(adresse: string | undefined): Promise<void> {
    if (!adresse) return;
    await rm(join(dossier, basename(adresse)), { force: true });
  }

  return {
    lire: lireListe,

    ajouter: (demande) =>
      enFile(async () => {
        const infos = lireInfos(demande);
        const largeur = lireDimension(demande.largeur);
        const hauteur = lireDimension(demande.hauteur);
        const image = decoderImage(demande.image);
        const miniature = decoderImage(demande.miniature);

        const cartes = await lireListe();
        const id = generateId();
        const nomImage = `${id}.${image.extension}`;
        const nomMiniature = `${id}-mini.${miniature.extension}`;
        await mkdir(dossier, { recursive: true });
        await writeFile(join(dossier, nomImage), image.octets);
        await writeFile(join(dossier, nomMiniature), miniature.octets);

        const carte: Card = {
          id,
          name: infos.nom,
          rarity: infos.rarete,
          imageUrl: `${STOCKAGE_CARTES.dossier}/${nomImage}`,
          thumbUrl: `${STOCKAGE_CARTES.dossier}/${nomMiniature}`,
          width: largeur,
          height: hauteur,
        };
        if (infos.variante) carte.variant = infos.variante;
        await ecrireListe([...cartes, carte]);
        return carte;
      }),

    modifier: (id, brut) =>
      enFile(async () => {
        const infos = lireInfos(brut);
        const cartes = await lireListe();
        const position = ID_VALIDE.test(id) ? cartes.findIndex((c) => c.id === id) : -1;
        const ancienne = cartes[position];
        if (!ancienne) throw new ErreurCartes(404, 'introuvable', 'Carte introuvable.');

        const carte: Card = { ...ancienne, name: infos.nom, rarity: infos.rarete };
        if (infos.variante) carte.variant = infos.variante;
        else delete carte.variant;
        cartes[position] = carte;
        await ecrireListe(cartes);
        return carte;
      }),

    supprimer: (id) =>
      enFile(async () => {
        const cartes = await lireListe();
        const carte = ID_VALIDE.test(id) ? cartes.find((c) => c.id === id) : undefined;
        if (!carte) throw new ErreurCartes(404, 'introuvable', 'Carte introuvable.');
        // La liste est mise à jour d'abord : en cas d'échec ensuite, il reste au pire un fichier orphelin.
        await ecrireListe(cartes.filter((c) => c.id !== id));
        await effacerFichier(carte.imageUrl);
        await effacerFichier(carte.thumbUrl);
      }),
  };
}
