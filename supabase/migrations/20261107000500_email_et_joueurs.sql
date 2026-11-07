-- ============================================================================
-- 5/5 — E-MAIL DANS LES PROFILS + LISTE DES JOUEURS (espace admin)
-- ============================================================================
-- Rôle : copier l'e-mail du compte dans la table profiles. Sans lui, la liste des joueurs de l'espace
-- admin ne montrerait que des profils sans pseudo (un joueur invité n'a pas encore choisi le sien).
--   • Lecture : comme le reste du profil (chacun voit le sien, l'admin voit tout).
--   • Écriture : impossible depuis l'appli (seuls pseudo et avatar_id sont modifiables, voir …000200).
--   • Synchronisé automatiquement quand l'e-mail du compte change.
--   • admin_list_players() : la liste des joueurs avec leur nombre de cartes, réservée à l'admin.
--     (Calculée ici, côté serveur : l'API limite à 1000 lignes par requête.)
-- ============================================================================

alter table public.profiles add column email text;

-- Comptes déjà existants.
update public.profiles p set email = u.email from auth.users u where u.id = p.id;

-- Nouveaux comptes : on copie aussi l'e-mail.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end;
$$;

-- E-mail changé dans le tableau de bord Supabase : le profil suit.
create function public.handle_user_email_change() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;
create trigger on_auth_user_email_changed after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- ----------------------------------------------------------------------------
-- admin_list_players : joueurs + nombre de cartes (total avec doublons, et cartes différentes).
-- Réservée à l'admin : un joueur qui l'appelle reçoit une erreur.
-- ----------------------------------------------------------------------------
create function public.admin_list_players()
returns table (
  player_id uuid,
  email text,
  pseudo text,
  role text,
  created_at timestamptz,
  total_cards bigint,
  distinct_cards bigint
)
language plpgsql stable security definer set search_path = public
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  return query
    select p.id, p.email, p.pseudo, p.role, p.created_at,
           coalesce(sum(uc.quantity), 0)::bigint,
           count(uc.card_id)::bigint
      from public.profiles p
      left join public.user_cards uc on uc.user_id = p.id
     group by p.id
     order by p.created_at, p.id;
end;
$$;
revoke all on function public.admin_list_players() from public, anon;
grant execute on function public.admin_list_players() to authenticated;
