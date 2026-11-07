-- ============================================================================
-- 1/4 — SCHÉMA : types, tables, déclencheur de création de profil
-- ============================================================================
-- Rôle : créer les tables de l'appli. La SÉCURITÉ (qui a le droit de lire / écrire quoi) est dans le
-- fichier suivant (…000200_securite.sql) : n'applique jamais ce fichier seul sans le suivant.
-- À appliquer UNE SEULE fois, dans l'éditeur SQL de Supabase (voir GUIDE / README de supabase/).
-- ============================================================================

-- Raretés et variantes : mêmes clés que le code de l'appli (src/domain/types.ts).
create type public.card_rarity as enum (
  'commune', 'peu_commune', 'rare', 'super_rare', 'legendaire', 'mythique', 'secrete'
);
create type public.card_variant as enum ('feu', 'bronze', 'argent', 'or');

-- ----------------------------------------------------------------------------
-- profiles : un profil par compte (id = identifiant du compte Supabase).
-- Créé automatiquement à la création d'un compte (déclencheur plus bas).
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Vide tant que le joueur n'a pas choisi son pseudo (2 à 16 caractères, comme dans l'appli).
  pseudo text,
  -- Identifiant de l'avatar choisi (liste dans src/config/avatars.ts).
  avatar_id text,
  -- 'joueur' par défaut. Passer 'admin' se fait UNIQUEMENT depuis la base (jamais depuis l'appli).
  role text not null default 'joueur',
  created_at timestamptz not null default now(),
  constraint profiles_role_valide check (role in ('admin', 'joueur')),
  constraint profiles_pseudo_valide check (
    pseudo is null or (pseudo = btrim(pseudo) and char_length(pseudo) between 2 and 16)
  ),
  constraint profiles_avatar_valide check (avatar_id is null or char_length(avatar_id) <= 40)
);
-- Deux joueurs ne peuvent pas avoir le même pseudo (majuscules/minuscules ignorées).
create unique index profiles_pseudo_unique on public.profiles (lower(pseudo)) where pseudo is not null;

-- ----------------------------------------------------------------------------
-- cards : les cartes du jeu (les images sont dans le bucket privé « cards »).
-- ----------------------------------------------------------------------------
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rarity public.card_rarity not null,
  -- Feu / Bronze pour Mythique, Argent / Or pour Secrète, rien pour les autres raretés.
  variant public.card_variant,
  -- Clé d'un effet visuel (registre src/effects/). Vide = aucun effet.
  effect text not null default '',
  -- Chemin de l'image dans le bucket « cards » (ex. « 3f2a.webp »), et de sa miniature.
  image_path text not null,
  thumb_path text,
  -- Une carte désactivée ne sort plus des boosters mais reste dans les collections.
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint cards_nom_valide check (name = btrim(name) and char_length(name) between 1 and 60),
  constraint cards_variante_coherente check (
    (rarity = 'mythique' and variant is not null and variant in ('feu', 'bronze'))
    or (rarity = 'secrete' and variant is not null and variant in ('argent', 'or'))
    or (rarity not in ('mythique', 'secrete') and variant is null)
  ),
  constraint cards_effet_valide check (effect ~ '^[a-z0-9_]{0,40}$'),
  constraint cards_image_valide check (image_path <> '' and char_length(image_path) <= 200)
);

-- ----------------------------------------------------------------------------
-- user_cards : la collection de chaque joueur (une ligne par carte possédée + quantité).
-- Une carte possédée ne peut pas être supprimée (on la désactive à la place).
-- ----------------------------------------------------------------------------
create table public.user_cards (
  user_id uuid not null references public.profiles (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete restrict,
  quantity integer not null default 1,
  first_obtained_at timestamptz not null default now(),
  primary key (user_id, card_id),
  constraint user_cards_quantite_valide check (quantity >= 1)
);
create index user_cards_card_idx on public.user_cards (card_id);

-- ----------------------------------------------------------------------------
-- booster_openings : historique des ouvertures (sert aussi à compter la limite quotidienne).
-- ----------------------------------------------------------------------------
create table public.booster_openings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  opened_at timestamptz not null default now(),
  -- Jour « de jeu » : la limite quotidienne se remet à zéro à minuit, heure de Paris.
  opened_on date not null default ((now() at time zone 'Europe/Paris')::date),
  -- Thème de booster choisi (purement esthétique), ex. « apero-soleil ».
  booster_id text,
  -- Cartes obtenues, dans l'ordre du tirage (une carte tirée deux fois apparaît deux fois).
  card_ids uuid[] not null
);
create index booster_openings_joueur_jour_idx on public.booster_openings (user_id, opened_on);

-- ----------------------------------------------------------------------------
-- app_config : réglages modifiables par l'admin. UNE SEULE ligne (id = 1).
-- ----------------------------------------------------------------------------

-- Vérifie que les probabilités ont bien les 7 raretés, sont positives, et font 100 au total.
create function public.rarity_weights_valid(w jsonb) returns boolean
language plpgsql immutable
as $$
declare
  v_cle text;
  v_valeur jsonb;
  v_nombre integer := 0;
  v_total numeric := 0;
begin
  if jsonb_typeof(w) is distinct from 'object' then
    return false;
  end if;
  for v_cle, v_valeur in select key, value from jsonb_each(w) loop
    if not (v_cle = any (array['commune', 'peu_commune', 'rare', 'super_rare', 'legendaire', 'mythique', 'secrete'])) then
      return false;
    end if;
    if jsonb_typeof(v_valeur) is distinct from 'number' then
      return false;
    end if;
    if (v_valeur #>> '{}')::numeric < 0 then
      return false;
    end if;
    v_nombre := v_nombre + 1;
    v_total := v_total + (v_valeur #>> '{}')::numeric;
  end loop;
  -- 7 clés toutes différentes et autorisées = exactement les 7 raretés.
  return v_nombre = 7 and v_total = 100;
end;
$$;

create table public.app_config (
  id integer primary key default 1,
  -- Nombre de cartes dans un booster.
  cards_per_booster integer not null default 5,
  -- Nombre de boosters ouvrables par joueur et par jour.
  boosters_per_day integer not null default 3,
  -- Probabilité (en %) de chaque rareté. Le total doit faire exactement 100.
  rarity_weights jsonb not null default '{
    "commune": 60, "peu_commune": 25, "rare": 10, "super_rare": 3,
    "legendaire": 1, "mythique": 0.6, "secrete": 0.4
  }'::jsonb,
  -- Version minimale de l'appli autorisée (format 0.1.0). En dessous : écran « Mise à jour obligatoire ».
  min_version text not null default '0.1.0',
  updated_at timestamptz not null default now(),
  constraint app_config_une_seule_ligne check (id = 1),
  constraint app_config_cartes_valide check (cards_per_booster between 1 and 10),
  constraint app_config_boosters_valide check (boosters_per_day between 1 and 100),
  constraint app_config_poids_valides check (public.rarity_weights_valid(rarity_weights)),
  constraint app_config_version_valide check (min_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);
insert into public.app_config (id) values (1);

-- Met à jour la date de modification des réglages.
create function public.set_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger app_config_updated_at before update on public.app_config
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Création automatique du profil quand un compte est créé (invitation, ajout depuis le tableau de bord…).
-- ----------------------------------------------------------------------------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Comptes déjà existants (si tu as créé ton compte avant d'appliquer ce fichier).
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;
