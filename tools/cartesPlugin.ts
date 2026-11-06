/**
 * Plugin Vite : API d'administration des cartes (uniquement avec `npm run dev`).
 *
 * Rôle : ajoute au serveur de développement quelques adresses `/api/cartes/...` qui permettent à
 * l'écran « Mes cartes » d'enregistrer des cartes dans le dossier du projet. Chaque écriture exige le
 * code admin (en-tête HTTP), vérifié ici, côté serveur. Dans l'appli publiée (`npm run build`), ce
 * plugin n'existe pas : il n'y a donc AUCUN moyen de modifier les cartes depuis Internet.
 * Expose : pluginCartes().
 * Dépend de : vite (type Plugin), node:http, config/cartes, tools/cartesStockage, tools/codeAdmin.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { STOCKAGE_CARTES } from '../src/config/cartes.ts';
import { creerStockageCartes, ErreurCartes, type DonneesBrutes } from './cartesStockage.ts';
import { verifierCodeAdmin } from './codeAdmin.ts';

/** Réglages du plugin. */
interface OptionsPluginCartes {
  /** Dossier racine du projet. */
  racine: string;
  /** Code admin lu dans `.env.local` (`undefined` = non défini : l'administration est bloquée). */
  codeAdmin: string | undefined;
}

/** Envoie une réponse JSON. */
function repondre(res: ServerResponse, statut: number, corps: unknown): void {
  res.statusCode = statut;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(corps));
}

/** Lit le corps JSON d'une requête, en refusant ce qui dépasse la taille maximale. */
function lireCorps(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const morceaux: Buffer[] = [];
    let taille = 0;
    req.on('data', (morceau: Buffer) => {
      taille += morceau.length;
      if (taille > STOCKAGE_CARTES.tailleMaxRequeteOctets) {
        reject(new ErreurCartes(413, 'trop_gros', 'Requête trop volumineuse.'));
        req.destroy();
        return;
      }
      morceaux.push(morceau);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(morceaux).toString('utf8')));
      } catch {
        reject(new ErreurCartes(400, 'json_invalide', 'Requête illisible.'));
      }
    });
    req.on('error', reject);
  });
}

/** Un corps de requête doit être un objet JSON. */
function enObjet(corps: unknown): DonneesBrutes {
  if (typeof corps !== 'object' || corps === null || Array.isArray(corps)) {
    throw new ErreurCartes(400, 'json_invalide', 'Requête illisible.');
  }
  return corps as DonneesBrutes;
}

/** Lit le code admin envoyé par le navigateur (encodé pour passer dans un en-tête HTTP). */
function lireCodeRecu(req: IncomingMessage): string | undefined {
  const brut = req.headers[STOCKAGE_CARTES.enteteCode];
  if (typeof brut !== 'string') return undefined;
  try {
    return decodeURIComponent(brut);
  } catch {
    return undefined;
  }
}

/** Plugin Vite qui branche l'API d'administration des cartes sur le serveur de développement. */
export function pluginCartes({ racine, codeAdmin }: OptionsPluginCartes): Plugin {
  const stockage = creerStockageCartes(join(racine, 'public'));

  async function traiter(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // `req.url` est relatif à /api/cartes : "/", "/statut", "/verifier" ou "/<id>".
    const chemin = (req.url ?? '/').split('?')[0] ?? '/';
    const methode = req.method ?? 'GET';

    if (methode === 'GET' && chemin === '/statut') {
      repondre(res, 200, { administration: true, codeDefini: Boolean(codeAdmin) });
      return;
    }

    // Tout le reste exige le code admin.
    if (!codeAdmin) {
      repondre(res, 503, {
        erreur: 'code_non_defini',
        message: 'Aucun code admin n’est défini dans .env.local (ADMIN_CODE).',
      });
      return;
    }
    if (!verifierCodeAdmin(codeAdmin, lireCodeRecu(req))) {
      await new Promise((suite) => setTimeout(suite, STOCKAGE_CARTES.delaiMauvaisCodeMs));
      repondre(res, 401, { erreur: 'code_incorrect', message: 'Code admin incorrect.' });
      return;
    }

    if (methode === 'POST' && chemin === '/verifier') {
      repondre(res, 200, { ok: true });
    } else if (methode === 'POST' && chemin === '/') {
      const carte = await stockage.ajouter(enObjet(await lireCorps(req)));
      repondre(res, 201, { carte });
    } else if (methode === 'PUT' && chemin.length > 1) {
      const carte = await stockage.modifier(chemin.slice(1), enObjet(await lireCorps(req)));
      repondre(res, 200, { carte });
    } else if (methode === 'DELETE' && chemin.length > 1) {
      await stockage.supprimer(chemin.slice(1));
      repondre(res, 200, { ok: true });
    } else {
      repondre(res, 404, { erreur: 'inconnu', message: 'Adresse inconnue.' });
    }
  }

  return {
    name: 'cartes-administration',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(STOCKAGE_CARTES.racineApi, (req, res) => {
        traiter(req, res).catch((erreur: unknown) => {
          if (erreur instanceof ErreurCartes) {
            repondre(res, erreur.statut, { erreur: erreur.code, message: erreur.message });
          } else {
            server.config.logger.error(`[cartes] ${String(erreur)}`);
            repondre(res, 500, { erreur: 'interne', message: 'Erreur interne du serveur.' });
          }
        });
      });
    },
  };
}
