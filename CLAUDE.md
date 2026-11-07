# SWAG — Cartes Délaitère

Application web mobile-first d'ouverture de boosters de cartes entre amis (inspirée de Pokémon TCG Pocket).
Les visuels des cartes sont des photos d'amis du porteur du projet.
Objectif en cours : **V0.1** = comptes (Supabase), collection par joueur, ouverture de boosters côté serveur,
espace administrateur, installation sur téléphone (PWA), mises à jour. Le porteur du projet débute en code :
toujours expliquer simplement et dire précisément ce qu'il doit faire lui-même.

## Règles absolues

- **Aucun secret dans le code ni sur GitHub.** Seuls l'URL Supabase et la clé publique « anon » vont dans le front
  (fichier `.env` ignoré par Git + secrets GitHub). La clé `service_role` n'apparaît JAMAIS dans le projet.
- **Les photos des cartes ne sont JAMAIS commitées** (le dépôt GitHub est public). `public/cartes/` est dans `.gitignore`
  (copie locale de travail seulement) ; elles iront dans le stockage privé Supabase (bucket `cards`, utilisateurs connectés).
  Historique Git nettoyé le 2026-11-06 (sauvegarde locale hors dépôt : `../SAUVEGARDE-avant-nettoyage-git/`).
- Méthode : travail par phases ; à la fin de chaque phase, résumer + comment tester, **s'arrêter** et attendre la validation.
  Ne rien supprimer ni réécrire d'existant sans l'avoir annoncé. Un commit Git (message en français) par phase.
- Aucune dépendance sans validation préalable du porteur du projet.

## Architecture cible (décidée)

- Front : PWA Vite + React 18 + TypeScript (le projet existant l'utilisait déjà). Pas de routeur : la navigation passe par
  une machine à états (pas d'URL), donc aucun souci de routage sur GitHub Pages.
- Hébergement : GitHub Pages, déployé par GitHub Actions à chaque push sur `main` (`.github/workflows/deploiement.yml`).
  Site : https://ldrdlab.github.io/swag-cartes-delaitere/ · dépôt public : https://github.com/Ldrdlab/swag-cartes-delaitere (réglage : `src/config/deploiement.ts`).
- Backend : Supabase (offre gratuite) : comptes e-mail + mot de passe (inscriptions publiques désactivées, invitations par
  l'admin), base Postgres avec RLS sur toutes les tables, bucket privé `cards`, fonction SQL `open_booster()` (le tirage ne se
  fait JAMAIS dans le navigateur). Rôle admin attribuable uniquement depuis la base.
- Installation sans store : PC via le navigateur, Android « Installer l'application », iPhone Safari > Partager > « Sur l'écran d'accueil ».
- Mises à jour : service worker `vite-plugin-pwa` en mode « prompt » + version minimum requise stockée dans Supabase (`app_config`).

## Phases

- Phase 0 : audit et plan — faite.
- Phase 1 : fondations et mise en ligne — faite (en ligne le 2026-11-06).
- Phase 2 : Supabase (comptes, rôles, données) — en cours (schéma SQL dans `supabase/`, guide : `supabase/README.md`).
- Phase 3 : espace admin. Phase 4 : espace joueur. Phase 5 : versions et mises à jour. Phase 6 : vérifications et `GUIDE.md`.

## Décisions prises

- Révélation des cartes : effets visuels **simplifiés** en V0.1 (recodage prévu plus tard) ; ne pas ajouter de nouveaux effets.
- Boosters : le carrousel de 3 thèmes reste un choix purement esthétique ; tous tirent dans le même pool de cartes.
- `profiles` reçoit une colonne `avatar_id` (les avatars actuels sont conservés).
- Limite quotidienne : remise à zéro à minuit (heure de Paris), 3 boosters/jour par défaut, modifiable par l'admin (`app_config`).
- Suppression d'une carte : interdite si un joueur la possède (on la désactive à la place).
- Effets de cartes : registre `src/effects/` (index clé → composant) ne contenant que « aucun » ; ne rien coder de plus.
- « Version minimum requise » : confort d'utilisation, pas une sécurité (à renforcer côté `open_booster()` si besoin).
- L'outil de création des cartes (images JPEG) est un autre projet : il n'est pas intégré à l'appli.
- Icônes de l'appli (`public/icons/`) : provisoires (S sur dégradé), à remplacer par les vraies.
- Base de données (`supabase/migrations/`, appliquée à la main dans l'éditeur SQL de Supabase, dans l'ordre) :
  `profiles`, `cards` (+ `thumb_path`), `user_cards`, `booster_openings`, `app_config` (1 seule ligne ; probabilités en JSON, total = 100 %).
  `profiles.role` n'est modifiable que depuis la base (droit de colonne + déclencheur). Joueur : lit cartes actives + cartes possédées,
  sa collection, son profil. `app_config` : admin seulement ; les joueurs passent par les fonctions `get_min_version()` (aussi pour
  les visiteurs non connectés) et `get_booster_status()`. Collections modifiées uniquement par `open_booster(p_booster)`.
  Variante obligatoire pour Mythique (feu/bronze) et Secrète (argent/or), interdite ailleurs. Bucket privé `cards` (2 Mo, webp/png/jpeg).
- Tests de la base : `supabase/tests/securite.sql` (à lancer dans Supabase ; annule tout ce qu'il crée). Il a aussi été validé sur une
  base PostgreSQL locale (PGlite) hors du projet, y compris avec des failles volontaires pour vérifier qu'il les détecte.
- Le front lit `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (`.env` local, secrets GitHub) via `src/services/supabaseClient.ts`.

## Stack

Vite 8 + React 18 + TypeScript strict + CSS Modules. Polices auto-hébergées (@fontsource). PWA : vite-plugin-pwa.
Tests : Vitest (environnement `node`). Qualité : ESLint 9 + Prettier.

## Commandes

- `npm run dev` (ajouter `-- --host` pour tester sur téléphone ; `-- --port 3456` si le port 5173 est refusé sous Windows)
- `npm run build` · `npm run lint` · `npm test`
- `npm run preview -- --port 4173` : aperçu du site construit, avec le chemin de base (http://localhost:4173/swag-cartes-delaitere/)
- Avant chaque commit : build, lint et tests sans erreur ni warning. Commits en français, une étape = un commit.

## Conventions clés

- Commentaires, JSDoc et messages en français. Chaque fichier commence par un bloc d'en-tête (rôle, exports, dépendances).
- `domain/` = logique pure : aucun import de React ni du DOM. La logique va dans `domain/` et `hooks/`, jamais dans les composants.
- Aucune valeur magique : seuils, durées et réglages dans `src/config/`, données factices dans `src/data/`.
- Textes de l'accueil, du profil, du choix du booster et de la révélation : uniquement dans `src/content/textes.ts` (jamais en dur dans les composants). Avatars : liste dans `src/config/avatars.ts`, profil enregistré par `id`.
- Gestes : Pointer Events uniquement ; `touch-action: none` seulement sur les zones de geste ; chaque geste a une alternative bouton/clavier.
- Animations : `transform` et `opacity` uniquement.
- Navigation : tout passe par `transition()` dans `app/flowMachine.ts`.
- Révélation des cartes : séquence = machine à états pure `domain/revelation.ts` ; effets et couleurs par rareté dans `src/config/raretes.ts`, durées dans `src/config/revelation.ts` ; aucun `Math.random` dans les effets (calcul à partir du numéro).
- Boosters : un écran n'affiche un booster que via `<BoosterVisuel />` ; ajouter un booster = un thème dans `src/boosters/themes/` + une ligne dans `src/boosters/catalogue.ts`. Toute skin respecte le contrat de `src/boosters/skins/types.ts` (parties `haut` / `corps`).
- Composants courts (~150 lignes max). Stockage : toujours via l'interface `StorageService`.
- Collection de cartes (« Mes cartes ») : accès via l'interface `CollectionService` (`StorageService` ne gère que le profil) ; implémentation actuelle = fichiers locaux `public/cartes/` (git-ignorés) écrits par `tools/cartesPlugin.ts` (`npm run dev` uniquement, code `ADMIN_CODE` dans `.env.local`) ; elle sera remplacée par une implémentation Supabase (phases 2-3). Un visuel de carte ne s'affiche que via `<Carte />` (`components/Carte`). Réglages dans `config/cartes.ts`, logique pure dans `domain/cartes.ts`. Les fichiers atteints par `vite.config.ts` (`tools/`, `config/cartes.ts`, `config/deploiement.ts`, `domain/cartes.ts`, `types.ts`, `id.ts`) importent avec l'extension `.ts`.
- Pas de `crypto.randomUUID` (indisponible en HTTP sur le réseau local) : utiliser `domain/id.ts`.
- PWA : le chemin de base n'est appliqué qu'au `build` et à `preview` ; `dev` reste à la racine. Les visuels de cartes ne sont jamais précachés par le service worker.

Structure et « où modifier quoi » : `docs/ARCHITECTURE.md`. Installation et test sur téléphone : `README.md`.
