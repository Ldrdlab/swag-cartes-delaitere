# Architecture

## Principes

1. **La logique est séparée de la présentation.** Les règles (tirage, détection de gestes, index du
   carrousel, machine à états) vivent dans `domain/` et `app/flowMachine.ts`, en fonctions pures testables.
   Les hooks branchent ces fonctions sur React et sur les événements du navigateur ; les composants ne
   font que de l'affichage.
2. **`domain/` n'importe ni React ni le DOM.**
3. **Aucune valeur magique.** Tout seuil, durée ou réglage est dans `config/` ; les données factices
   sont dans `data/`.
4. **Un seul type d'entrée : les Pointer Events** (souris, doigt, stylet). `touch-action: none` n'est
   appliqué que sur les zones de geste (carrousel, booster à découper, pile de cartes).
5. **Chaque geste a une alternative** au clavier ou à un bouton.

## Dossiers

```
src/
├── main.tsx              Monte <App /> ; choisit l'implémentation de StorageService
├── app/
│   ├── App.tsx           Routeur d'écrans : affiche l'écran de l'état courant
│   ├── flowMachine.ts    Machine à états (PURE) : écrans, événements, fonction transition()
│   ├── flowMachine.test.ts
│   └── useFlow.ts        Branche transition() sur React (useReducer)
├── screens/              Un dossier par écran (index.tsx + CSS Module)
│   ├── Welcome/          Écran 1 — Accueil
│   ├── Profile/          Écran 2 — Profil (ProfileLayout, ProfileEditor, ProfileForm, ProfileResume)
│   ├── BoosterSelect/    Écran 3 — Carrousel de boosters
│   ├── BoosterConfirm/   Écran 4 — Confirmation
│   ├── BoosterOpening/   Écran 5 — Découpe du booster
│   └── CardReveal/       Écran 6 — Révélation + récapitulatif
├── components/           Button, ScreenLayout, Carousel, BoosterPlaceholder, CutTrail,
│                         CardPlaceholder, CardStack, CardGrid, FloatingCard (cartes décoratives de l'accueil),
│                         Icon (icônes en traits), AvatarButton (avatar rond), AvatarPicker (choix d'avatar)
├── content/
│   ├── textes.ts         TOUS les textes de l'accueil et du profil (autres écrans à venir)
│   └── formatTexte.ts    remplir() : insère le pseudo à la place de {pseudo} dans un texte
├── assets/
│   ├── images/welcome/cartes/   Photos optionnelles des cartes flottantes de l'accueil
│   ├── images/avatars/          Les images des avatars (5 exemples en SVG)
│   └── icons/                   Icônes en traits (crayon, croix), colorées par le CSS
├── hooks/
│   ├── useSwipe.ts            Tap / swipe (Pointer Events) + décalage en cours
│   ├── useCarousel.ts         Élément central d'un carrousel qui boucle
│   ├── useCutGesture.ts       Geste de découpe (Pointer Events) + trace
│   ├── cutFeedback.ts         Points d'accroche VIDES pour son et vibration
│   ├── useGlobalActivation.ts Touche clavier / clic « n'importe où »
│   ├── useAvatarSelection.ts  État du choix d'avatar (ouvrir, cocher, valider, fermer)
│   ├── useStorage.tsx         Fournit le StorageService aux composants (contexte)
│   └── useViewportHeight.ts   Suit la zone visible (clavier virtuel mobile)
├── domain/               Logique métier pure
│   ├── types.ts          Player, Booster, Card, Rarity
│   ├── carousel.ts       Index circulaire (wrapIndex, stepIndex, relativeOffset)
│   ├── swipe.ts          Classification tap / swipe / rien (classifyGesture)
│   ├── cutGesture.ts     Détecteur de découpe (startCut, moveCut, endCut)
│   ├── drawCards.ts      Tirage des cartes (aléatoire injectable)
│   ├── cardImport.ts     Validation / import d'un JSON de cartes externe
│   ├── avatarSelection.ts Choix d'avatar : fermer sans valider ne change pas l'avatar
│   ├── validatePseudo.ts Règles du pseudonyme
│   ├── player.ts         Lecture sûre d'un Player (parsePlayer)
│   └── id.ts             generateId() sans crypto.randomUUID
├── services/
│   ├── StorageService.ts       Interface (asynchrone)
│   └── LocalStorageService.ts  Implémentation localStorage
├── config/
│   ├── game.ts           Nombre de cartes, poids et libellés de rareté, taille de la pile
│   ├── gestures.ts       Seuils swipe/tap et découpe
│   ├── timings.ts        Durées des animations
│   ├── avatars.ts        Liste des avatars (id, nom, image) et avatar par défaut
│   ├── accueil.ts        Cartes flottantes de l'accueil (position, taille, couleur, photo) et durées
│   └── profile.ts        Longueur du pseudo, clé de sauvegarde
├── data/
│   ├── boosters.ts       Les boosters proposés (+ getBoosterAt)
│   └── cards.ts          Les cartes factices
└── styles/
    ├── tokens.css        Couleurs, polices, dégradés, espacements, dimensions
    └── reset.css         Remise à zéro, focus visible
```

## Flux des écrans

```
WELCOME → PROFILE → BOOSTER_SELECT → BOOSTER_CONFIRM → BOOSTER_OPENING → CARD_REVEAL
                       ↑______BACK_______|                                   |
BOOSTER_SELECT ←────────────── OPEN_ANOTHER ─────────────────────────────────┤
WELCOME ←──────────────────────── GO_HOME ──────────────────────────────────┘
```

Toutes les transitions passent par **une seule fonction** : `transition(state, event)` dans
`app/flowMachine.ts`. Un événement non autorisé depuis l'écran courant est ignoré.

| Événement        | De → vers                         | Déclenché par                                      |
| ---------------- | --------------------------------- | -------------------------------------------------- |
| `START`          | WELCOME → PROFILE                 | Tap / clic / Entrée / Espace                       |
| `PROFILE_DONE`   | PROFILE → BOOSTER_SELECT          | Profil validé et sauvegardé (ou repris)            |
| `BOOSTER_CHOSEN` | BOOSTER_SELECT → BOOSTER_CONFIRM  | Tap / Entrée sur le booster central                |
| `BACK`           | BOOSTER_CONFIRM → BOOSTER_SELECT  | Bouton « Retour » (le carrousel garde sa position) |
| `OPEN_CONFIRMED` | BOOSTER_CONFIRM → BOOSTER_OPENING | Bouton « Ouvrir ce booster »                       |
| `OPENING_DONE`   | BOOSTER_OPENING → CARD_REVEAL     | Découpe validée (le tirage est fait à ce moment)   |
| `OPEN_ANOTHER`   | CARD_REVEAL → BOOSTER_SELECT      | Bouton « Ouvrir un autre booster »                 |
| `GO_HOME`        | CARD_REVEAL → WELCOME             | Bouton « Accueil »                                 |

Si un profil existe déjà, l'écran Profil propose « Continuer en tant que… » ou « Modifier mon profil ».

## Les gestes

### Carrousel (écran 3) — `useSwipe` + `domain/swipe.ts`

1. `useSwipe` suit le pointeur (capture du pointeur) et expose le décalage horizontal en cours, pour que
   les boosters suivent le doigt.
2. Au relâchement, `classifyGesture` décide : **tap** (très peu de mouvement, bref), **swipe** (assez long,
   plutôt horizontal, assez rapide) ou **rien** (le carrousel revient en place).
3. Un geste qui a dépassé la tolérance du tap n'est jamais un tap : un swipe ne sélectionne donc jamais
   un booster par erreur.

### Découpe (écran 5) — `useCutGesture` + `domain/cutGesture.ts`

Règles : départ près d'un bord latéral dans la bande de découpe ; le pointeur doit rester dans la bande
verticale ; validation quand la distance parcourue atteint le seuil ; sortie de bande ou relâchement
précoce = annulation, la trace s'efface. Le sens est libre. `domain/cutGesture.ts` ne manipule que des
nombres (coordonnées relatives au booster) ; `useCutGesture` convertit les événements du pointeur.

Alternatives sans geste : bouton « Ouvrir » et touche Entrée.

Points d'accroche son/vibration : `hooks/cutFeedback.ts` (`onCutStart`, `onCutProgress`,
`onCutComplete`), volontairement vides.

## Personnaliser le visuel

Guide pour débutant : tout ce qu'on peut changer **sans toucher au code des composants**.
Après un changement, enregistre le fichier : la page ouverte dans le navigateur se met à jour toute seule.

### Les textes

| Je veux changer…                                          | Fichier                                    |
| --------------------------------------------------------- | ------------------------------------------ |
| Un texte de l'**accueil**                                 | `src/content/textes.ts`, section `accueil` |
| Un texte du **profil** (consigne, boutons, erreur…)       | `src/content/textes.ts`, section `profil`  |
| Les textes du **choix d'avatar** (titre, Valider, Fermer) | `src/content/textes.ts`, section `profil`  |

Modifie ce qui est **entre guillemets**, garde les guillemets et la virgule. Dans un texte, `{pseudo}`
est remplacé automatiquement par le pseudo du joueur : garde-le tel quel.
Si tu changes la longueur autorisée du pseudo (`src/config/profile.ts`), change aussi le texte
`erreurPseudo`, qui cite « 2 et 16 caractères ».

### Les avatars

Fichier à modifier : **`src/config/avatars.ts`** (la liste) et le dossier **`src/assets/images/avatars/`** (les images).

- **Remplacer un avatar par une photo** : prépare une image **carrée de 256 × 256 px**, au format
  **WebP**, de **moins de 30 Ko**. Dépose-la dans `src/assets/images/avatars/`. Dans `config/avatars.ts`,
  change le nom du fichier dans la ligne `import` de cet avatar (par exemple `'./avatar-01.svg'` devient
  `'./ma-photo.webp'`). Ne change pas son `id`.
- **Ajouter un avatar** : dépose son image dans le dossier, ajoute une ligne `import` en haut de
  `config/avatars.ts`, puis copie une ligne `{ id: …, nom: …, image: … },` de la liste et change ses trois
  valeurs. L'`id` doit être **unique** et ne plus changer ensuite (c'est lui qui est enregistré dans le
  profil du joueur). Le sélecteur affiche tout seul le nouvel avatar et passe à la ligne s'il y en a plus de 5.
- **Retirer un avatar** : efface sa ligne. Les joueurs qui l'avaient retrouvent l'avatar par défaut.
- **Changer l'avatar par défaut** : `ID_AVATAR_PAR_DEFAUT` dans le même fichier (l'`id` doit exister dans la liste).

Le champ `nom` n'est pas affiché : il sert aux lecteurs d'écran, qui ne peuvent pas décrire une image.

### Les couleurs, polices et animations

| Je veux changer…                                      | Fichier                                                |
| ----------------------------------------------------- | ------------------------------------------------------ |
| Une couleur, une police, un dégradé                   | `src/styles/tokens.css` (variables `--couleur-…`)      |
| Les cartes flottantes de l'accueil (position, photo…) | `src/config/accueil.ts`                                |
| La durée de l'ouverture de la fenêtre d'avatar        | `src/config/timings.ts` → `AVATAR_PICKER_OPEN_MS`      |
| Les icônes (crayon, croix)                            | `src/assets/icons/` (le SVG ; la couleur vient du CSS) |

## Où modifier quoi

| Je veux…                                                                      | Je modifie…                                                                                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Changer le **nombre de cartes** par booster                                   | `config/game.ts` → `CARDS_PER_BOOSTER`                                                                                  |
| Changer les **probabilités de rareté**                                        | `config/game.ts` → `RARITY_WEIGHTS`                                                                                     |
| Changer les **libellés de rareté**                                            | `config/game.ts` → `RARITY_LABELS`                                                                                      |
| Ajouter / retirer / renommer un **booster**                                   | `data/boosters.ts`                                                                                                      |
| Ajouter / modifier des **cartes**                                             | `data/cards.ts` (puis les inscrire dans `cardIds` de `data/boosters.ts`)                                                |
| Rendre le **swipe** plus ou moins sensible                                    | `config/gestures.ts` → `SWIPE_THRESHOLDS`                                                                               |
| Régler la **découpe** (position de la ligne, tolérance, distance à parcourir) | `config/gestures.ts` → `CUT_THRESHOLDS`                                                                                 |
| Changer la **durée des animations**                                           | `config/timings.ts`                                                                                                     |
| Changer la **longueur du pseudo**                                             | `config/profile.ts`                                                                                                     |
| Changer les **couleurs, espacements**                                         | `styles/tokens.css`                                                                                                     |
| Changer un **texte de l'accueil**                                             | `content/textes.ts` (section `accueil`)                                                                                 |
| Changer un **texte du profil** ou du choix d'avatar                           | `content/textes.ts` (section `profil`)                                                                                  |
| **Remplacer ou ajouter un avatar**                                            | `config/avatars.ts` + image dans `src/assets/images/avatars/` (démarche détaillée dans « Personnaliser le visuel »)     |
| Déplacer / ajouter / retirer une **carte flottante** de l'accueil             | `config/accueil.ts` → `CARTES_FLOTTANTES`                                                                               |
| Mettre une **photo** sur une carte flottante                                  | Copier la photo dans `src/assets/images/welcome/cartes/`, puis `image: 'nom.png'` dans `config/accueil.ts`              |
| Régler la **vitesse du flottement / de la pulsation** de l'accueil            | `config/accueil.ts` → `REGLAGES_ANIMATION`                                                                              |
| Changer le **nombre de cartes visibles** dans la pile                         | `config/game.ts` → `STACK_VISIBLE_CARDS`                                                                                |
| Modifier l'**ordre / les transitions des écrans**                             | `app/flowMachine.ts` (+ `app/App.tsx` pour l'affichage)                                                                 |
| Modifier l'**apparence d'un écran**                                           | `screens/<Écran>/index.tsx` et son `.module.css`                                                                        |
| Brancher un **backend** (profil partagé entre amis)                           | Écrire une autre implémentation de `StorageService` (`services/`), puis la passer à `<StorageProvider>` dans `main.tsx` |
| Ajouter du **son / de la vibration** à la découpe                             | `hooks/cutFeedback.ts`                                                                                                  |
| Ajouter la **sélection d'icône de profil**                                    | `screens/Profile/AvatarPlaceholder.tsx` (repérer le `TODO`) ; `iconId` existe déjà dans `Player`                        |
| Importer des cartes depuis un **fichier JSON externe**                        | `domain/cardImport.ts` → `importCards()` (écrite et testée, pas encore branchée à l'interface)                          |
| Remplacer les **placeholders** par de vraies images                           | `components/BoosterPlaceholder`, `components/CardPlaceholder` (`imageUrl` des cartes est déjà géré)                     |

## Tests

`npm test` lance Vitest (environnement `node`, donc uniquement de la logique pure) :

- machine à états : `app/flowMachine.test.ts` ;
- détection de la découpe : `domain/cutGesture.test.ts` ;
- logique d'index du carrousel : `domain/carousel.test.ts` ;
- tirage des cartes : `domain/drawCards.test.ts` ;
- et aussi : classification des gestes, validation du pseudo, import de cartes, génération d'identifiants,
  service de stockage, cohérence des données et des réglages.

Les hooks et composants (pointeurs, animations) ne sont pas couverts par des tests automatiques : ils sont
vérifiés à la main dans le navigateur et sur téléphone (voir la check-list du `README.md`).

## Points d'attention connus

- **Bouton « retour » du navigateur** : non géré. La navigation est interne (machine à états), l'URL ne change pas.
- **Clavier virtuel sur iOS** : `hooks/useViewportHeight.ts` suit la zone visible via `visualViewport`.
  Écrit pour Safari iOS mais à valider sur un vrai iPhone.
- **Tirage avec remise** : une même carte peut sortir deux fois dans un booster.
