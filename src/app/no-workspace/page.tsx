import Link from 'next/link';

import { getViewer, listWorkspaces } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

/**
 * Where someone lands when they are signed in but have no workspace, or tried to reach
 * one they are not a member of. Deliberately says nothing about whether the workspace
 * they asked for exists.
 */
export default async function NoWorkspacePage() {
  const viewer = await getViewer();
  const workspaces = viewer ? await listWorkspaces() : [];

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Selestial</p>

        {workspaces.length > 0 ? (
          <>
            <h1 className="mt-2 text-lg font-semibold text-zinc-900">Pick a workspace</h1>
            <ul className="mt-4 space-y-1">
              {workspaces.map((workspace) => (
                <li key={workspace.id}>
                  <Link
                    href={`/w/${workspace.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    {workspace.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h1 className="mt-2 text-lg font-semibold text-zinc-900">No workspace yet</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Your account is not attached to a workspace. If you were expecting access, ask your
              account manager to resend your invitation.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
