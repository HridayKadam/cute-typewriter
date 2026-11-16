import { NextResponse } from "next/server";
import { clearLocalSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
  } else {
    await clearLocalSession();
  }
  return NextResponse.json({ ok: true });
}