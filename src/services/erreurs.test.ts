/**
 * Tests de la traduction des erreurs Supabase.
 *
 * Rôle : vérifier que chaque erreur brute (droits, carte possédée, réseau, fichier trop gros…) donne le
 * bon code, et que le code d'une `ErreurService` est conservé.
 * Dépend de : vitest, services/erreurs.
 */
import { describe, expect, it } from 'vitest';
import { ErreurService, traduireErreur, type CodeErreur } from './erreurs';

const cas: [string, Parameters<typeof traduireErreur>[0], CodeErreur][] = [
  [
    'droits refusés par la base',
    { code: '42501', message: 'permission denied for table cards' },
    'non_autorise',
  ],
  [
    'règle de sécurité (RLS)',
    { message: 'new row violates row-level security policy' },
    'non_autorise',
  ],
  ['stockage : 403', { statusCode: '403', message: 'Unauthorized' }, 'non_autorise'],
  ['session expirée', { code: 'PGRST301', message: 'JWT expired' }, 'non_connecte'],
  [
    'carte possédée (clé étrangère)',
    { code: '23503', message: 'violates foreign key constraint' },
    'carte_possedee',
  ],
  [
    'contrainte non respectée',
    { code: '23514', message: 'violates check constraint' },
    'infos_invalides',
  ],
  ['pseudo déjà pris', { code: '23505', message: 'duplicate key' }, 'infos_invalides'],
  [
    'fichier trop lourd',
    { statusCode: '413', message: 'The object exceeded the maximum allowed size' },
    'trop_gros',
  ],
  [
    'format refusé',
    { statusCode: '415', message: 'mime type text/plain is not supported' },
    'image_invalide',
  ],
  ['aucune ligne', { code: 'PGRST116', message: 'The result contains 0 rows' }, 'introuvable'],
  [
    'limite de boosters atteinte',
    { code: 'P0001', message: 'daily_limit_reached' },
    'limite_atteinte',
  ],
  ['aucune carte à tirer', { code: 'P0001', message: 'no_cards_available' }, 'aucune_carte'],
  ['non connecté (fonction SQL)', { code: '28000', message: 'not_authenticated' }, 'non_connecte'],
  ['pas de réseau', { message: 'TypeError: Failed to fetch' }, 'reseau'],
  ['exception du navigateur', { name: 'TypeError', message: 'Load failed' }, 'reseau'],
  ['erreur inattendue', { message: 'quelque chose' }, 'inconnue'],
  ['aucune erreur fournie', undefined, 'inconnue'],
];

describe('traduireErreur', () => {
  it.each(cas)('%s', (_nom, brute, attendu) => {
    const erreur = traduireErreur(brute);
    expect(erreur).toBeInstanceOf(ErreurService);
    expect(erreur.code).toBe(attendu);
  });
});
