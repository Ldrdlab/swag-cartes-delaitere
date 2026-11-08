# Guide de SWAG — Cartes Délaitère

Ce guide est écrit pour quelqu'un qui débute. Chaque partie dit **quoi faire, dans quel ordre**, et **quoi vérifier**.
En cas de doute, lis d'abord la partie « Quand quelque chose ne marche pas » tout en bas.

**Les adresses à connaître**

| Quoi               | Où                                               |
| ------------------ | ------------------------------------------------ |
| Le site de l'appli | https://ldrdlab.github.io/swag-cartes-delaitere/ |
| Le code (GitHub)   | https://github.com/Ldrdlab/swag-cartes-delaitere |
| La base de données | https://supabase.com/dashboard (projet `swag`)   |
| Les déploiements   | Dépôt GitHub > onglet **Actions**                |

**Comment tout fonctionne, en une phrase :** le code est sur GitHub ; à chaque envoi, GitHub construit l'appli et la
publie (GitHub Pages) ; les comptes, les cartes et les images sont dans Supabase.

---

## 1. Lancer l'appli sur ton ordinateur

À faire **une seule fois** par ordinateur :

1. Installe **Node.js** (version « LTS », 22 ou plus) : https://nodejs.org
2. Installe **Git** : https://git-scm.com
3. Récupère le projet (dans un dossier de ton choix) :

   ```bash
   git clone https://github.com/Ldrdlab/swag-cartes-delaitere.git
   ```

   Si tu as déjà le dossier du projet sur ton PC, saute cette étape.

4. Dans le dossier du projet, installe les outils :

   ```bash
   npm install
   ```

5. Crée le fichier `.env` : copie `.env.example` sous le nom `.env`, puis remplis les deux lignes
   (adresse et clé **publique** de ton projet Supabase : voir `supabase/README.md`, partie 2).
   **Ce fichier ne part jamais sur GitHub** : c'est voulu.

À faire **à chaque fois** que tu veux voir l'appli :

```bash
npm run dev
```

Ouvre l'adresse affichée (souvent http://localhost:5173). Pour arrêter : `Ctrl + C` dans le terminal.

> **Sous Windows**, si le port 5173 est refusé (`EACCES`), lance `npm run dev -- --port 3456`.

**Essayer sur ton téléphone** (même Wi-Fi que l'ordinateur) : `npm run dev -- --host`, puis ouvre sur le téléphone
l'adresse « Network » affichée. (Attention : Supabase n'accepte la connexion que depuis les adresses autorisées ;
sur le téléphone, le plus simple est de tester le vrai site en ligne.)

**Les commandes utiles**

| Commande          | Ce qu'elle fait                                         |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | Lance l'appli pour travailler dessus                    |
| `npm test`        | Lance les tests automatiques (tout doit passer)         |
| `npm run lint`    | Vérifie la qualité du code (aucun avertissement permis) |
| `npm run build`   | Construit l'appli comme pour la mise en ligne           |
| `npm run publier` | Publie une nouvelle version (voir la partie 2)          |

---

## 2. Publier une nouvelle version

Chaque fois que tu changes quelque chose que les joueurs verront (une nouveauté, une correction) :

1. **Écris-le dans `CHANGELOG.md`**, sous le titre `## Non publié`, un point par ligne, en français simple :

   ```
   ## Non publié

   - Les cartes Légendaires ont maintenant un cadre doré.
   ```

2. **Enregistre tes changements dans Git** (`git add .` puis `git commit -m "Ce que j'ai changé"`).
   Pour publier, `git status` doit dire « nothing to commit » (rien à enregistrer).
3. **Lance la commande de publication** :

   ```bash
   npm run publier -- mineur
   ```

   Choisis le mot qui convient :

   | Mot         | Quand                   | Exemple de numéro |
   | ----------- | ----------------------- | ----------------- |
   | `correctif` | Petite correction       | 0.1.0 → 0.1.1     |
   | `mineur`    | Nouveautés              | 0.1.0 → 0.2.0     |
   | `majeur`    | Grande étape            | 0.1.0 → 1.0.0     |
   | `0.3.0`     | Numéro choisi à la main | —                 |

   Pour **voir ce qui se passerait sans rien faire**, ajoute `--essai` (`npm run publier -- mineur --essai`).

4. La commande vérifie tout (qualité, tests, construction), range le `CHANGELOG.md`, met à jour le numéro de version,
   pose l'étiquette `vx.y.z` dans Git et envoie le tout sur GitHub. Si quelque chose ne va pas, **elle s'arrête avant
   de publier** et te dit quoi corriger.
5. **Attends 1 à 2 minutes** : GitHub met le site à jour tout seul (onglet **Actions** du dépôt : une coche verte = fini).
6. Les joueurs voient alors un bandeau **« Nouvelle version disponible »** avec les nouveautés. Ils choisissent
   « Mettre à jour » ou « Plus tard ».

**Obliger tout le monde à se mettre à jour** (par exemple après une correction importante) : une fois la nouvelle version
en ligne, va dans l'appli > **Admin > Version** et mets la « version minimum requise » sur ce nouveau numéro. Les joueurs
qui ont une version plus ancienne voient un écran « Mise à jour obligatoire ».

> ⚠️ **Ne mets jamais la version minimum plus haut que la version en ligne** : plus personne ne pourrait entrer, toi
> compris. Si ça arrive : dans Supabase > **SQL Editor**, lance
> `update public.app_config set min_version = '0.1.0';` (avec le bon numéro).

---

## 3. Ajouter un ami

Tu peux choisir entre deux méthodes. **La méthode A est la plus simple.**

### Méthode A : tu crées son compte avec un mot de passe provisoire (recommandée)

1. Supabase > **Authentication > Users > Add user > Create new user**.
2. Écris son **e-mail** et un **mot de passe provisoire**, et **coche « Auto Confirm User »**.
3. Donne-lui l'adresse du site, son e-mail et ce mot de passe. À sa première connexion, il choisit son **avatar et son pseudo**.

### Méthode B : tu l'invites par e-mail

1. Supabase > **Authentication > Users > Add user > Send invitation**, avec son e-mail.
2. Il reçoit un e-mail. En cliquant sur le lien, il arrive sur l'appli et choisit **son mot de passe**, puis son avatar et
   son pseudo.

À savoir pour la méthode B :

- Dans Supabase > **Authentication > URL Configuration**, **Site URL** doit être
  `https://ldrdlab.github.io/swag-cartes-delaitere/` et la liste **Redirect URLs** doit contenir
  `https://ldrdlab.github.io/swag-cartes-delaitere/**`. Sans ça, le lien de l'e-mail ne mène pas au bon endroit.
- L'offre gratuite de Supabase envoie **très peu d'e-mails par heure** (2 ou 3). Pour inviter beaucoup d'amis d'un coup,
  utilise la méthode A.
- Le lien d'invitation expire (quelques heures). S'il est périmé, renvoie une invitation.
- Dans Supabase > **Authentication > Sign In / Providers > Email**, règle **Minimum password length** sur **8** (c'est
  le minimum que l'appli demande).

Dans les deux cas, **les inscriptions publiques restent désactivées** : personne ne peut se créer un compte tout seul.

### Un ami a oublié son mot de passe

Il clique sur **« Mot de passe oublié ? »** sur l'écran de connexion, entre son e-mail, et reçoit un lien pour en choisir
un nouveau (même limite d'e-mails que ci-dessus). Si ça ne marche pas : Supabase > **Authentication > Users**, clique
sur les trois points à côté de son nom > **Send password recovery**.

> ⚠️ **Ne supprime jamais un compte pour « le refaire »** : sa collection de cartes disparaîtrait avec lui.

---

## 4. Passer quelqu'un administrateur (ou lui retirer ce rôle)

Seul toi peux le faire, **depuis Supabase** : l'appli elle-même n'a aucun moyen de donner ce rôle (c'est volontaire).

1. Supabase > **SQL Editor > New query**.
2. Colle ceci (avec **son** e-mail) puis clique sur **Run** :

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'ami@exemple.com');
   ```

3. Pour retirer le rôle : même requête avec `role = 'joueur'`.
4. Vérifie la liste des admins : `select email, role from public.profiles where role = 'admin';`

Il doit se **déconnecter puis se reconnecter** pour voir l'onglet « Admin ».

---

## 5. Ajouter des cartes et régler les boosters

Tout se fait dans l'appli, onglet **Admin** (visible seulement par les administrateurs).

**Cartes** (Admin > Cartes > « Ajouter des cartes »)

- Glisse tes images (ou clique pour les choisir) : **PNG, JPG ou WebP**, plusieurs à la fois.
- Idéal : des cartes **finies de 744 × 1040 pixels** (coins arrondis transparents). Une image qui n'a pas ces proportions
  est acceptée avec un avertissement, mais elle ne sera jamais déformée.
- Pour chaque carte : le **nom**, la **rareté**, la **variante** (Feu ou Bronze pour Mythique, Argent ou Or pour Secrète),
  l'**effet** (pour l'instant seulement « Aucun ») et « Carte active ».
- **Désactiver** une carte : elle ne sort plus des boosters mais reste chez ceux qui l'ont.
- **Supprimer** : impossible si un joueur possède la carte (désactive-la alors).
- **Ne mets jamais les photos dans le dossier du projet ni sur GitHub** (le dépôt est public) : elles vont uniquement
  dans l'appli (stockage privé de Supabase).

**Boosters** (Admin > Boosters) : cartes par booster, boosters par joueur et par jour, probabilité de chaque rareté
(le total doit faire exactement 100 %). Le bouton « Valeurs par défaut » remet les réglages de départ.

**Joueurs** (Admin > Joueurs) : la liste, en lecture seule.

---

## 6. Si Supabase met le projet en pause

Sur l'offre gratuite, **Supabase met en pause un projet qui n'est pas utilisé pendant environ une semaine**.

**Comment le reconnaître :** l'appli affiche « Impossible de joindre le serveur » ou la connexion échoue tout le temps.
Dans https://supabase.com/dashboard, ton projet affiche **« Paused »**.

**Que faire :**

1. Ouvre le projet dans le tableau de bord et clique sur **« Restore project »**.
2. Attends quelques minutes. Tes données (comptes, cartes, collections, images) sont conservées.
3. Recharge l'appli : tout est de retour.

À savoir : un projet resté en pause très longtemps (environ 90 jours) ne peut plus être restauré normalement. **N'attends
pas.** Pour éviter la pause : ouvre l'appli au moins une fois par semaine (ou fais-la utiliser par tes amis).

---

## 7. Sauvegarder tes données

L'offre gratuite de Supabase **ne propose pas de sauvegarde automatique téléchargeable**. De temps en temps :

- **Les cartes et les collections** : Supabase > **Table Editor** > ouvre chaque table (`cards`, `user_cards`,
  `profiles`) > bouton **Export** > **CSV**.
- **Les images** : Supabase > **Storage** > bucket `cards` > sélectionne les fichiers > **Download**.
- **Garde aussi tes images originales** (les fichiers que tu as importés) sur ton ordinateur.

Le code, lui, est sauvegardé sur GitHub. La sauvegarde de l'historique d'avant le nettoyage est dans le dossier
`SAUVEGARDE-avant-nettoyage-git` à côté du projet : elle contient des photos, **ne la partage jamais** et supprime-la quand
tu n'en as plus besoin.

---

## 8. Les règles de sécurité à ne jamais oublier

- **La clé « service_role » (ou « secret ») de Supabase ne doit jamais apparaître** dans le projet, dans un fichier, ni
  dans un message. Seules l'adresse du projet et la clé **publique** (`anon` / `publishable`) sont dans `.env`.
- **Le fichier `.env` ne part jamais sur GitHub** (il est ignoré). Ne le renomme pas, ne le copie pas dans un autre fichier suivi.
- **Aucune photo dans le dépôt** : le dépôt est public, tout ce qui y entre est visible par tout le monde, pour toujours.
- Le rôle « admin » ne se donne que depuis Supabase (partie 4).
- **Ton adresse e-mail Git est visible dans l'historique public** du dépôt. Si tu ne le veux pas, GitHub propose une
  adresse « no-reply » (GitHub > Settings > Emails > « Keep my email addresses private »), à utiliser pour les prochains commits.
- Active la **double authentification (2FA)** sur ton compte GitHub et sur ton compte Supabase.

**Vérifier la sécurité de la base** : dans Supabase > SQL Editor, colle le contenu de `supabase/tests/securite.sql` et
clique sur Run. Un cadre rouge s'affiche (c'est normal, c'est ainsi que le test annule ce qu'il crée) : le message doit
commencer par **« TOUT EST BON »**. Refais-le après toute modification de la base.

---

## 9. Quand quelque chose ne marche pas

| Ce que tu vois                                           | Que faire                                                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| « Adresse e-mail ou mot de passe incorrect »             | Vérifie l'e-mail. Sinon : « Mot de passe oublié ? ».                                                 |
| « Ce lien n'est plus valable »                           | Le lien de l'e-mail est périmé ou déjà utilisé : refais « Mot de passe oublié ? » ou une invitation. |
| « Impossible de joindre le serveur »                     | Vérifie ta connexion. Si tout va bien : le projet Supabase est peut-être en pause (partie 6).        |
| « Mise à jour obligatoire », même après avoir mis à jour | La version minimum est trop haute (partie 2, encadré ⚠️).                                            |
| Les images des cartes n'apparaissent plus                | Recharge la page (les adresses d'images durent 2 heures).                                            |
| L'onglet Admin n'apparaît pas                            | Le compte n'est pas admin (partie 4), ou il faut se déconnecter puis se reconnecter.                 |
| `npm run publier` dit « Il reste des modifications… »    | Fais d'abord `git add .` puis `git commit -m "…"`.                                                   |
| L'appli installée ne propose pas la mise à jour          | Ferme-la complètement puis rouvre-la (sur iPhone : glisse-la vers le haut pour la fermer).           |
| Le site en ligne n'a pas changé après une publication    | Regarde l'onglet **Actions** du dépôt GitHub : une croix rouge indique l'erreur à corriger.          |
| « Aucune carte n'est disponible »                        | Aucune carte active : ajoutes-en (partie 5).                                                         |

**Pour aller plus loin** : `README.md` (vue d'ensemble), `docs/ARCHITECTURE.md` (où modifier quoi), `supabase/README.md`
(mise en place de la base), `CLAUDE.md` (la mémoire du projet pour Claude), `BILAN-V0.1.md` (ce qui est fait et les idées
pour la suite).
