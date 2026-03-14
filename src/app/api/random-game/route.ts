import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("city")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const city = profile?.city;

  if (!city) {
    return NextResponse.json(
      { error: "Please set your city in your profile first." },
      { status: 400 },
    );
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("game_sessions")
    .select(
      `
      id,
      title,
      city,
      starts_at,
      max_players,
      status,
      game:board_games(id, name, description, min_players, max_players, play_time_minutes)
    `,
    )
    .eq("city", city)
    .gte("starts_at", new Date().toISOString())
    .eq("status", "open");

  if (sessionsError) {
    return NextResponse.json({ error: sessionsError.message }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json(
      { error: "No open sessions found near you yet. Try hosting one!" },
      { status: 404 },
    );
  }

  const random =
    sessions[Math.floor(Math.random() * Math.max(1, sessions.length))];

  return NextResponse.json(random);
}

