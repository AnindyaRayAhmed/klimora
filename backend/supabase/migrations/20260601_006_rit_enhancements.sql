-- Phase 3 Rit Enhancements

ALTER TABLE public.rit_messages 
ADD COLUMN IF NOT EXISTS intent TEXT;

ALTER TABLE public.rit_messages 
ADD COLUMN IF NOT EXISTS context_summary TEXT;

ALTER TABLE public.rit_conversations 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
