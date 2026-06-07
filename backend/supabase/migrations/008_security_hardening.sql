-- Migration: 008_security_hardening.sql
-- Description: Hardening storage policies and ensuring strict RLS compliance

-- 1. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Storage Policies for 'mission-evidence' bucket
-- Users can only upload files to their own folder (folder name = user_id)
CREATE POLICY "Users can upload own mission evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mission-evidence' AND 
  (storage.foldername(name))[1] = auth.uid()::text AND
  (LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'mp4', 'mov'))
);

-- Users can only read their own evidence
CREATE POLICY "Users can read own mission evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'mission-evidence' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only delete their own evidence
CREATE POLICY "Users can delete own mission evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'mission-evidence' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Service role has full access
CREATE POLICY "Service role full access to storage"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Ensure users cannot update their points directly
DROP POLICY IF EXISTS "Users can read own points" ON public.user_points;
CREATE POLICY "Users can read own points"
ON public.user_points FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Explicitly ensure no INSERT/UPDATE/DELETE policy exists for users on user_points
-- Only service_role can modify user_points.

-- 4. Harden Verification Results
DROP POLICY IF EXISTS "Users can read own verification results" ON public.verification_results;
CREATE POLICY "Users can read own verification results"
ON public.verification_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mission_submissions ms
    WHERE ms.id = verification_results.submission_id
    AND ms.user_id = auth.uid()
  )
);
-- Again, no insert/update/delete for users.

-- 5. Strict permissions on submissions
DROP POLICY IF EXISTS "Users can update own mission submissions" ON public.mission_submissions;
-- Users can only UPDATE their submissions if they are in 'pending' or 'rejected' state? Actually no updates allowed from users usually.
-- Just reading and inserting.
