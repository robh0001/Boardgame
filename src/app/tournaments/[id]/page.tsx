import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { JoinTournamentButton } from "./JoinTournamentButton";
import { TournamentLeaderboard } from "./TournamentLeaderboard";
import { HostTournamentControls } from "@/components/tournaments/HostTournamentControls";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select(
      `
      *,
      game:board_games(name, min_players, max_players),
      host:profiles!host_id(display_name)
    `,
    )
    .eq("id", id)
    .single();

  if (!tournament) {
    notFound();
  }

  const { data: players } = await supabase
    .from("tournament_players")
    .select(
      `
      *,
      profile:profiles!user_id(display_name, avatar_url)
    `,
    )
    .eq("tournament_id", id)
    .order("joined_at", { ascending: true });

  const { data: rounds } = await supabase
    .from("tournament_rounds")
    .select("*")
    .eq("tournament_id", id)
    .order("round_number", { ascending: true });

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select(
      `
      *,
      match_players:tournament_match_players(
        *,
        tournament_player:tournament_players(
          *,
          profile:profiles!user_id(display_name, avatar_url)
        )
      )
    `,
    )
    .eq("tournament_id", id)
    .order("table_number", { ascending: true });

  const isHost = user && user.id === tournament.host_id;
  const hasJoined =
    !!user &&
    !!players?.some((p) => {
      return p.user_id === user.id;
    });

  const matchPlayers =
    matches?.flatMap((m) =>
      (m.match_players ?? []).map((mp: any) => ({
        ...mp,
        player_id: mp.player_id,
      })),
    ) ?? [];

  return (
    <div className="mx-auto min-w-0 max-w-6xl px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-[var(--foreground)] break-words sm:text-2xl">
            {tournament.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {tournament.game?.name} · {tournament.format.replace(/_/g, " ")} ·{" "}
            {new Date(tournament.starts_at).toLocaleString()}
          </p>
          {tournament.description && (
            <p className="mt-3 text-sm text-[var(--muted)]">
              {tournament.description}
            </p>
          )}
          {!!players?.length && (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Players joined:{" "}
              <span className="text-[var(--foreground)]">
                {players
                  .slice(0, 6)
                  .map((p) => p.profile?.display_name ?? "Player")
                  .join(", ")}
                {players.length > 6 ? ` +${players.length - 6} more` : ""}
              </span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 font-medium text-[var(--accent)]">
              Host: {tournament.host?.display_name ?? "Unknown"}
            </span>
  
            {tournament.is_strategy_focused && (
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Strategy expert
              </span>
            )}
            <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 font-medium text-[var(--accent)]">
              {tournament.players_per_match} per table
            </span>
            {tournament.city && (
              <span className="rounded-full bg-[var(--card)] px-3 py-1">
                {tournament.city}
              </span>
            )}
            <span className="rounded-full bg-[var(--card)] px-3 py-1 capitalize">
              {tournament.privacy.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
          {isHost ? (
            <HostTournamentControls
              tournamentId={id}
              hasRounds={!!rounds?.length}
            />
          ) : !hasJoined ? (
            <JoinTournamentButton tournamentId={id} />
          ) : (
            <p className="text-xs font-medium text-[var(--muted)]">
              You are registered for this tournament.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 sm:mt-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Players</h2>
            {!players?.length ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                No players have joined yet.
              </p>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {players.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-semibold text-[var(--accent)]">
                      {p.profile?.display_name?.[0]?.toUpperCase() ?? "P"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {p.profile?.display_name ?? "Player"}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        Joined {new Date(p.joined_at).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Rounds & tables
            </h2>
            {!rounds?.length ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                The host will generate the first round once enough players have joined.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {rounds.map((round) => {
                  const roundMatches =
                    matches?.filter((m) => m.round_id === round.id) ?? [];
                  return (
                    <div
                      key={round.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {round.name ?? `Round ${round.round_number}`}
                          </p>
                          <p className="text-xs text-[var(--muted)] capitalize">
                            {round.status.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>

                      {!roundMatches.length ? (
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          No tables have been generated for this round yet.
                        </p>
                      ) : (
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {roundMatches.map((m) => (
                            <div
                              key={m.id}
                              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3"
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-[var(--foreground)]">
                                  Table {m.table_number}
                                </p>
                                <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">
                                  {m.status}
                                </span>
                              </div>
                              <ul className="mt-2 space-y-1">
                                {(m.match_players ?? []).map((mp: any) => (
                                  <li
                                    key={mp.id}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <span className="text-[var(--foreground)]">
                                      {mp.tournament_player?.profile?.display_name ??
                                        "Player"}
                                    </span>
                                    {typeof mp.placement === "number" && (
                                      <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                                        {mp.placement === 1
                                          ? "1st"
                                          : mp.placement === 2
                                          ? "2nd"
                                          : mp.placement === 3
                                          ? "3rd"
                                          : `${mp.placement}th`}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <TournamentLeaderboard
          players={players ?? []}
          matchPlayers={matchPlayers as any}
        />
      </div>
    </div>
  );
}

