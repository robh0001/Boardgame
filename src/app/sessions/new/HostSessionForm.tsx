"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import type { BoardGame } from "@/types/database";

export function HostSessionForm({
  games,
  preselectedGame,
}: {
  games: { id: string; name: string }[];
  preselectedGame: BoardGame | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    game_id: preselectedGame?.id ?? games[0]?.id ?? "",
    title: preselectedGame ? `${preselectedGame.name} at my place` : "",
    city: "",
    address: "",
    venue_name: "",
    starts_at: "",
    max_players: preselectedGame?.max_players ?? 4,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      setLoading(false);
      setError("reCAPTCHA is not configured.");
      return;
    }

    let captchaToken: string;

    try {
      captchaToken = await new Promise<string>((resolve, reject) => {
        if (typeof window === "undefined") {
          reject(new Error("Window is not available"));
          return;
        }

        const grecaptcha = (window as any).grecaptcha;

        if (!grecaptcha) {
          reject(new Error("reCAPTCHA is not loaded"));
          return;
        }

        grecaptcha.ready(() => {
          grecaptcha
            .execute(siteKey, { action: "host_session" })
            .then((token: string) => resolve(token))
            .catch((err: unknown) => reject(err));
        });
      });
    } catch (captchaError) {
      setLoading(false);
      setError("Failed to run reCAPTCHA. Please try again.");
      return;
    }

    try {
      const response = await fetch("/api/host-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          captchaToken,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? "Failed to create session.");
        setLoading(false);
        return;
      }

      router.push("/sessions");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}`}
        strategy="afterInteractive"
      />
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Game</label>
        <select
          value={form.game_id}
          onChange={(e) => setForm((f) => ({ ...f, game_id: e.target.value }))}
          required
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Catan at the café"
          required
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">City</label>
        <input
          type="text"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          placeholder="e.g. San Francisco"
          required
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Address or venue (optional)</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Street address"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Venue name (optional)</label>
        <input
          type="text"
          value={form.venue_name}
          onChange={(e) => setForm((f) => ({ ...f, venue_name: e.target.value }))}
          placeholder="e.g. The Board Room Café"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Date & time</label>
        <input
          type="datetime-local"
          value={form.starts_at}
          onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
          required
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Max players</label>
        <input
          type="number"
          min={2}
          max={20}
          value={form.max_players}
          onChange={(e) => setForm((f) => ({ ...f, max_players: parseInt(e.target.value, 10) || 4 }))}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
          placeholder="Anything players should know?"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? "Creating…" : "Host session"}
      </button>
      </form>
    </>
  );
}
