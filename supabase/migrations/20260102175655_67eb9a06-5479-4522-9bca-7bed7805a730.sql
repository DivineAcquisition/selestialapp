-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own company logo
CREATE POLICY "Users can upload company logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

-- Allow anyone to view company logos (they're in emails)
CREATE POLICY "Company logos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Allow users to update their own logos
CREATE POLICY "Users can update their own logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos');

-- Allow users to delete their own logos
CREATE POLICY "Users can delete their own logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos');