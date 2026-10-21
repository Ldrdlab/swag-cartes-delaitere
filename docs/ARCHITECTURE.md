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
├── components/           Button, ScreenLayout, Carousel, CutTrail,
│                         CardPlaceholder, CardStack, CardGrid, FloatingCard (cartes décoratives de l'accueil),
│                         Icon (icônes en traits), AvatarButton (avatar rond), AvatarPicker (choix d'avatar)
├── content/
│   ├── textes.ts         TOUS les textes de l'accueil, du profil et du choix du booster
│   └── formatTexte.ts    remplir() : insère le pseudo à la place de {pseudo} dans un texte
├── assets/
│   ├── images/welcome/cartes/   Photos optionnelles des cartes flottantes de l'accueil
│   ├── images/avatars/          Les images des avatars (5 exemples en SVG)
│   ├── images/boosters/<id>/    Illustrations des boosters à skin « image » (paquet.webp, haut.webp…)
│   └── icons/                   Icônes en traits (chevron, crayon, croix), colorées par le CSS
├── boosters/             TOUT ce qui concerne l'apparence des boosters (voir « Créer un nouveau booster »)
│   ├── catalogue.ts      LA liste des boosters (seul fichier à toucher pour en ajouter / retirer un)
│   ├── BoosterVisuel.tsx LE composant d'affichage d'un booster, utilisé par tous les écrans
│   ├── taille.ts         ajusterBooster() : plus grande taille sans déformer (172 : 320)
│   ├── themes/           Un fichier par booster : couleurs, textes du paquet, illustration, effets
│   ├── skins/            Les modèles de rendu : types.ts (contrat), registre.ts, standard/, image/,
│   │                     exemple-ultra/ (modèle commenté), Fenetre.tsx, imagesBoosters.ts
│   └── effets/           Foil, sertis, reflet au sol (CSS Modules + petits composants)
├── hooks/
│   ├── useSwipe.ts            Tap / swipe (Pointer Events) + décalage en cours
│   ├── useCarousel.ts         Élément central d'un carrousel qui boucle
│   ├── useCutGesture.ts       Geste de découpe (Pointer Events) + trace
│   ├── cutFeedback.ts         Points d'accroche VIDES pour son et vibration
│   ├── useGlobalActivation.ts Touche clavier / clic « n'importe où »
│   ├── useAvatarSelection.ts  État du choix d'avatar (ouvrir, cocher, valider, fermer)
│   ├── useElementSize.ts      Mesure un élément (place disponible pour un booster…)
│   ├── useInclinaison.ts      Inclinaison 3D : souris ou orientation du téléphone
│   ├── useStorage.tsx         Fournit le StorageService aux composants (contexte)
│   └── useViewportHeight.ts   Suit la zone visible (clavier virtuel mobile)
├── domain/               Logique métier pure
│   ├── types.ts          Player, Booster, Card, Rarity
│   ├── carousel.ts       Index circulaire et positions du carrousel (carouselPositions)
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
│   ├── boosters.ts       Taille de référence d'un booster (172 × 320, haut de 60) et géométrie du carrousel
│   ├── avatars.ts        Liste des avatars (id, nom, image) et avatar par défaut
│   ├── accueil.ts        Cartes flottantes de l'accueil (position, taille, couleur, photo) et durées
│   └── profile.ts        Longueur du pseudo, clé de sauvegarde
├── data/
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

## Créer un nouveau booster

Tout ce qui concerne l'apparence des boosters vit dans `src/boosters/`. Les écrans n'affichent un booster
qu'à travers `<BoosterVisuel />` : **on n'a jamais besoin de toucher au carrousel ni aux écrans.**

Trois notions :

- un **thème** (`boosters/themes/*.ts`) : les VALEURS d'un booster — couleurs, textes du paquet,
  illustration, effets. Aucun code ;
- une **skin** (`boosters/skins/*/`) : un MODÈLE de dessin, capable de dessiner n'importe quel thème ;
- le **catalogue** (`boosters/catalogue.ts`) : la liste des boosters du jeu, chacun = un thème + une skin +
  ses cartes.

### 1. Un booster dessiné en CSS (skin « standard »)

C'est le cas le plus simple : aucune image, tout est généré à partir des couleurs du thème.

1. Dans `src/boosters/themes/`, copie `apero-soleil.ts` et renomme la copie (ex. `ma-soiree.ts`).
2. Dans la copie :
   - change le nom de l'export : `export const aperoSoleil` devient `export const maSoiree` ;
   - change `id` (unique, en minuscules avec des tirets : `'ma-soiree'`), `nom`, `ligne1` et `ligne2`
     (EN MAJUSCULES), `saison` et `code` ;
   - change les cinq `couleurs` (début et fin du paquet, sertis, ombre, lueur du titre) ;
   - change l'`illustration` : une liste de dégradés CSS, le premier au-dessus, le dernier au fond. Les
     tailles en `calc(N * var(--u))` suivent la taille du booster (N = pixels du paquet de référence
     172 × 320). Le plus simple est de partir d'un thème existant et de changer ses couleurs ;
   - règle les `effets` : `foil` (true/false), `foilIntensite` (0 à 1), `foilCouleur`, `sertis`, `reflet`.
3. Dans `src/boosters/catalogue.ts` :
   - ajoute en haut : `import { maSoiree } from './themes/ma-soiree';` ;
   - dans `CATALOGUE`, copie un bloc `{ theme: …, skin: 'standard', cardIds: [ … ] },` et mets
     `theme: maSoiree` et la liste de ses cartes (leurs `id` sont dans `src/data/cards.ts`).
4. Lance `npm test` : un test vérifie que chaque booster pointe vers une skin existante, que les `id`
   sont uniques et que les cartes existent.

Le carrousel accepte n'importe quel nombre de boosters ; l'ordre du catalogue est l'ordre du carrousel.

### 2. Un booster avec une illustration (skin « image »)

Pour un paquet entièrement dessiné (logiciel de dessin, illustration…).

1. Crée le thème comme ci-dessus (étapes 1 et 2). Les couleurs servent encore à l'ombre, au reflet au
   sol et au paquet de secours ; l'`illustration` CSS n'est pas utilisée par cette skin.
2. Prépare l'image du paquet entier : **344 × 640 px** (le double de 172 × 320), au format **WebP**, de
   **moins de 120 Ko**. Nomme-la `paquet.webp`.
3. Crée le dossier `src/assets/images/boosters/<id-du-thème>/` (ex. `.../boosters/ma-soiree/`) et mets-y
   `paquet.webp`.
4. (Facultatif) Ajoute `haut.webp` (344 × 120 px) : la bande du haut, celle qui se découpe à l'ouverture.
   Sans lui, c'est le haut de `paquet.webp` qui est utilisé.
5. Dans le catalogue, mets `skin: 'image'` pour ce booster.

Les 120 premiers pixels de l'image (sur 640) forment la partie qui se découpe : n'y place rien
d'important qui serait coupé en deux. Le foil et le reflet au sol s'ajoutent par-dessus, réglés par les
`effets` du thème. Si l'image est introuvable, un paquet aux couleurs du thème affiche le chemin attendu.

### 3. Une nouvelle skin avancée

Pour un rendu impossible avec les deux skins existantes (calques animés, effets spéciaux…).

1. Copie le dossier `src/boosters/skins/exemple-ultra/` et renomme-le (ex. `skins/scintillant/`). Ce
   modèle commenté montre des calques d'images en profondeur, une inclinaison 3D (souris, ou orientation
   du téléphone si l'utilisateur l'autorise) et des paillettes.
2. Ajoute le nom de la skin dans le type `NomSkin` de `skins/types.ts`, puis une ligne dans
   `skins/registre.ts` qui associe ce nom à ton composant.
3. Respecte le **contrat** décrit en tête de `skins/types.ts` :
   - la skin remplit son parent et mesure tout en `calc(N * var(--u))` ;
   - elle sait dessiner `partie = 'haut'` (60 unités), `'corps'` (260 unités) ou `'complet'` — le plus
     simple est de dessiner le paquet entier et de l'envelopper dans `<Fenetre partie={partie}>` ;
   - elle n'anime que `transform` et `opacity`, et seulement si `etat` vaut `'centre'` ou
     `'confirmation'` (rien ne tourne pour les boosters latéraux) ;
   - elle ne gère ni le foil ni le reflet au sol : `BoosterVisuel` les ajoute selon le thème.
4. Pour ses images, ajoute `calques: [{ fichier: 'fond', profondeur: 0 }, …]` au thème et dépose les
   fichiers dans `src/assets/images/boosters/<id>/`.
5. Dans le catalogue, mets `skin: 'scintillant'` pour le booster voulu, puis lance `npm test`.

### Où régler quoi pour les boosters

| Je veux changer…                                               | Fichier                                          |
| -------------------------------------------------------------- | ------------------------------------------------ |
| Les couleurs, textes, illustration, effets d'un booster        | son thème dans `src/boosters/themes/`            |
| Quels boosters existent, leur ordre, leurs cartes, leur skin   | `src/boosters/catalogue.ts`                      |
| La place des boosters latéraux (décalage, abaissement, taille) | `src/config/boosters.ts` → `GEOMETRIE_CARROUSEL` |
| La durée de rotation du carrousel et du balayage du foil       | `src/config/timings.ts`                          |
| L'aspect du foil, des sertis, du reflet au sol (pour tous)     | `src/boosters/effets/`                           |

## Où modifier quoi

| Je veux…                                                                      | Je modifie…                                                                                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Changer le **nombre de cartes** par booster                                   | `config/game.ts` → `CARDS_PER_BOOSTER`                                                                                  |
| Changer les **probabilités de rareté**                                        | `config/game.ts` → `RARITY_WEIGHTS`                                                                                     |
| Changer les **libellés de rareté**                                            | `config/game.ts` → `RARITY_LABELS`                                                                                      |
| Ajouter / retirer / renommer un **booster**                                   | `boosters/catalogue.ts` + un thème dans `boosters/themes/` (voir « Créer un nouveau booster »)                          |
| Ajouter / modifier des **cartes**                                             | `data/cards.ts` (puis les inscrire dans `cardIds` de `boosters/catalogue.ts`)                                           |
| Changer la **position des boosters latéraux** du carrousel                    | `config/boosters.ts` → `GEOMETRIE_CARROUSEL`                                                                            |
| Changer un **texte de l'écran de choix** (« Choisis un booster. »…)           | `content/textes.ts` (section `choixBooster`)                                                                            |
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
| Importer des cartes depuis un **fichier JSON externe**                        | `domain/cardImport.ts` → `importCards()` (écrite et testée, pas encore branchée à l'interface)                          |
| Remplacer les **cartes placeholder** par de vraies images                     | `components/CardPlaceholder` (`imageUrl` des cartes est déjà géré)                                                      |

## Tests

`npm test` lance Vitest (environnement `node`, donc uniquement de la logique pure) :

- machine à états : `app/flowMachine.test.ts` ;
- détection de la découpe : `domain/cutGesture.test.ts` ;
- logique d'index et positions du carrousel (avec 3 puis 5 boosters) : `domain/carousel.test.ts` ;
- catalogue des boosters (chaque booster pointe vers une skin existante, cartes valides) et taille
  d'un booster : `boosters/boosters.test.ts` ;
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
