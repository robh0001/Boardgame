import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HostSessionForm } from "./HostSessionForm";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { game: gameId } = await searchParams;
  let game = null;
  if (gameId) {
    const { data } = await supabase.from("board_games").select("*").eq("id", gameId).single();
    game = data;
  }
  const { data: games } = await supabase.from("board_games").select("id, name").order("name");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Host a session</h1>
      <p className="mt-1 text-[var(--muted)]">
        Pick a game, time, and place. Others can find and join you.
      </p>
      <HostSessionForm games={games ?? []} preselectedGame={game} />
    </div>
  );
}
