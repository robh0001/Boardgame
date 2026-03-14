"use client";

import Link from "next/link";
import type { HubSession } from "./hub-data";

type SessionPreviewCardProps = {
  session: HubSession | null;
  onClose: () => void;
};

export function SessionPreviewCard({
  session,
  onClose,
}: SessionPreviewCardProps) {
  if (!session) {
    return (
      <div className="border-t border-white/10 bg-[#081120]/95 p-4 text-slate-300">
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium">
            Walk near a table and press <span className="text-cyan-300">E</span>, or click a hosted table to view details.
          </p>
        </div>
      </div>
    );
  }

  const spotsLeft = Math.max(session.max_players - session.player_count, 0);
  const isDummy = session.id.startsWith("dummy-");

  return (
    <div className="border-t border-white/10 bg-[#081120]/95 p-4">
      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1324]/95 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="h-1.5 w-full" style={{ background: session.gradient }} />

        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                {session.zoneLabel}
              </div>
              <h2 className="mt-3 text-2xl font-bold">{session.title}</h2>
              <p className="mt-1 text-sm font-medium text-cyan-300">
                {session.game_name}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Host
              </p>
              <p className="mt-1 text-sm text-white">{session.host_name}</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                When
              </p>
              <p className="mt-1 text-sm text-white">
                {new Date(session.starts_at).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Where
              </p>
              <p className="mt-1 text-sm text-white">
                {session.city}
                {session.venue_name ? ` · ${session.venue_name}` : ""}
                {session.address ? ` · ${session.address}` : ""}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Players
              </p>
              <p className="mt-1 text-sm text-white">
                {session.player_count} / {session.max_players} joined
                {session.status === "full"
                  ? " · Full"
                  : ` · ${spotsLeft} spots left`}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Vibe
              </p>
              <p className="mt-1 text-sm text-white">{session.vibe}</p>
            </div>
          </div>

          {session.notes && (
            <div className="mt-3 rounded-2xl border border-white/8 bg-white/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Notes
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-white">
                {session.notes}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={isDummy ? "#" : `/sessions/${session.id}`}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
              style={{ background: session.gradient }}
            >
              {isDummy ? "Preview only" : "Learn more / Join"}
            </Link>

            <Link
              href="/sessions"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              All sessions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}