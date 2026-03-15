"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HostTournamentControls({
  tournamentId,
  hasRounds,
}: {
  tournamentId: string;
  hasRounds: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const startTournament = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/start`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to start tournament.");
      } else {
        router.refresh();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link. Please copy from the address bar.");
    }
  };

  return (
    <div className="flex flex-col items-end gap-3">
      {error && (
        <p className="max-w-xs text-right text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={startTournament}
          disabled={loading}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_3px_0_#f06a25] transition-all hover:translate-y-0.5 hover:shadow-[0_1px_0_#f06a25] disabled:opacity-50"
        >
          {loading
            ? "Working…"
            : hasRounds
              ? "Regenerate round 1"
              : "Start tournament"}
        </button>
        <button
          type="button"
          onClick={copyInviteLink}
          className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {copied ? "Link copied" : "Copy invite link"}
        </button>
      </div>
      <p className="max-w-xs text-right text-xs text-[var(--muted)]">
        As host, you can start the tournament to generate the first round of tables
        for everyone who has joined. Share the invite link so friends can join.
      </p>
    </div>
  );
}

