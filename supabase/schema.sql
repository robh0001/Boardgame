-- Run this in Supabase SQL Editor to set up the database.
-- Board Game Social: profiles, games, preferences, sessions.

-- Profiles (extends auth.users; create trigger to insert on signup)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  city text,
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Board games catalog (searchable; can be seeded or added by users)
create table if not exists public.board_games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  image_url text,
  min_players int,
  max_players int,
  play_time_minutes int,
  created_at timestamptz default now()
);

create index if not exists idx_board_games_name on public.board_games using gin(to_tsvector('english', name));
create index if not exists idx_board_games_slug on public.board_games(slug);

-- User preferences (favorite games, etc.)
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid references public.board_games(id) on delete set null,
  preferred_cities text[] default '{}',
  max_travel_km int default 20,
  created_at timestamptz default now(),
  unique(user_id, game_id)
);

create index if not exists idx_user_preferences_user on public.user_preferences(user_id);

-- Game sessions (hosted games others can join)
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.board_games(id) on delete cascade,
  title text not null,
  city text not null,
  address text,
  venue_name text,
  starts_at timestamptz not null,
  max_players int not null default 4,
  notes text,
  status text default 'open' check (status in ('open', 'full', 'cancelled', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_game_sessions_starts_at on public.game_sessions(starts_at);
create index if not exists idx_game_sessions_city on public.game_sessions(city);
create index if not exists idx_game_sessions_game on public.game_sessions(game_id);

-- Who has joined which session
create table if not exists public.session_players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(session_id, user_id)
);

create index if not exists idx_session_players_session on public.session_players(session_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.board_games enable row level security;
alter table public.user_preferences enable row level security;
alter table public.game_sessions enable row level security;
alter table public.session_players enable row level security;

-- Profiles: anyone can read; only own row can update
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Board games: read for all; insert/update for authenticated (e.g. add community games)
create policy "Board games are viewable by everyone" on public.board_games for select using (true);
create policy "Authenticated users can insert board games" on public.board_games for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update board games" on public.board_games for update using (auth.role() = 'authenticated');

-- User preferences: only own row
create policy "Users can view own preferences" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can manage own preferences" on public.user_preferences for all using (auth.uid() = user_id);

-- Game sessions: read for all; host can manage own
create policy "Game sessions are viewable by everyone" on public.game_sessions for select using (true);
create policy "Authenticated users can create sessions" on public.game_sessions for insert with check (auth.uid() = host_id);
create policy "Hosts can update own sessions" on public.game_sessions for update using (auth.uid() = host_id);
create policy "Hosts can delete own sessions" on public.game_sessions for delete using (auth.uid() = host_id);

-- Session players: read for all; users can join/leave own
create policy "Session players are viewable by everyone" on public.session_players for select using (true);
create policy "Users can join sessions" on public.session_players for insert with check (auth.uid() = user_id);
create policy "Users can leave sessions" on public.session_players for delete using (auth.uid() = user_id);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
