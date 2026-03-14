"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function JoinButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const join = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    await supabase.from("session_players").insert({ session_id: sessionId, user_id: user.id });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={join}
      disabled={loading}
      className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
    >
      {loading ? "Joining…" : "Join this session"}
    </button>
  );
}
