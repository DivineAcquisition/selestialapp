import 'server-only';

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { marked } from 'marked';

/**
 * The in-app documentation, rendered from markdown files in `src/content/docs`.
 *
 * Markdown in the repo rather than rows in a table, so docs review happens in the same
 * pull request as the behaviour they describe. `next.config.ts` traces the directory into
 * the serverless bundle.
 */

const DOCS_DIR = join(process.cwd(), 'src', 'content', 'docs');

export interface DocMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
}

export interface Doc extends DocMeta {
  html: string;
  headings: { id: string; text: string; level: number }[];
}

/** Order the categories appear in the sidebar. */
export const CATEGORY_ORDER = ['Getting started', 'Running campaigns', 'Reference', 'Operations'];

interface Frontmatter {
  data: Record<string, string>;
  body: string;
}

/**
 * Minimal frontmatter parser. The docs only ever use flat `key: value` pairs, so a
 * YAML dependency would be more surface area than the feature needs.
 */
function parseFrontmatter(raw: string): Frontmatter {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key) data[key] = value;
  }

  return { data, body: match[2] };
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

let cachedList: DocMeta[] | null = null;

export function listDocs(): DocMeta[] {
  if (cachedList) return cachedList;

  let files: string[];
  try {
    files = readdirSync(DOCS_DIR).filter((name) => name.endsWith('.md'));
  } catch {
    return [];
  }

  const docs = files.map((file) => {
    const raw = readFileSync(join(DOCS_DIR, file), 'utf8');
    const { data } = parseFrontmatter(raw);
    const slug = file.replace(/\.md$/, '');

    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      category: data.category || 'Reference',
      order: Number(data.order ?? 999),
    };
  });

  cachedList = docs.sort((a, b) => {
    const categoryDelta =
      indexOfCategory(a.category) - indexOfCategory(b.category);
    if (categoryDelta !== 0) return categoryDelta;
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });

  return cachedList;
}

function indexOfCategory(category: string): number {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

export function getDoc(slug: string): Doc | null {
  // Refuse anything that could escape the docs directory.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  let raw: string;
  try {
    raw = readFileSync(join(DOCS_DIR, `${slug}.md`), 'utf8');
  } catch {
    return null;
  }

  const { data, body } = parseFrontmatter(raw);
  const headings: { id: string; text: string; level: number }[] = [];

  const renderer = new marked.Renderer();
  const baseHeading = renderer.heading.bind(renderer);

  renderer.heading = (token) => {
    const text = token.text;
    const id = slugifyHeading(text);
    if (token.depth <= 3) headings.push({ id, text, level: token.depth });
    return baseHeading(token).replace(/^<h([1-6])>/, `<h$1 id="${id}">`);
  };

  const html = marked.parse(body, { renderer, async: false }) as string;

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    category: data.category || 'Reference',
    order: Number(data.order ?? 999),
    html,
    headings,
  };
}

export function groupByCategory(docs: DocMeta[]): { category: string; docs: DocMeta[] }[] {
  const groups = new Map<string, DocMeta[]>();
  for (const doc of docs) {
    const bucket = groups.get(doc.category) ?? [];
    bucket.push(doc);
    groups.set(doc.category, bucket);
  }

  return Array.from(groups.entries())
    .sort((a, b) => indexOfCategory(a[0]) - indexOfCategory(b[0]))
    .map(([category, items]) => ({ category, docs: items }));
}
