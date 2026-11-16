import { NextResponse } from "next/server";
import { AuthError, entryDatesInMonth, listMoods } from "@/lib/data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = Number(searchParams.get("year") ?? new Date().getFullYear());
    const month = Number(searchParams.get("month") ?? new Date().getMonth());
    const type = searchParams.get("type");

    if (type === "writing-days") {
      const days = await entryDatesInMonth(year, month);
      return NextResponse.json({ days });
    }

    const moods = await listMoods(year, month);
    return NextResponse.json(moods);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}