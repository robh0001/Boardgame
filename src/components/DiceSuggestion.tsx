"use client";

import { useState } from "react";
import Link from "next/link";

interface RandomSession {
  id: string;
  title: string;
  city: string;
  starts_at: string;
  max_players: number;
  status: string;
  game?: {
    id: string;
    name: string;
    description: string | null;
    min_players: number | null;
    max_players: number | null;
    play_time_minutes: number | null;
  } | null;
}

export function DiceSuggestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RandomSession | null>(null);

  const roll = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/random-game");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setResult(data as RandomSession);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-t border-[var(--border)] bg-[var(--card)]/60">
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Not sure what to play?
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
          <span className="mr-1">🎲</span>
          Roll the dice for a game near you
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)]">
          We&apos;ll pick a random open session in your city based on your profile.
        </p>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={roll}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_0_#f06a25] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_#f06a25] disabled:opacity-60"
          >
            🎲 {loading ? "Rolling…" : "Roll for me"}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {result && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 text-left shadow-[0_5px_0_#f5d5c2]">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Your random pick
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              {result.game?.name ?? result.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {result.city} · {new Date(result.starts_at).toLocaleString()}
            </p>
            {result.game?.description && (
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                {result.game.description}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
              {result.game?.min_players != null &&
                result.game?.max_players != null && (
                  <span>
                    {result.game.min_players}–{result.game.max_players} players
                  </span>
                )}
              {result.game?.play_time_minutes != null && (
                <span>~{result.game.play_time_minutes} min</span>
              )}
            </div>
            <Link
              href={`/sessions/${result.id}`}
              className="mt-4 inline-flex items-center text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View session details
              <span className="ml-1">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

