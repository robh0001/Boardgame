import type { TournamentMatchPlayer, TournamentPlayer } from "@/types/database";
import { computeTournamentStandings } from "@/lib/tournaments/standings";

export function TournamentLeaderboard({
  players,
  matchPlayers,
}: {
  players: TournamentPlayer[];
  matchPlayers: TournamentMatchPlayer[];
}) {
  const standings = computeTournamentStandings(players, matchPlayers);

  if (!standings.length) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Leaderboard</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Standings will appear here once matches have results.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">Leaderboard</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="pb-2 pr-4">Rank</th>
              <th className="pb-2 pr-4">Player</th>
              <th className="pb-2 pr-4">Matches</th>
              <th className="pb-2 pr-4">Wins</th>
              <th className="pb-2 pr-4">Points</th>
              <th className="pb-2 pr-4">Win %</th>
              <th className="pb-2">Podiums</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, index) => (
              <tr
                key={s.player.id}
                className="border-b border-[var(--border)] last:border-0"
              >
                <td className="py-2 pr-4 text-xs font-semibold text-[var(--muted)]">
                  #{index + 1}
                </td>
                <td className="py-2 pr-4 text-sm text-[var(--foreground)]">
                  {s.player.profile?.display_name ?? "Player"}
                </td>
                <td className="py-2 pr-4 text-xs text-[var(--muted)]">
                  {s.matchesPlayed}
                </td>
                <td className="py-2 pr-4 text-xs text-[var(--muted)]">
                  {s.matchesWon}
                </td>
                <td className="py-2 pr-4 text-xs text-[var(--muted)]">
                  {s.points.toFixed(1)}
                </td>
                <td className="py-2 pr-4 text-xs text-[var(--muted)]">
                  {s.winPercentage.toFixed(1)}%
                </td>
                <td className="py-2 text-xs text-[var(--muted)]">
                  {s.podiumFinishes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

