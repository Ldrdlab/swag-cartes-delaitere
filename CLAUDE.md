# Booster Opening

Application web mobile-first d'ouverture de boosters de cartes entre amis (inspirée de Pokémon TCG Pocket).
Itération 1 : parcours complet fonctionnel, placeholders neutres, aucun graphisme définitif.

## Stack

Vite + React 18 + TypeScript strict + CSS Modules. Polices auto-hébergées (@fontsource). Tests : Vitest (environnement `node`). Qualité : ESLint 9 + Prettier.
Aucune dépendance sans validation préalable du porteur du projet.

## Commandes

- `npm run dev` (ajouter `-- --host` pour tester sur téléphone ; `-- --port 3456` si le port 5173 est refusé sous Windows)
- `npm run build` · `npm run lint` · `npm test`
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
- Pas de `crypto.randomUUID` (indisponible en HTTP sur le réseau local) : utiliser `domain/id.ts`.

Structure et « où modifier quoi » : `docs/ARCHITECTURE.md`. Installation et test sur téléphone : `README.md`.
