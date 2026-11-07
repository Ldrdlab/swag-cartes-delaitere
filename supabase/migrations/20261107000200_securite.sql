-- ============================================================================
-- 2/4 — SÉCURITÉ : droits d'accès et Row Level Security (RLS)
-- ============================================================================
-- Rôle : décider qui peut lire / écrire quoi. Principe : TOUT est interdit par défaut, puis on ouvre
-- le strict nécessaire.
--   • Un joueur lit les cartes actives (+ celles qu'il possède), sa collection, son profil. Rien d'autre.
--   • L'admin lit et modifie tout.
--   • Le rôle « admin » ne peut être donné que depuis la base (éditeur SQL), jamais depuis l'appli.
--   • Les collections ne sont modifiées que par la fonction open_booster() (fichier suivant).
-- ============================================================================

-- Qui est admin ? (« security definer » : la fonction lit profiles sans être bloquée par la RLS,
-- ce qui évite qu'une règle de profiles ne s'appelle elle-même.)
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ----------------------------------------------------------------------------
-- 1) On retire tous les droits par défaut, puis on redonne le minimum.
--    (Supabase donne par défaut tous les droits aux rôles « anon » et « authenticated ».)
-- ----------------------------------------------------------------------------
revoke all on table
  public.profiles, public.cards, public.user_cards, public.booster_openings, public.app_config
from anon, authenticated;

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.user_cards enable row level security;
alter table public.booster_openings enable row level security;
alter table public.app_config enable row level security;

-- Profils : lecture ; modification du pseudo et de l'avatar UNIQUEMENT (jamais du rôle).
grant select on public.profiles to authenticated;
grant update (pseudo, avatar_id) on public.profiles to authenticated;

-- Les autres tables : les droits sont donnés ici, mais les règles (policies) plus bas les limitent.
grant select, insert, update, delete on public.cards to authenticated;
grant select, insert, update, delete on public.user_cards to authenticated;
grant select on public.booster_openings to authenticated;
grant select, update on public.app_config to authenticated;

-- ----------------------------------------------------------------------------
-- 2) Règles RLS (policies)
-- ----------------------------------------------------------------------------

-- profiles
create policy profiles_lecture on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
create policy profiles_modif_soi on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_modif_admin on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- cards : un joueur voit les cartes actives et celles qu'il possède (même désactivées) ; l'admin voit tout.
create policy cards_lecture on public.cards for select to authenticated
  using (
    active
    or public.is_admin()
    or exists (
      select 1 from public.user_cards uc
      where uc.card_id = cards.id and uc.user_id = (select auth.uid())
    )
  );
create policy cards_ajout_admin on public.cards for insert to authenticated
  with check (public.is_admin());
create policy cards_modif_admin on public.cards for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy cards_suppression_admin on public.cards for delete to authenticated
  using (public.is_admin());

-- user_cards : un joueur lit sa collection ; seul l'admin peut la modifier à la main.
create policy user_cards_lecture on public.user_cards for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
create policy user_cards_ajout_admin on public.user_cards for insert to authenticated
  with check (public.is_admin());
create policy user_cards_modif_admin on public.user_cards for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy user_cards_suppression_admin on public.user_cards for delete to authenticated
  using (public.is_admin());

-- booster_openings : un joueur lit son historique, l'admin lit tout. Personne n'écrit directement.
create policy openings_lecture on public.booster_openings for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- app_config : réservé à l'admin (les joueurs passent par les fonctions get_min_version / get_booster_status).
create policy config_lecture_admin on public.app_config for select to authenticated
  using (public.is_admin());
create policy config_modif_admin on public.app_config for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3) Double verrou sur le rôle : même si un droit était donné par erreur un jour, une requête venant
--    de l'appli (qui a toujours un utilisateur connecté) ne peut pas changer le rôle.
--    Depuis l'éditeur SQL de Supabase (aucun utilisateur connecté), c'est autorisé.
-- ----------------------------------------------------------------------------
create function public.empecher_changement_role() returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'Le role ne peut etre change que depuis la base de donnees.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger profiles_garde_role before update of role on public.profiles
  for each row execute function public.empecher_changement_role();
