-- Phase 3.5 Rit Insights Schema

CREATE TABLE IF NOT EXISTS public.rit_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locality_id uuid NOT NULL REFERENCES public.localities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_rit_insights_locality_user_created 
  ON public.rit_insights(locality_id, user_id, created_at DESC);

ALTER TABLE public.rit_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own personalized insights"
  ON public.rit_insights FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public can read locality insights"
  ON public.rit_insights FOR SELECT
  USING (user_id IS NULL);
