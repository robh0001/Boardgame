import { createClient } from "@/lib/supabase/server";
import { GamesList } from "./GamesList";

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("board_games")
    .select("*")
    .order("name");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Browse games</h1>
      <p className="mt-1 text-[var(--muted)]">
        Search for a game you like, then host or join a session near you.
      </p>
      <GamesList initialGames={games ?? []} />
    </div>
  );
}
