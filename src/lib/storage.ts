import { v4 as uuidv4 } from "uuid";
import type {
  DreamWish,
  FavoriteThing,
  JournalEntry,
  Letter,
  Memory,
  MoodLog,
  Profile,
} from "@/lib/types";

const KEYS = {
  profile: "dear-diary-profile",
  entries: "dear-diary-entries",
  memories: "dear-diary-memories",
  letters: "dear-diary-letters",
  things: "dear-diary-things",
  dreams: "dear-diary-dreams",
  moods: "dear-diary-moods",
} as const;

const defaultProfile: Profile = {
  user_id: "local",
  nickname: "lovely",
  avatar_url: null,
  paper_style: "cream",
  typewriter_font: "special-elite",
  theme: "warm",
  background_style: "floral",
  ambient_sound: "none",
  typewriter_sounds: true,
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile(): Profile {
  return { ...defaultProfile, ...read<Partial<Profile>>(KEYS.profile, {}) };
}

export function updateProfile(patch: Partial<Profile>): Profile {
  const next = { ...getProfile(), ...patch };
  write(KEYS.profile, next);
  return next;
}

function logMood(mood: string, entryId?: string) {
  const moods = read<MoodLog[]>(KEYS.moods, []);
  const today = new Date().toISOString().slice(0, 10);
  const existing = moods.findIndex((m) => m.logged_at.slice(0, 10) === today);
  const row: MoodLog = {
    id: existing >= 0 ? moods[existing].id : uuidv4(),
    user_id: "local",
    entry_id: entryId ?? null,
    mood,
    note: null,
    logged_at: today,
    created_at: new Date().toISOString(),
  };
  if (existing >= 0) moods[existing] = row;
  else moods.push(row);
  write(KEYS.moods, moods);
}

export function listEntries(limit = 50): JournalEntry[] {
  const all = read<JournalEntry[]>(KEYS.entries, []);
  return all
    .sort((a, b) => new Date(b.written_at).getTime() - new Date(a.written_at).getTime())
    .slice(0, limit);
}

export function getEntry(id: string): JournalEntry | undefined {
  return read<JournalEntry[]>(KEYS.entries, []).find((e) => e.id === id);
}

export function upsertEntry(input: {
  id?: string;
  title?: string;
  body?: string;
  mood?: string | null;
}): JournalEntry {
  const all = read<JournalEntry[]>(KEYS.entries, []);
  const now = new Date().toISOString();
  const title = input.title ?? "";
  const body = input.body ?? "";
  const mood = input.mood ?? null;

  if (input.id) {
    const idx = all.findIndex((e) => e.id === input.id);
    if (idx < 0) throw new Error("Not found");
    all[idx] = { ...all[idx], title, body, mood, updated_at: now };
    write(KEYS.entries, all);
    if (mood) logMood(mood, input.id);
    return all[idx];
  }

  const entry: JournalEntry = {
    id: uuidv4(),
    user_id: "local",
    title,
    body,
    mood,
    is_favorite: false,
    written_at: now,
    created_at: now,
    updated_at: now,
  };
  all.unshift(entry);
  write(KEYS.entries, all);
  if (mood) logMood(mood, entry.id);
  return entry;
}

export function deleteEntry(id: string) {
  write(
    KEYS.entries,
    read<JournalEntry[]>(KEYS.entries, []).filter((e) => e.id !== id),
  );
}

export function toggleEntryFavorite(id: string, favorite: boolean) {
  const all = read<JournalEntry[]>(KEYS.entries, []);
  const idx = all.findIndex((e) => e.id === id);
  if (idx >= 0) {
    all[idx].is_favorite = favorite;
    write(KEYS.entries, all);
  }
}

export function entryDatesInMonth(year: number, month: number): number[] {
  return read<JournalEntry[]>(KEYS.entries, [])
    .filter((e) => {
      const d = new Date(e.written_at);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .map((e) => new Date(e.written_at).getDate());
}

export function listMemories(): Memory[] {
  return read<Memory[]>(KEYS.memories, []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function upsertMemory(input: Partial<Memory> & { id?: string }): Memory {
  const all = read<Memory[]>(KEYS.memories, []);
  const now = new Date().toISOString();
  if (input.id) {
    const idx = all.findIndex((m) => m.id === input.id);
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        title: input.title ?? "",
        caption: input.caption ?? "",
        photo_url: input.photo_url ?? null,
        updated_at: now,
      };
      write(KEYS.memories, all);
      return all[idx];
    }
  }
  const memory: Memory = {
    id: uuidv4(),
    user_id: "local",
    title: input.title ?? "",
    caption: input.caption ?? "",
    photo_url: input.photo_url ?? null,
    photo_path: null,
    moment_date: null,
    is_favorite: false,
    created_at: now,
    updated_at: now,
  };
  all.unshift(memory);
  write(KEYS.memories, all);
  return memory;
}

export function deleteMemory(id: string) {
  write(KEYS.memories, read<Memory[]>(KEYS.memories, []).filter((m) => m.id !== id));
}

export function listLetters(): Letter[] {
  return read<Letter[]>(KEYS.letters, []);
}

export function upsertLetter(input: Partial<Letter> & { id?: string }): Letter {
  const all = read<Letter[]>(KEYS.letters, []);
  const now = new Date().toISOString();
  if (input.id) {
    const idx = all.findIndex((l) => l.id === input.id);
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        title: input.title ?? "",
        body: input.body ?? "",
        deliver_on: input.deliver_on ?? null,
        updated_at: now,
      };
      write(KEYS.letters, all);
      return all[idx];
    }
  }
  const letter: Letter = {
    id: uuidv4(),
    user_id: "local",
    title: input.title ?? "",
    body: input.body ?? "",
    deliver_on: input.deliver_on ?? null,
    is_opened: false,
    created_at: now,
    updated_at: now,
  };
  all.unshift(letter);
  write(KEYS.letters, all);
  return letter;
}

export function deleteLetter(id: string) {
  write(KEYS.letters, read<Letter[]>(KEYS.letters, []).filter((l) => l.id !== id));
}

export function listFavoriteThings(): FavoriteThing[] {
  return read<FavoriteThing[]>(KEYS.things, []);
}

export function upsertFavoriteThing(input: Partial<FavoriteThing> & { id?: string }): FavoriteThing {
  const all = read<FavoriteThing[]>(KEYS.things, []);
  const now = new Date().toISOString();
  if (input.id) {
    const idx = all.findIndex((t) => t.id === input.id);
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        category: input.category ?? "thought",
        title: input.title ?? "",
        content: input.content ?? "",
        updated_at: now,
      };
      write(KEYS.things, all);
      return all[idx];
    }
  }
  const thing: FavoriteThing = {
    id: uuidv4(),
    user_id: "local",
    category: input.category ?? "thought",
    title: input.title ?? "",
    content: input.content ?? "",
    created_at: now,
    updated_at: now,
  };
  all.unshift(thing);
  write(KEYS.things, all);
  return thing;
}

export function deleteFavoriteThing(id: string) {
  write(KEYS.things, read<FavoriteThing[]>(KEYS.things, []).filter((t) => t.id !== id));
}

export function listDreams(): DreamWish[] {
  return read<DreamWish[]>(KEYS.dreams, []);
}

export function upsertDream(input: Partial<DreamWish> & { id?: string }): DreamWish {
  const all = read<DreamWish[]>(KEYS.dreams, []);
  const now = new Date().toISOString();
  if (input.id) {
    const idx = all.findIndex((d) => d.id === input.id);
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        title: input.title ?? "",
        description: input.description ?? "",
        is_completed: input.is_completed ?? false,
        completed_at: input.is_completed ? now : null,
        updated_at: now,
      };
      write(KEYS.dreams, all);
      return all[idx];
    }
  }
  const dream: DreamWish = {
    id: uuidv4(),
    user_id: "local",
    title: input.title ?? "",
    description: input.description ?? "",
    is_completed: false,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };
  all.unshift(dream);
  write(KEYS.dreams, all);
  return dream;
}

export function deleteDream(id: string) {
  write(KEYS.dreams, read<DreamWish[]>(KEYS.dreams, []).filter((d) => d.id !== id));
}

export function listMoods(year: number, month: number): MoodLog[] {
  return read<MoodLog[]>(KEYS.moods, []).filter((m) => {
    const d = new Date(m.logged_at);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function listFavorites() {
  return {
    entries: listEntries(200).filter((e) => e.is_favorite),
    memories: listMemories().filter((m) => m.is_favorite),
  };
}

export type CollectionKey = "letters" | "things";

export function listCollection(key: CollectionKey): Record<string, unknown>[] {
  if (key === "letters") return listLetters() as unknown as Record<string, unknown>[];
  return listFavoriteThings() as unknown as Record<string, unknown>[];
}

export function saveCollectionItem(key: CollectionKey, input: Record<string, unknown>) {
  if (key === "letters") return upsertLetter(input as Partial<Letter> & { id?: string });
  return upsertFavoriteThing(input as Partial<FavoriteThing> & { id?: string });
}

export function deleteCollectionItem(key: CollectionKey, id: string) {
  if (key === "letters") deleteLetter(id);
  else deleteFavoriteThing(id);
}