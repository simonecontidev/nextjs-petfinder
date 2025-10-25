// src/app/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const store = await cookies();
  const sessionId = store.get("session")?.value ?? null;

  if (sessionId) {
    try {
      await lucia.invalidateSession(sessionId);
    } catch {
      // se già invalida, ignora
    }
    const blank = lucia.createBlankSessionCookie();
    store.set(blank.name, blank.value, blank.attributes);
  }

  // redirect a /login
  const redirectUrl = new URL("/login", request.nextUrl.origin);
  return NextResponse.redirect(redirectUrl);
}

export const dynamic = "force-dynamic";