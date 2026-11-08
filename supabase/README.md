# Supabase : mise en place pas à pas

Supabase héberge les comptes, la base de données et les images des cartes (offre gratuite).
Ce dossier contient tout le schéma, écrit en SQL :

| Fichier                                           | Rôle                                                                         |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `migrations/20261107000100_schema.sql`            | Tables : profils, cartes, collections, historique, réglages                  |
| `migrations/20261107000200_securite.sql`          | Qui peut lire / écrire quoi (Row Level Security), rôle admin verrouillé      |
| `migrations/20261107000300_fonctions.sql`         | Tirage des boosters côté serveur, limite quotidienne, version minimale       |
| `migrations/20261107000400_stockage.sql`          | Bucket privé « cards » pour les images                                       |
| `migrations/20261107000500_email_et_joueurs.sql`  | E-mail dans les profils + liste des joueurs pour l'admin                     |
| `migrations/20261108000600_effets_des_cartes.sql` | Effets visuels des cartes : effet par rareté, effet forcé par carte (V0.1.5) |
| `tests/securite.sql`                              | Test automatique de toutes ces règles (n'enregistre rien)                    |

## 1. Créer le compte et le projet

1. Va sur <https://supabase.com> → **Start your project** → **Continue with GitHub**.
2. Crée une organisation si on te le demande (nom libre, type « Personal », plan **Free**).
3. **New project** : nom `swag`, région **Europe** (la plus proche de toi), plan **Free**.
4. Choisis un **mot de passe de base de données** (bouton « Generate »). **Garde-le dans un gestionnaire de mots de passe.** Il ne doit jamais aller dans le projet ni sur GitHub, et l'appli n'en a pas besoin.
5. Attends 1 à 2 minutes que le projet soit prêt.

## 2. Récupérer l'URL et la clé publique

Dans le projet : **Project Settings** (roue dentée) → **API Keys** (ou **API**).

- **Project URL** : `https://xxxxxxxx.supabase.co`
- **Clé publique** : « anon public » (ancienne interface) ou « Publishable key » (commence par `sb_publishable_`).

> **Ne copie JAMAIS** la clé « service_role » ou « secret » : elle donne tous les droits sur ta base.

Mets-les dans un fichier `.env` à la racine du projet (modèle : `.env.example`) :

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=la-cle-publique
```

`.env` est ignoré par Git : il ne part jamais sur GitHub.

## 3. Régler l'authentification

1. **Authentication → Sign In / Providers** (ou **Settings**) : garde **Email** activé et mets **Allow new users to sign up** sur **OFF**. Personne ne peut alors s'inscrire seul : tu invites tes amis toi-même.
2. **Authentication → URL Configuration** :
   - **Site URL** : `https://ldrdlab.github.io/swag-cartes-delaitere/`
   - **Redirect URLs** : ajoute `https://ldrdlab.github.io/swag-cartes-delaitere/**` et `http://localhost:5173/**`.

## 4. Appliquer le schéma

1. Dans Supabase : **SQL Editor** → **New query**.
2. Ouvre `migrations/20261107000100_schema.sql` dans ton éditeur, copie tout, colle dans Supabase, clique **Run**. Message attendu : _Success. No rows returned_.
3. Fais de même, **dans l'ordre**, avec les fichiers `…000200_securite.sql`, `…000300_fonctions.sql`, `…000400_stockage.sql`, puis `…000500_email_et_joueurs.sql`. (Mise à jour V0.1.5 : si ton projet existe déjà, il ne te manque que `…000600_effets_des_cartes.sql` : applique-le seul, une fois.)

Chaque fichier ne s'applique **qu'une seule fois** (une 2e fois, Supabase répond « already exists » : sans danger, rien ne change). En cas d'erreur, copie le message et envoie-le-moi.

## 5. Lancer le test de sécurité

1. **SQL Editor → New query**, colle tout `tests/securite.sql`, clique **Run**.
2. Un cadre **rouge** s'affiche : c'est normal, c'est comme ça que le test annule tout ce qu'il a créé.
3. Lis le message : **TOUT EST BON : 76 vérifications réussies** = parfait. **ECHEC** = envoie-moi la liste.

## 6. Créer ton compte et te passer admin

1. **Authentication → Users → Add user → Create new user** : ton e-mail, un mot de passe, et coche **Auto Confirm User**.
2. **SQL Editor** : lance (en remplaçant l'e-mail par le tien) :

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'ton-email@exemple.com');
```

C'est la **seule** façon de devenir admin : l'appli ne peut pas le faire, même par un joueur malin.

## 7. Ajouter un ami

**Méthode simple** (recommandée) : **Authentication → Users → Add user → Create new user**, avec son e-mail et un mot de passe provisoire, **Auto Confirm User** coché. Donne-lui ce mot de passe.

**Méthode par e-mail** : **Add user → Send invitation**. L'ami reçoit un lien. Attention : l'offre gratuite limite l'envoi à quelques e-mails par heure.

Le profil du joueur est créé tout seul. Il choisira son pseudo à sa première connexion (phase 4).

## 8. Secrets GitHub (pour le site en ligne)

Dans le dépôt GitHub : **Settings → Secrets and variables → Actions → New repository secret**, deux secrets :

- `VITE_SUPABASE_URL` = l'URL du projet
- `VITE_SUPABASE_ANON_KEY` = la clé publique

(Ces deux valeurs sont publiques par nature ; la protection vient des règles de sécurité de la base.)
