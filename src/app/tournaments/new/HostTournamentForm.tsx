"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BoardGame, TournamentFormat } from "@/types/database";

const FORMATS: { value: TournamentFormat; label: string }[] = [
  { value: "single_elimination", label: "Single elimination (1v1)" },
  { value: "round_robin", label: "Round robin" },
  { value: "multiplayer_points", label: "Multiplayer rounds with points" },
  { value: "swiss", label: "Swiss-style (beta)" },
];

const PRIVACY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "invite_only", label: "Invite only" },
];

const LOCATION_TYPES = [
  { value: "in_person", label: "In person" },
  { value: "online", label: "Online" },
  { value: "mixed", label: "Mixed / hybrid" },
];

export function HostTournamentForm({
  games,
}: {
  games: { id: string; name: string; min_players: number | null; max_players: number | null }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstGame = games[0];

  const [form, setForm] = useState({
    game_id: firstGame?.id ?? "",
    name: firstGame ? `${firstGame.name} tournament` : "",
    description: "",
    format: "multiplayer_points" as TournamentFormat,
    min_players: firstGame?.min_players ?? 2,
    max_players: firstGame?.max_players ?? 16,
    players_per_match: Math.min(firstGame?.max_players ?? 4, 4),
    total_rounds: 3,
    starts_at: "",
    location_type: "in_person" as "in_person" | "online" | "mixed",
    city: "",
    address: "",
    venue_name: "",
    privacy: "public" as "public" | "private" | "invite_only",
    entry_cap: "",
    cover_image_url: "",
    is_beginner_friendly: false,
    is_strategy_focused: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const { error: err, data } = await supabase
      .from("tournaments")
      .insert({
        host_id: user.id,
        game_id: form.game_id,
        name: form.name,
        description: form.description || null,
        format: form.format,
        min_players: form.min_players,
        max_players: form.max_players,
        players_per_match: form.players_per_match,
        total_rounds: form.total_rounds || null,
        starts_at: form.starts_at,
        location_type: form.location_type,
        city: form.location_type === "in_person" || form.location_type === "mixed" ? form.city || null : null,
        address:
          form.location_type === "in_person" || form.location_type === "mixed"
            ? form.address || null
            : null,
        venue_name:
          form.location_type === "in_person" || form.location_type === "mixed"
            ? form.venue_name || null
            : null,
        privacy: form.privacy,
        entry_cap: form.entry_cap ? parseInt(form.entry_cap, 10) || null : null,
        cover_image_url: form.cover_image_url || null,
        is_beginner_friendly: form.is_beginner_friendly,
        is_strategy_focused: form.is_strategy_focused,
        status: "upcoming",
      })
      .select("id")
      .single();

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }

    if (data?.id) {
      router.push(`/tournaments/${data.id}`);
      router.refresh();
    } else {
      router.push("/tournaments");
      router.refresh();
    }
  };

  const selectedGame: BoardGame | undefined = games.find((g) => g.id === form.game_id) as
    | BoardGame
    | undefined;

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Game</label>
          <select
            value={form.game_id}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                game_id: e.target.value,
              }))
            }
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
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Tournament name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Catan City Championship"
            required
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          placeholder="Share the vibe, rules, and expectations for this tournament."
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Format</label>
          <select
            value={form.format}
            onChange={(e) =>
              setForm((f) => ({ ...f, format: e.target.value as TournamentFormat }))
            }
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Players per match / table
          </label>
          <input
            type="number"
            min={2}
            max={selectedGame?.max_players ?? 8}
            value={form.players_per_match}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                players_per_match: parseInt(e.target.value, 10) || 2,
              }))
            }
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            Match size must be compatible with this game&apos;s player count.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Planned rounds
          </label>
          <input
            type="number"
            min={1}
            max={12}
            value={form.total_rounds}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                total_rounds: parseInt(e.target.value, 10) || 1,
              }))
            }
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Minimum players
          </label>
          <input
            type="number"
            min={2}
            value={form.min_players ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                min_players: parseInt(e.target.value, 10) || null,
              }))
            }
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Maximum players
          </label>
          <input
            type="number"
            min={2}
            value={form.max_players ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                max_players: parseInt(e.target.value, 10) || null,
              }))
            }
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Entry cap (optional)
          </label>
          <input
            type="number"
            min={2}
            value={form.entry_cap}
            onChange={(e) => setForm((f) => ({ ...f, entry_cap: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Date & time
          </label>
          <input
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
            required
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Cover image URL (optional)
          </label>
          <input
            type="url"
            value={form.cover_image_url}
            onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
            placeholder="Link to a banner or game art"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Beginner friendly
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="beginner-friendly"
              type="checkbox"
              checked={form.is_beginner_friendly}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_beginner_friendly: e.target.checked }))
              }
              className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <label
              htmlFor="beginner-friendly"
              className="text-xs text-[var(--muted)]"
            >
              Mark this tournament as welcoming to new players.
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Strategy focused
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="strategy-focused"
              type="checkbox"
              checked={form.is_strategy_focused}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_strategy_focused: e.target.checked }))
              }
              className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <label htmlFor="strategy-focused" className="text-xs text-[var(--muted)]">
              Highlight that this event is geared towards serious/competitive play.
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Privacy
          </label>
          <select
            value={form.privacy}
            onChange={(e) =>
              setForm((f) => ({ ...f, privacy: e.target.value as typeof f.privacy }))
            }
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            {PRIVACY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Location type
          </label>
          <select
            value={form.location_type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                location_type: e.target.value as typeof f.location_type,
              }))
            }
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            {LOCATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(form.location_type === "in_person" || form.location_type === "mixed") && (
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              City
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Berlin"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Venue name
            </label>
            <input
              type="text"
              value={form.venue_name}
              onChange={(e) => setForm((f) => ({ ...f, venue_name: e.target.value }))}
              placeholder="e.g. Local board game café"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Street address"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? "Creating…" : "Host tournament"}
      </button>
    </form>
  );
}

