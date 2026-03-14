import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("game_sessions")
    .select(`
      id,
      title,
      city,
      starts_at,
      max_players,
      status,
      host:profiles!host_id(display_name),
      game:board_games(name)
    `)
    .gte("starts_at", new Date().toISOString())
    .in("status", ["open", "full"])
    .order("starts_at");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Game sessions</h1>
          <p className="mt-1 text-[var(--muted)]">
            Join a game near you or host one for others.
          </p>
        </div>
        <Link
          href="/sessions/new"
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_3px_0_#f06a25] transition-all hover:translate-y-0.5 hover:shadow-[0_1px_0_#f06a25]"
        >
          Host a session
        </Link>
      </div>

      {!sessions?.length ? (
        <p className="mt-8 text-[var(--muted)]">
          No upcoming sessions. Be the first to host one!
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {sessions.map((s) => {
            const game = Array.isArray(s.game) ? s.game[0] : s.game;
            return (
              <li key={s.id}>
                <Link
                  href={`/sessions/${s.id}`}
                  className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_0_#f5d5c2] transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-[0_8px_0_#f5d5c2]"
                >
                  <span className="font-semibold text-[var(--foreground)]">{s.title}</span>
                  <span className="text-[var(--muted)]">·</span>
                  <span className="text-sm text-[var(--muted)]">
                    {game?.name ?? "Game"}
                  </span>
                  <span className="text-[var(--muted)]">·</span>
                  <span className="text-sm text-[var(--muted)]">{s.city}</span>
                  <span className="text-sm text-[var(--muted)]">
                    {new Date(s.starts_at).toLocaleString()}
                  </span>
                  <span className="ml-auto rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                    {s.status === "full" ? "Full" : `${s.max_players} spots`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
