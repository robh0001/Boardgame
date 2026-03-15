import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { fetchUpcomingSessions } from "@/lib/sessions";
import { DUMMY_HUB_SESSIONS } from "@/app/hub/hub-data";

export default async function SessionsPage() {
  const supabase = await createClient();
  const sessions = await fetchUpcomingSessions(supabase);

  const { data: playerRows } = await supabase
    .from("session_players")
    .select("session_id");
  const countsBySession = new Map<string, number>();
  for (const row of playerRows ?? []) {
    countsBySession.set(row.session_id, (countsBySession.get(row.session_id) ?? 0) + 1);
  }

  const displaySessions = sessions.map((s) => {
    const game = Array.isArray(s.game) ? s.game[0] : s.game;
    const host = Array.isArray(s.host) ? s.host[0] : s.host;
    const gameName = game && typeof game === "object" && "name" in game ? (game as { name: string }).name : "Game";
    return { ...s, gameName, host, playerCount: countsBySession.get(s.id) ?? 0 };
  });

  const sampleSessions = DUMMY_HUB_SESSIONS;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Game sessions</h1>
          <p className="mt-1 text-sm text-[var(--muted)] sm:text-base">
            Join a game near you or host one for others. Same sessions as in the Hub.
          </p>
        </div>
        <Link
          href="/sessions/new"
          className="shrink-0 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_3px_0_#f06a25] transition-all hover:translate-y-0.5 hover:shadow-[0_1px_0_#f06a25]"
        >
          Host a session
        </Link>
      </div>

      {/* Real sessions — joinable */}
      <section className="mt-6 sm:mt-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Join a session
        </h2>
        {displaySessions.length === 0 ? (
          <p className="mt-3 text-[var(--muted)]">
            No upcoming sessions yet. Be the first to host one, or explore sample sessions below in the Hub.
          </p>
        ) : (
          <ul className="mt-3 space-y-3 sm:space-y-4">
            {displaySessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sessions/${s.id}`}
                  className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_0_#f5d5c2] transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-[0_8px_0_#f5d5c2]"
                >
                  <span className="font-semibold text-[var(--foreground)]">{s.title}</span>
                  <span className="hidden text-[var(--muted)] sm:inline">·</span>
                  <span className="text-sm text-[var(--muted)]">{s.gameName}</span>
                  <span className="hidden text-[var(--muted)] sm:inline">·</span>
                  <span className="text-sm text-[var(--muted)]">{s.city}</span>
                  <span className="text-sm text-[var(--muted)]">
                    {new Date(s.starts_at).toLocaleString()}
                  </span>
                  <span className="ml-auto shrink-0 rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                    {s.status === "full" ? "Full" : `${s.playerCount}/${s.max_players} joined`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Same sample sessions as Hub — discover in Hub */}
      <section className="mt-8 sm:mt-10">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Also in the Hub
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          These sample sessions appear in the Game Hub. Open the Hub to explore the same list there.
        </p>
        <ul className="mt-3 space-y-3 sm:space-y-4">
          {sampleSessions.map((s) => (
            <li key={s.id}>
              <Link
                href="/hub"
                className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 shadow-[0_2px_0_#f5d5c2] transition-transform hover:-translate-y-0.5 hover:shadow-[0_6px_0_#f5d5c2]"
              >
                <span className="font-semibold text-[var(--foreground)]">{s.title}</span>
                <span className="hidden text-[var(--muted)] sm:inline">·</span>
                <span className="text-sm text-[var(--muted)]">{s.game_name}</span>
                <span className="hidden text-[var(--muted)] sm:inline">·</span>
                <span className="text-sm text-[var(--muted)]">{s.city}</span>
                <span className="text-sm text-[var(--muted)]">
                  {new Date(s.starts_at).toLocaleString()}
                </span>
                <span className="ml-auto shrink-0 rounded-full border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
                  Sample · See in Hub
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
