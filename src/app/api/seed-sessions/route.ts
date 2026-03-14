import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if there are already sessions, so we don't duplicate on every call
  const { data: existingSessions, error: existingError } = await supabase
    .from("game_sessions")
    .select("id")
    .limit(1);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existingSessions && existingSessions.length > 0) {
    return NextResponse.json({ message: "Sessions already exist" });
  }

  // Ensure the user has a profile with a city
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("city")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const city = profile?.city || "Playtest City";

  // Grab a few games to attach sessions to
  const { data: games, error: gamesError } = await supabase
    .from("board_games")
    .select("id, name")
    .order("name")
    .limit(3);

  if (gamesError) {
    return NextResponse.json({ error: gamesError.message }, { status: 500 });
  }

  if (!games || games.length === 0) {
    return NextResponse.json(
      { error: "No games found. Seed games first via /api/seed-games." },
      { status: 400 },
    );
  }

  const now = new Date();

  const sessionsToInsert = games.map((game, index) => {
    const startsAt = new Date(now);
    startsAt.setDate(now.getDate() + (index + 1));
    startsAt.setHours(19, 0, 0, 0); // 7pm

    return {
      host_id: user.id,
      game_id: game.id,
      title: `${game.name} playtest #${index + 1}`,
      city,
      address: null,
      venue_name: "Local Board Game Café",
      starts_at: startsAt.toISOString(),
      max_players: 4 + index,
      notes: "Dummy session for testing the UI and dice roll feature.",
      status: "open" as const,
    };
  });

  const { error: insertError } = await supabase
    .from("game_sessions")
    .insert(sessionsToInsert);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Dummy sessions created",
    count: sessionsToInsert.length,
    city,
  });
}

