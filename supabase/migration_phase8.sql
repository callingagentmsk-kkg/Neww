-- =========================================================================
-- MIGRATION: Phase 8 — Image / PDF upload from Admin Panel (Supabase Storage)
-- -------------------------------------------------------------------------
-- Run this ONCE in Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- Safe to run multiple times. Does NOT delete any existing data.
--
-- Creates a PUBLIC-READ storage bucket "site-images". Only a logged-in
-- admin (Supabase Auth "authenticated" role) can upload / replace / delete.
-- The new "Upload" buttons in the Admin Panel (hero image, teacher photo,
-- logo, batch image, PDF notes) store files here and paste the public URL.
-- =========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images', 'site-images', true, 15728640,
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','application/pdf']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 15728640,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','application/pdf'];

drop policy if exists "site-images public read" on storage.objects;
create policy "site-images public read" on storage.objects
  for select using (bucket_id = 'site-images');

drop policy if exists "site-images admin insert" on storage.objects;
create policy "site-images admin insert" on storage.objects
  for insert with check (bucket_id = 'site-images' and auth.role() = 'authenticated');

drop policy if exists "site-images admin update" on storage.objects;
create policy "site-images admin update" on storage.objects
  for update using (bucket_id = 'site-images' and auth.role() = 'authenticated');

drop policy if exists "site-images admin delete" on storage.objects;
create policy "site-images admin delete" on storage.objects
  for delete using (bucket_id = 'site-images' and auth.role() = 'authenticated');

-- Done. Admin Panel -> any "Upload" button will now work.
