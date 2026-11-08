# Booster Opening

Application web d'ouverture de boosters de cartes à jouer entre amis, inspirée du flux de
Pokémon TCG Pocket : choix d'un booster, découpe du haut du paquet d'un geste, révélation des cartes.

**Itération 1 : squelette fonctionnel.** Tout le parcours est jouable de bout en bout, mais avec des
placeholders neutres (rectangles gris, libellés texte). Pas de graphismes définitifs, de son, de
vibration, de backend ni de multijoueur.

## Parcours

Connexion → (choix du pseudo à la première visite) → **Accueil** → Choix du booster → Confirmation →
Ouverture (découpe) → Révélation des cartes → « Ouvrir un autre booster » ou « Accueil ».

La barre d'onglets (en bas sur téléphone, à gauche sur ordinateur) donne accès à : **Accueil** (boosters
restants aujourd'hui, temps avant le prochain, bouton « Ouvrir un booster »), **Collection** (cartes
obtenues, emplacements vides grisés, quantités, progression X / Y, filtre par rareté, vue agrandie),
**Jouer** (« Bientôt disponible »), **Installer** (comment installer l'appli sur Android, iPhone et
ordinateur) et, pour les administrateurs, **Admin**.

Avant tout, on se **connecte** (e-mail + mot de passe : les comptes sont créés par l'administrateur, voir
`supabase/README.md`). Un administrateur voit en plus l'onglet **Admin**
(cartes, boosters, joueurs, version ; voir « Espace administrateur » plus bas).

**Limite quotidienne.** Chaque joueur peut ouvrir un nombre limité de boosters par jour (3 par défaut,
réglable par l'admin). Le compteur se remet à zéro à minuit, heure de Paris. Le tirage des cartes est fait
par le serveur : impossible de tricher depuis le navigateur.

## Prérequis

- Node.js 22.12 ou plus récent (développé avec Node 24) et npm. Cette version est exigée par Vitest ;
  Vite seul accepterait Node 20.19.

## Installation et lancement

```bash
npm install
```

```bash
npm run dev
```

L'application s'ouvre sur l'adresse affichée par Vite (en général `http://localhost:5173`).

> **Windows :** si Vite répond `EACCES: permission denied` sur le port 5173, ce port est réservé par
> le système. Choisissez-en un autre : `npm run dev -- --port 3456`.

## Commandes

| Commande             | Rôle                                             |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Serveur de développement (rechargement à chaud)  |
| `npm run build`      | Vérification TypeScript puis build de production |
| `npm run preview`    | Sert le build de production                      |
| `npm run lint`       | ESLint (aucun warning toléré)                    |
| `npm run format`     | Formate tout le code avec Prettier               |
| `npm test`           | Tests unitaires Vitest (une exécution)           |
| `npm run test:watch` | Tests en mode surveillance                       |

## Espace administrateur : cartes, boosters, joueurs, version

Les comptes, les cartes et leurs images sont dans **Supabase** (voir `supabase/README.md` pour la mise en
place : projet, clés, fichiers SQL, premier compte admin). L'appli lit l'URL et la clé publique du projet
dans le fichier `.env` (modèle : `.env.example`).

Un compte dont le rôle est **admin** voit le bouton **Administration** sur l'accueil, avec quatre onglets :

- **Cartes** : ajout de plusieurs visuels (choix de fichiers ou glisser-déposer ; PNG, JPG ou WebP), galerie
  avec recherche, filtre par rareté et compteurs, fiche d'une carte (nom, rareté, variante, effet,
  active oui/non) avec Modifier / Désactiver / Supprimer. Une image qui n'a pas les proportions d'une
  carte (744 × 1040, ≈ 5:7) est signalée ; elle n'est jamais déformée.
- **Boosters** : nombre de cartes par booster, boosters par joueur et par jour, probabilité de chaque
  rareté (le total doit faire 100 %), bouton « Valeurs par défaut ».
- **Joueurs** : liste des joueurs avec leur nombre de cartes (lecture seule).
- **Version** : version en ligne et « version minimum requise ».

**Pourquoi un joueur ne peut-il rien modifier ?** Le bouton n'est qu'un confort : toutes les actions sont
vérifiées par la **base de données** (règles de sécurité « RLS »). Même en bricolant l'appli, un joueur est
refusé. Le rôle admin ne peut être donné que depuis l'éditeur SQL de Supabase.

**Les images des cartes** (photos d'amis) sont dans un stockage **privé** : jamais dans le dépôt GitHub,
visibles seulement par les utilisateurs connectés.

## Versions et mises à jour

La version de l'appli est dans `package.json` (format `majeur.mineur.correctif`, ex. `0.1.0`). Elle est affichée
sur l'accueil et dans Admin > Version. Les nouveautés de chaque version sont dans `CHANGELOG.md`, en français simple.

**Ce que voient les joueurs :**

- Quand une nouvelle version est publiée, l'appli la détecte toute seule (à l'ouverture, au retour au premier plan
  et toutes les 30 minutes) et affiche un bandeau **« Nouvelle version disponible »** avec les nouveautés et deux
  boutons : **Mettre à jour** (installe et recharge) ou **Plus tard** (le bandeau revient au prochain lancement).
- Si la version du joueur est plus ancienne que la **version minimum requise** (réglée dans Admin > Version),
  un écran bloquant **« Mise à jour obligatoire »** remplace toute l'appli, avec un seul bouton.
  C'est un confort d'utilisation, pas une sécurité : les données restent protégées par la base.

**Publier une nouvelle version :**

1. Note les changements pour les joueurs dans `CHANGELOG.md`, sous `## Non publié` : un point par ligne
   (`- Ce qui change.`). Fais un commit de tout le reste (`git status` doit être propre).
2. Lance **une** commande :

   ```bash
   npm run publier -- mineur
   ```

   Remplace `mineur` par `correctif` (petite correction : 0.1.0 → 0.1.1), `mineur` (nouveautés : 0.1.0 → 0.2.0),
   `majeur` (grosse étape : 0.1.0 → 1.0.0) ou un numéro précis (`0.3.0`). Pour publier la toute première version déjà
   inscrite dans `package.json` sans changer le numéro : `npm run publier -- actuelle`.

3. La commande vérifie tout (lint, tests, construction), met à jour `package.json` et `CHANGELOG.md`, fait le commit
   « Version x.y.z », pose l'étiquette Git `vx.y.z` et envoie le tout sur GitHub. **Le déploiement est ensuite
   automatique** (1 à 2 minutes : onglet « Actions » du dépôt).

Pour voir ce qui se passerait sans rien modifier : ajoute `--essai` (ex. `npm run publier -- mineur --essai`).

**Obliger tout le monde à mettre à jour :** une fois la nouvelle version en ligne, règle la « version minimum requise »
dans Admin > Version sur ce nouveau numéro. Ne la monte **jamais** au-dessus de la version en ligne : tout le monde,
toi compris, serait bloqué (l'écran admin te prévient). En cas de blocage, remets-la depuis l'éditeur SQL de Supabase :
`update public.app_config set min_version = '0.1.0';`

## Tester sur téléphone (réseau local)

1. Le téléphone et l'ordinateur doivent être sur le **même réseau Wi-Fi**.
2. Lancez le serveur en l'ouvrant au réseau :

   ```bash
   npm run dev -- --host
   ```

3. Vite affiche une ligne `Network: http://192.168.x.x:5173/`. Ouvrez cette adresse dans le navigateur
   du téléphone (Chrome Android ou Safari iOS).
4. Si la page ne s'ouvre pas : le pare-feu Windows bloque probablement Node.js. Autorisez-le pour les
   **réseaux privés** (fenêtre qui s'affiche au premier lancement, ou Paramètres Windows → Pare-feu).

Remarques :

- La page est servie en HTTP simple (pas HTTPS). L'application n'utilise aucune API réservée aux
  contextes sécurisés (par exemple `crypto.randomUUID`), donc tout fonctionne ainsi.
- Pour fermer le serveur : `Ctrl + C` dans le terminal.

### Check-list de test sur téléphone

- [ ] Accueil : un tap n'importe où démarre.
- [ ] Profil : le clavier virtuel ne masque pas le bouton OK ; un pseudo de moins de 2 caractères est refusé.
- [ ] Carrousel : le swipe fait tourner, un swipe court ou lent revient en place, jamais de sélection par erreur.
- [ ] Carrousel : un tap sur un booster latéral le ramène au centre ; un tap sur le central ouvre la confirmation.
- [ ] Découpe : tracer une ligne le long des pointillés, d'un bord à l'autre, ouvre le booster ; la page ne défile pas et ne zoome pas.
- [ ] Découpe : relâcher trop tôt ou sortir de la bande efface la trace.
- [ ] Révélation : tap ou swipe passe à la carte suivante, puis le récapitulatif s'affiche.

## Structure du projet

```
src/
├── app/         Point d'entrée de l'application : routeur d'écrans, machine à états du parcours
├── screens/     Un dossier par écran (Welcome, Profile, BoosterSelect, BoosterConfirm, BoosterOpening, CardReveal, Login, Admin)
├── boosters/    Apparence des boosters : catalogue, thèmes, skins, effets, BoosterVisuel
├── components/  Composants réutilisables (Button, ScreenLayout, Carousel, CardStack...)
├── hooks/       Logique React réutilisable (gestes, carrousel, stockage)
├── domain/      Logique métier pure, sans React ni DOM (types, tirage, détection de gestes...)
├── services/    StorageService et CollectionService (interfaces), leurs implémentations, optimisation d'images
├── config/      Tous les seuils, durées et réglages
├── data/        Données factices : boosters et cartes
└── styles/      Variables CSS globales et reset
supabase/     Base de données : migrations SQL, test de sécurité, guide pas à pas (supabase/README.md)
public/icons/ Icônes de l'appli installée (provisoires)
docs/ARCHITECTURE.md   Détail de l'architecture et « où modifier quoi »
```

Pour savoir **où intervenir** (changer le nombre de cartes, la sensibilité des gestes, les boosters...),
voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Stack

Vite · React 18 · TypeScript (mode strict) · CSS Modules · Vitest · ESLint · Prettier.
Dépendances d'exécution : React et les polices auto-hébergées @fontsource (Lilita One, Nunito).
