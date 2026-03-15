import { createClient } from "@/lib/supabase/server";
import { fetchUpcomingSessions } from "@/lib/sessions";
import {
  buildHubSessions,
  mergeRealAndDummySessions,
  type RawHubSession,
} from "./hub-data";
import { HubScene } from "./HubScene";

export default async function HubPage() {
  const supabase = await createClient();
  const sessions = await fetchUpcomingSessions(supabase);

  const { data: playerRows } = await supabase
    .from("session_players")
    .select("session_id");

  const countsBySession = new Map<string, number>();
  for (const row of playerRows ?? []) {
    const current = countsBySession.get(row.session_id) ?? 0;
    countsBySession.set(row.session_id, current + 1);
  }

  const realSessions: RawHubSession[] =
    sessions?.map((session) => {
      const host = Array.isArray(session.host) ? session.host[0] : session.host;
      const game = Array.isArray(session.game) ? session.game[0] : session.game;

      return {
        id: session.id,
        title: session.title,
        city: session.city,
        address: session.address,
        venue_name: session.venue_name,
        starts_at: session.starts_at,
        max_players: session.max_players,
        notes: session.notes,
        status: session.status as "open" | "full" | "cancelled" | "completed",
        player_count: countsBySession.get(session.id) ?? 0,
        host_name: host?.display_name ?? "Host",
        host_city: host?.city ?? null,
        host_avatar_url: host?.avatar_url ?? null,
        game_name: game?.name ?? "Board Game",
        game_image_url: game?.image_url ?? null,
        game_min_players: game?.min_players ?? null,
        game_max_players: game?.max_players ?? null,
        play_time_minutes: game?.play_time_minutes ?? null,
        game_description: game?.description ?? null,
      };
    }) ?? [];

  const allSessions = mergeRealAndDummySessions(realSessions);
  const hubSessions = buildHubSessions(allSessions);

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-4 text-white sm:px-6 sm:py-6">
      <div
        className="mb-4 overflow-hidden rounded-2xl sm:mb-5 sm:rounded-[30px]"
        style={{
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "linear-gradient(135deg, rgba(17,24,39,0.95), rgba(30,41,59,0.88))",
          boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div
          className="p-4 sm:p-6"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(34,211,238,0.18), transparent 28%), radial-gradient(circle at top right, rgba(168,85,247,0.15), transparent 25%)",
          }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300 sm:mb-2 sm:text-xs">
                Social Board Game World
              </p>
              <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                Game Hub
              </h1>
              <p className="mt-2 max-w-2xl text-xs text-slate-300 sm:text-sm md:text-base">
                Walk around the hub, discover hosted game nights, and join tables
                near you. Real sessions appear first, and dummy sessions keep the
                world lively while you build.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-medium text-slate-200 sm:text-xs">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                WASD / Arrow keys
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                E to interact
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                Live + dummy sessions
              </span>
            </div>
          </div>
        </div>
      </div>

      <HubScene sessions={hubSessions} />
    </div>
  );
}