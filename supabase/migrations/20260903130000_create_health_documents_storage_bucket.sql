-- Migration: Private Storage Bucket & RLS Policies for Health Documents

-- 1. Create Private Storage Bucket for health documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'health-documents',
  'health-documents',
  false, -- PRIVATE BUCKET
  20971520, -- 20MB Limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

-- 2. Storage RLS Policies for health-documents bucket
-- Family members can view health documents belonging to their care recipients
CREATE POLICY "Family members can view health documents in storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'health-documents'
  AND EXISTS (
    SELECT 1 FROM public.health_documents hd
    JOIN public.care_recipients cr ON cr.id = hd.care_recipient_id
    WHERE hd.storage_path = storage.objects.name
      AND private.is_family_member(cr.family_id)
  )
);

-- Family members can upload health documents belonging to their care recipients
CREATE POLICY "Family members can upload health documents to storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'health-documents'
  AND EXISTS (
    SELECT 1 FROM public.care_recipients cr
    WHERE split_part(storage.objects.name, '/', 1)::uuid = cr.id
      AND private.is_family_member(cr.family_id)
  )
);

-- Family members can update health documents belonging to their care recipients
CREATE POLICY "Family members can update health documents in storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'health-documents'
  AND EXISTS (
    SELECT 1 FROM public.health_documents hd
    JOIN public.care_recipients cr ON cr.id = hd.care_recipient_id
    WHERE hd.storage_path = storage.objects.name
      AND private.is_family_member(cr.family_id)
  )
);
