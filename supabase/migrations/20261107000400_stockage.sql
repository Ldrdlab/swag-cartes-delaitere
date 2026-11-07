-- ============================================================================
-- 4/4 — STOCKAGE : bucket privé « cards » pour les images des cartes
-- ============================================================================
-- Rôle : les visuels des cartes (photos d'amis) sont stockés ICI, jamais dans GitHub.
--   • Le bucket est PRIVÉ : aucune adresse publique. L'appli utilise des adresses signées
--     (temporaires), obtenues uniquement par un utilisateur connecté.
--   • Lecture : tout utilisateur connecté. Écriture (ajout, modification, suppression) : admin seulement.
--   • Taille max 2 Mo par fichier, formats WebP / PNG / JPEG.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cards', 'cards', false, 2097152, array['image/webp', 'image/png', 'image/jpeg'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists cards_images_lecture on storage.objects;
drop policy if exists cards_images_ajout_admin on storage.objects;
drop policy if exists cards_images_modif_admin on storage.objects;
drop policy if exists cards_images_suppression_admin on storage.objects;

create policy cards_images_lecture on storage.objects for select to authenticated
  using (bucket_id = 'cards');
create policy cards_images_ajout_admin on storage.objects for insert to authenticated
  with check (bucket_id = 'cards' and public.is_admin());
create policy cards_images_modif_admin on storage.objects for update to authenticated
  using (bucket_id = 'cards' and public.is_admin())
  with check (bucket_id = 'cards' and public.is_admin());
create policy cards_images_suppression_admin on storage.objects for delete to authenticated
  using (bucket_id = 'cards' and public.is_admin());
