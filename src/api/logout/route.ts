import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value ?? null;
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
    const blank = lucia.createBlankSessionCookie();
    cookieStore.set(blank.name, blank.value, blank.attributes);
  }
  return NextResponse.json({ ok: true });
}