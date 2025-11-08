// src/app/listings/[id]/page.tsx
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import MapDetail from "@/components/MapDetail";
import ClientTime from "@/components/ClientTime";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { id: string };

function backTo(id: string, query?: string, hash = "#comments") {
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

  // comments (newest first)
  const comments = await db.comment.findMany({
    where: { listingId: id },
    include: { user: true },
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
      redirect(backTo(id, "?error=" + encodeURIComponent("You must be signed in")));
    }

    const listingId = String(formData.get("listingId") || "");
    const body = String(formData.get("body") || "").trim();

    if (!listingId || listingId !== id) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Invalid request")));
    }
    if (body.length < 2) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Comment is too short")));
    }
    if (body.length > 2000) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Comment is too long")));
    }

    // explicit connect
    await db.comment.create({
      data: {
        body,
        listing: { connect: { id } },
        user: { connect: { id: authId } },
      },
    });

    redirect(backTo(id));
  }

  async function deleteComment(formData: FormData) {
    "use server";

    const { user } = await getSession();
    const authId = (user as any)?.id ?? (user as any)?.userId;
    if (!authId) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Unauthorized")));
    }

    const commentId = String(formData.get("commentId") || "");
    if (!commentId) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Invalid request")));
    }

    const c = await db.comment.findUnique({
      where: { id: commentId },
      include: { listing: true },
    });
    if (!c || c.listingId !== id) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Comment not found")));
    }

    const canDelete = c.userId === authId || c.listing.userId === authId;
    if (!canDelete) {
      redirect(backTo(id, "?error=" + encodeURIComponent("Unauthorized")));
    }

    await db.comment.delete({ where: { id: commentId } });
    redirect(backTo(id));
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
          {comments.map((c) => (
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

              {user && (authUserId === c.userId || isOwner) && (
                <form action={deleteComment} className="mt-2">
                  <input type="hidden" name="commentId" value={c.id} />
                  <button
                    className="text-xs opacity-70 underline hover:opacity-100"
                    aria-label="Delete comment"
                  >
                    Delete
                  </button>
                </form>
              )}
            </article>
          ))}

          {comments.length === 0 && (
            <p className="opacity-70">No comments yet. Be the first to help!</p>
          )}
        </div>
      </section>
    </main>
  );
}