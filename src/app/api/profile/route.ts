import { NextResponse } from "next/server";
import { AuthError, getProfile, updateProfile } from "@/lib/data";

export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json(profile);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}

export async function PATCH(req: Request) {
  try {
    const profile = await updateProfile(await req.json());
    return NextResponse.json(profile);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}