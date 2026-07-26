import Link from 'next/link';

import { AppShell } from '@/components/v2/AppShell';
import { Badge, Card, CardHeader } from '@/components/v2/Primitives';
import {
  GHL_WEBHOOK_EVENTS,
  ghlAgencyKeyConfigured,
  ghlOAuthConfigured,
  ghlPitConfigured,
  resolveAuthMode,
} from '@/lib/ghl/config';
import { hasAgencyToken } from '@/lib/ghl/tokens';
import { adminDb } from '@/lib/v2/db';
import { isEmailConfigured, SHARED_SENDING_DOMAIN } from '@/lib/v2/email';
import { isAiConfigured, GENERATION_MODEL, SUMMARY_MODEL } from '@/lib/v2/ai';
import { hoursAgoIso } from '@/lib/v2/metrics';
import { agencyNav } from '@/lib/v2/nav';
import { listWorkspaces, requireAgencyAdmin } from '@/lib/v2/workspace';

export const dynamic = 'force-dynamic';

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ghl?: string }>;
}) {
  const { ghl: ghlStatus } = await searchParams;

  const [viewer, workspaces, connected] = await Promise.all([
    requireAgencyAdmin(),
    listWorkspaces(),
    hasAgencyToken().catch(() => false),
  ]);

  const { data: recentLogs } = await adminDb()
    .from('integration_logs')
    .select('provider, ok, created_at')
    .gte('created_at', hoursAgoIso(24))
    .limit(5000);

  const health = new Map<string, { ok: number; failed: number }>();
  for (const log of (recentLogs ?? []) as { provider: string; ok: boolean }[]) {
    const bucket = health.get(log.provider) ?? { ok: 0, failed: 0 };
    if (log.ok) bucket.ok++;
    else bucket.failed++;
    health.set(log.provider, bucket);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.selestial.io';
  const authMode = resolveAuthMode();

  return (
    <AppShell
      workspaces={workspaces}
      current={null}
      isAgencyAdmin={viewer.isAgencyAdmin}
      nav={agencyNav()}
      pathname="/agency/integrations"
      docsHref="/docs/integrations"
      title="Integrations"
      subtitle="Everything Selestial talks to, and whether it is working."
    >
      {ghlStatus ? <StatusBanner status={ghlStatus} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="GoHighLevel"
            description="SMS goes out through each client's own sub-account, so replies land where they already work."
          />
          <dl className="divide-y divide-zinc-100 text-sm">
            <Row label="Auth mode">
              {authMode ? (
                <Badge tone={authMode === 'oauth' ? 'green' : 'amber'}>
                  {authMode.replace('_', ' ')}
                </Badge>
              ) : (
                <Badge tone="red">not configured</Badge>
              )}
            </Row>
            <Row label="Agency OAuth app">
              <Badge tone={ghlOAuthConfigured() ? 'green' : 'neutral'}>
                {ghlOAuthConfigured() ? 'configured' : 'no client id/secret'}
              </Badge>
            </Row>
            <Row label="Agency token">
              <Badge tone={connected ? 'green' : 'amber'}>
                {connected ? 'stored' : 'not connected'}
              </Badge>
            </Row>
            <Row label="Legacy agency key">
              <Badge tone={ghlAgencyKeyConfigured() ? 'blue' : 'neutral'}>
                {ghlAgencyKeyConfigured() ? 'present' : 'absent'}
              </Badge>
            </Row>
            <Row label="Private integration token">
              <Badge tone={ghlPitConfigured() ? 'blue' : 'neutral'}>
                {ghlPitConfigured() ? 'present' : 'absent'}
              </Badge>
            </Row>
            <Row label="Calls, last 24h">{describeHealth(health.get('ghl'))}</Row>
          </dl>

          <div className="border-t border-zinc-100 px-5 py-4">
            {ghlOAuthConfigured() ? (
              <a
                href="/api/ghl/oauth/start"
                className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                {connected ? 'Reconnect the agency' : 'Connect the agency'}
              </a>
            ) : (
              <p className="text-sm text-zinc-600">
                Set <code className="rounded bg-zinc-100 px-1">GHL_CLIENT_ID</code> and{' '}
                <code className="rounded bg-zinc-100 px-1">GHL_CLIENT_SECRET</code>, then reload to
                connect over OAuth.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Resend" description="Campaign email and platform notifications." />
            <dl className="divide-y divide-zinc-100 text-sm">
              <Row label="API key">
                <Badge tone={isEmailConfigured() ? 'green' : 'red'}>
                  {isEmailConfigured() ? 'configured' : 'missing'}
                </Badge>
              </Row>
              <Row label="Sending domain">{SHARED_SENDING_DOMAIN}</Row>
              <Row label="Webhook signing">
                <Badge tone={process.env.RESEND_WEBHOOK_SECRET ? 'green' : 'amber'}>
                  {process.env.RESEND_WEBHOOK_SECRET ? 'verified' : 'unsigned'}
                </Badge>
              </Row>
              <Row label="Calls, last 24h">{describeHealth(health.get('resend'))}</Row>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Anthropic" description="Campaign generation and case-file summaries." />
            <dl className="divide-y divide-zinc-100 text-sm">
              <Row label="API key">
                <Badge tone={isAiConfigured() ? 'green' : 'amber'}>
                  {isAiConfigured() ? 'configured' : 'missing — fallback copy will be used'}
                </Badge>
              </Row>
              <Row label="Generation model">{GENERATION_MODEL}</Row>
              <Row label="Summary model">{SUMMARY_MODEL}</Row>
              <Row label="Calls, last 24h">{describeHealth(health.get('anthropic'))}</Row>
            </dl>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Webhook endpoints"
          description="Point the providers at these. Selestial verifies signatures on both."
        />
        <div className="space-y-4 px-5 py-4 text-sm">
          <div>
            <p className="font-medium text-zinc-900">GoHighLevel</p>
            <code className="mt-1 block break-all rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
              {appUrl}/api/webhooks/ghl
            </code>
            <p className="mt-2 text-xs text-zinc-500">
              Subscribe the marketplace app to: {GHL_WEBHOOK_EVENTS.join(', ')}. Then set{' '}
              <code className="rounded bg-zinc-100 px-1">GHL_WEBHOOK_APP_CONFIGURED=true</code> so
              the provisioning step can pass.
            </p>
          </div>

          <div>
            <p className="font-medium text-zinc-900">Resend</p>
            <code className="mt-1 block break-all rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
              {appUrl}/api/webhooks/resend
            </code>
            <p className="mt-2 text-xs text-zinc-500">
              Subscribe to email.delivered, email.opened, email.clicked, email.bounced and
              email.complained.
            </p>
          </div>

          <Link href="/agency/webhooks" className="inline-block text-sm text-primary hover:underline">
            View the webhook queue →
          </Link>
        </div>
      </Card>
    </AppShell>
  );
}

function describeHealth(bucket: { ok: number; failed: number } | undefined): string {
  if (!bucket) return 'No calls';
  return `${bucket.ok} ok, ${bucket.failed} failed`;
}

function StatusBanner({ status }: { status: string }) {
  const messages: Record<string, { tone: string; text: string }> = {
    connected: {
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      text: 'GoHighLevel agency account connected.',
    },
    denied: {
      tone: 'border-amber-200 bg-amber-50 text-amber-800',
      text: 'The GoHighLevel authorization was declined.',
    },
    failed: {
      tone: 'border-red-200 bg-red-50 text-red-700',
      text: 'The token exchange failed. Check the redirect URI matches GHL_OAUTH_REDIRECT_URI exactly.',
    },
    missing_code: {
      tone: 'border-red-200 bg-red-50 text-red-700',
      text: 'GoHighLevel redirected back without an authorization code.',
    },
  };

  const message = messages[status];
  if (!message) return null;

  return <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${message.tone}`}>{message.text}</div>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-2.5">
      <dt className="shrink-0 text-xs text-zinc-500">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm text-zinc-800">{children}</dd>
    </div>
  );
}
