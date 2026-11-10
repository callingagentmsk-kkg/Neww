-- =========================================================================
-- MIGRATION: Phase 9 — Ek chapter me MULTIPLE videos (naam ke saath)
-- -------------------------------------------------------------------------
-- Run this ONCE in Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- Safe to run multiple times (idempotent). Kisi bhi purane data ko delete
-- NAHI karta.
--
-- Kya karta hai:
--   1. public.chapter_videos table banata hai
--        (chapter_id, title, youtube_id, duration, enabled, sort_order)
--   2. Public site ko read access, aur sirf logged-in admin ko write access
--   3. Purane chapters ka single youtube_id automatically chapter_videos me
--      copy kar deta hai (sirf jinke videos abhi tak copy nahi hue)
--
-- NOTE: Is migration se pehle bhi website chalti rehti hai (purana single
-- video dikhata hai). Migration ke baad admin panel se ek chapter me jitne
-- chahein utne videos add kar sakte hain.
-- =========================================================================

create table if not exists public.chapter_videos (
  id          bigint generated always as identity primary key,
  chapter_id  bigint not null references public.chapters(id) on delete cascade,
  title       text   not null default 'Video',
  youtube_id  text   not null,
  duration    text,
  enabled     boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists chapter_videos_chapter_idx on public.chapter_videos(chapter_id);

alter table public.chapter_videos enable row level security;

drop policy if exists "public read chapter_videos" on public.chapter_videos;
create policy "public read chapter_videos" on public.chapter_videos
  for select using (true);

drop policy if exists "admin write chapter_videos" on public.chapter_videos;
create policy "admin write chapter_videos" on public.chapter_videos
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Purane single-video chapters ko naye table me copy karo (sirf ek baar).
insert into public.chapter_videos (chapter_id, title, youtube_id, duration, enabled, sort_order)
select c.id, c.title, c.youtube_id, c.duration, coalesce(c.video_enabled, true), 0
from public.chapters c
where c.youtube_id is not null
  and btrim(c.youtube_id) <> ''
  and not exists (select 1 from public.chapter_videos v where v.chapter_id = c.id);

-- Done. Admin Panel -> Batches -> chapter ke andar "+ Video" button aa jayega.
