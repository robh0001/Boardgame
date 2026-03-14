"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BoardGame } from "@/types/database";

export function GamesList({ initialGames }: { initialGames: BoardGame[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return initialGames;
    const q = query.toLowerCase();
    return initialGames.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.description?.toLowerCase().includes(q) ?? false)
    );
  }, [initialGames, query]);

  return (
    <>
      <input
        type="search"
        placeholder="Search by name or description…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-6 w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
      />
      {filtered.length === 0 ? (
        <p className="mt-8 text-[var(--muted)]">
          {initialGames.length === 0
            ? "No games in the catalog yet. Run the seed API once (see README) or add games in Supabase."
            : "No games match your search."}
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((game) => (
            <li key={game.id}>
              <Link
                href={`/games/${game.id}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--accent)] hover:shadow-md"
              >
                <h3 className="font-semibold text-[var(--foreground)]">{game.name}</h3>
                {game.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                    {game.description}
                  </p>
                )}
                <div className="mt-2 flex gap-3 text-xs text-[var(--muted)]">
                  {game.min_players != null && game.max_players != null && (
                    <span>
                      {game.min_players}–{game.max_players} players
                    </span>
                  )}
                  {game.play_time_minutes != null && (
                    <span>~{game.play_time_minutes} min</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
