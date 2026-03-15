import { createClient } from "@/lib/supabase/server";
import { GamesList } from "./GamesList";

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("board_games")
    .select("*")
    .order("name");
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">Browse games</h1>
      <p className="mt-1 text-sm text-[var(--muted)] sm:text-base">
        Search for a game you like, then host or join a session near you.
      </p>
      <GamesList initialGames={games ?? []} />
    </div>
  );
}
