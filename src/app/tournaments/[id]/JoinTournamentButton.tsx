"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function JoinTournamentButton({ tournamentId }: { tournamentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error: err } = await supabase.from("tournament_players").insert({
      tournament_id: tournamentId,
      user_id: user.id,
    });

    setLoading(false);
    if (err) {
      // Common cases: RLS mismatch, unique constraint, missing table in remote schema.
      setError(err.message);
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <p className="max-w-xs text-right text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={join}
        disabled={loading}
        className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? "Joining…" : "Join this tournament"}
      </button>
    </div>
  );
}

