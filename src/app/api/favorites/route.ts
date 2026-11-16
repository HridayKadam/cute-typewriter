import { NextResponse } from "next/server";
import { AuthError, listFavorites } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await listFavorites());
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}