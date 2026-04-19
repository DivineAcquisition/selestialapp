-- Storage bucket for optional pricing-doc uploads from /offer/get-started.
-- Created via Supabase API in this round; this file mirrors the live state.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pricing-docs',
  'pricing-docs',
  true,
  10485760, -- 10 MB
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

DROP POLICY IF EXISTS "pricing-docs anon insert" ON storage.objects;
CREATE POLICY "pricing-docs anon insert"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'pricing-docs');

DROP POLICY IF EXISTS "pricing-docs public read" ON storage.objects;
CREATE POLICY "pricing-docs public read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'pricing-docs');
