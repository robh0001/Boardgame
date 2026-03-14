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
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by name or description…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="mt-8 text-[var(--muted)]">
          {initialGames.length === 0
            ? "No games in the catalog yet. Run the seed API once (see README) or add games in Supabase."
            : "No games match your search."}
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((game) => (
            <li key={game.id}>
              <Link
                href={`/games/${game.id}`}
                className="block h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_0_#f5d5c2] transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-[0_8px_0_#f5d5c2]"
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
