import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createLocalSession, ensureProfile } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase!.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    if (data.user) await ensureProfile(data.user.id, data.user.email ?? email);
    return NextResponse.json({ ok: true });
  }

  const normalized = email.trim().toLowerCase();
  const rows = await sql<{ id: string; password_hash: string }>(
    "select id, password_hash from users where email = $1",
    [normalized],
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  await createLocalSession(rows[0].id, normalized);
  await ensureProfile(rows[0].id, normalized);
  return NextResponse.json({ ok: true });
}