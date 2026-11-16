-- Run in Supabase SQL editor or via Supabase CLI
-- Mirrors migrations/001_schema.sql with RLS

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text default 'lovely',
  avatar_url text,
  paper_style text not null default 'cream',
  typewriter_font text not null default 'special-elite',
  theme text not null default 'warm',
  background_style text not null default 'floral',
  ambient_sound text default 'none',
  typewriter_sounds boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  mood text,
  is_favorite boolean not null default false,
  written_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  caption text not null default '',
  photo_url text,
  photo_path text,
  moment_date date,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  deliver_on date,
  is_opened boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorite_things (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'thought',
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dreams_wishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mood_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid references public.journal_entries(id) on delete set null,
  mood text not null,
  note text,
  logged_at date not null default current_date,
  created_at timestamptz not null default now()
);

create unique index if not exists mood_log_user_day on public.mood_log(user_id, logged_at);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('entry', 'memory')),
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.memories enable row level security;
alter table public.letters enable row level security;
alter table public.favorite_things enable row level security;
alter table public.dreams_wishes enable row level security;
alter table public.mood_log enable row level security;
alter table public.favorites enable row level security;

create policy "profiles_own" on public.profiles for all using (auth.uid() = user_id);
create policy "entries_own" on public.journal_entries for all using (auth.uid() = user_id);
create policy "memories_own" on public.memories for all using (auth.uid() = user_id);
create policy "letters_own" on public.letters for all using (auth.uid() = user_id);
create policy "things_own" on public.favorite_things for all using (auth.uid() = user_id);
create policy "dreams_own" on public.dreams_wishes for all using (auth.uid() = user_id);
create policy "mood_own" on public.mood_log for all using (auth.uid() = user_id);
create policy "favorites_own" on public.favorites for all using (auth.uid() = user_id);

-- Storage bucket: create `diary-photos` in dashboard, private, policies:
-- (select/insert/update/delete) where bucket_id = 'diary-photos' and auth.uid()::text = (storage.foldername(name))[1]