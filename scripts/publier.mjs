/**
 * Publication d'une nouvelle version de l'appli.
 *
 * Rôle : une seule commande pour publier : vérifie que tout est propre, calcule le nouveau numéro de
 * version, range le CHANGELOG, vérifie le code (lint, tests, construction), enregistre le tout dans Git
 * (commit « Version x.y.z » + étiquette vx.y.z) et l'envoie sur GitHub. Le déploiement est ensuite
 * AUTOMATIQUE (GitHub Actions publie le site à chaque envoi sur la branche main).
 *
 * Utilisation :
 *   npm run publier -- correctif      petite correction   0.1.0 → 0.1.1
 *   npm run publier -- mineur         nouveautés          0.1.0 → 0.2.0
 *   npm run publier -- majeur         grosse étape        0.1.0 → 1.0.0
 *   npm run publier -- 0.3.0          numéro choisi à la main
 *   npm run publier -- actuelle       publie la version déjà inscrite dans package.json (première version)
 * Options :
 *   --essai                simulation : affiche ce qui serait fait, sans rien modifier ni envoyer
 *   --sans-verification    saute lint, tests et construction (à éviter : réservé aux essais)
 *
 * Avant de publier, il faut avoir noté les changements dans CHANGELOG.md, sous « ## Non publié ».
 * Dépend de : node (git et npm installés), src/domain/version.ts, src/domain/changelog.ts.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { notesDeVersion, publierChangelog } from '../src/domain/changelog.ts';
import { incrementerVersion, lireVersion, comparerVersions } from '../src/domain/version.ts';

const arguments_ = process.argv.slice(2);
const options = arguments_.filter((a) => a.startsWith('--'));
const demande = arguments_.find((a) => !a.startsWith('--'));
const essai = options.includes('--essai');
const sansVerification = options.includes('--sans-verification');

/** Arrête la commande avec un message clair (et un code d'erreur). */
function echec(message) {
  console.error(`\n✘ ${message}\n`);
  process.exit(1);
}

/** Lance une commande et renvoie sa sortie (texte). */
function executer(commande, args, { affiche = false } = {}) {
  return execFileSync(commande, args, {
    encoding: 'utf8',
    stdio: affiche ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    // Sous Windows, « npm » est un fichier .cmd : il faut passer par le shell.
    shell: commande === 'npm' && process.platform === 'win32',
  });
}

/** Lance une commande git et renvoie sa sortie sans espaces autour. */
const git = (...args) => (executer('git', args) ?? '').trim();

const lireJson = (chemin) => JSON.parse(readFileSync(chemin, 'utf8'));

// ---------- 1. Ce qu'on veut publier ----------
if (!demande) {
  echec(
    'Précise le type de version : correctif, mineur, majeur, actuelle, ou un numéro (ex. 0.3.0).\n' +
      '  Exemple : npm run publier -- mineur',
  );
}
const paquet = lireJson('package.json');
const versionActuelle = paquet.version;
if (!lireVersion(versionActuelle))
  echec(`La version de package.json (« ${versionActuelle} ») est invalide.`);

const typesConnus = ['correctif', 'mineur', 'majeur'];
let nouvelle;
if (demande === 'actuelle') nouvelle = versionActuelle;
else if (typesConnus.includes(demande)) nouvelle = incrementerVersion(versionActuelle, demande);
else if (lireVersion(demande)) nouvelle = demande;
else
  echec(
    `« ${demande} » n'est ni un type (correctif, mineur, majeur, actuelle) ni un numéro de version.`,
  );

if (demande !== 'actuelle' && comparerVersions(nouvelle, versionActuelle) <= 0) {
  echec(
    `La nouvelle version (${nouvelle}) doit être plus récente que la version actuelle (${versionActuelle}).`,
  );
}
const etiquette = `v${nouvelle}`;

// ---------- 2. Git est-il prêt ? ----------
if (git('rev-parse', '--abbrev-ref', 'HEAD') !== 'main')
  echec('Publie depuis la branche « main ».');
if (git('status', '--porcelain', '--untracked-files=no') !== '') {
  echec(
    "Il reste des modifications non enregistrées. Fais d'abord un commit (ou annule-les), puis relance.",
  );
}
try {
  executer('git', ['fetch', 'origin', 'main', '--tags']);
} catch {
  echec('Impossible de joindre GitHub (git fetch). Vérifie ta connexion.');
}
if (git('rev-list', '--count', 'HEAD..origin/main') !== '0') {
  echec("GitHub a des changements que tu n'as pas. Fais « git pull » d'abord.");
}
if (git('tag', '--list', etiquette) !== '') echec(`L'étiquette ${etiquette} existe déjà.`);

// ---------- 3. CHANGELOG ----------
const changelog = readFileSync('CHANGELOG.md', 'utf8');
let nouveauChangelog = changelog;
try {
  if (demande === 'actuelle') {
    if (notesDeVersion(changelog, nouvelle).length === 0) {
      throw new Error(`Le CHANGELOG n'a pas de section « ## [${nouvelle}] » avec des points.`);
    }
  } else {
    const date = new Date().toISOString().slice(0, 10);
    nouveauChangelog = publierChangelog(changelog, nouvelle, date);
  }
} catch (erreur) {
  echec(
    `${erreur.message}\n  Ajoute d'abord des points « - … » sous « ## Non publié » dans CHANGELOG.md.`,
  );
}
const notes = notesDeVersion(nouveauChangelog, nouvelle);

console.log(`\nPublication : ${versionActuelle} → ${nouvelle}  (étiquette ${etiquette})`);
console.log('Nouveautés qui seront annoncées aux joueurs :');
notes.forEach((note) => console.log(`  - ${note}`));

// ---------- 4. Vérifications du code ----------
if (sansVerification) {
  console.log('\n(vérifications sautées : --sans-verification)');
} else {
  for (const script of ['lint', 'test', 'build']) {
    console.log(`\n→ npm run ${script}`);
    try {
      executer('npm', ['run', script], { affiche: true });
    } catch {
      echec(`« npm run ${script} » a échoué : rien n'a été publié. Corrige puis relance.`);
    }
  }
}

if (essai) {
  console.log("\n✔ Simulation terminée : rien n'a été modifié ni envoyé.");
  process.exit(0);
}

// ---------- 5. Enregistrement dans Git et envoi ----------
if (demande !== 'actuelle') {
  executer('npm', ['version', nouvelle, '--no-git-tag-version', '--allow-same-version']);
  writeFileSync('CHANGELOG.md', nouveauChangelog);
  git('add', 'package.json', 'package-lock.json', 'CHANGELOG.md');
  git('commit', '-m', `Version ${nouvelle}`);
}
git('tag', '-a', etiquette, '-m', `Version ${nouvelle}`);
console.log(`\n→ envoi sur GitHub (main + ${etiquette})`);
executer('git', ['push', 'origin', 'main', '--follow-tags'], { affiche: true });

console.log(`\n✔ Version ${nouvelle} publiée.`);
console.log(
  "  Le site se met à jour tout seul d'ici 1 à 2 minutes (onglet « Actions » du dépôt GitHub).",
);
console.log('  Les joueurs verront le bandeau « Nouvelle version disponible ».');
