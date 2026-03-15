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

-- Tournaments: structured multi-round events for board games
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.board_games(id) on delete cascade,
  name text not null,
  description text,
  format text not null check (format in ('single_elimination', 'round_robin', 'multiplayer_points', 'swiss')),
  min_players int,
  max_players int,
  players_per_match int not null,
  total_rounds int,
  starts_at timestamptz not null,
  location_type text not null default 'in_person' check (location_type in ('online', 'in_person', 'mixed')),
  city text,
  address text,
  venue_name text,
  privacy text not null default 'public' check (privacy in ('public', 'private', 'invite_only')),
  entry_cap int,
  cover_image_url text,
  is_beginner_friendly boolean default false,
  is_strategy_focused boolean default false,
  status text not null default 'draft' check (status in ('draft', 'upcoming', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_tournaments_game on public.tournaments(game_id);
create index if not exists idx_tournaments_starts_at on public.tournaments(starts_at);
create index if not exists idx_tournaments_city on public.tournaments(city);

-- Players registered for a tournament
create table if not exists public.tournament_players (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_approved boolean default true,
  seed int,
  joined_at timestamptz default now(),
  unique(tournament_id, user_id)
);

create index if not exists idx_tournament_players_tournament on public.tournament_players(tournament_id);
create index if not exists idx_tournament_players_user on public.tournament_players(user_id);

-- Logical rounds within a tournament
create table if not exists public.tournament_rounds (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round_number int not null,
  name text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  unique(tournament_id, round_number)
);

create index if not exists idx_tournament_rounds_tournament on public.tournament_rounds(tournament_id);

-- Individual matches / tables within a round
create table if not exists public.tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round_id uuid not null references public.tournament_rounds(id) on delete cascade,
  table_number int not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed')),
  winner_player_id uuid references public.tournament_players(id) on delete set null,
  game_metadata jsonb,
  created_by uuid not null references public.profiles(id) on delete cascade,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists idx_tournament_matches_tournament on public.tournament_matches(tournament_id);
create index if not exists idx_tournament_matches_round on public.tournament_matches(round_id);

-- Mapping of players to a specific match/table, with results
create table if not exists public.tournament_match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.tournament_matches(id) on delete cascade,
  player_id uuid not null references public.tournament_players(id) on delete cascade,
  seat_number int,
  score numeric,
  placement int,
  advanced boolean,
  is_winner boolean default false,
  unique(match_id, player_id)
);

create index if not exists idx_tournament_match_players_match on public.tournament_match_players(match_id);
create index if not exists idx_tournament_match_players_player on public.tournament_match_players(player_id);

-- Aggregated per-user, per-game stats for leaderboards
create table if not exists public.player_game_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.board_games(id) on delete cascade,
  tournaments_played int not null default 0,
  tournaments_won int not null default 0,
  matches_played int not null default 0,
  matches_won int not null default 0,
  points_earned numeric not null default 0,
  podium_finishes int not null default 0,
  win_percentage numeric not null default 0,
  last_updated timestamptz default now(),
  unique(user_id, game_id)
);

create index if not exists idx_player_game_stats_game on public.player_game_stats(game_id);
create index if not exists idx_player_game_stats_user on public.player_game_stats(user_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.board_games enable row level security;
alter table public.user_preferences enable row level security;
alter table public.game_sessions enable row level security;
alter table public.session_players enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_players enable row level security;
alter table public.tournament_rounds enable row level security;
alter table public.tournament_matches enable row level security;
alter table public.tournament_match_players enable row level security;
alter table public.player_game_stats enable row level security;

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

-- Session host reports
create table if not exists public.session_host_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  reported_host_id uuid not null references public.profiles(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

create policy "Reports are insertable by reporter" on public.session_host_reports
  for insert with check (auth.uid() = reporter_id);

create policy "Users can view own reports" on public.session_host_reports
  for select using (auth.uid() = reporter_id);

-- Tournaments: read for all; host can manage own
create policy "Tournaments are viewable by everyone" on public.tournaments for select using (true);
create policy "Authenticated users can create tournaments" on public.tournaments for insert with check (auth.uid() = host_id);
create policy "Hosts can update own tournaments" on public.tournaments for update using (auth.uid() = host_id);
create policy "Hosts can delete own tournaments" on public.tournaments for delete using (auth.uid() = host_id);

-- Tournament players: read for all; users can join/leave themselves
create policy "Tournament players are viewable by everyone" on public.tournament_players for select using (true);
create policy "Users can join tournaments" on public.tournament_players for insert with check (auth.uid() = user_id);
create policy "Users can leave tournaments" on public.tournament_players for delete using (auth.uid() = user_id);

-- Tournament rounds, matches, and match players: readable by all; host manages
create policy "Tournament rounds are viewable by everyone" on public.tournament_rounds for select using (true);
create policy "Hosts can manage tournament rounds" on public.tournament_rounds for all using (
  auth.uid() in (
    select host_id from public.tournaments where id = tournament_id
  )
);

create policy "Tournament matches are viewable by everyone" on public.tournament_matches for select using (true);
create policy "Hosts can manage tournament matches" on public.tournament_matches for all using (
  auth.uid() in (
    select host_id from public.tournaments where id = tournament_id
  )
);

create policy "Tournament match players are viewable by everyone" on public.tournament_match_players for select using (true);
create policy "Hosts can manage tournament match players" on public.tournament_match_players for all using (
  auth.uid() in (
    select host_id from public.tournaments where id = (
      select tournament_id from public.tournament_matches where id = match_id
    )
  )
);

-- Player game stats: leaderboards viewable by everyone; authenticated users can update
create policy "Player game stats are viewable by everyone" on public.player_game_stats for select using (true);
create policy "Authenticated users can update player game stats" on public.player_game_stats for all using (auth.role() = 'authenticated');

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
