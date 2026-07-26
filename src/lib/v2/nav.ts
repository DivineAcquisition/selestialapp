import type { NavItem } from '@/components/v2/AppShell';

/** Workspace navigation, shared by every `/w/[slug]` page so the shell stays consistent. */
export function workspaceNav(slug: string): NavItem[] {
  return [
    { href: `/w/${slug}`, label: 'Dashboard', exact: true },
    { href: `/w/${slug}/campaigns`, label: 'Campaigns' },
    { href: `/w/${slug}/contacts`, label: 'Contacts' },
    { href: `/w/${slug}/activity`, label: 'Activity' },
    { href: `/w/${slug}/settings`, label: 'Settings' },
  ];
}

export function agencyNav(): NavItem[] {
  return [
    { href: '/agency', label: 'All clients', exact: true },
    { href: '/agency/onboard', label: 'Onboard a client' },
    { href: '/agency/integrations', label: 'Integrations' },
    { href: '/agency/webhooks', label: 'Webhook queue' },
  ];
}
