"use client";

import type { HubSession } from "./hub-data";

type HostedGameSpotProps = {
  session: HubSession;
  isNearby: boolean;
  onSelect: () => void;
};

export function HostedGameSpot({
  session,
  isNearby,
  onSelect,
}: HostedGameSpotProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group absolute -translate-x-1/2 -translate-y-1/2 text-left"
      style={{ left: session.x, top: session.y + 10 }}
      aria-label={`View ${session.title}`}
    >
      <div
        className={`relative transition-all duration-200 ${
          isNearby ? "scale-110" : "group-hover:scale-105"
        }`}
      >
        {isNearby && (
          <div
            className="absolute left-1/2 top-[44px] h-24 w-24 -translate-x-1/2 rounded-full blur-2xl"
            style={{
              background: session.gradient,
              opacity: 0.95,
            }}
          />
        )}

        <div className="relative">
          <div className="absolute left-1/2 top-[56px] h-4 w-20 -translate-x-1/2 rounded-full bg-black/30 blur-[3px]" />

          <div className="relative mx-auto flex w-[110px] flex-col items-center">
            <div
              className="relative w-full rounded-[22px] border px-3 py-3 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,26,46,0.96), rgba(10,16,32,0.96))",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              <div
                className="absolute left-1/2 top-0 h-2 w-14 -translate-x-1/2 rounded-b-full"
                style={{ background: session.gradient }}
              />

              <div className="mt-1 flex items-center justify-center">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full border text-base font-extrabold text-white"
                  style={{
                    background: session.gradient,
                    borderColor: "rgba(255,255,255,0.4)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                  }}
                >
                  {session.host_name.slice(0, 1).toUpperCase()}
                </div>
              </div>

              <div className="mt-3 text-center">
                <div className="line-clamp-1 text-[13px] font-bold text-white">
                  {session.game_name}
                </div>
                <div className="mt-1 line-clamp-1 text-[11px] text-slate-300">
                  {session.host_name}
                </div>
              </div>
            </div>

            <div
              className="mt-2 rounded-full border px-3 py-1 text-center text-[10px] font-semibold text-white shadow-md"
              style={{
                background: session.gradient,
                borderColor: "rgba(255,255,255,0.22)",
              }}
            >
              {session.player_count}/{session.max_players} players
            </div>
          </div>
        </div>

        {isNearby && (
          <div className="absolute left-1/2 top-[122px] -translate-x-1/2 rounded-full border border-cyan-300/20 bg-[#07111f]/95 px-2.5 py-1 text-[10px] font-semibold text-cyan-200 shadow-md">
            Click or press E
          </div>
        )}
      </div>
    </button>
  );
}