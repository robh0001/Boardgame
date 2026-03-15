import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HostTournamentForm } from "./HostTournamentForm";

export default async function NewTournamentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: games } = await supabase
    .from("board_games")
    .select("id, name, min_players, max_players")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Host a tournament</h1>
      <p className="mt-1 text-[var(--muted)]">
        Create a multi-round event with automatic pairings, standings, and leaderboards.
      </p>
      <HostTournamentForm games={games ?? []} />
    </div>
  );
}

