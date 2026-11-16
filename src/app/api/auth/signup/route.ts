import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createLocalSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { email, password, nickname } = await req.json();
  if (!email?.trim() || !password || password.length < 6) {
    return NextResponse.json({ error: "Valid email and password (6+ chars) required" }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase!.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { nickname: nickname || "lovely" },
      },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (data.user) {
      await supabase!.from("profiles").upsert({
        user_id: data.user.id,
        nickname: nickname || data.user.email?.split("@")[0] || "lovely",
      });
    }
    return NextResponse.json({ ok: true, needsConfirmation: !data.session });
  }

  const normalized = email.trim().toLowerCase();
  const existing = await sql("select id from users where email = $1", [normalized]);
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const rows = await sql<{ id: string }>(
    "insert into users (email, password_hash) values ($1, $2) returning id",
    [normalized, hash],
  );
  const userId = rows[0].id;
  await sql("insert into profiles (user_id, nickname) values ($1, $2)", [
    userId,
    nickname || normalized.split("@")[0] || "lovely",
  ]);
  await createLocalSession(userId, normalized);
  return NextResponse.json({ ok: true });
}