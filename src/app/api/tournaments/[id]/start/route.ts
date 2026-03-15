import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInitialRound } from "@/lib/tournaments/pairings";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", params.id)
    .single();

  if (tError || !tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  if (tournament.host_id !== user.id) {
    return NextResponse.json({ error: "Only the host can start the tournament" }, { status: 403 });
  }

  const { data: players, error: pError } = await supabase
    .from("tournament_players")
    .select("*")
    .eq("tournament_id", params.id)
    .eq("is_approved", true);

  if (pError) {
    return NextResponse.json({ error: pError.message }, { status: 500 });
  }

  if (!players || players.length < (tournament.min_players ?? 2)) {
    return NextResponse.json(
      { error: "Not enough players to start this tournament yet." },
      { status: 400 },
    );
  }

  const generated = generateInitialRound(
    tournament.id,
    tournament.host_id,
    tournament.format,
    players,
    tournament.players_per_match,
  );

  const { data: roundData, error: roundError } = await supabase
    .from("tournament_rounds")
    .insert({
      tournament_id: generated.round.tournament_id,
      round_number: generated.round.round_number,
      name: generated.round.name,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (roundError || !roundData) {
    return NextResponse.json({ error: roundError?.message ?? "Failed to create round" }, { status: 500 });
  }

  const matchInserts = generated.matches.map((m) => ({
    tournament_id: tournament.id,
    round_id: roundData.id,
    table_number: m.match.table_number,
    status: "scheduled",
    winner_player_id: null,
    game_metadata: null,
    created_by: tournament.host_id,
  }));

  const { data: insertedMatches, error: matchError } = await supabase
    .from("tournament_matches")
    .insert(matchInserts)
    .select("id, table_number");

  if (matchError || !insertedMatches) {
    return NextResponse.json(
      { error: matchError?.message ?? "Failed to create matches" },
      { status: 500 },
    );
  }

  const matchIdByTable: Record<number, string> = {};
  for (const m of insertedMatches) {
    matchIdByTable[m.table_number] = m.id;
  }

  const matchPlayersInserts = generated.matches.flatMap((m) =>
    m.players.map((p) => ({
      match_id: matchIdByTable[m.match.table_number],
      player_id: p.tournament_player_id,
      seat_number: p.seat_number,
      score: null,
      placement: null,
      advanced: null,
      is_winner: false,
    })),
  );

  const { error: mpError } = await supabase
    .from("tournament_match_players")
    .insert(matchPlayersInserts);

  if (mpError) {
    return NextResponse.json(
      { error: mpError.message ?? "Failed to add players to tables" },
      { status: 500 },
    );
  }

  const { error: statusError } = await supabase
    .from("tournaments")
    .update({ status: "in_progress" })
    .eq("id", tournament.id);

  if (statusError) {
    return NextResponse.json(
      { error: statusError.message ?? "Failed to update tournament status" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

