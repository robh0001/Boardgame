import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*, board_games(id, name)")
    .eq("user_id", user.id);
  const { data: games } = await supabase.from("board_games").select("id, name").order("name");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Profile & preferences</h1>
      <p className="mt-1 text-[var(--muted)]">
        Set your city and favorite games so we can match you with sessions near you.
      </p>
      <ProfileForm
        profile={profile ?? null}
        preferences={preferences ?? []}
        allGames={games ?? []}
      />
    </div>
  );
}
