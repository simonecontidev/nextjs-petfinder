// app/(auth)/register/page.tsx  (adatta il path al tuo progetto)
import { db } from "@/lib/db";
import { lucia, pwd } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

export const dynamic = "force-dynamic";

// --- Helpers ---
function fail(msg: string) {
  redirect("/register?error=" + encodeURIComponent(msg));
}

// lista minima di domini “usa e getta” (puoi ampliarla)
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "yopmail.com",
]);

// password comuni da rifiutare (estendi a piacere)
const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "111111",
  "123123",
]);

// schema di validazione con zod
const RegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email richiesta")
    .email("Email non valida")
    .max(254, "Email troppo lunga"),
  password: z
    .string()
    .min(8, "Password minima 8 caratteri")
    .max(72, "Password troppo lunga")
    // almeno 1 minuscola, 1 maiuscola, 1 numero, 1 simbolo
    .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero")
    .regex(/[^A-Za-z0-9]/, "La password deve contenere almeno un simbolo"),
  confirmPassword: z.string().min(1, "Conferma password richiesta"),
  accept: z.literal("on", {
    errorMap: () => ({ message: "Devi accettare Termini e Privacy" }),
  }),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le password non coincidono",
      path: ["confirmPassword"],
    });
  }
  if (COMMON_PASSWORDS.has(data.password.toLowerCase())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La password scelta è troppo comune",
      path: ["password"],
    });
  }
  const domain = data.email.split("@")[1] || "";
  if (DISPOSABLE_DOMAINS.has(domain)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Dominio email non accettato",
      path: ["email"],
    });
  }
});

async function register(formData: FormData) {
  "use server";

  // raccogli input dal form
  const raw = {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    confirmPassword: String(formData.get("confirmPassword") || ""),
    accept: String(formData.get("accept") || ""),
  };

  // valida con zod
  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    // prendi il primo errore “umano”
    const first = parsed.error.errors[0]?.message || "Dati non validi";
    fail(first);
  }

  const { email, password } = parsed.data;

  // check esistenza utente
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    fail("Email già registrata");
  }

  try {
    // crea utente + key in transazione
    const user = await db.user.create({
      data: { email },
    });

    await db.key.create({
      data: {
        id: `email:${email}`,
        userId: user.id,
        hashedPassword: await pwd.hash(password),
        primary: true,
      },
    });

    // crea sessione
    const session = await lucia.createSession(user.id, {});
    const cookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(cookie.name, cookie.value, cookie.attributes);

    redirect("/dashboard");
  } catch (err: any) {
    // gestisci unique constraint Prisma (in caso di race)
    if (err?.code === "P2002") {
      fail("Email già registrata");
    }
    console.error("Register error:", err);
    fail("Registrazione non disponibile, riprova tra poco");
  }
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">Crea account</h1>

      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={register} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="nome@esempio.com"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Min 8, Maiuscole, numeri e simboli"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
            Conferma Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Ridigita la password"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            name="accept"
            type="checkbox"
            className="mt-1"
            required
          />
          <span>
            Accetto i{" "}
            <a href="/terms" className="underline" target="_blank" rel="noreferrer">
              Termini
            </a>{" "}
            e la{" "}
            <a href="/privacy" className="underline" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <button
          className="w-full rounded-lg bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Registrati
        </button>
      </form>

      <p className="mt-3 text-sm">
        Hai già un account? <a href="/login" className="underline">Login</a>
      </p>

      {/* Suggerimenti password */}
      <div className="mt-6 rounded-lg border p-3 text-xs text-gray-600">
        Suggerimenti: usa almeno 8 caratteri, includi maiuscole, minuscole, numeri e simboli. Evita password comuni.
      </div>
    </main>
  );
}