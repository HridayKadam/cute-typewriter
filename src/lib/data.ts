import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  DreamWish,
  FavoriteThing,
  JournalEntry,
  Letter,
  Memory,
  MoodLog,
  Profile,
} from "@/lib/types";

export class AuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AuthError";
  }
}

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new AuthError();
  return user;
}

// ——— Profile ———
export async function getProfile(): Promise<Profile | null> {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    return data as Profile | null;
  }
  const rows = await sql<Profile>("select * from profiles where user_id = $1", [user.id]);
  return rows[0] ?? null;
}

export async function updateProfile(patch: Partial<Profile>) {
  const user = await requireUser();
  const fields = ["nickname", "paper_style", "typewriter_font", "theme", "background_style", "ambient_sound", "typewriter_sounds"] as const;
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const f of fields) {
      if (patch[f] !== undefined) payload[f] = patch[f];
    }
    await supabase!.from("profiles").update(payload).eq("user_id", user.id);
    return getProfile();
  }
  const sets: string[] = ["updated_at = now()"];
  const params: unknown[] = [user.id];
  let i = 2;
  for (const f of fields) {
    if (patch[f] !== undefined) {
      sets.push(`${f} = $${i++}`);
      params.push(patch[f]);
    }
  }
  await sql(`update profiles set ${sets.join(", ")} where user_id = $1`, params);
  return getProfile();
}

// ——— Journal entries ———
export async function listEntries(limit = 50): Promise<JournalEntry[]> {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("written_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as JournalEntry[];
  }
  return sql<JournalEntry>(
    "select * from journal_entries where user_id = $1 order by written_at desc limit $2",
    [user.id, limit],
  );
}

export async function getEntry(id: string): Promise<JournalEntry | null> {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!
      .from("journal_entries")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    return data as JournalEntry | null;
  }
  const rows = await sql<JournalEntry>(
    "select * from journal_entries where id = $1 and user_id = $2",
    [id, user.id],
  );
  return rows[0] ?? null;
}

export async function upsertEntry(
  input: Partial<JournalEntry> & { id?: string; title?: string; body?: string },
): Promise<JournalEntry> {
  const user = await requireUser();
  const title = input.title ?? "";
  const body = input.body ?? "";
  const mood = input.mood ?? null;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (input.id) {
      const { data, error } = await supabase!
        .from("journal_entries")
        .update({
          title,
          body,
          mood,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data as JournalEntry;
    }
    const { data, error } = await supabase!
      .from("journal_entries")
      .insert({ user_id: user.id, title, body, mood })
      .select()
      .single();
    if (error) throw error;
    if (mood) await logMoodInternal(user.id, mood, data.id);
    return data as JournalEntry;
  }

  if (input.id) {
    const rows = await sql<JournalEntry>(
      `update journal_entries set title = $3, body = $4, mood = $5, updated_at = now()
       where id = $1 and user_id = $2 returning *`,
      [input.id, user.id, title, body, mood],
    );
    if (!rows[0]) throw new Error("Not found");
    if (mood) await logMoodInternal(user.id, mood, input.id);
    return rows[0];
  }
  const rows = await sql<JournalEntry>(
    `insert into journal_entries (user_id, title, body, mood) values ($1, $2, $3, $4) returning *`,
    [user.id, title, body, mood],
  );
  if (mood) await logMoodInternal(user.id, mood, rows[0].id);
  return rows[0];
}

export async function deleteEntry(id: string) {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase!.from("journal_entries").delete().eq("id", id).eq("user_id", user.id);
    return;
  }
  await sql("delete from journal_entries where id = $1 and user_id = $2", [id, user.id]);
}

export async function toggleEntryFavorite(id: string, favorite: boolean) {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase!
      .from("journal_entries")
      .update({ is_favorite: favorite })
      .eq("id", id)
      .eq("user_id", user.id);
    if (favorite) {
      await supabase!.from("favorites").upsert({ user_id: user.id, item_type: "entry", item_id: id });
    } else {
      await supabase!.from("favorites").delete().eq("user_id", user.id).eq("item_type", "entry").eq("item_id", id);
    }
    return;
  }
  await sql("update journal_entries set is_favorite = $3 where id = $1 and user_id = $2", [id, user.id, favorite]);
  if (favorite) {
    await sql(
      `insert into favorites (user_id, item_type, item_id) values ($1, 'entry', $2)
       on conflict (user_id, item_type, item_id) do nothing`,
      [user.id, id],
    );
  } else {
    await sql("delete from favorites where user_id = $1 and item_type = 'entry' and item_id = $2", [user.id, id]);
  }
}

export async function entryDatesInMonth(year: number, month: number) {
  const user = await requireUser();
  const start = new Date(year, month, 1).toISOString();
  const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!
      .from("journal_entries")
      .select("written_at")
      .eq("user_id", user.id)
      .gte("written_at", start)
      .lte("written_at", end);
    return (data ?? []).map((r) => new Date(r.written_at as string).getDate());
  }
  const rows = await sql<{ day: number }>(
    `select extract(day from written_at)::int as day from journal_entries
     where user_id = $1 and written_at >= $2 and written_at <= $3`,
    [user.id, start, end],
  );
  return rows.map((r) => r.day);
}

// ——— Memories ———
export async function listMemories(): Promise<Memory[]> {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!
      .from("memories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    return (data ?? []) as Memory[];
  }
  return sql<Memory>("select * from memories where user_id = $1 order by created_at desc", [user.id]);
}

export async function upsertMemory(input: Partial<Memory> & { id?: string }) {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const payload = {
      title: input.title ?? "",
      caption: input.caption ?? "",
      photo_url: input.photo_url ?? null,
      photo_path: input.photo_path ?? null,
      moment_date: input.moment_date ?? null,
      updated_at: new Date().toISOString(),
    };
    if (input.id) {
      const { data } = await supabase!
        .from("memories")
        .update(payload)
        .eq("id", input.id)
        .eq("user_id", user.id)
        .select()
        .single();
      return data as Memory;
    }
    const { data } = await supabase!
      .from("memories")
      .insert({ user_id: user.id, ...payload })
      .select()
      .single();
    return data as Memory;
  }
  if (input.id) {
    const rows = await sql<Memory>(
      `update memories set title=$3,caption=$4,photo_url=$5,photo_path=$6,moment_date=$7,updated_at=now()
       where id=$1 and user_id=$2 returning *`,
      [input.id, user.id, input.title ?? "", input.caption ?? "", input.photo_url ?? null, input.photo_path ?? null, input.moment_date ?? null],
    );
    return rows[0];
  }
  const rows = await sql<Memory>(
    `insert into memories (user_id,title,caption,photo_url,photo_path,moment_date)
     values ($1,$2,$3,$4,$5,$6) returning *`,
    [user.id, input.title ?? "", input.caption ?? "", input.photo_url ?? null, input.photo_path ?? null, input.moment_date ?? null],
  );
  return rows[0];
}

export async function deleteMemory(id: string) {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase!.from("memories").delete().eq("id", id).eq("user_id", user.id);
    return;
  }
  await sql("delete from memories where id = $1 and user_id = $2", [id, user.id]);
}

// ——— Letters ———
export async function listLetters(): Promise<Letter[]> {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!.from("letters").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    return (data ?? []) as Letter[];
  }
  return sql<Letter>("select * from letters where user_id = $1 order by created_at desc", [user.id]);
}

export async function upsertLetter(input: Partial<Letter> & { id?: string }) {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const payload = {
      title: input.title ?? "",
      body: input.body ?? "",
      deliver_on: input.deliver_on ?? null,
      updated_at: new Date().toISOString(),
    };
    if (input.id) {
      const { data } = await supabase!.from("letters").update(payload).eq("id", input.id).eq("user_id", user.id).select().single();
      return data as Letter;
    }
    const { data } = await supabase!.from("letters").insert({ user_id: user.id, ...payload }).select().single();
    return data as Letter;
  }
  if (input.id) {
    const rows = await sql<Letter>(
      `update letters set title=$3,body=$4,deliver_on=$5,updated_at=now() where id=$1 and user_id=$2 returning *`,
      [input.id, user.id, input.title ?? "", input.body ?? "", input.deliver_on ?? null],
    );
    return rows[0];
  }
  const rows = await sql<Letter>(
    `insert into letters (user_id,title,body,deliver_on) values ($1,$2,$3,$4) returning *`,
    [user.id, input.title ?? "", input.body ?? "", input.deliver_on ?? null],
  );
  return rows[0];
}

export async function deleteLetter(id: string) {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase!.from("letters").delete().eq("id", id).eq("user_id", user.id);
    return;
  }
  await sql("delete from letters where id = $1 and user_id = $2", [id, user.id]);
}

// ——— Favorite things ———
export async function listFavoriteThings(): Promise<FavoriteThing[]> {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!.from("favorite_things").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    return (data ?? []) as FavoriteThing[];
  }
  return sql<FavoriteThing>("select * from favorite_things where user_id = $1 order by created_at desc", [user.id]);
}

export async function upsertFavoriteThing(input: Partial<FavoriteThing> & { id?: string }) {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const payload = {
      category: input.category ?? "thought",
      title: input.title ?? "",
      content: input.content ?? "",
      updated_at: new Date().toISOString(),
    };
    if (input.id) {
      const { data } = await supabase!.from("favorite_things").update(payload).eq("id", input.id).eq("user_id", user.id).select().single();
      return data as FavoriteThing;
    }
    const { data } = await supabase!.from("favorite_things").insert({ user_id: user.id, ...payload }).select().single();
    return data as FavoriteThing;
  }
  if (input.id) {
    const rows = await sql<FavoriteThing>(
      `update favorite_things set category=$3,title=$4,content=$5,updated_at=now() where id=$1 and user_id=$2 returning *`,
      [input.id, user.id, input.category ?? "thought", input.title ?? "", input.content ?? ""],
    );
    return rows[0];
  }
  const rows = await sql<FavoriteThing>(
    `insert into favorite_things (user_id,category,title,content) values ($1,$2,$3,$4) returning *`,
    [user.id, input.category ?? "thought", input.title ?? "", input.content ?? ""],
  );
  return rows[0];
}

export async function deleteFavoriteThing(id: string) {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase!.from("favorite_things").delete().eq("id", id).eq("user_id", user.id);
    return;
  }
  await sql("delete from favorite_things where id = $1 and user_id = $2", [id, user.id]);
}

// ——— Dreams ———
export async function listDreams(): Promise<DreamWish[]> {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!.from("dreams_wishes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    return (data ?? []) as DreamWish[];
  }
  return sql<DreamWish>("select * from dreams_wishes where user_id = $1 order by created_at desc", [user.id]);
}

export async function upsertDream(input: Partial<DreamWish> & { id?: string }) {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const payload = {
      title: input.title ?? "",
      description: input.description ?? "",
      is_completed: input.is_completed ?? false,
      completed_at: input.is_completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    if (input.id) {
      const { data } = await supabase!.from("dreams_wishes").update(payload).eq("id", input.id).eq("user_id", user.id).select().single();
      return data as DreamWish;
    }
    const { data } = await supabase!.from("dreams_wishes").insert({ user_id: user.id, ...payload }).select().single();
    return data as DreamWish;
  }
  if (input.id) {
    const rows = await sql<DreamWish>(
      `update dreams_wishes set title=$3,description=$4,is_completed=$5,completed_at=case when $5 then now() else null end,updated_at=now()
       where id=$1 and user_id=$2 returning *`,
      [input.id, user.id, input.title ?? "", input.description ?? "", input.is_completed ?? false],
    );
    return rows[0];
  }
  const rows = await sql<DreamWish>(
    `insert into dreams_wishes (user_id,title,description) values ($1,$2,$3) returning *`,
    [user.id, input.title ?? "", input.description ?? ""],
  );
  return rows[0];
}

export async function deleteDream(id: string) {
  const user = await requireUser();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase!.from("dreams_wishes").delete().eq("id", id).eq("user_id", user.id);
    return;
  }
  await sql("delete from dreams_wishes where id = $1 and user_id = $2", [id, user.id]);
}

// ——— Mood ———
async function logMoodInternal(userId: string, mood: string, entryId?: string) {
  const today = new Date().toISOString().slice(0, 10);
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase!.from("mood_log").upsert(
      { user_id: userId, mood, entry_id: entryId ?? null, logged_at: today },
      { onConflict: "user_id,logged_at" },
    );
    return;
  }
  await sql(
    `insert into mood_log (user_id, mood, entry_id, logged_at) values ($1, $2, $3, $4::date)
     on conflict (user_id, logged_at) do update set mood = excluded.mood, entry_id = excluded.entry_id`,
    [userId, mood, entryId ?? null, today],
  );
}

export async function listMoods(year: number, month: number): Promise<MoodLog[]> {
  const user = await requireUser();
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!
      .from("mood_log")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", start)
      .lte("logged_at", end);
    return (data ?? []) as MoodLog[];
  }
  return sql<MoodLog>(
    `select * from mood_log where user_id = $1 and logged_at >= $2 and logged_at <= $3 order by logged_at`,
    [user.id, start, end],
  );
}

export async function listFavorites() {
  await requireUser();
  const entries = (await listEntries(200)).filter((e) => e.is_favorite);
  const memories = (await listMemories()).filter((m) => m.is_favorite);
  return { entries, memories };
}