import 'server-only';

import { cache } from 'react';
import { adminDb, userDb } from './db';
import type { Workspace, WorkspaceRole } from './types';

export interface Viewer {
  userId: string;
  email: string | null;
  isAgencyAdmin: boolean;
}

export interface WorkspaceContext {
  viewer: Viewer;
  workspace: Workspace;
  /** The viewer's role in this workspace. Agency admins get `agency_admin` everywhere. */
  role: WorkspaceRole;
  canWrite: boolean;
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super('Not authenticated');
    this.name = 'NotAuthenticatedError';
  }
}

export class WorkspaceAccessError extends Error {
  constructor(message = 'Workspace not found or not accessible') {
    super(message);
    this.name = 'WorkspaceAccessError';
  }
}

/**
 * Deduped per request so a page can call this from the layout and from several
 * components without re-hitting Supabase each time.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const db = await userDb();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) return null;

  const { data } = await db.from('agency_admins').select('user_id').eq('user_id', user.id).maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    isAgencyAdmin: Boolean(data),
  };
});

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) throw new NotAuthenticatedError();
  return viewer;
}

/**
 * Workspaces the viewer can see. RLS already restricts this — agency admins get every
 * row, clients get only theirs — so no explicit filter is applied here on purpose.
 */
export const listWorkspaces = cache(async (): Promise<Workspace[]> => {
  const db = await userDb();
  const { data, error } = await db.from('workspaces').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as Workspace[];
});

export const getWorkspaceBySlug = cache(async (slug: string): Promise<Workspace | null> => {
  const db = await userDb();
  const { data, error } = await db.from('workspaces').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return (data as Workspace) ?? null;
});

async function resolveRole(viewer: Viewer, workspaceId: string): Promise<WorkspaceRole | null> {
  if (viewer.isAgencyAdmin) return 'agency_admin';

  const db = await userDb();
  const { data } = await db
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', viewer.userId)
    .maybeSingle();

  return (data?.role as WorkspaceRole) ?? null;
}

/**
 * The entry point for every `/w/[slug]` page and server action. Throws rather than
 * returning null so a missing or forbidden workspace can never be rendered as an empty
 * state that looks like "this client has no data".
 */
export const requireWorkspace = cache(async (slug: string): Promise<WorkspaceContext> => {
  const viewer = await requireViewer();
  const workspace = await getWorkspaceBySlug(slug);

  if (!workspace) throw new WorkspaceAccessError();

  const role = await resolveRole(viewer, workspace.id);
  if (!role) throw new WorkspaceAccessError();

  return {
    viewer,
    workspace,
    role,
    canWrite: role === 'agency_admin' || role === 'client_owner',
  };
});

export async function requireAgencyAdmin(): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!viewer.isAgencyAdmin) {
    throw new WorkspaceAccessError('Agency admin access required');
  }
  return viewer;
}

/** Where to send a user who lands on `/`: their only workspace, or the agency rollup. */
export async function defaultLandingPath(): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) return '/login';
  if (viewer.isAgencyAdmin) return '/agency';

  const workspaces = await listWorkspaces();
  if (workspaces.length === 0) return '/no-workspace';
  return `/w/${workspaces[0].slug}`;
}

/** Service-role lookup used by webhooks and cron, where there is no session. */
export async function getWorkspaceByLocationId(locationId: string): Promise<Workspace | null> {
  const { data } = await adminDb()
    .from('workspaces')
    .select('*')
    .eq('ghl_location_id', locationId)
    .maybeSingle();
  return (data as Workspace) ?? null;
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  const { data } = await adminDb().from('workspaces').select('*').eq('id', id).maybeSingle();
  return (data as Workspace) ?? null;
}

const SLUG_MAX = 40;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/, '');
}

/** Appends `-2`, `-3`, … until the slug is free. */
export async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || 'workspace';
  const db = adminDb();

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = attempt === 0 ? root : `${root}-${attempt + 1}`;
    const { data } = await db.from('workspaces').select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
  }

  return `${root}-${Date.now().toString(36)}`;
}
