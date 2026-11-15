-- Frameora — Supabase setup
-- Run this once: Supabase dashboard → SQL Editor → New query → paste everything → Run.
-- Safe to re-run (it skips things that already exist and won't duplicate products).

-- 1. Admins: only users listed here can add / edit / delete products.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

drop policy if exists "Admins can see their own admin row" on public.admins;
create policy "Admins can see their own admin row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Helper used by the policies below. security definer so it can read public.admins.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2. Products shown on the website.
create table if not exists public.products (
  slug         text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text not null,
  category     text not null,
  kind         text not null default 'custom' check (kind in ('custom', 'ready')),
  description  text not null default '',
  finishes     text[] not null check (cardinality(finishes) > 0),
  sizes        jsonb not null check (jsonb_typeof(sizes) = 'array' and jsonb_array_length(sizes) > 0),
  art          text not null default 'hills',
  image_url    text,
  mat          boolean not null default true,
  badge        text,
  style        text,
  orientation  text not null default 'portrait' check (orientation in ('portrait', 'landscape', 'square')),
  sort         integer not null default 100,
  active       boolean not null default true,
  featured     boolean not null default false,   -- starred to show on the home page
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.products add column if not exists featured boolean not null default false;
create index if not exists products_sort_idx on public.products (sort, created_at);
alter table public.products enable row level security;

drop policy if exists "Anyone can view active products" on public.products;
create policy "Anyone can view active products" on public.products
  for select to anon, authenticated using (active or (select public.is_admin()));

drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products" on public.products
  for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products" on public.products
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
  for delete to authenticated using ((select public.is_admin()));

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- 3. Product photos (public to view, only admins can upload / replace / delete).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "Admins can replace product images" on storage.objects;
create policy "Admins can replace product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));

-- 4. Starting catalogue (today's products). Skipped for any slug that already exists.
insert into public.products (slug, name, category, kind, description, finishes, sizes, art, mat, badge, style, orientation, sort)
values
  ('classic-gallery', 'The Classic Gallery', 'wall', 'custom', 'A clean profile with a soft white mat — the frame that makes every photo look like it belongs in a gallery.', array['black','white','oak','walnut'], '[{"label":"8×10","w":8,"h":10,"price":799},{"label":"12×16","w":12,"h":16,"price":1299},{"label":"16×20","w":16,"h":20,"price":1899},{"label":"20×30","w":20,"h":30,"price":2799}]'::jsonb, 'hills', true, 'Bestseller', null, 'portrait', 0),
  ('heirloom-gold', 'Heirloom Gold', 'couple', 'custom', 'Antique gold finish with a deep bevel. Made for anniversaries and the photos you''ll keep for a lifetime.', array['gold','walnut'], '[{"label":"8×10","w":8,"h":10,"price":799},{"label":"12×16","w":12,"h":16,"price":1299},{"label":"16×20","w":16,"h":20,"price":1899},{"label":"20×30","w":20,"h":30,"price":2799}]'::jsonb, 'petal', true, 'Gift favourite', null, 'portrait', 10),
  ('desk-mini', 'Desk Mini', 'tabletop', 'custom', 'A compact table-top frame with a fold-out stand. Small enough for any desk, big enough to make you smile.', array['white','black','oak'], '[{"label":"5×7","w":5,"h":7,"price":449},{"label":"6×8","w":6,"h":8,"price":549},{"label":"8×10","w":8,"h":10,"price":749}]'::jsonb, 'bloom', false, null, null, 'portrait', 20),
  ('crystal-acrylic', 'Crystal Acrylic', 'acrylic', 'custom', 'Your photo printed directly behind 5mm crystal-clear acrylic. Glossy, vivid and completely frameless.', array['acrylic'], '[{"label":"8×10","w":8,"h":10,"price":799},{"label":"12×16","w":12,"h":16,"price":1299},{"label":"16×20","w":16,"h":20,"price":1899},{"label":"20×30","w":20,"h":30,"price":2799}]'::jsonb, 'coast', false, 'New', null, 'landscape', 30),
  ('memory-grid', 'Memory Grid', 'collage', 'custom', 'A square frame that holds your favourite memory front and centre — collage layouts coming soon.', array['black','white','oak'], '[{"label":"8×8","w":8,"h":8,"price":699},{"label":"12×12","w":12,"h":12,"price":1199},{"label":"16×16","w":16,"h":16,"price":1699}]'::jsonb, 'meadow', true, null, null, 'square', 40),
  ('mandir-blessings', 'Mandir Blessings', 'spiritual', 'custom', 'A rich gold frame for your family deity or a cherished photo of elders, made for the home mandir.', array['gold','walnut'], '[{"label":"5×7","w":5,"h":7,"price":449},{"label":"6×8","w":6,"h":8,"price":549},{"label":"8×10","w":8,"h":10,"price":749}]'::jsonb, 'temple', true, null, null, 'portrait', 50),
  ('saat-phere', 'Saat Phere', 'wedding', 'custom', 'Wide walnut moulding with a warm mat — built for the big wedding portrait on the living room wall.', array['walnut','gold','black'], '[{"label":"8×10","w":8,"h":10,"price":799},{"label":"12×16","w":12,"h":16,"price":1299},{"label":"16×20","w":16,"h":20,"price":1899},{"label":"20×30","w":20,"h":30,"price":2799}]'::jsonb, 'dusk', true, 'Wedding season', null, 'landscape', 60),
  ('noir-city', 'Noir City — Print', 'ready-made', 'ready', 'A moody monochrome art print, framed and ready to hang. No upload needed.', array['black','white'], '[{"label":"8×10","w":8,"h":10,"price":799},{"label":"12×16","w":12,"h":16,"price":1299},{"label":"16×20","w":16,"h":20,"price":1899},{"label":"20×30","w":20,"h":30,"price":2799}]'::jsonb, 'noir', true, null, 'charcoal', 'portrait', 70),
  ('golden-meadow', 'Golden Meadow — Print', 'ready-made', 'ready', 'Warm, sunlit botanical art that brightens any room. Arrives framed and ready to hang.', array['oak','white'], '[{"label":"8×10","w":8,"h":10,"price":799},{"label":"12×16","w":12,"h":16,"price":1299},{"label":"16×20","w":16,"h":20,"price":1899},{"label":"20×30","w":20,"h":30,"price":2799}]'::jsonb, 'meadow', true, null, 'botanical-art', 'landscape', 80)
on conflict (slug) do nothing;

-- 5. Make yourself an admin:
--    a) Dashboard → Authentication → Users → "Add user" → enter your email + a password,
--       tick "Auto Confirm User".
--    b) Then run this line with your email:
-- insert into public.admins (user_id) select id from auth.users where email = 'you@example.com' on conflict do nothing;
