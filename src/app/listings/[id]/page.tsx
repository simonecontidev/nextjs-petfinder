// src/app/listings/[id]/page.tsx
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import MapDetail from "@/components/MapDetail";
import ClientTime from "@/components/ClientTime";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { id: string };

function backTo(id: string, query?: string, hash = "") {
  return `/listings/${id}${query ? query : ""}${hash}`;
}

export default async function ListingDetailPage(
  props: { params: Params } | { params: Promise<Params> }
) {
  // --- unwrap params (Next 16)
  const p =
    "then" in (props as any).params ? await (props as any).params : (props as any).params;
  const id = p?.id as string | undefined;
  if (!id) notFound();

  // user session (if logged in)
  const { user } = await getSession();

  // load listing
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) notFound();

  // owner?
  const authUserId = (user as any)?.id ?? (user as any)?.userId ?? null;
  const isOwner = !!authUserId && listing.userId === authUserId;

  const createdIso = new Date(listing.createdAt).toISOString();

  // comments (newest first) con conteggio like e "liked by me"
  const comments = await db.comment.findMany({
    where: { listingId: id },
    include: {
      user: true,
      _count: { select: { likes: true } },
      ...(authUserId
        ? {
            likes: {
              where: { userId: authUserId },
              select: { id: true },
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  // -----------------------------
  // SERVER ACTIONS
  // -----------------------------
  async function addComment(formData: FormData) {
    "use server";

    const { user } = await getSession();
    const authId = (user as any)?.id ?? (user as any)?.userId;
    if (!authId) {
      redirect(backTo(id, "?error=" + encodeURIComponent("You must be signed in"), "#comments"));
    }

    const listingId = String(formData.get("listingId") || "");
    const body = String(formData.get("body") || "").trim();

    if (!listingId || listingId !== id) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Invalid request"), "#comments"));
    }
    if (body.length < 2) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Comment is too short"), "#comments"));
    }
    if (body.length > 2000) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Comment is too long"), "#comments"));
    }

    await db.comment.create({
      data: {
        body,
        listing: { connect: { id } },
        user: { connect: { id: authId } },
      },
    });

    redirect(backTo(id, undefined, "#comments"));
  }

  async function deleteComment(formData: FormData) {
    "use server";

    const { user } = await getSession();
    const authId = (user as any)?.id ?? (user as any)?.userId;
    if (!authId) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Unauthorized"), "#comments"));
    }

    const commentId = String(formData.get("commentId") || "");
    if (!commentId) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Invalid request"), "#comments"));
    }

    const c = await db.comment.findUnique({
      where: { id: commentId },
      include: { listing: true },
    });
    if (!c || c.listingId !== id) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Comment not found"), "#comments"));
    }

    const canDelete = c.userId === authId || c.listing.userId === authId;
    if (!canDelete) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Unauthorized"), "#comments"));
    }

    await db.comment.delete({ where: { id: commentId } });
    redirect(backTo(id, undefined, "#comments"));
  }

  // Toggle like semplice: se esiste lo rimuove, altrimenti lo crea
  async function toggleLike(formData: FormData) {
    "use server";
    const { user } = await getSession();
    const authId = (user as any)?.id ?? (user as any)?.userId;
    if (!authId) {
      redirect(backTo(id, "?error=" + encodeURIComponent("You must be signed in"), "#comments"));
    }

    const commentId = String(formData.get("commentId") || "");
    if (!commentId) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Invalid request"), "#comments"));
    }

    const res = await db.commentLike.deleteMany({
      where: { userId: authId, commentId },
    });

    if (res.count === 0) {
      await db.commentLike.create({ data: { userId: authId, commentId } });
    }

    redirect(backTo(id, undefined, "#comments"));
  }

  // ➜ SERVER ACTION: invio messaggio al proprietario (salvataggio in DB)
  async function sendMessage(formData: FormData) {
    "use server";

    const { user } = await getSession();
    const authEmail: string | undefined = (user as any)?.email || undefined;

    const body = String(formData.get("body") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const emailRaw = String(formData.get("email") || "").trim();

    // Se l'utente è loggato usiamo la sua email per priorità
    const email = authEmail ?? (emailRaw || undefined);

    if (body.length < 5) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Message too short"), "#contact"));
    }
    if (!email) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Email is required"), "#contact"));
    }

    // ✅ Salva in DB sul modello ContactMessage (non "message")
    await db.contactMessage.create({
      data: {
        listingId: id,
        email,
        name: name || null,
        phone: phone || null,
        body,
      },
    });

    redirect(backTo(id, "?ok=" + encodeURIComponent("Message sent"), "#contact"));
  }

  // -----------------------------
  // PAGE RETURN (outside actions)
  // -----------------------------
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/listings" className="text-sm opacity-70 hover:opacity-100">
            ← Back to listings
          </Link>
          <h1 className="mt-3 text-3xl font-bold">{listing.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
              {listing.animalType}
            </span>
            <span
              className={`rounded-full px-2 py-1 ${
                listing.status === "FOUND"
                  ? "bg-green-100 text-green-700"
                  : listing.status === "LOST"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {listing.status}
            </span>
            {listing.city && <span className="opacity-80">📍 {listing.city}</span>}
            <span className="opacity-60">
              Posted: <ClientTime iso={createdIso} fallback={createdIso} />
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="shrink-0">
            <Link
              href={`/listings/${listing.id}/edit`}
              className="inline-block rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border">
        <img
          src={listing.photos || "https://via.placeholder.com/1200x800"}
          alt={listing.title}
          className="h-[360px] w-full object-cover"
        />
      </div>

      <p className="mt-6 leading-relaxed opacity-90">{listing.description}</p>

      {listing.latitude != null && listing.longitude != null ? (
        <>
          <MapDetail lat={listing.latitude} lng={listing.longitude} title={listing.title} />
          <div className="mt-4">
            <a
              className="inline-block rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open location on Google Maps
            </a>
          </div>
        </>
      ) : null}

      {/* --- CONTACT OWNER --- */}
      <section id="contact" className="mt-10">
        <h2 className="text-xl font-semibold">Contact the owner</h2>
        <form action={sendMessage} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium mb-1">Your name</label>
            <input
              name="name"
              type="text"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Optional"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium mb-1">Your email *</label>
            <input
              name="email"
              type="email"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="you@example.com"
              required={!user}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="+34 ..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Message *</label>
            <textarea
              name="body"
              required
              minLength={5}
              maxLength={2000}
              rows={4}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Write details or how to reach you…"
            />
          </div>
          <div className="sm:col-span-2 pt-1">
            <button className="rounded-lg bg-black px-4 py-2 text-white dark:bg-white dark:text-black">
              Send message
            </button>
          </div>
        </form>
      </section>

      {/* --- COMMENTS --- */}
      <section id="comments" className="mt-10">
        <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>

        {user ? (
          <form action={addComment} className="mt-4 space-y-3">
            <input type="hidden" name="listingId" value={id} />
            <textarea
              name="body"
              required
              minLength={2}
              maxLength={2000}
              placeholder="Write a helpful comment (sighting location, contact info, etc.)"
              className="w-full rounded-lg border px-3 py-2"
              rows={3}
            />
            <button className="rounded-lg bg-black px-4 py-2 text-white dark:bg-white dark:text-black">
              Post comment
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm opacity-80">
            <Link href="/login" className="underline">
              Sign in
            </Link>{" "}
            to leave a comment.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {comments.map((c) => {
            const likeCount = (c as any)._count?.likes ?? 0;
            const likedByMe = !!(authUserId && (c as any).likes && (c as any).likes.length > 0);

            return (
              <article key={c.id} className="rounded-lg border p-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs dark:bg-gray-700">
                      {c.user?.email?.[0]?.toUpperCase() || "U"}
                    </span>
                    <span className="opacity-80">{c.user?.email || "User"}</span>
                  </div>
                  <time className="opacity-60 text-xs">
                    {new Date(c.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{c.body}</p>

                <div className="mt-2 flex items-center gap-4">
                  {/* Like / Unlike */}
                  {user ? (
                    <form action={toggleLike}>
                      <input type="hidden" name="commentId" value={c.id} />
                      <button
                        className="text-xs rounded border px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                        aria-label={likedByMe ? "Unlike comment" : "Like comment"}
                      >
                        {likedByMe ? "💚 Liked" : "🤍 Like"} · {likeCount}
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs opacity-70">❤️ {likeCount}</span>
                  )}

                  {/* Delete: author or listing owner */}
                  {user && (authUserId === c.userId || isOwner) && (
                    <form action={deleteComment}>
                      <input type="hidden" name="commentId" value={c.id} />
                      <button
                        className="text-xs opacity-70 underline hover:opacity-100"
                        aria-label="Delete comment"
                      >
                        Delete
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}

          {comments.length === 0 && (
            <p className="opacity-70">No comments yet. Be the first to help!</p>
          )}
        </div>
      </section>
    </main>
  );
}