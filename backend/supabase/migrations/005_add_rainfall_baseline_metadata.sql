-- Add rainfall_baseline_source and rainfall_baseline_confidence to climate_snapshots
ALTER TABLE climate_snapshots 
ADD COLUMN IF NOT EXISTS rainfall_baseline_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS rainfall_baseline_confidence VARCHAR(50);

-- Add rainfall_baseline_source and rainfall_baseline_confidence to climate_scores
ALTER TABLE climate_scores 
ADD COLUMN IF NOT EXISTS rainfall_baseline_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS rainfall_baseline_confidence VARCHAR(50);
