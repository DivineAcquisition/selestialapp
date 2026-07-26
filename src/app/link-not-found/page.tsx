export const metadata = { title: 'Link not found' };

/**
 * `?retry=1` means the lookup itself failed rather than the token being unknown. Telling
 * someone their link is dead when the database was briefly unreachable sends them away
 * for good, so the two cases say different things.
 */
export default async function LinkNotFoundPage({
  searchParams,
}: {
  searchParams: Promise<{ retry?: string }>;
}) {
  const { retry } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center">
        {retry ? (
          <>
            <h1 className="text-lg font-semibold text-zinc-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-zinc-600">
              We couldn&apos;t open that link just now. Please try again in a moment — the link
              itself is fine.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-zinc-900">This link is no longer active</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Reply to the message you received and whoever sent it can send you a working one.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
