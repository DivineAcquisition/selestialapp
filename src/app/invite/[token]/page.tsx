import Link from 'next/link';
import { redirect } from 'next/navigation';

import { acceptInvite, isInviteExpired } from '@/lib/v2/invites';
import { adminDb } from '@/lib/v2/db';
import { getViewer } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

/**
 * Invite acceptance.
 *
 * Membership is granted only to a signed-in user, so an invite forwarded to the wrong
 * inbox cannot silently attach a stranger to a client's workspace — whoever accepts it
 * is a real authenticated account we can audit.
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: invite } = await adminDb()
    .from('workspace_invites')
    .select('workspace_id, email, expires_at, accepted_at')
    .eq('token', token)
    .maybeSingle();

  if (!invite) return <Message title="This invitation is not valid" body="The link may have been replaced by a newer invite. Ask your account manager to resend it." />;

  const { data: workspace } = await adminDb()
    .from('workspaces')
    .select('name, slug')
    .eq('id', invite.workspace_id)
    .maybeSingle();

  const workspaceName = (workspace?.name as string) ?? 'your workspace';

  if (invite.accepted_at) {
    return (
      <Message
        title="This invitation has already been used"
        body={`If that was you, sign in to reach ${workspaceName}.`}
        action={{ href: '/login', label: 'Sign in' }}
      />
    );
  }

  if (isInviteExpired(invite.expires_at as string)) {
    return (
      <Message
        title="This invitation has expired"
        body="Invites are valid for 14 days. Ask your account manager to send a fresh one."
      />
    );
  }

  const viewer = await getViewer();

  if (!viewer) {
    return (
      <Message
        title={`You've been invited to ${workspaceName}`}
        body={`Sign in or create an account with ${invite.email as string} to accept.`}
        action={{ href: `/login?redirect=/invite/${token}`, label: 'Sign in to accept' }}
      />
    );
  }

  const accepted = await acceptInvite(token, viewer.userId);
  redirect(`/w/${accepted.workspaceSlug}`);
}

function Message({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Selestial</p>
        <h1 className="mt-2 text-lg font-semibold text-zinc-900">{title}</h1>
        <p className="mt-2 text-sm text-zinc-600">{body}</p>
        {action ? (
          <Link
            href={action.href}
            className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </main>
  );
}
