/**
 * Tests de la lecture et de la publication du CHANGELOG.
 *
 * Rôle : vérifier la lecture des notes d'une version, du « Non publié », et le passage d'un « Non publié »
 * à une version publiée (sans rien perdre des versions précédentes).
 * Dépend de : vitest, domain/changelog.
 */
import { describe, expect, it } from 'vitest';
import { contenuNonPublie, lireInfosVersion, notesDeVersion, publierChangelog } from './changelog';

const exemple = `# Journal des modifications

Notes de chaque version.

## Non publié

### Nouveautés

- Bandeau de mise à jour.
- Écran « Mise à jour obligatoire ».

## [0.1.0] - 2026-11-08

### Nouveautés

- Première version.
- Ouverture de boosters.

### Corrections

- Rien à signaler.

## [0.0.9] - 2026-10-01

- Version de test.
`;

describe('notesDeVersion', () => {
  it('lit les points d’une version, sous-titres ignorés', () => {
    expect(notesDeVersion(exemple, '0.1.0')).toEqual([
      'Première version.',
      'Ouverture de boosters.',
      'Rien à signaler.',
    ]);
    expect(notesDeVersion(exemple, '0.0.9')).toEqual(['Version de test.']);
  });

  it('renvoie une liste vide pour une version absente', () => {
    expect(notesDeVersion(exemple, '9.9.9')).toEqual([]);
    expect(notesDeVersion('', '0.1.0')).toEqual([]);
  });

  it('ne confond pas deux versions qui commencent pareil', () => {
    const texte = '## [0.1.0] - a\n- un\n## [0.1.10] - b\n- deux\n';
    expect(notesDeVersion(texte, '0.1.1')).toEqual([]);
    expect(notesDeVersion(texte, '0.1.10')).toEqual(['deux']);
  });
});

describe('contenuNonPublie', () => {
  it('lit les points de la section « Non publié »', () => {
    expect(contenuNonPublie(exemple)).toEqual([
      'Bandeau de mise à jour.',
      'Écran « Mise à jour obligatoire ».',
    ]);
  });

  it('renvoie une liste vide si la section est absente ou sans point', () => {
    expect(contenuNonPublie('# Titre\n')).toEqual([]);
    expect(contenuNonPublie('## Non publié\n\n### Nouveautés\n\n## [0.1.0] - x\n- a\n')).toEqual(
      [],
    );
  });
});

describe('publierChangelog', () => {
  const resultat = publierChangelog(exemple, '0.2.0', '2026-12-01');

  it('place le « Non publié » sous la nouvelle version et garde une section vide en haut', () => {
    expect(contenuNonPublie(resultat)).toEqual([]);
    expect(notesDeVersion(resultat, '0.2.0')).toEqual([
      'Bandeau de mise à jour.',
      'Écran « Mise à jour obligatoire ».',
    ]);
    expect(resultat).toContain('## [0.2.0] - 2026-12-01');
    expect(resultat.indexOf('## Non publié')).toBeLessThan(resultat.indexOf('## [0.2.0]'));
  });

  it('conserve les versions précédentes et l’introduction', () => {
    expect(notesDeVersion(resultat, '0.1.0')).toEqual(notesDeVersion(exemple, '0.1.0'));
    expect(notesDeVersion(resultat, '0.0.9')).toEqual(['Version de test.']);
    expect(resultat.startsWith('# Journal des modifications\n\nNotes de chaque version.')).toBe(
      true,
    );
  });

  it('refuse de publier quand il n’y a rien de nouveau', () => {
    expect(() => publierChangelog('## Non publié\n\n## [0.1.0] - x\n- a\n', '0.2.0', 'd')).toThrow(
      /vide/,
    );
  });

  it('refuse une version déjà publiée ou un fichier sans « Non publié »', () => {
    expect(() => publierChangelog(exemple, '0.1.0', 'd')).toThrow(/existe déjà/);
    expect(() => publierChangelog('# Titre\n', '0.2.0', 'd')).toThrow(/section/);
  });

  it('peut publier plusieurs versions à la suite', () => {
    const suivante = publierChangelog(
      resultat.replace('## Non publié\n', '## Non publié\n\n- Correction.\n'),
      '0.2.1',
      '2026-12-02',
    );
    expect(notesDeVersion(suivante, '0.2.1')).toEqual(['Correction.']);
    expect(notesDeVersion(suivante, '0.2.0')).toHaveLength(2);
  });
});

describe('lireInfosVersion', () => {
  it('lit une version et ses notes, en ignorant les notes illisibles', () => {
    expect(lireInfosVersion({ version: '0.2.0', notes: ['Un', 3, '', 'Deux'] })).toEqual({
      version: '0.2.0',
      notes: ['Un', 'Deux'],
    });
  });

  it('renvoie null pour un contenu invalide', () => {
    for (const valeur of [
      null,
      'texte',
      3,
      {},
      { version: '', notes: [] },
      { version: '1', notes: 'x' },
    ]) {
      expect(lireInfosVersion(valeur)).toBeNull();
    }
  });
});
