-- Klimora MVP schema.
-- Scope: minimal tables required for locality climate scores, missions, verification state, points, and Rit history.

create extension if not exists pgcrypto;

create table if not exists public.localities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null,
  state text not null,
  country text not null default 'India',
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  home_locality_id uuid references public.localities(id) on delete set null,
  total_points integer not null default 0 check (total_points >= 0),
  level integer not null default 1 check (level >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.climate_scores (
  id uuid primary key default gen_random_uuid(),
  locality_id uuid not null references public.localities(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  label text not null check (label in ('Healthy', 'Fair', 'Stressed', 'Critical')),
  trend text not null check (trend in ('improving', 'stable', 'declining')),
  temperature_c numeric(5, 2),
  heat_index_c numeric(5, 2),
  aqi integer check (aqi >= 0),
  ndvi numeric(4, 3),
  rainfall_mm numeric(8, 2),
  rainfall_anomaly_pct numeric(6, 2),
  confidence text not null check (confidence in ('High', 'Medium', 'Low')),
  breakdown jsonb not null default '[]'::jsonb,
  computed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('green', 'mobility', 'community', 'civic')),
  description text not null,
  points integer not null check (points > 0),
  active boolean not null default true,
  verification_prompt_hint text,
  created_at timestamptz not null default now()
);

create table if not exists public.mission_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete restrict,
  locality_id uuid not null references public.localities(id) on delete restrict,
  status text not null default 'submitted' check (
    status in ('submitted', 'verifying', 'verified', 'rejected', 'manual_review')
  ),
  media_bucket text not null default 'mission-evidence',
  media_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  user_note text,
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_results (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.mission_submissions(id) on delete cascade,
  status text not null check (status in ('verified', 'rejected', 'manual_review', 'failed')),
  confidence_score numeric(4, 3) check (confidence_score >= 0 and confidence_score <= 1),
  detected_objects jsonb not null default '[]'::jsonb,
  mission_compliance jsonb not null default '{}'::jsonb,
  reason text not null,
  model_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid references public.mission_submissions(id) on delete set null,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.rit_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  locality_id uuid references public.localities(id) on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rit_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.rit_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_home_locality_id on public.profiles(home_locality_id);
create index if not exists idx_profiles_total_points_desc on public.profiles(total_points desc);
create index if not exists idx_localities_city on public.localities(city);
create index if not exists idx_localities_lat_lng on public.localities(latitude, longitude);
create index if not exists idx_climate_scores_locality_computed_at on public.climate_scores(locality_id, computed_at desc);
create index if not exists idx_climate_scores_score_desc on public.climate_scores(score desc);
create index if not exists idx_climate_scores_confidence on public.climate_scores(confidence);
create index if not exists idx_missions_category_active on public.missions(category, active);
create index if not exists idx_mission_submissions_user_submitted_at on public.mission_submissions(user_id, submitted_at desc);
create index if not exists idx_mission_submissions_locality_submitted_at on public.mission_submissions(locality_id, submitted_at desc);
create index if not exists idx_mission_submissions_status on public.mission_submissions(status);
create index if not exists idx_mission_submissions_mission_id on public.mission_submissions(mission_id);
create index if not exists idx_verification_results_submission_created_at on public.verification_results(submission_id, created_at desc);
create index if not exists idx_verification_results_status on public.verification_results(status);
create index if not exists idx_user_points_user_created_at on public.user_points(user_id, created_at desc);
create index if not exists idx_user_points_submission_id on public.user_points(submission_id);
create unique index if not exists idx_user_points_one_reward_per_submission
  on public.user_points(submission_id)
  where submission_id is not null and points > 0;
create index if not exists idx_rit_conversations_user_updated_at on public.rit_conversations(user_id, updated_at desc);
create index if not exists idx_rit_conversations_locality_id on public.rit_conversations(locality_id);
create index if not exists idx_rit_messages_conversation_created_at on public.rit_messages(conversation_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_mission_submissions_updated_at on public.mission_submissions;
create trigger set_mission_submissions_updated_at
before update on public.mission_submissions
for each row execute function public.set_updated_at();

drop trigger if exists set_rit_conversations_updated_at on public.rit_conversations;
create trigger set_rit_conversations_updated_at
before update on public.rit_conversations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.localities enable row level security;
alter table public.climate_scores enable row level security;
alter table public.missions enable row level security;
alter table public.mission_submissions enable row level security;
alter table public.verification_results enable row level security;
alter table public.user_points enable row level security;
alter table public.rit_conversations enable row level security;
alter table public.rit_messages enable row level security;

create policy "Public can read localities"
  on public.localities for select
  using (true);

create policy "Public can read climate scores"
  on public.climate_scores for select
  using (true);

create policy "Public can read active missions"
  on public.missions for select
  using (active = true);

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read own mission submissions"
  on public.mission_submissions for select
  using (auth.uid() = user_id);

create policy "Users can create own mission submissions"
  on public.mission_submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can read own verification results"
  on public.verification_results for select
  using (
    exists (
      select 1
      from public.mission_submissions s
      where s.id = verification_results.submission_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users can read own points"
  on public.user_points for select
  using (auth.uid() = user_id);

create policy "Users can read own Rit conversations"
  on public.rit_conversations for select
  using (auth.uid() = user_id);

create policy "Users can create own Rit conversations"
  on public.rit_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can read own Rit messages"
  on public.rit_messages for select
  using (
    exists (
      select 1
      from public.rit_conversations c
      where c.id = rit_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users can create messages in own Rit conversations"
  on public.rit_messages for insert
  with check (
    exists (
      select 1
      from public.rit_conversations c
      where c.id = rit_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );
