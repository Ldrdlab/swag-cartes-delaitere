# Booster Opening

Application web mobile-first d'ouverture de boosters de cartes entre amis (inspirée du flux de Pokémon TCG Pocket).
Itération 1 : squelette fonctionnel, placeholders neutres, aucun graphisme définitif.

## Stack

Vite + React 18 + TypeScript strict + CSS Modules. Tests : Vitest. Qualité : ESLint 9 + Prettier.
Aucune dépendance sans validation préalable du porteur du projet.

## Commandes

- `npm run dev` (ajouter `-- --host` pour tester sur téléphone) · `npm run build` · `npm run lint` · `npm test`
- Avant chaque commit : build, lint et tests doivent passer sans erreur ni warning.

## Conventions clés

- Commentaires, JSDoc et messages de commit en français. Bloc d'en-tête dans chaque fichier (rôle, exports, dépendances).
- `domain/` = logique pure : aucun import de React ni du DOM.
- Aucune valeur magique : seuils, durées et réglages vivent dans `src/config/`, données factices dans `src/data/`.
- Gestes : Pointer Events uniquement ; `touch-action: none` seulement sur les zones de geste.
- Animations : `transform` et `opacity` uniquement. Chaque geste a une alternative bouton/clavier.
- Composants courts (~150 lignes max) ; logique dans `hooks/` et `domain/`.

Voir `docs/ARCHITECTURE.md` pour la structure et « où modifier quoi ».
