import type {
  PlayerGameStats,
  TournamentMatchPlayer,
  TournamentPlayer,
} from "@/types/database";

export interface TournamentStanding {
  player: TournamentPlayer;
  matchesPlayed: number;
  matchesWon: number;
  points: number;
  podiumFinishes: number;
  winPercentage: number;
}

export function computeTournamentStandings(
  players: TournamentPlayer[],
  matchPlayers: TournamentMatchPlayer[],
): TournamentStanding[] {
  const byPlayer: Record<string, TournamentStanding> = {};

  for (const p of players) {
    byPlayer[p.id] = {
      player: p,
      matchesPlayed: 0,
      matchesWon: 0,
      points: 0,
      podiumFinishes: 0,
      winPercentage: 0,
    };
  }

  for (const mp of matchPlayers) {
    const entry = byPlayer[mp.player_id];
    if (!entry) continue;

    entry.matchesPlayed += 1;

    if (mp.is_winner) {
      entry.matchesWon += 1;
    }

    if (typeof mp.score === "number") {
      entry.points += mp.score;
    }

    if (typeof mp.placement === "number" && mp.placement >= 1 && mp.placement <= 3) {
      entry.podiumFinishes += 1;
    }
  }

  for (const value of Object.values(byPlayer)) {
    if (value.matchesPlayed > 0) {
      value.winPercentage = (value.matchesWon / value.matchesPlayed) * 100;
    }
  }

  return Object.values(byPlayer).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
    return (b.winPercentage ?? 0) - (a.winPercentage ?? 0);
  });
}

export function rollupPlayerGameStats(
  current: PlayerGameStats | null,
  standings: TournamentStanding,
  isTournamentWinner: boolean,
): Omit<PlayerGameStats, "id" | "user_id" | "game_id" | "last_updated"> {
  const base = current ?? {
    tournaments_played: 0,
    tournaments_won: 0,
    matches_played: 0,
    matches_won: 0,
    points_earned: 0,
    podium_finishes: 0,
    win_percentage: 0,
  };

  const tournaments_played = base.tournaments_played + 1;
  const tournaments_won = base.tournaments_won + (isTournamentWinner ? 1 : 0);

  const matches_played = base.matches_played + standings.matchesPlayed;
  const matches_won = base.matches_won + standings.matchesWon;
  const points_earned = base.points_earned + standings.points;
  const podium_finishes = base.podium_finishes + standings.podiumFinishes;

  const win_percentage =
    matches_played > 0 ? (matches_won / matches_played) * 100 : base.win_percentage;

  return {
    tournaments_played,
    tournaments_won,
    matches_played,
    matches_won,
    points_earned,
    podium_finishes,
    win_percentage,
  };
}

