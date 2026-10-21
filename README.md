# Booster Opening

Application web d'ouverture de boosters de cartes à jouer entre amis, inspirée du flux de
Pokémon TCG Pocket : choix d'un booster, découpe du haut du paquet d'un geste, révélation des cartes.

**Itération 1 : squelette fonctionnel.** Tout le parcours est jouable de bout en bout, mais avec des
placeholders neutres (rectangles gris, libellés texte). Pas de graphismes définitifs, de son, de
vibration, de backend ni de multijoueur.

## Parcours

Accueil → Profil → Choix du booster → Confirmation → Ouverture (découpe) → Révélation des cartes
→ « Ouvrir un autre booster » (retour au choix) ou « Accueil ».

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
├── screens/     Un dossier par écran (Welcome, Profile, BoosterSelect, BoosterConfirm, BoosterOpening, CardReveal)
├── boosters/    Apparence des boosters : catalogue, thèmes, skins, effets, BoosterVisuel
├── components/  Composants réutilisables (Button, ScreenLayout, Carousel, CardStack...)
├── hooks/       Logique React réutilisable (gestes, carrousel, stockage)
├── domain/      Logique métier pure, sans React ni DOM (types, tirage, détection de gestes...)
├── services/    StorageService (interface) et ses implémentations
├── config/      Tous les seuils, durées et réglages
├── data/        Données factices : boosters et cartes
└── styles/      Variables CSS globales et reset
docs/ARCHITECTURE.md   Détail de l'architecture et « où modifier quoi »
```

Pour savoir **où intervenir** (changer le nombre de cartes, la sensibilité des gestes, les boosters...),
voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Stack

Vite · React 18 · TypeScript (mode strict) · CSS Modules · Vitest · ESLint · Prettier.
Dépendances d'exécution : React et les polices auto-hébergées @fontsource (Lilita One, Nunito).
