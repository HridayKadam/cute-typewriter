-- dear diary ♡ schema

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  supabase_id uuid unique,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  user_id uuid primary key references users(id) on delete cascade,
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

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  mood text,
  is_favorite boolean not null default false,
  written_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null default '',
  caption text not null default '',
  photo_url text,
  photo_path text,
  moment_date date,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  deliver_on date,
  is_opened boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists favorite_things (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  category text not null default 'thought',
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dreams_wishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mood_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  entry_id uuid references journal_entries(id) on delete set null,
  mood text not null,
  note text,
  logged_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  item_type text not null check (item_type in ('entry', 'memory')),
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create index if not exists idx_journal_entries_user on journal_entries(user_id, written_at desc);
create index if not exists idx_memories_user on memories(user_id, created_at desc);
create index if not exists idx_letters_user on letters(user_id, created_at desc);
create index if not exists idx_mood_log_user_date on mood_log(user_id, logged_at);
create index if not exists idx_favorites_user on favorites(user_id);