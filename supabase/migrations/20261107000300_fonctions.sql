-- ============================================================================
-- 3/4 — FONCTIONS : tirage des boosters (côté serveur) et réglages publics
-- ============================================================================
-- Rôle : le tirage des cartes ne se fait JAMAIS dans le navigateur (sinon on pourrait tricher).
--   • open_booster()      : vérifie la limite du jour, tire les cartes selon les probabilités de app_config,
--                           les ajoute à la collection et renvoie le résultat.
--   • get_booster_status(): boosters restants aujourd'hui et temps avant la remise à zéro.
--   • get_min_version()   : version minimale de l'appli (lisible AVANT la connexion).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- get_min_version : renvoie seulement le numéro de version minimal (rien d'autre de app_config).
-- ----------------------------------------------------------------------------
create function public.get_min_version() returns text
language sql stable security definer set search_path = public
as $$
  select min_version from public.app_config where id = 1;
$$;
revoke all on function public.get_min_version() from public;
grant execute on function public.get_min_version() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- get_booster_status : { per_day, used, remaining, seconds_until_reset }
-- ----------------------------------------------------------------------------
create function public.get_booster_status() returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_cfg public.app_config;
  v_jour date := (now() at time zone 'Europe/Paris')::date;
  v_utilises integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_cfg from public.app_config where id = 1;
  select count(*) into v_utilises
    from public.booster_openings where user_id = v_uid and opened_on = v_jour;

  return jsonb_build_object(
    'per_day', v_cfg.boosters_per_day,
    'used', v_utilises,
    'remaining', greatest(v_cfg.boosters_per_day - v_utilises, 0),
    -- Minuit (heure de Paris) du jour suivant, moins maintenant.
    'seconds_until_reset',
      ceil(extract(epoch from (((v_jour + 1)::timestamp at time zone 'Europe/Paris') - now())))::integer
  );
end;
$$;
revoke all on function public.get_booster_status() from public, anon;
grant execute on function public.get_booster_status() to authenticated;

-- ----------------------------------------------------------------------------
-- open_booster : ouvre un booster pour le joueur connecté.
--   p_booster : thème de booster choisi (purement esthétique, gardé dans l'historique).
-- Renvoie { cards: [ { card_id, name, rarity, variant, effect, image_path, thumb_path, is_new, quantity } ],
--           remaining }.
-- Erreurs : not_authenticated, daily_limit_reached, no_cards_available, invalid_booster.
-- Algorithme (comme src/domain/drawCards.ts) : pour chaque carte, 1) choisir une rareté selon son poids
-- (parmi les raretés qui ont au moins une carte active) ; 2) choisir une carte active de cette rareté.
-- Tirage avec remise : une même carte peut sortir deux fois dans un booster.
-- ----------------------------------------------------------------------------
create function public.open_booster(p_booster text default null) returns jsonb
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
