-- ============================================================================
-- TEST DE SÉCURITÉ — à lancer dans l'éditeur SQL de Supabase APRÈS les 4 migrations
-- ============================================================================
-- Rôle : vérifier automatiquement que les règles d'accès tiennent (joueur, admin, visiteur non connecté)
-- et que le tirage des boosters se fait bien côté serveur.
-- Il crée de FAUX comptes et de FAUSSES cartes, fait ses vérifications, puis ANNULE tout : rien n'est
-- enregistré dans ta base (même si elle contient déjà de vraies données). Le résultat s'affiche dans un
-- cadre ROUGE d'erreur : c'est NORMAL, c'est la façon d'annuler. Lis le message :
--   « TOUT EST BON » = parfait ;   « ECHEC » = une règle ne tient pas (la liste dit laquelle).
-- ============================================================================

-- Outil : exécute une requête « en tant que » un visiteur (uid vide), un joueur ou l'admin,
-- et renvoie 'ok' ou 'erreur: …'.
create or replace function pg_temp.tente(p_uid uuid, p_role text, p_sql text) returns text
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims',
    case when p_uid is null then '' else json_build_object('sub', p_uid, 'role', p_role)::text end, true);
  execute format('set local role %I', p_role);
  begin
    execute p_sql;
    reset role;
    perform set_config('request.jwt.claims', '', true);
    return 'ok';
  exception when others then
    reset role;
    perform set_config('request.jwt.claims', '', true);
    return 'erreur: ' || sqlerrm;
  end;
end;
$$;

-- Outil : idem, mais renvoie la valeur (texte) d'une requête qui renvoie une seule valeur.
create or replace function pg_temp.valeur(p_uid uuid, p_role text, p_sql text) returns text
language plpgsql
as $$
declare
  v_sortie text;
begin
  perform set_config('request.jwt.claims',
    case when p_uid is null then '' else json_build_object('sub', p_uid, 'role', p_role)::text end, true);
  execute format('set local role %I', p_role);
  begin
    execute p_sql into v_sortie;
    reset role;
    perform set_config('request.jwt.claims', '', true);
    return coalesce(v_sortie, '<vide>');
  exception when others then
    reset role;
    perform set_config('request.jwt.claims', '', true);
    return 'erreur: ' || sqlerrm;
  end;
end;
$$;

do $test$
declare
  v_admin uuid := gen_random_uuid();
  v_j1 uuid := gen_random_uuid();
  v_j2 uuid := gen_random_uuid();
  v_commune uuid;
  v_rare uuid;
  v_inactive uuid;
  v_actives integer;
  v_total integer;
  v_nb integer;
  v_ko integer;
  v_rapport text := '';
  v_r text;
begin
  create temp table resultats (nom text not null, ok boolean not null, detail text) on commit drop;

  -- ---------- Préparation (en tant qu'administrateur de la base) ----------
  -- Réglages connus pour le test (annulés à la fin, comme tout le reste).
  update public.app_config set
    cards_per_booster = 5, boosters_per_day = 3, min_version = '0.1.0',
    rarity_weights = '{"commune":60,"peu_commune":25,"rare":10,"super_rare":3,"legendaire":1,"mythique":0.6,"secrete":0.4}';

  insert into auth.users (id, email) values
    (v_admin, 'test-admin@exemple.invalid'),
    (v_j1, 'test-joueur1@exemple.invalid'),
    (v_j2, 'test-joueur2@exemple.invalid');
  update public.profiles set role = 'admin' where id = v_admin;

  insert into public.cards (name, rarity, image_path) values ('Test commune', 'commune', 'test-1.webp')
    returning id into v_commune;
  insert into public.cards (name, rarity, image_path) values ('Test rare', 'rare', 'test-2.webp')
    returning id into v_rare;
  insert into public.cards (name, rarity, image_path, active) values ('Test inactive', 'commune', 'test-3.webp', false)
    returning id into v_inactive;
  -- Le joueur 2 possède déjà la carte commune.
  insert into public.user_cards (user_id, card_id) values (v_j2, v_commune);

  select count(*) into v_actives from public.cards where active;
  select count(*) into v_total from public.cards;

  -- ---------- A. Visiteur non connecté ----------
  v_r := pg_temp.valeur(null, 'anon', 'select count(*) from public.cards');
  insert into resultats values ('Visiteur : ne peut pas lire les cartes', v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(null, 'anon', 'select count(*) from public.profiles');
  insert into resultats values ('Visiteur : ne peut pas lire les profils', v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(null, 'anon', 'select public.open_booster()::text');
  insert into resultats values ('Visiteur : ne peut pas ouvrir de booster', v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(null, 'anon', 'select public.get_min_version()');
  insert into resultats values ('Visiteur : peut lire la version minimale', v_r = '0.1.0', v_r);
  v_r := pg_temp.valeur(null, 'anon', 'select count(*) from public.app_config');
  insert into resultats values ('Visiteur : ne peut pas lire les réglages', v_r like 'erreur:%', v_r);

  -- ---------- B. Joueur 1 ----------
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select count(*) from public.cards');
  insert into resultats values ('Joueur : ne voit que les cartes actives', v_r = v_actives::text, v_r || ' au lieu de ' || v_actives);
  v_r := pg_temp.tente(v_j1, 'authenticated', 'insert into public.cards (name, rarity, image_path) values (''Triche'', ''commune'', ''x.webp'')');
  insert into resultats values ('Joueur : ne peut pas ajouter de carte', v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'with u as (update public.cards set name = ''Triche'' returning 1) select count(*) from u');
  insert into resultats values ('Joueur : ne peut pas modifier une carte', v_r = '0' or v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'with d as (delete from public.cards returning 1) select count(*) from d');
  insert into resultats values ('Joueur : ne peut pas supprimer une carte', v_r = '0' or v_r like 'erreur:%', v_r);
  v_r := pg_temp.tente(v_j1, 'authenticated', 'update public.profiles set role = ''admin'' where id = auth.uid()');
  insert into resultats values ('Joueur : ne peut pas se donner le rôle admin', v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select role from public.profiles where id = auth.uid()');
  insert into resultats values ('Joueur : son rôle reste « joueur »', v_r = 'joueur', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'with u as (update public.profiles set pseudo = ''Alice'', avatar_id = ''avatar-01'' where id = auth.uid() returning 1) select count(*) from u');
  insert into resultats values ('Joueur : peut choisir son pseudo et son avatar', v_r = '1', v_r);
  v_r := pg_temp.tente(v_j2, 'authenticated', 'update public.profiles set pseudo = ''ALICE'' where id = auth.uid()');
  insert into resultats values ('Pseudo déjà pris (majuscules ignorées) : refusé', v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select count(*) from public.profiles');
  insert into resultats values ('Joueur : ne voit que son propre profil', v_r = '1', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select count(*) from public.user_cards');
  insert into resultats values ('Joueur : ne voit pas la collection des autres', v_r = '0', v_r);
  v_r := pg_temp.tente(v_j1, 'authenticated', format('insert into public.user_cards (user_id, card_id) values (%L, %L)', v_j1, v_rare));
  insert into resultats values ('Joueur : ne peut pas s''ajouter une carte à la main', v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select count(*) from public.app_config');
  insert into resultats values ('Joueur : ne peut pas lire les réglages', v_r = '0' or v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'with u as (update public.app_config set boosters_per_day = 100 returning 1) select count(*) from u');
  insert into resultats values ('Joueur : ne peut pas modifier les réglages', v_r = '0' or v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select (public.get_booster_status() ->> ''remaining'')');
  insert into resultats values ('Joueur : 3 boosters disponibles au départ', v_r = '3', v_r);

  -- Tirage côté serveur
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select jsonb_array_length(public.open_booster(''apero-soleil'') -> ''cards'')::text');
  insert into resultats values ('Booster : 5 cartes tirées côté serveur', v_r = '5', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select sum(quantity)::text from public.user_cards');
  insert into resultats values ('Booster : les 5 cartes sont dans la collection', v_r = '5', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select (public.get_booster_status() ->> ''remaining'')');
  insert into resultats values ('Booster : il en reste 2', v_r = '2', v_r);
  perform pg_temp.tente(v_j1, 'authenticated', 'select public.open_booster()');
  perform pg_temp.tente(v_j1, 'authenticated', 'select public.open_booster()');
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select public.open_booster()::text');
  insert into resultats values ('Limite quotidienne : le 4e booster est refusé', v_r like '%daily_limit_reached%', v_r);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select count(*) from public.booster_openings');
  insert into resultats values ('Historique : 3 ouvertures enregistrées', v_r = '3', v_r);
  select count(*)::text into v_r from public.user_cards where user_id = v_j1 and card_id = v_inactive;
  insert into resultats values ('Une carte désactivée ne sort jamais', v_r = '0', v_r);

  -- Carte désactivée mais possédée : toujours visible par son propriétaire
  insert into public.user_cards (user_id, card_id) values (v_j1, v_inactive);
  v_r := pg_temp.valeur(v_j1, 'authenticated', 'select count(*) from public.cards');
  insert into resultats values ('Joueur : voit encore sa carte désactivée', v_r = (v_actives + 1)::text, v_r || ' au lieu de ' || (v_actives + 1));

  -- Stockage
  v_r := pg_temp.tente(v_j1, 'authenticated', 'insert into storage.objects (bucket_id, name) values (''cards'', ''pirate.webp'')');
  insert into resultats values ('Stockage : un joueur ne peut pas déposer d''image', v_r like 'erreur:%', v_r);
  v_r := pg_temp.tente(v_j1, 'authenticated', 'select count(*) from storage.objects where bucket_id = ''cards''');
  insert into resultats values ('Stockage : un joueur connecté peut lire', v_r = 'ok', v_r);
  v_r := pg_temp.valeur(null, 'anon', 'select count(*) from storage.objects');
  insert into resultats values ('Stockage : un visiteur ne voit rien', v_r = '0' or v_r like 'erreur:%', v_r);

  -- ---------- C. Administrateur ----------
  v_r := pg_temp.valeur(v_admin, 'authenticated', 'select count(*) from public.profiles');
  insert into resultats values ('Admin : voit tous les profils', v_r::integer >= 3, v_r);
  v_r := pg_temp.valeur(v_admin, 'authenticated', 'select count(*) from public.cards');
  insert into resultats values ('Admin : voit toutes les cartes (même désactivées)', v_r = v_total::text, v_r || ' au lieu de ' || v_total);
  v_r := pg_temp.tente(v_admin, 'authenticated', 'insert into public.cards (name, rarity, image_path) values (''Nouvelle'', ''rare'', ''n.webp'')');
  insert into resultats values ('Admin : peut ajouter une carte', v_r = 'ok', v_r);
  v_r := pg_temp.tente(v_admin, 'authenticated', 'insert into public.cards (name, rarity, image_path) values (''Sans variante'', ''mythique'', ''m.webp'')');
  insert into resultats values ('Carte mythique sans variante : refusée', v_r like 'erreur:%', v_r);
  v_r := pg_temp.tente(v_admin, 'authenticated', 'insert into public.cards (name, rarity, variant, image_path) values (''Feu'', ''mythique'', ''feu'', ''m.webp'')');
  insert into resultats values ('Carte mythique avec variante Feu : acceptée', v_r = 'ok', v_r);
  v_r := pg_temp.tente(v_admin, 'authenticated', 'insert into public.cards (name, rarity, variant, image_path) values (''Mauvaise'', ''secrete'', ''feu'', ''m.webp'')');
  insert into resultats values ('Carte secrète avec variante Feu : refusée', v_r like 'erreur:%', v_r);
  v_r := pg_temp.tente(v_admin, 'authenticated', 'update public.app_config set rarity_weights = ''{"commune":50,"peu_commune":25,"rare":10,"super_rare":3,"legendaire":1,"mythique":0.6,"secrete":0.4}''');
  insert into resultats values ('Probabilités ne faisant pas 100 % : refusées', v_r like 'erreur:%', v_r);
  v_r := pg_temp.valeur(v_admin, 'authenticated', 'with u as (update public.app_config set boosters_per_day = 5 returning 1) select count(*) from u');
  insert into resultats values ('Admin : peut modifier les réglages', v_r = '1', v_r);
  v_r := pg_temp.tente(v_admin, 'authenticated', format('update public.profiles set role = ''admin'' where id = %L', v_j2));
  insert into resultats values ('Admin : ne peut pas non plus changer un rôle depuis l''appli', v_r like 'erreur:%', v_r);
  v_r := pg_temp.tente(v_admin, 'authenticated', format('delete from public.cards where id = %L', v_commune));
  insert into resultats values ('Carte possédée par un joueur : suppression refusée', v_r like 'erreur:%', v_r);
  v_r := pg_temp.tente(v_admin, 'authenticated', 'insert into storage.objects (bucket_id, name) values (''cards'', ''admin.webp'')');
  insert into resultats values ('Stockage : l''admin peut déposer une image', v_r = 'ok', v_r);
  v_r := pg_temp.valeur(v_admin, 'authenticated', 'select count(*) from public.user_cards');
  insert into resultats values ('Admin : voit toutes les collections', v_r::integer >= 3, v_r);

  -- ---------- D. Les probabilités sont bien appliquées par le serveur ----------
  update public.app_config set boosters_per_day = 3, rarity_weights =
    '{"commune":100,"peu_commune":0,"rare":0,"super_rare":0,"legendaire":0,"mythique":0,"secrete":0}';
  -- Seules les 2 cartes de test restent actives (la rare a une probabilité de 0 : elle ne doit jamais sortir).
  update public.cards set active = false where id not in (v_commune, v_rare);
  perform pg_temp.tente(v_j2, 'authenticated', 'select public.open_booster()');
  select quantity::text into v_r from public.user_cards where user_id = v_j2 and card_id = v_commune;
  insert into resultats values ('Probabilités 100 % commune : 5 cartes tirées en plus de la 1re (1 + 5 = 6)', v_r = '6', v_r);
  select count(*)::text into v_r from public.user_cards where user_id = v_j2 and card_id = v_rare;
  insert into resultats values ('Probabilités 100 % commune : aucune carte rare tirée', v_r = '0', v_r);

  -- ---------- E. Le rôle admin peut être donné depuis la base ----------
  update public.profiles set role = 'admin' where id = v_j2;
  select role into v_r from public.profiles where id = v_j2;
  insert into resultats values ('Éditeur SQL : peut donner le rôle admin', v_r = 'admin', v_r);

  -- ---------- Rapport ----------
  select count(*) into v_nb from resultats;
  select count(*) into v_ko from resultats where not ok;
  for v_r in
    select (case when ok then 'OK     ' else 'ECHEC  ' end) || nom ||
           (case when ok then '' else '   [' || coalesce(detail, 'null') || ']' end)
      from resultats order by ok, nom
  loop
    v_rapport := v_rapport || E'\n' || v_r;
  end loop;

  if v_ko = 0 then
    raise exception E'TOUT EST BON : % verifications reussies sur %. (Rien n''a ete enregistre.)%', v_nb, v_nb, v_rapport;
  else
    raise exception E'ECHEC : % verification(s) en echec sur %.%', v_ko, v_nb, v_rapport;
  end if;
end;
$test$;
