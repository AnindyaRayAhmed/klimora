-- Create storage bucket for mission evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mission-evidence', 'mission-evidence', false)
ON CONFLICT DO NOTHING;

-- Add points_awarded column to verification_results
ALTER TABLE public.verification_results 
ADD COLUMN IF NOT EXISTS points_awarded INTEGER DEFAULT 0;

-- Create index for verification processing job
CREATE INDEX IF NOT EXISTS idx_submissions_pending 
ON public.mission_submissions(status) WHERE status = 'pending';
