import { createClient } from "@/lib/supabase/server";
import { SEED_BOARD_GAMES } from "@/data/seed-games";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: existing } = await supabase.from("board_games").select("id").limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ message: "Games already seeded" });
  }
  const { error } = await supabase.from("board_games").insert(
    SEED_BOARD_GAMES.map((g) => ({
      name: g.name,
      slug: g.slug,
      description: g.description,
      min_players: g.min_players,
      max_players: g.max_players,
      play_time_minutes: g.play_time_minutes,
    }))
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: "Seeded successfully" });
}
