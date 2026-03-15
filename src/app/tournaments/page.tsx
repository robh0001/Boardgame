import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function TournamentsPage() {
  const supabase = await createClient();

      const { data: tournaments } = await supabase
    .from("tournaments")
    .select(
      `
      id,
      name,
      starts_at,
      city,
      status,
      format,
      players_per_match,
      game:board_games(name),
      host:profiles!host_id(display_name)
    `,
    )
    .order("starts_at", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tournaments</h1>
          <p className="mt-1 text-[var(--muted)]">
            Host multi-round tournaments or join events for your favorite games.
          </p>
        </div>
        <Link
          href="/tournaments/new"
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_3px_0_#f06a25] transition-all hover:translate-y-0.5 hover:shadow-[0_1px_0_#f06a25]"
        >
          Host a tournament
        </Link>
      </div>

      {!tournaments?.length ? (
        <p className="mt-8 text-[var(--muted)]">
          No tournaments yet. Be the first to host one!
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {tournaments.map((t) => {
            const game = Array.isArray(t.game) ? t.game[0] : t.game;
            const host = Array.isArray(t.host) ? t.host[0] : t.host;
            return (
              <li key={t.id}>
                <Link
                  href={`/tournaments/${t.id}`}
                  className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_0_#f5d5c2] transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-[0_8px_0_#f5d5c2]"
                >
                  <span className="font-semibold text-[var(--foreground)]">
                    {t.name}
                  </span>
                  <span className="text-[var(--muted)]">·</span>
                  <span className="text-sm text-[var(--muted)]">
                    {game?.name ?? "Game"}
                  </span>
                  {t.city && (
                    <>
                      <span className="text-[var(--muted)]">·</span>
                      <span className="text-sm text-[var(--muted)]">{t.city}</span>
                    </>
                  )}
                  <span className="text-sm text-[var(--muted)]">
                    {new Date(t.starts_at).toLocaleString()}
                  </span>
                  <span className="ml-auto flex flex-wrap items-center gap-2">
      
                    <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
                      {t.format.replace(/_/g, " ")}
                    </span>
                    <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                      {t.status === "completed"
                        ? "Completed"
                        : t.status === "in_progress"
                        ? "In progress"
                        : "Upcoming"}
                    </span>
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

