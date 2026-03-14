"use client";

import { useEffect, useMemo, useState } from "react";
import { HostedGameSpot } from "./HostedGameSpot";
import { SessionPreviewCard } from "./SessionPreviewCard";
import type { HubSession } from "./hub-data";
import { WORLD_HEIGHT, WORLD_WIDTH } from "./hub-data";

type HubSceneProps = {
  sessions: HubSession[];
};

type PlayerState = {
  x: number;
  y: number;
};

const VIEWPORT_HEIGHT = 780;
const PLAYER_SPEED = 4.2;
const INTERACTION_DISTANCE = 140;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getNearestSession(
  player: PlayerState,
  sessions: HubSession[],
  maxDistance: number
) {
  let nearest: HubSession | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const session of sessions) {
    const d = distance(player, session);
    if (d < bestDistance && d <= maxDistance) {
      bestDistance = d;
      nearest = session;
    }
  }

  return nearest;
}

function District({
  x,
  y,
  width,
  height,
  title,
  subtitle,
  gradient,
  children,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  subtitle: string;
  gradient: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="absolute rounded-[34px] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
      style={{
        left: x,
        top: y,
        width,
        height,
        background:
          "linear-gradient(180deg, rgba(9,14,27,0.88), rgba(8,12,24,0.96))",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-20 rounded-t-[34px]"
        style={{
          background: gradient,
          opacity: 0.92,
        }}
      />
      <div className="relative z-10 p-5 text-white">
        <div className="text-2xl font-extrabold">{title}</div>
        <div className="mt-1 text-sm text-white/80">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function BoothPad({
  x,
  y,
  size = 130,
}: {
  x: number;
  y: number;
  size?: number;
}) {
  return (
    <div
      className="absolute rounded-full border border-white/10"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.07), rgba(255,255,255,0.02) 55%, rgba(0,0,0,0.15) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    />
  );
}

function PlayerAvatar({ x, y, moving }: { x: number; y: number; moving: boolean }) {
  return (
    <div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      <div className="absolute left-1/2 top-[-38px] -translate-x-1/2 rounded-full border border-cyan-300/20 bg-[#07111f]/95 px-3 py-1 text-xs font-bold text-cyan-200 shadow-md">
        You
      </div>

      <div className="absolute left-1/2 top-[58px] h-4 w-20 -translate-x-1/2 rounded-full bg-black/30 blur-[3px]" />

      <div className="relative flex h-[84px] w-[84px] items-center justify-center rounded-full border border-white/10 bg-[#0b1324]/90 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div
          className={`absolute h-12 w-10 rounded-b-[18px] rounded-t-[999px] bg-[linear-gradient(180deg,#38bdf8_0%,#2563eb_100%)] ${
            moving ? "translate-y-[1px]" : ""
          }`}
        />
        <div className="absolute top-[16px] flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(180deg,#ffffff_0%,#dbeafe_100%)] text-xs font-extrabold text-slate-900">
          Y
        </div>
      </div>
    </div>
  );
}

export function HubScene({ sessions }: HubSceneProps) {
  const [player, setPlayer] = useState<PlayerState>({ x: 950, y: 620 });
  const [selected, setSelected] = useState<HubSession | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  const moving = !!(
    pressedKeys["ArrowUp"] ||
    pressedKeys["ArrowDown"] ||
    pressedKeys["ArrowLeft"] ||
    pressedKeys["ArrowRight"] ||
    pressedKeys["w"] ||
    pressedKeys["a"] ||
    pressedKeys["s"] ||
    pressedKeys["d"] ||
    pressedKeys["W"] ||
    pressedKeys["A"] ||
    pressedKeys["S"] ||
    pressedKeys["D"]
  );

  const nearestSession = useMemo(() => {
    return getNearestSession(player, sessions, INTERACTION_DISTANCE);
  }, [player, sessions]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "w",
          "a",
          "s",
          "d",
          "W",
          "A",
          "S",
          "D",
          "e",
          "E",
          "Escape",
        ].includes(key)
      ) {
        event.preventDefault();
      }

      setPressedKeys((prev) => ({ ...prev, [key]: true }));

      if ((key === "e" || key === "E") && nearestSession) {
        setSelected(nearestSession);
      }

      if (key === "Escape") {
        setSelected(null);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key;
      setPressedKeys((prev) => ({ ...prev, [key]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [nearestSession]);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      let dx = 0;
      let dy = 0;

      if (pressedKeys["ArrowUp"] || pressedKeys["w"] || pressedKeys["W"]) dy -= 1;
      if (pressedKeys["ArrowDown"] || pressedKeys["s"] || pressedKeys["S"]) dy += 1;
      if (pressedKeys["ArrowLeft"] || pressedKeys["a"] || pressedKeys["A"]) dx -= 1;
      if (pressedKeys["ArrowRight"] || pressedKeys["d"] || pressedKeys["D"]) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        const nx = dx / len;
        const ny = dy / len;

        setPlayer((prev) => ({
          x: clamp(prev.x + nx * PLAYER_SPEED, 60, WORLD_WIDTH - 60),
          y: clamp(prev.y + ny * PLAYER_SPEED, 60, WORLD_HEIGHT - 60),
        }));
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [pressedKeys]);

  const cameraLeft = clamp(player.x - 620, 0, WORLD_WIDTH - 1240);
  const cameraTop = clamp(player.y - VIEWPORT_HEIGHT / 2, 0, WORLD_HEIGHT - VIEWPORT_HEIGHT);

  const party = sessions.filter((s) => s.zone === "party-plaza");
  const strategy = sessions.filter((s) => s.zone === "strategy-square");
  const cozy = sessions.filter((s) => s.zone === "cozy-corner");
  const mystery = sessions.filter((s) => s.zone === "mystery-alley");

  return (
    <div
      className="relative overflow-hidden rounded-[34px] border border-white/10"
      style={{
        background: "#070b17",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}
    >
      <div className="border-b border-white/10 bg-[#0b1224]/95 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-200 md:text-sm">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            Walk the plaza
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            Press E near a table
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            Sessions: {sessions.length}
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden" style={{ height: VIEWPORT_HEIGHT }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at top, #18223f 0%, #0a1020 45%, #050816 100%)",
          }}
        />

        <div
          className="absolute"
          style={{
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            transform: `translate(${-cameraLeft}px, ${-cameraTop}px)`,
            transition: "transform 80ms linear",
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 35%, rgba(255,255,255,0.02) 70%, transparent 100%)",
              boxShadow: "0 0 80px rgba(59,130,246,0.08)",
            }}
          />

          <div
            className="absolute left-[370px] top-[570px] h-[120px] w-[1160px] rounded-full border border-white/10"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.08), rgba(255,255,255,0.05))",
            }}
          />
          <div
            className="absolute left-[880px] top-[180px] h-[860px] w-[120px] rounded-full border border-white/10"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.08), rgba(255,255,255,0.05))",
            }}
          />

          <District
            x={120}
            y={120}
            width={520}
            height={300}
            title="Party Plaza"
            subtitle="Fast games · Big groups · High energy"
            gradient="linear-gradient(135deg, #ff7a18 0%, #ffb347 100%)"
          />
          <District
            x={1260}
            y={120}
            width={520}
            height={300}
            title="Strategy Hall"
            subtitle="Deep games · Tactics · Tight tables"
            gradient="linear-gradient(135deg, #5333ed 0%, #8f6bff 100%)"
          />
          <District
            x={120}
            y={820}
            width={520}
            height={300}
            title="Cozy Café"
            subtitle="Relaxed games · New player friendly"
            gradient="linear-gradient(135deg, #00b894 0%, #55efc4 100%)"
          />
          <District
            x={1260}
            y={820}
            width={520}
            height={300}
            title="Mystery Lounge"
            subtitle="Clues · Lies · Deduction"
            gradient="linear-gradient(135deg, #b5179e 0%, #ff4d8d 100%)"
          />

          {[...party, ...strategy, ...cozy, ...mystery].map((session) => (
            <BoothPad key={`pad-${session.id}`} x={session.x} y={session.y + 10} />
          ))}

          {sessions.map((session) => (
            <HostedGameSpot
              key={session.id}
              session={session}
              isNearby={nearestSession?.id === session.id}
              onSelect={() => setSelected(session)}
            />
          ))}

          <PlayerAvatar x={player.x} y={player.y} moving={moving} />
        </div>

        <SessionPreviewCard session={selected} onClose={() => setSelected(null)} />

        {nearestSession && !selected && (
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-[#07111f]/95 px-4 py-2 text-sm font-semibold text-slate-100 shadow-lg">
            You’re near{" "}
            <span
              className="font-bold"
              style={{
                backgroundImage: nearestSession.gradient,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {nearestSession.title}
            </span>
            . Click or press <span className="text-cyan-300">E</span>.
          </div>
        )}
      </div>
    </div>
  );
}