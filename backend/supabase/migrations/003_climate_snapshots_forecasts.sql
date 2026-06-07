-- Create climate_snapshots table
CREATE TABLE IF NOT EXISTS public.climate_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locality_id UUID NOT NULL REFERENCES public.localities(id) ON DELETE CASCADE,
    temperature_c NUMERIC,
    heat_index_c NUMERIC,
    aqi NUMERIC,
    ndvi NUMERIC,
    rainfall_mm NUMERIC,
    rainfall_anomaly_pct NUMERIC,
    observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for querying snapshots by locality and time
CREATE INDEX IF NOT EXISTS idx_climate_snapshots_locality_observed 
    ON public.climate_snapshots(locality_id, observed_at DESC);

-- Create climate_forecasts table
CREATE TABLE IF NOT EXISTS public.climate_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locality_id UUID NOT NULL REFERENCES public.localities(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    temperature_c NUMERIC,
    heat_index_c NUMERIC,
    aqi NUMERIC,
    rainfall_mm NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(locality_id, forecast_date)
);

-- RLS Policies
ALTER TABLE public.climate_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climate_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to climate_snapshots"
    ON public.climate_snapshots FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to climate_snapshots"
    ON public.climate_snapshots
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

CREATE POLICY "Allow public read access to climate_forecasts"
    ON public.climate_forecasts
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

CREATE POLICY "Allow service role full access to climate_forecasts"
    ON public.climate_forecasts
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);