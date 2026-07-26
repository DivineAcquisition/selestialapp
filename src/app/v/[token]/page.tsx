import { notFound } from 'next/navigation';

import { adminDb } from '@/lib/v2/db';
import { applyEngagement } from '@/lib/v2/engagement';
import { bumpClickCounters, isExpired, resolveToken } from '@/lib/v2/links';
import type { CampaignAttachment } from '@/lib/v2/types';
import { AttachmentViewer } from './AttachmentViewer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Tokenized attachment viewer.
 *
 * Attachments are never linked raw. Opening one is itself a tracked engagement event
 * attributed to a specific contact, and the file is served from a short-lived signed URL
 * so the storage path never leaks into a forwardable link.
 */
export default async function AttachmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await resolveToken(token);

  if (!link || link.kind !== 'attachment' || !link.attachment_id) notFound();
  if (isExpired(link)) {
    return <Expired />;
  }

  const db = adminDb();

  const { data: attachmentRow } = await db
    .from('campaign_attachments')
    .select('*')
    .eq('id', link.attachment_id)
    .maybeSingle();

  if (!attachmentRow) notFound();
  const attachment = attachmentRow as CampaignAttachment;

  const { data: signed } = await db.storage
    .from('campaign-attachments')
    .createSignedUrl(attachment.storage_path, 60 * 30);

  try {
    await applyEngagement({
      workspaceId: link.workspace_id,
      contactId: link.contact_id,
      campaignId: link.campaign_id,
      messageId: link.message_id,
      touchId: link.touch_id,
      linkId: link.id,
      eventType: 'attachment_viewed',
      metadata: { attachmentId: attachment.id, attachmentName: attachment.name },
    });

    await bumpClickCounters(link);
  } catch (err) {
    console.error('[attachment] failed to record view', token, err);
  }

  const { data: workspace } = await db
    .from('workspaces')
    .select('name, logo_url, primary_color')
    .eq('id', link.workspace_id)
    .maybeSingle();

  return (
    <AttachmentViewer
      token={token}
      name={attachment.name}
      description={attachment.description}
      mimeType={attachment.mime_type}
      url={signed?.signedUrl ?? null}
      businessName={(workspace?.name as string) ?? 'Selestial'}
      accent={(workspace?.primary_color as string) ?? '#6428F9'}
    />
  );
}

function Expired() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-zinc-900">This link has expired</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Reply to the message you received and we&apos;ll send you a fresh one.
        </p>
      </div>
    </main>
  );
}
