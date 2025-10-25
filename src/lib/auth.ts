// src/lib/auth.ts
import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { Argon2id } from "oslo/password";

// ⚠️ L'adapter per Prisma v5 richiede i model delegate in questo ordine: Session, Key, User
const adapter = new PrismaAdapter(db.session, db.key, db.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "session",
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  },
  // Questo definisce quali attributi dell'utente vuoi esporre a runtime
  getUserAttributes: (user) => ({
    email: user.email,
  }),
});

// 🔐 Helper per leggere la sessione lato server
export async function getSession() {
  const store = await cookies();
  const sessionId = store.get("session")?.value ?? null;
  if (!sessionId) return { session: null, user: null };
  const result = await lucia.validateSession(sessionId);
  return result; // { session, user }
}

// 🔑 Hash/verify password
export const pwd = {
  hash: (plain: string) => new Argon2id().hash(plain),
  verify: (hash: string, plain: string) => new Argon2id().verify(hash, plain),
};

/**
 * 🔧 AUGMENTAZIONE TIPI
 * Diciamo a Lucia quali attributi ha il nostro utente nel database
 * (così `user.email` non è più `{}` ma `string`).
 */
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
    };
    DatabaseSessionAttributes: {};
  }
}