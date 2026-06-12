-- Migration: 009_profile_insert_policy.sql
-- Description: Add insert policy for profiles table to allow client-side creation on login/signup.

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
