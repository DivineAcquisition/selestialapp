export const metadata = { title: 'Link expired' };

export default function LinkExpiredPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-zinc-900">This link has expired</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Reply to the message you received and whoever sent it can send you a fresh one.
        </p>
      </div>
    </main>
  );
}
