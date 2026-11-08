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
- Phase 2 : Supabase (comptes, rôles, données) — faite le 2026-11-07 (projet `gbaiedvbxtwmuphjmdxn`, schéma SQL dans `supabase/`, guide : `supabase/README.md`). Inscriptions publiques désactivées ; compte admin du porteur créé.
- Phase 3 : espace admin — faite et testée en réel le 2026-11-07 (connexion, onglets Cartes / Boosters / Joueurs / Version, registre d'effets ; ajout, modification, désactivation et suppression d'une carte vérifiés avec des cartes de test, ensuite supprimées).
- Phase 4 : espace joueur — faite et testée en réel le 2026-11-08 (onglets, accueil avec boosters du jour et compte à rebours, ouverture par le serveur, révélation simple + « Nouvelle ! », collection, Jouer, Installer, pseudo à la 1re connexion ; limite quotidienne vérifiée avec 3 boosters ouverts).
- Phase 5 : versions et mises à jour — code écrit et testé en navigateur le 2026-11-08 (bandeau de mise à jour, écran obligatoire, `npm run publier`, `CHANGELOG.md`) ; la première étiquette `v0.1.0` sera posée à la fin (`npm run publier -- actuelle`).
- **V0.1.5 — effets visuels des cartes selon leur rareté** (branche `v0.1.5`, `main` intact jusqu'à la validation finale) : phases 0 à 4 faites (audit, port des 8 effets, migration SQL 6, espace admin, effets côté joueur) ; phase 5 : documentation et test sur téléphone avant publication (`npm run telephone`, voir `GUIDE.md`) ; publiée en 0.1.5.
- **V0.2 — effets animés en continu et carte manipulable (souris et doigt)** (branche `v0.2`) : phases 0 à 3 faites (diagnostic, animation continue, gestes, réglages joueur) ; phase 4 : tests, documentation, test sur téléphone avant publication (`npm run telephone`, onglet Admin > Essai), puis fusion dans `main` et `npm run publier -- 0.2.0`. Aucun changement de base de données.
- Phase 6 : vérifications et `GUIDE.md` — faite le 2026-11-08 : audit du dépôt propre ; affichage mobile (375 px), tablette (768 px) et PC vérifié ; sécurité vérifiée EN RÉEL avec un compte joueur de test (ajout/modif/suppression de carte, rôle admin, collection à la main, réglages, liste des joueurs, dépôt d'image : tout refusé ; limite de 3 boosters refusée côté serveur au 4e appel) ; flux d'invitation et « mot de passe oublié » ajoutés ; `GUIDE.md` et `BILAN-V0.1.md` écrits ; étiquette `v0.1.0` posée avec `npm run publier -- actuelle`. Réglages Supabase à garder : Site URL = adresse du site, Redirect URLs = adresse du site + `**`, longueur minimale du mot de passe = 8.

## Décisions prises

- Révélation des cartes : effets visuels **simplifiés** en V0.1 (recodage prévu plus tard) ; ne pas ajouter de nouveaux effets.
- Boosters : le carrousel de 3 thèmes reste un choix purement esthétique ; tous tirent dans le même pool de cartes.
- `profiles` reçoit une colonne `avatar_id` (les avatars actuels sont conservés).
- Limite quotidienne : remise à zéro à minuit (heure de Paris), 3 boosters/jour par défaut, modifiable par l'admin (`app_config`).
- Suppression d'une carte : interdite si un joueur la possède (on la désactive à la place).
- Effets de cartes (V0.1.5) : l'image d'une carte reste une PHOTO FIXE sans effet incrusté (les cartes exportées de l'outil de création doivent l'être avec la finition « Aucun », y compris les raretés élevées) ; l'effet est une COUCHE ajoutée à l'affichage par `<EffetCarte />` (`src/effects/`), dans le seul composant `<Carte />`. Interdits : GIF ou vidéo par carte, effet dessiné dans l'image. Un effet = une « fiche » (`src/effects/fiches/`, fonction pure contexte → calques CSS, + dessin WebGL pour le feu) chargée À LA DEMANDE (`REGISTRE_EFFETS` dans `effects/index.ts`, import dynamique). Ils viennent de l'outil de création (« Visuel carte - V1 », dossier en LECTURE SEULE) : 8 effets portés — lustre (Peu commune), holo (Rare), prisme (Super rare), arc_en_ciel (Légendaire), feu et bronze (Mythique), argent et or (Secrète) ; les ~20 autres de V1 ne sont pas portés. Fidélité vérifiée automatiquement contre V1 (calques identiques, seule différence voulue : la bande de balayage d'Argent et Or est hors carte quand rien ne bouge). Crédits : `CREDITS.md`.
- Effets, décision d'un effet : base `cards.effect_override` (vide = AUTOMATIQUE : effet de la rareté ; `aucun` ; ou une clé) + `cards.effect_params` (JSON : intensity 0-100, zone, settings vitesse/densite) ; effet par défaut de chaque rareté (9 lignes) dans la table `rarity_effects` (admin seulement ; lue par les joueurs via `get_rarity_effects()`, chargée une fois par `hooks/useReglesEffets`). Fonction pure `resoudreEffet` (`domain/effetsCartes.ts`) : aucun > imposé (avec SES réglages) > automatique (réglages de la rareté, intensité de la carte prioritaire). L'ancienne colonne `cards.effect` est conservée, vide, pour les anciennes versions de l'appli. Migration 6 (`…000600_effets_des_cartes.sql`) : additive, version minimale inchangée ; le test de sécurité compte 76 vérifications.
- Effets, affichage (V0.2) : zones en pourcentages dans `config/effets.ts` (carte entière, intérieur du cadre, illustration encadrée, cadre). Les effets sont ANIMÉS EN CONTINU partout (grilles comprises) : un « pointeur virtuel » décrit une orbite lente (8 s par tour, rayon 0,20, soit ≈ 3,6° d'inclinaison ; phase tirée de l'identifiant de la carte, donc cartes décalées) et écrit `--effet-x/y` ; le CSS en déduit les reflets et l'inclinaison 3D (9° au bord, perspective 240 cqw, `Carte.module.css`). UNE SEULE horloge (`effects/socle/horloge.ts`, un seul `requestAnimationFrame`, aucune mise à jour React par image) pour les seules cartes visibles (IntersectionObserver + onglet visible), à 30 images/s en grille et pleine cadence en vue agrandie ; logique pure dans `domain/animationEffets.ts`. Modes de `<Carte modeEffet>` : `anime` (défaut : grilles, survol de la SOURIS seulement, jamais le doigt, rien n'est bloqué), `interactif` (vue agrandie, carte retournée : souris et doigt, `setPointerCapture`, `touch-action: none` sur la carte seulement, menu d'appui long supprimé, glissé > 8 px = le clic qui suit est annulé), `statique`. Retour doux de 0,5 s vers l'orbite à la fin du geste. Gyroscope RETIRÉ (le doigt suffit). Dessins WebGL (feu) : `effects/webgl/arbitre.ts` — carte agrandie ou retournée prioritaire et SEULE à animer, sinon les N plus proches du centre de l'écran (`WEBGL_ANIMES_MAX` : 2 en Élevée, 1 en Économie), les autres gardent leur dernière image ; un seul contexte WebGL partagé. Réglages joueur (écran Profil, mémorisés sur l'appareil, `effects/preferences.ts`) : « Qualité des effets » Auto / Élevée / Économie (Auto = Économie si ≤ 4 cœurs, peu de mémoire ou économie de données) et « Effets réduits » (qualité Économie, ni orbite ni inclinaison, effets figés, mais les reflets suivent encore la souris et le doigt) ; `prefers-reduced-motion` fait de même. Éclat de révélation sobre à partir de Légendaire : `REVELATION_EFFETS`. Emplacements vides de la collection : jamais d'effet. Page d'essai admin (onglet « Essai », `SectionEssaiEffets`) : compteur d'images par seconde, comparaison horloge JavaScript / CSS `@property` (même coût, mais le retour doux et la priorité du geste exigent JavaScript : horloge JS retenue), nombre de feux animés. Budget : effets à la demande ≈ 8 Ko gzip, textures 0 Ko.
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
- Migration 5 (`…000500_email_et_joueurs.sql`) : `profiles.email` (copié du compte, non modifiable par l'appli) et `admin_list_players()` (admin seulement). Le test de sécurité comptait alors 50 vérifications (76 depuis la migration 6, voir les décisions « Effets »).
- Phase 3 : l'ancien système local (plugin Vite `tools/`, `ADMIN_CODE`, `public/cartes` écrit en dev) est supprimé.
- Phase 4 : le tirage dans le navigateur est supprimé (`drawCards`, `config/game.ts`, `data/cards.ts`, mode `?forcer=`, `cardIds` des boosters) : TOUT tirage passe par `open_booster()` (`BoosterService`). Le pseudo et l'avatar sont dans `profiles` (`SupabaseStorageService` implémente `StorageService`). Navigation : onglets HOME / COLLECTION / JOUER / INSTALLER / ADMIN + parcours d'ouverture plein écran (`app/flowMachine.ts`). Révélation SIMPLE : `EFFETS_REVELATION_ACTIFS = false` dans `config/raretes.ts` (les effets complets sont gardés dans `RARETES_COMPLETES`). Collection du joueur : les images des cartes non obtenues ne sont jamais signées (emplacement vide). Désormais `<Carte />` est aussi le recto des cartes révélées.
- Comptes (phase 6) : un joueur invité par e-mail (ou qui clique sur un lien « mot de passe oublié ») arrive connecté par le lien et doit d'abord choisir son mot de passe (`screens/MotDePasse`, `AuthService.definirMotDePasse`) ; le lien est lu dans `services/lienAuth.ts` AVANT la création du client Supabase. Longueur minimale du mot de passe : `config/profile.ts` (8, à régler pareil dans Supabase). Méthode recommandée pour ajouter un ami : création directe avec mot de passe provisoire (voir `GUIDE.md`).
- Mises à jour (phase 5) : mode « prompt ». `app/pwa.ts` enregistre le service worker et cherche une nouvelle version à l'ouverture, au retour au premier plan et toutes les 30 min ; `app/miseAJour.ts` garde l'état (hors React) ; `components/BandeauMiseAJour` propose « Mettre à jour » / « Plus tard » avec les nouveautés lues dans `version.json` (produit à chaque construction par `vite.config.ts` à partir de `CHANGELOG.md`, jamais précaché). Écran bloquant `screens/MiseAJourObligatoire` quand `VERSION_APPLI` < `get_min_version()` (lue avant la connexion, `useVersionMinimale`) : son bouton supprime service worker et cache puis recharge. Une erreur réseau ne bloque jamais personne. `CHANGELOG.md` : tenir à jour sous « ## Non publié » à chaque changement visible des joueurs.
- Le front lit `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (`.env` local, secrets GitHub) via `src/services/supabaseClient.ts`.

## Stack

Vite 8 + React 18 + TypeScript strict + CSS Modules. Polices auto-hébergées (@fontsource). PWA : vite-plugin-pwa.
Tests : Vitest (environnement `node`). Qualité : ESLint 9 + Prettier.

## Commandes

- `npm run dev` (ajouter `-- --host` pour tester sur téléphone ; `-- --port 3456` si le port 5173 est refusé sous Windows)
- `npm run build` · `npm run lint` · `npm test`
- `npm run publier -- <correctif|mineur|majeur|x.y.z|actuelle> [--essai]` : publie une version (CHANGELOG, package.json, commit « Version x.y.z », étiquette `vx.y.z`, push ; déploiement automatique). Exige un dépôt propre sur `main` et des points sous « Non publié » dans `CHANGELOG.md`.
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
- Données : accès UNIQUEMENT via les interfaces `CollectionService`, `AdministrationService`, `AuthService`, `BoosterService` et `StorageService` (profil) ; implémentations Supabase branchées dans `main.tsx`. Un visuel de carte ne s'affiche que via `<Carte />` (`components/Carte`), qui pose aussi l'effet visuel de la carte (voir « Effets » dans Décisions prises ; réglages dans `config/effets.ts`, logique pure dans `domain/effetsCartes.ts`). Réglages dans `config/cartes.ts` et `config/reglages.ts`, logique pure dans `domain/cartes.ts`, `domain/reglages.ts`, `domain/version.ts`, conversions base ↔ appli dans `domain/cartesBase.ts` et `domain/administration.ts`. Le rôle lu dans le profil ne sert qu'à AFFICHER l'espace admin : la sécurité est dans la base. Erreurs Supabase : `services/erreurs.ts`. Le seul fichier atteint par `vite.config.ts` est `config/deploiement.ts` (import avec l'extension `.ts`) ; `domain/cartes.ts`, `types.ts` et `id.ts` gardent l'extension `.ts` dans leurs imports.
- Pas de `crypto.randomUUID` (indisponible en HTTP sur le réseau local) : utiliser `domain/id.ts`.
- PWA : le chemin de base n'est appliqué qu'au `build` et à `preview` ; `dev` reste à la racine. Les visuels de cartes ne sont jamais précachés par le service worker.

Structure et « où modifier quoi » : `docs/ARCHITECTURE.md`. Installation et test sur téléphone : `README.md`.
