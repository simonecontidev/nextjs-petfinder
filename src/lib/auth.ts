// src/lib/auth.ts
import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { Argon2id } from "oslo/password";

// ✅ v3: passa SOLO (session, user) e nello stesso ordine
const adapter = new PrismaAdapter(db.session, db.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "session",
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  },
  getUserAttributes: (user) => ({
    email: user.email,
  }),
});

export async function getSession() {
  const store = await cookies();
  const sessionId = store.get("session")?.value ?? null;
  if (!sessionId) return { session: null, user: null };
  return await lucia.validateSession(sessionId); // { session, user }
}

export const pwd = {
  hash: (plain: string) => new Argon2id().hash(plain),
  verify: (hash: string, plain: string) => new Argon2id().verify(hash, plain),
};

// ✅ Augmentazione tipi: così user.email è tipizzato
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
    };
    DatabaseSessionAttributes: {};
  }
}