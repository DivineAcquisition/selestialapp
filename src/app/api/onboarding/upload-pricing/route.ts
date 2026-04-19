import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const BUCKET = 'pricing-docs';

/**
 * POST /api/onboarding/upload-pricing
 *
 * Multipart form upload of the customer's pricing document (PDF / CSV /
 * spreadsheet / image). Stored in the `pricing-docs` Supabase Storage
 * bucket and returned as a public URL the wizard persists onto the
 * onboarding_signups row.
 *
 * Optional. The wizard also lets the user skip this and confirm pricing
 * verbally on the post-payment onboarding call.
 */
export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File is too large. Max ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB.` },
      { status: 413 }
    );
  }

  if (file.type && !ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type (${file.type}). Use PDF, PNG/JPG, or CSV/Excel.` },
      { status: 415 }
    );
  }

  // Generate a path that's unique + non-guessable + retains the original
  // filename so the dashboard view stays human-readable.
  const safeName = sanitizeFilename(file.name) || 'pricing';
  const objectPath = `${crypto.randomUUID()}/${safeName}`;

  try {
    const supabase = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, buffer, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[upload-pricing] supabase storage error:', uploadError);
      return NextResponse.json(
        { error: 'Could not save the file. Try again or skip this step.' },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);

    return NextResponse.json({
      ok: true,
      url: data.publicUrl,
      filename: safeName,
    });
  } catch (err) {
    console.error('[upload-pricing] unexpected error:', err);
    return NextResponse.json(
      { error: 'Could not save the file. Try again or skip this step.' },
      { status: 500 }
    );
  }
}

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
