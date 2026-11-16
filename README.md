# dear diary ♡

A cozy, vintage typewriter-inspired personal journal built with **Next.js**, **Tailwind CSS**, and **Supabase** (with a local dev mode when Supabase is not configured).

## Features

- Private authentication and per-user data
- Interactive typewriter writing desk with mechanical key sounds, autosave, moods, and favorites
- **My journal**, **Little moments** (photos), **Letters to myself**, **Things I love**, **Dreams & wishes**, **My favorites**
- Mood calendar and monthly mood history
- Personalization: paper styles, fonts, themes, ambient sounds

## Local development

```bash
npm install
env -u DATABASE_URL npm run dev
```

Open http://127.0.0.1:3000, create an account, and start writing. Without Supabase env vars, the app uses **PGlite** (in-memory Postgres) and cookie-based auth.

## Supabase setup (production)

1. Create a Supabase project.
2. Run SQL from `supabase/migrations/001_dear_diary.sql` in the SQL editor.
3. Create a **private** storage bucket `diary-photos` with RLS policies so users can only access their own folder.
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `AUTH_SECRET`.
5. Enable email auth in Supabase Authentication settings.

