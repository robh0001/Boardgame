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
