-- Klimora MVP seed data.

insert into public.localities (id, slug, name, city, state, country, latitude, longitude, description)
values
  ('11111111-1111-4111-8111-111111111111', 'ballygunge', 'Ballygunge', 'Kolkata', 'West Bengal', 'India', 22.527300, 88.366400, 'Dense commercial and residential ward with mature avenue trees and active canopy maintenance.'),
  ('22222222-2222-4222-8222-222222222222', 'jadavpur', 'Jadavpur', 'Kolkata', 'West Bengal', 'India', 22.499400, 88.369700, 'Mixed-use institutional and residential area with moderate canopy and urban heat signals.'),
  ('33333333-3333-4333-8333-333333333333', 'salt-lake', 'Salt Lake', 'Kolkata', 'West Bengal', 'India', 22.580400, 88.418100, 'Planned sector with parks, wide avenues, and moderate surface temperature signals.'),
  ('44444444-4444-4444-8444-444444444444', 'new-town', 'New Town', 'Kolkata', 'West Bengal', 'India', 22.579400, 88.459400, 'Rapidly expanding IT and residential corridor with high construction-driven heat stress.'),
  ('55555555-5555-4555-8555-555555555555', 'park-street', 'Park Street', 'Kolkata', 'West Bengal', 'India', 22.548400, 88.356200, 'Dense urban ward with historical avenues, commercial traffic, and high heat-island footprint.')
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  city = excluded.city,
  state = excluded.state,
  country = excluded.country,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  description = excluded.description;

insert into public.climate_scores (
  locality_id,
  score,
  label,
  trend,
  temperature_c,
  heat_index_c,
  aqi,
  ndvi,
  rainfall_mm,
  rainfall_anomaly_pct,
  confidence,
  breakdown,
  computed_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    54,
    'Stressed',
    'declining',
    34.20,
    37.00,
    142,
    0.420,
    12.00,
    -34.00,
    'High',
    '[{"label":"Heat Risk","penalty":-20,"reason":"High heat index for dense urban conditions."},{"label":"AQI","penalty":-11,"reason":"Air quality is unhealthy for sensitive groups."},{"label":"Vegetation","penalty":-11,"reason":"NDVI indicates moderate canopy loss."},{"label":"Rainfall","penalty":-4,"reason":"Rainfall is below local baseline."}]'::jsonb,
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    61,
    'Fair',
    'improving',
    33.40,
    35.10,
    118,
    0.480,
    18.00,
    -8.00,
    'High',
    '[{"label":"Heat Risk","penalty":-15,"reason":"Moderate heat stress remains present."},{"label":"AQI","penalty":-8,"reason":"AQI is elevated but below severe range."},{"label":"Vegetation","penalty":-8,"reason":"Vegetation cover is moderate."},{"label":"Rainfall","penalty":0,"reason":"Rainfall is close to local baseline."}]'::jsonb,
    now()
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    72,
    'Healthy',
    'improving',
    31.80,
    32.60,
    96,
    0.580,
    22.00,
    3.00,
    'High',
    '[{"label":"Heat Risk","penalty":-8,"reason":"Heat stress is moderate."},{"label":"AQI","penalty":-6,"reason":"AQI is within moderate range."},{"label":"Vegetation","penalty":-4,"reason":"Healthy canopy buffers heat."},{"label":"Rainfall","penalty":0,"reason":"Rainfall is near normal."}]'::jsonb,
    now()
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    48,
    'Stressed',
    'declining',
    35.10,
    38.20,
    156,
    0.380,
    9.00,
    -42.00,
    'Medium',
    '[{"label":"Heat Risk","penalty":-24,"reason":"Severe heat-island conditions are likely."},{"label":"AQI","penalty":-13,"reason":"AQI is unhealthy."},{"label":"Vegetation","penalty":-13,"reason":"Low canopy increases surface heat."},{"label":"Rainfall","penalty":-6,"reason":"Rainfall deficit indicates water stress."}]'::jsonb,
    now()
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    58,
    'Fair',
    'stable',
    34.00,
    36.00,
    128,
    0.440,
    16.00,
    -18.00,
    'High',
    '[{"label":"Heat Risk","penalty":-18,"reason":"High heat risk from built-up surfaces."},{"label":"AQI","penalty":-9,"reason":"AQI is elevated."},{"label":"Vegetation","penalty":-10,"reason":"Vegetation is moderate but fragmented."},{"label":"Rainfall","penalty":-3,"reason":"Rainfall is below normal."}]'::jsonb,
    now()
  );

insert into public.missions (id, slug, title, category, description, points, active, verification_prompt_hint)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'plant-tree', 'Plant Tree', 'green', 'Plant a native sapling and submit geotagged photo or video evidence.', 100, true, 'Verify that the evidence shows a newly planted sapling or young tree.'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'rooftop-garden', 'Rooftop Garden', 'green', 'Create or maintain a rooftop garden that helps reduce heat stress.', 250, true, 'Verify visible rooftop or terrace planting activity.'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'rainwater-harvesting', 'Rainwater Harvesting', 'green', 'Install or maintain rainwater harvesting infrastructure.', 220, true, 'Verify visible rainwater harvesting equipment or setup.'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'public-transport', 'Public Transport', 'mobility', 'Use bus, metro, rail, or shared public transport instead of a private vehicle.', 10, true, 'Verify ticket, transit location, or public transport evidence.'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'community-cleanup', 'Community Cleanup', 'community', 'Participate in a local cleanup effort and submit evidence.', 100, true, 'Verify cleanup activity, collected waste, or community participation.'),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'civic-reporting', 'Civic Reporting', 'civic', 'Report illegal tree cutting, garbage burning, water encroachment, or related civic issues.', 80, true, 'Verify civic issue evidence relevant to climate or environmental harm.')
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  description = excluded.description,
  points = excluded.points,
  active = excluded.active,
  verification_prompt_hint = excluded.verification_prompt_hint;
