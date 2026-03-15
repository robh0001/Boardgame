import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JoinButton } from "./JoinButton";
import { ReportHostButton } from "./ReportHostButton";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("game_sessions")
    .select(`
      *,
      host:profiles!host_id(display_name, city),
      game:board_games(name, min_players, max_players, play_time_minutes)
    `)
    .eq("id", id)
    .single();
  if (!session) notFound();

  const { data: players } = await supabase
    .from("session_players")
    .select("user_id, profiles(display_name)")
    .eq("session_id", id);

  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;
  const isHost = session.host_id === currentUserId;
  const hasJoined = players?.some((p: { user_id: string }) => p.user_id === currentUserId) ?? false;
  const playerCount = players?.length ?? 0;
  const canJoin = !hasJoined && !isHost && session.status === "open" && playerCount < session.max_players;

  const hostRaw = session.host;
  const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;
  const gameRaw = session.game;
  const game = Array.isArray(gameRaw) ? gameRaw[0] : gameRaw;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/sessions" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
        ← Back to sessions
      </Link>
      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_5px_0_#f5d5c2]">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{session.title}</h1>
        <p className="mt-1 text-[var(--muted)]">{game?.name}</p>
        <dl className="mt-6 grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Host</dt>
            <dd className="font-medium">{host?.display_name ?? "Someone"}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">When</dt>
            <dd>{new Date(session.starts_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Where</dt>
            <dd>
              {session.city}
              {session.venue_name && ` · ${session.venue_name}`}
              {session.address && ` · ${session.address}`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Players</dt>
            <dd>
              {playerCount} / {session.max_players} joined
              {session.status === "full" && " (full)"}
            </dd>
          </div>
          {session.notes && (
            <div>
              <dt className="text-[var(--muted)]">Notes</dt>
              <dd className="whitespace-pre-wrap">{session.notes}</dd>
            </div>
          )}
        </dl>
        {user && (
          <div className="mt-6">
            {isHost ? (
              <p className="text-sm text-[var(--muted)]">You are hosting this session.</p>
            ) : hasJoined ? (
              <p className="text-sm font-medium text-[var(--accent)]">You’re in! See you there.</p>
            ) : canJoin ? (
              <JoinButton sessionId={id} />
            ) : (
              session.status !== "open" && (
                <p className="text-sm text-[var(--muted)]">This session is not open for new players.</p>
              )
            )}

            {!isHost && (
              <ReportHostButton sessionId={id} reportedHostId={session.host_id} />
            )}
          </div>
        )}
        {!user && (
          <p className="mt-6 text-sm text-[var(--muted)]">
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              Log in
            </Link>{" "}
            to join this session.
          </p>
        )}
      </div>
      {players && players.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Players</h2>
          <ul className="mt-2 space-y-1">
            {players.map((p: { user_id: string; profiles: unknown }) => {
              const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
              const name = profile && typeof profile === "object" && "display_name" in profile
                ? (profile as { display_name: string | null }).display_name
                : null;
              return (
                <li key={p.user_id} className="text-sm text-[var(--muted)]">
                  {name ?? "Anonymous"}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
