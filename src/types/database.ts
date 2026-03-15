export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  display_name: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoardGame {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  min_players: number | null;
  max_players: number | null;
  play_time_minutes: number | null;
  created_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  game_id: string | null;
  preferred_cities: string[];
  max_travel_km: number;
  created_at: string;
}

export interface GameSession {
  id: string;
  host_id: string;
  game_id: string;
  title: string;
  city: string;
  address: string | null;
  venue_name: string | null;
  starts_at: string;
  max_players: number;
  notes: string | null;
  status: "open" | "full" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
  host?: Profile;
  game?: BoardGame;
  players?: Profile[];
  player_count?: number;
}

export interface SessionPlayer {
  id: string;
  session_id: string;
  user_id: string;
  created_at: string;
}

export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export interface SessionHostReport {
  id: string;
  session_id: string;
  reported_host_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
}

export type TournamentFormat =
  | "single_elimination"
  | "round_robin"
  | "multiplayer_points"
  | "swiss";

export type TournamentStatus =
  | "draft"
  | "upcoming"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Tournament {
  id: string;
  host_id: string;
  game_id: string;
  name: string;
  description: string | null;
  format: TournamentFormat;
  min_players: number | null;
  max_players: number | null;
  players_per_match: number;
  total_rounds: number | null;
  starts_at: string;
  location_type: "online" | "in_person" | "mixed";
  city: string | null;
  address: string | null;
  venue_name: string | null;
  privacy: "public" | "private" | "invite_only";
  entry_cap: number | null;
  cover_image_url: string | null;
  status: TournamentStatus;
  created_at: string;
  updated_at: string;
  host?: Profile;
  game?: BoardGame;
  player_count?: number;
}

export interface TournamentPlayer {
  id: string;
  tournament_id: string;
  user_id: string;
  is_approved: boolean;
  seed: number | null;
  joined_at: string;
  profile?: Profile;
}

export type TournamentRoundStatus = "pending" | "in_progress" | "completed";

export interface TournamentRound {
  id: string;
  tournament_id: string;
  round_number: number;
  name: string | null;
  status: TournamentRoundStatus;
  started_at: string | null;
  completed_at: string | null;
}

export type TournamentMatchStatus = "scheduled" | "in_progress" | "completed";

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round_id: string;
  table_number: number;
  status: TournamentMatchStatus;
  winner_player_id: string | null;
  game_metadata: Json | null;
  created_by: string;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  players?: TournamentMatchPlayer[];
}

export interface TournamentMatchPlayer {
  id: string;
  match_id: string;
  player_id: string;
  seat_number: number | null;
  score: number | null;
  placement: number | null;
  advanced: boolean | null;
  is_winner: boolean;
  player?: TournamentPlayer;
}

export interface PlayerGameStats {
  id: string;
  user_id: string;
  game_id: string;
  tournaments_played: number;
  tournaments_won: number;
  matches_played: number;
  matches_won: number;
  points_earned: number;
  podium_finishes: number;
  win_percentage: number;
  last_updated: string;
  user?: Profile;
  game?: BoardGame;
}
