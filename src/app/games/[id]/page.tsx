import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: game } = await supabase.from("board_games").select("*").eq("id", id).single();
  if (!game) notFound();

  const { data: sessions } = await supabase
    .from("game_sessions")
    .select("id, title, city, starts_at, max_players, status")
    .eq("game_id", id)
    .gte("starts_at", new Date().toISOString())
    .in("status", ["open", "full"])
    .order("starts_at");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/games" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
        ← Back to games
      </Link>
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{game.name}</h1>
        {game.description && (
          <p className="mt-2 text-[var(--muted)]">{game.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          {game.min_players != null && game.max_players != null && (
            <span>{game.min_players}–{game.max_players} players</span>
          )}
          {game.play_time_minutes != null && (
            <span>~{game.play_time_minutes} min</span>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/sessions/new?game=${game.id}`}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Host a session
          </Link>
          <Link
            href="/sessions"
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Find sessions
          </Link>
        </div>
      </div>
      <h2 className="mt-8 text-lg font-semibold text-[var(--foreground)]">
        Upcoming sessions
      </h2>
      {!sessions?.length ? (
        <p className="mt-2 text-[var(--muted)]">No upcoming sessions for this game yet. Host one!</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/sessions/${s.id}`}
                className="block rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 transition-colors hover:border-[var(--accent)]"
              >
                <span className="font-medium">{s.title}</span>
                <span className="mx-2 text-[var(--muted)]">·</span>
                <span className="text-sm text-[var(--muted)]">
                  {s.city} · {new Date(s.starts_at).toLocaleString()} · {s.max_players} spots
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
