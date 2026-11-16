import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import type { SessionUser } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const COOKIE = "dear_diary_session";
const secret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "dear-diary-local-dev-secret-change-me",
  );

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id || !user.email) return null;
    return { id: user.id, email: user.email, source: "supabase" };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = payload.sub;
    const email = payload.email as string;
    if (!id || !email) return null;
    return { id, email, source: "local" };
  } catch {
    return null;
  }
}

export async function createLocalSession(userId: string, email: string) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearLocalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

export async function ensureProfile(userId: string, email: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();
    if (!data) {
      await supabase.from("profiles").insert({ user_id: userId, nickname: email.split("@")[0] || "lovely" });
    }
    return;
  }

  const rows = await sql<{ user_id: string }>("select user_id from users where id = $1", [userId]);
  if (rows.length === 0) return;

  const profiles = await sql("select user_id from profiles where user_id = $1", [userId]);
  if (profiles.length === 0) {
    const nickname = email.split("@")[0] || "lovely";
    await sql("insert into profiles (user_id, nickname) values ($1, $2)", [userId, nickname]);
  }
}