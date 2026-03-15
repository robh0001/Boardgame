import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Single source of truth for "upcoming joinable sessions" so Hub and Sessions tab stay in sync.
 */
const UPCOMING_SESSION_SELECT = `
  id,
  title,
  city,
  address,
  venue_name,
  starts_at,
  max_players,
  notes,
  status,
  host:profiles!host_id(display_name, avatar_url, city),
  game:board_games(name, image_url, min_players, max_players, play_time_minutes, description)
`;

const NOW_ISO = () => new Date().toISOString();

export type UpcomingSessionRow = {
  id: string;
  title: string;
  city: string;
  address: string | null;
  venue_name: string | null;
  starts_at: string;
  max_players: number;
  notes: string | null;
  status: string;
  host: unknown;
  game: unknown;
};

/**
 * Fetches upcoming game sessions (open or full) from the database.
 * Use this in both Hub and Sessions page so filters and ordering are identical.
 */
export async function fetchUpcomingSessions(
  supabase: SupabaseClient
): Promise<UpcomingSessionRow[]> {
  const { data } = await supabase
    .from("game_sessions")
    .select(UPCOMING_SESSION_SELECT)
    .gte("starts_at", NOW_ISO())
    .in("status", ["open", "full"])
    .order("starts_at", { ascending: true });
  return data ?? [];
}
