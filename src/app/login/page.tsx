import { db } from "@/lib/db";
import { lucia, pwd } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user) redirect("/login?error=" + encodeURIComponent("Credenziali non valide"));

  const key = await db.key.findUnique({ where: { id: `email:${email}` } });
  if (!key?.hashedPassword) redirect("/login?error=" + encodeURIComponent("Credenziali non valide"));

  const ok = await pwd.verify(key.hashedPassword, password);
  if (!ok) redirect("/login?error=" + encodeURIComponent("Credenziali non valide"));

  const session = await lucia.createSession(user.id, { });
  const cookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(cookie.name, cookie.value, cookie.attributes);

  redirect("/dashboard");
}

export default async function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <form action={login} className="space-y-4">
        <input name="email" type="email" required placeholder="Email"
          className="w-full rounded-lg border px-3 py-2" />
        <input name="password" type="password" required placeholder="Password"
          className="w-full rounded-lg border px-3 py-2" />
        <button className="rounded-lg bg-black px-4 py-2 text-white dark:bg-white dark:text-black">
          Entra
        </button>
      </form>
      <p className="mt-3 text-sm">
        Nuovo utente? <a href="/register" className="underline">Registrati</a>
      </p>
    </main>
  );
}