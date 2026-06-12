-- Migration: 20260612_010_coordinate_native_missions.sql
-- Description: Make locality_id nullable and add coordinate fields to mission submissions

ALTER TABLE public.mission_submissions
  ALTER COLUMN locality_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS latitude numeric(9, 6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9, 6),
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS country text;

-- Also update rit_conversations just in case we want to store city context
ALTER TABLE public.rit_conversations
  ADD COLUMN IF NOT EXISTS context_city text;
