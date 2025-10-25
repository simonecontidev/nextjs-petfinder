import { db } from "@/lib/db";
import { lucia, pwd } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function register(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password || password.length < 6) {
    redirect("/register?error=" + encodeURIComponent("Password minima 6 caratteri"));
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=" + encodeURIComponent("Email già registrata"));
  }

  const user = await db.user.create({
    data: { email },
  });

  // crea key (password) per Lucia
  await db.key.create({
    data: {
      id: `email:${email}`,
      userId: user.id,
      hashedPassword: await pwd.hash(password),
      primary: true
    }
  });

  const session = await lucia.createSession(user.id, { });
  const cookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(cookie.name, cookie.value, cookie.attributes);

  redirect("/dashboard");
}

export default async function RegisterPage({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">Crea account</h1>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <form action={register} className="space-y-4">
        <input name="email" type="email" required placeholder="Email"
          className="w-full rounded-lg border px-3 py-2" />
        <input name="password" type="password" required placeholder="Password (min 6)"
          className="w-full rounded-lg border px-3 py-2" />
        <button className="rounded-lg bg-black px-4 py-2 text-white dark:bg-white dark:text-black">
          Registrati
        </button>
      </form>
      <p className="mt-3 text-sm">
        Hai già un account? <a href="/login" className="underline">Login</a>
      </p>
    </main>
  );
}