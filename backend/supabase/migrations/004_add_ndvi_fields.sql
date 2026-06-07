-- Add new NDVI metadata and rainfall baseline columns to climate_snapshots
ALTER TABLE public.climate_snapshots 
ADD COLUMN IF NOT EXISTS ndvi_source VARCHAR(100) DEFAULT 'planet',
ADD COLUMN IF NOT EXISTS ndvi_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rainfall_baseline_mm NUMERIC;

-- Add new NDVI metadata and rainfall baseline columns to climate_scores
ALTER TABLE public.climate_scores
ADD COLUMN IF NOT EXISTS ndvi_source VARCHAR(100) DEFAULT 'planet',
ADD COLUMN IF NOT EXISTS ndvi_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rainfall_baseline_mm NUMERIC;
