-- ============================================================================
-- 6 — EFFETS VISUELS DES CARTES (V0.1.5)
-- ============================================================================
-- Rôle : permettre de choisir l'effet visuel d'une carte (holo, feu, or…).
--   • rarity_effects : l'effet PAR DÉFAUT de chaque rareté (et variante) + ses réglages. Une ligne par
--     cas (9 lignes, créées ici). Réservée à l'admin : les joueurs passent par get_rarity_effects().
--   • cards.effect_override : vide = « automatique » (l'effet de la rareté s'applique) ; sinon la clé
--     d'un effet, ou « aucun » pour forcer l'absence d'effet.
--   • cards.effect_params : réglages propres à la carte (intensité, zone, réglages de l'effet).
-- COMPATIBILITÉ : ce fichier ne fait qu'AJOUTER. Les anciennes versions de l'appli continuent de
-- fonctionner telles quelles : elles ignorent les nouvelles colonnes et fonctions, et l'ancienne colonne
-- cards.effect (toujours vide) est conservée. Toutes les cartes existantes passent en « automatique » :
-- les images sont des photos fixes, sans effet incrusté. Aucune version minimale n'est à relever.
-- Pour forcer « aucun » sur une carte précise (si son image avait un effet dessiné dedans) :
--   update public.cards set effect_override = 'aucun' where name = 'Nom de la carte';
-- À appliquer UNE SEULE fois, dans l'éditeur SQL de Supabase, après les 5 premiers fichiers.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Réglages d'un effet : { "intensity": 0 à 100, "zone": "carte" | "interieur" | "illustration" | "cadre",
-- "settings": { "vitesse": 0,1 à 10, "densite": 0,1 à 10 } }. Tout est facultatif ; rien d'autre n'est accepté.
-- ----------------------------------------------------------------------------
create function public.effect_params_valid(p jsonb) returns boolean
language plpgsql immutable
as $$
declare
  v_cle text;
  v_valeur jsonb;
  v_reglage text;
  v_valeur_reglage jsonb;
begin
  if jsonb_typeof(p) is distinct from 'object' or length(p::text) > 400 then
    return false;
  end if;
  for v_cle, v_valeur in select key, value from jsonb_each(p) loop
    if v_cle = 'intensity' then
      -- « case » : le texte n'est converti en nombre que s'il en est un (sinon la conversion échouerait).
      if not coalesce(case when jsonb_typeof(v_valeur) = 'number'
                           then (v_valeur #>> '{}')::numeric between 0 and 100 end, false) then
        return false;
      end if;
    elsif v_cle = 'zone' then
      if jsonb_typeof(v_valeur) is distinct from 'string'
         or (v_valeur #>> '{}') not in ('carte', 'interieur', 'illustration', 'cadre') then
        return false;
      end if;
    elsif v_cle = 'settings' then
      if jsonb_typeof(v_valeur) is distinct from 'object' then
        return false;
      end if;
      for v_reglage, v_valeur_reglage in select key, value from jsonb_each(v_valeur) loop
        if v_reglage not in ('vitesse', 'densite')
           or not coalesce(case when jsonb_typeof(v_valeur_reglage) = 'number'
                                then (v_valeur_reglage #>> '{}')::numeric between 0.1 and 10 end, false) then
          return false;
        end if;
      end loop;
    else
      return false;
    end if;
  end loop;
  return true;
end;
$$;

-- ----------------------------------------------------------------------------
-- cards : choix de l'effet de la carte.
-- ----------------------------------------------------------------------------
alter table public.cards
  add column effect_override text not null default '',
  add column effect_params jsonb not null default '{}'::jsonb,
  add constraint cards_effet_override_valide check (effect_override ~ '^[a-z0-9_]{0,40}$'),
  add constraint cards_effet_params_valides check (public.effect_params_valid(effect_params));

comment on column public.cards.effect is
  'ANCIEN champ (avant la V0.1.5), toujours vide : conservé pour les anciennes versions de l''appli.';
comment on column public.cards.effect_override is
  'Vide = effet automatique de la rareté ; sinon la clé d''un effet, ou aucun pour forcer l''absence d''effet.';

-- ----------------------------------------------------------------------------
-- rarity_effects : effet par défaut de chaque rareté (et variante pour Mythique et Secrète).
-- ----------------------------------------------------------------------------
create table public.rarity_effects (
  id smallint generated always as identity primary key,
  rarity public.card_rarity not null,
  variant public.card_variant,
  -- Clé d'un effet du registre src/effects/ (« aucun » = pas d'effet).
  effect text not null default 'aucun',
  params jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint rarity_effects_variante_coherente check (
    (rarity = 'mythique' and variant is not null and variant in ('feu', 'bronze'))
    or (rarity = 'secrete' and variant is not null and variant in ('argent', 'or'))
    or (rarity not in ('mythique', 'secrete') and variant is null)
  ),
  constraint rarity_effects_effet_valide check (effect ~ '^[a-z0-9_]{1,40}$'),
  constraint rarity_effects_params_valides check (public.effect_params_valid(params))
);
-- Une seule ligne par cas : une par rareté sans variante, une par couple rareté + variante.
create unique index rarity_effects_sans_variante on public.rarity_effects (rarity) where variant is null;
create unique index rarity_effects_avec_variante on public.rarity_effects (rarity, variant) where variant is not null;
create trigger rarity_effects_updated_at before update on public.rarity_effects
  for each row execute function public.set_updated_at();

-- Les 9 cas, avec les effets proposés (mêmes valeurs que src/config/effets.ts).
insert into public.rarity_effects (rarity, variant, effect, params) values
  ('commune', null, 'aucun', '{}'),
  ('peu_commune', null, 'lustre', '{"intensity": 100}'),
  ('rare', null, 'holo', '{"intensity": 100}'),
  ('super_rare', null, 'prisme', '{"intensity": 100}'),
  ('legendaire', null, 'arc_en_ciel', '{"intensity": 100}'),
  ('mythique', 'feu', 'feu', '{"intensity": 100}'),
  ('mythique', 'bronze', 'bronze', '{"intensity": 100}'),
  ('secrete', 'argent', 'argent', '{"intensity": 100}'),
  ('secrete', 'or', 'or', '{"intensity": 100}');

-- Sécurité : admin seulement. L'admin peut changer l'effet et ses réglages, jamais ajouter, supprimer ou
-- déplacer une ligne (les 9 cas sont fixes). (Supabase ouvre par défaut les nouvelles tables : on referme.)
revoke all on table public.rarity_effects from anon, authenticated;
alter table public.rarity_effects enable row level security;
grant select on public.rarity_effects to authenticated;
grant update (effect, params) on public.rarity_effects to authenticated;
create policy rarity_effects_lecture_admin on public.rarity_effects for select to authenticated
  using (public.is_admin());
create policy rarity_effects_modif_admin on public.rarity_effects for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- get_rarity_effects : les effets par défaut, pour les joueurs (lecture seule, sans passer par la table).
-- Renvoie [ { rarity, variant, effect, params } ].
-- ----------------------------------------------------------------------------
create function public.get_rarity_effects() returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object('rarity', rarity, 'variant', variant, 'effect', effect, 'params', params)
      order by id
    ),
    '[]'::jsonb
  )
  from public.rarity_effects;
$$;
revoke all on function public.get_rarity_effects() from public, anon;
grant execute on function public.get_rarity_effects() to authenticated;

-- ----------------------------------------------------------------------------
-- open_booster : identique à la version précédente, plus les deux nouveaux champs d'effet dans chaque
-- carte tirée (les anciennes versions de l'appli les ignorent).
-- ----------------------------------------------------------------------------
create or replace function public.open_booster(p_booster text default null) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_cfg public.app_config;
  v_jour date := (now() at time zone 'Europe/Paris')::date;
  v_utilises integer;
  v_raretes public.card_rarity[];
  v_poids numeric[];
  v_total numeric;
  v_tirage numeric;
  v_i integer;
  v_j integer;
  v_rarete public.card_rarity;
  v_carte public.cards;
  v_nouvelle boolean;
  v_quantite integer;
  v_ids uuid[] := '{}';
  v_resultat jsonb := '[]'::jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_booster is not null and char_length(p_booster) > 40 then
    raise exception 'invalid_booster';
  end if;

  -- Un seul tirage à la fois par joueur : empêche de dépasser la limite en cliquant très vite.
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  select * into v_cfg from public.app_config where id = 1;
  select count(*) into v_utilises
    from public.booster_openings where user_id = v_uid and opened_on = v_jour;
  if v_utilises >= v_cfg.boosters_per_day then
    raise exception 'daily_limit_reached';
  end if;

  -- Raretés réellement disponibles (au moins une carte active) et leur poids.
  select array_agg(r.rarity order by r.rarity),
         array_agg((v_cfg.rarity_weights ->> r.rarity::text)::numeric order by r.rarity)
    into v_raretes, v_poids
    from (select distinct rarity from public.cards where active) r;
  if v_raretes is null then
    raise exception 'no_cards_available';
  end if;
  select sum(p) into v_total from unnest(v_poids) p;

  for v_i in 1..v_cfg.cards_per_booster loop
    if v_total > 0 then
      v_tirage := random() * v_total;
      v_rarete := v_raretes[cardinality(v_raretes)];  -- filet de sécurité contre les arrondis
      for v_j in 1..cardinality(v_raretes) loop
        v_tirage := v_tirage - v_poids[v_j];
        if v_tirage < 0 then
          v_rarete := v_raretes[v_j];
          exit;
        end if;
      end loop;
    else
      -- Tous les poids sont nuls : choix uniforme entre les raretés disponibles.
      v_rarete := v_raretes[1 + floor(random() * cardinality(v_raretes))::integer];
    end if;

    select * into v_carte
      from public.cards where active and rarity = v_rarete
      order by random() limit 1;

    -- Ajout à la collection. xmax = 0 signifie « ligne créée » : la carte est nouvelle pour le joueur.
    insert into public.user_cards (user_id, card_id) values (v_uid, v_carte.id)
    on conflict (user_id, card_id) do update set quantity = public.user_cards.quantity + 1
    returning (xmax = 0), quantity into v_nouvelle, v_quantite;

    v_ids := v_ids || v_carte.id;
    v_resultat := v_resultat || jsonb_build_array(jsonb_build_object(
      'card_id', v_carte.id,
      'name', v_carte.name,
      'rarity', v_carte.rarity,
      'variant', v_carte.variant,
      'effect', v_carte.effect,
      'effect_override', v_carte.effect_override,
      'effect_params', v_carte.effect_params,
      'image_path', v_carte.image_path,
      'thumb_path', v_carte.thumb_path,
      'is_new', v_nouvelle,
      'quantity', v_quantite
    ));
  end loop;

  insert into public.booster_openings (user_id, booster_id, card_ids)
  values (v_uid, p_booster, v_ids);

  return jsonb_build_object(
    'cards', v_resultat,
    'remaining', greatest(v_cfg.boosters_per_day - v_utilises - 1, 0)
  );
end;
$$;
revoke all on function public.open_booster(text) from public, anon;
grant execute on function public.open_booster(text) to authenticated;
