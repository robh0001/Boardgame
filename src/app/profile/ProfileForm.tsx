"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

type PrefWithGame = {
  id: string;
  game_id: string | null;
  preferred_cities: string[];
  max_travel_km: number;
  board_games: { id: string; name: string } | null;
};

export function ProfileForm({
  profile,
  preferences,
  allGames,
}: {
  profile: Profile | null;
  preferences: PrefWithGame[];
  allGames: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState< string | null>(null);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [maxTravelKm, setMaxTravelKm] = useState(
    preferences[0]?.max_travel_km ?? 20
  );
  const [preferredCities, setPreferredCities] = useState(
    preferences[0]?.preferred_cities?.join(", ") ?? ""
  );
  const [favoriteGameIds, setFavoriteGameIds] = useState<string[]>(
    preferences.filter((p) => p.game_id).map((p) => p.game_id!)
  );

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName || null,
      city: city || null,
      bio: bio || null,
      updated_at: new Date().toISOString(),
    });
    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }
    const cities = preferredCities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await supabase.from("user_preferences").delete().eq("user_id", user.id);
    if (cities.length > 0 || favoriteGameIds.length > 0) {
      if (favoriteGameIds.length > 0) {
        await supabase.from("user_preferences").insert(
          favoriteGameIds.map((game_id) => ({
            user_id: user.id,
            game_id,
            preferred_cities: cities,
            max_travel_km: maxTravelKm,
          }))
        );
      } else {
        await supabase.from("user_preferences").insert({
          user_id: user.id,
          game_id: null,
          preferred_cities: cities,
          max_travel_km: maxTravelKm,
        });
      }
    }
    setMessage("Saved.");
    setLoading(false);
    router.refresh();
  };

  const toggleGame = (id: string) => {
    setFavoriteGameIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={saveProfile} className="mt-8 space-y-6">
      {message && (
        <p className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Display name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How others see you"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">City</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. San Francisco"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Bio (optional)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          placeholder="A bit about you"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Preferred cities (comma-separated)
        </label>
        <input
          type="text"
          value={preferredCities}
          onChange={(e) => setPreferredCities(e.target.value)}
          placeholder="e.g. San Francisco, Oakland, Berkeley"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Max travel (km)
        </label>
        <input
          type="number"
          min={1}
          max={100}
          value={maxTravelKm}
          onChange={(e) => setMaxTravelKm(parseInt(e.target.value, 10) || 20)}
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Favorite games (select to get matched with sessions)
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {allGames.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGame(g.id)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                favoriteGameIds.includes(g.id)
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[var(--accent)] py-2.5 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
