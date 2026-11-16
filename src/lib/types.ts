export type Profile = {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  paper_style: string;
  typewriter_font: string;
  theme: string;
  background_style: string;
  ambient_sound: string | null;
  typewriter_sounds: boolean;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  mood: string | null;
  is_favorite: boolean;
  written_at: string;
  created_at: string;
  updated_at: string;
};

export type Memory = {
  id: string;
  user_id: string;
  title: string;
  caption: string;
  photo_url: string | null;
  photo_path: string | null;
  moment_date: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type Letter = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  deliver_on: string | null;
  is_opened: boolean;
  created_at: string;
  updated_at: string;
};

export type FavoriteThing = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type DreamWish = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MoodLog = {
  id: string;
  user_id: string;
  entry_id: string | null;
  mood: string;
  note: string | null;
  logged_at: string;
  created_at: string;
};

export type SessionUser = {
  id: string;
  email: string;
  source: "local" | "supabase";
};