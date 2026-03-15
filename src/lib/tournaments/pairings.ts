import type {
  TournamentFormat,
  TournamentMatch,
  TournamentMatchPlayer,
  TournamentPlayer,
  TournamentRound,
} from "@/types/database";

export interface GeneratedRound {
  round: Omit<TournamentRound, "id">;
  matches: Array<{
    match: Omit<TournamentMatch, "id" | "players">;
    players: Array<Omit<TournamentMatchPlayer, "id" | "player" | "player_id" | "match_id"> & { tournament_player_id: string }>;
  }>;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateInitialRound(
  tournamentId: string,
  hostId: string,
  format: TournamentFormat,
  players: TournamentPlayer[],
  playersPerMatch: number,
): GeneratedRound {
  const activePlayers = shuffle(players);

  const groups: TournamentPlayer[][] = [];
  for (let i = 0; i < activePlayers.length; i += playersPerMatch) {
    groups.push(activePlayers.slice(i, i + playersPerMatch));
  }

  const round: Omit<TournamentRound, "id"> = {
    tournament_id: tournamentId,
    round_number: 1,
    name: "Round 1",
    status: "pending",
    started_at: null,
    completed_at: null,
  };

  const matches: GeneratedRound["matches"] = groups.map((group, index) => ({
    match: {
      tournament_id: tournamentId,
      round_id: "", // to be filled after inserting the round
      table_number: index + 1,
      status: "scheduled",
      winner_player_id: null,
      game_metadata: null,
      created_by: hostId,
      scheduled_at: null,
      started_at: null,
      completed_at: null,
    },
    players: group.map((p, seatIndex) => ({
      tournament_player_id: p.id,
      seat_number: seatIndex + 1,
      score: null,
      placement: null,
      advanced: null,
      is_winner: false,
    })),
  }));

  return { round, matches };
}

export function generateNextEliminationRound(
  tournamentId: string,
  hostId: string,
  completedRoundNumber: number,
  winners: TournamentPlayer[],
  playersPerMatch: number,
): GeneratedRound | null {
  if (winners.length === 0) {
    return null;
  }

  const shuffled = shuffle(winners);
  const groups: TournamentPlayer[][] = [];
  for (let i = 0; i < shuffled.length; i += playersPerMatch) {
    groups.push(shuffled.slice(i, i + playersPerMatch));
  }

  const roundNumber = completedRoundNumber + 1;

  const round: Omit<TournamentRound, "id"> = {
    tournament_id: tournamentId,
    round_number: roundNumber,
    name: `Round ${roundNumber}`,
    status: "pending",
    started_at: null,
    completed_at: null,
  };

  const matches: GeneratedRound["matches"] = groups.map((group, index) => ({
    match: {
      tournament_id: tournamentId,
      round_id: "",
      table_number: index + 1,
      status: "scheduled",
      winner_player_id: null,
      game_metadata: null,
      created_by: hostId,
      scheduled_at: null,
      started_at: null,
      completed_at: null,
    },
    players: group.map((p, seatIndex) => ({
      tournament_player_id: p.id,
      seat_number: seatIndex + 1,
      score: null,
      placement: null,
      advanced: null,
      is_winner: false,
    })),
  }));

  return { round, matches };
}

