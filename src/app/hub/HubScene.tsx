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

type DistrictZone = {
  id: "party" | "strategy" | "cozy" | "mystery";
  left: number;
  top: number;
  width: number;
  height: number;
};

const VIEWPORT_HEIGHT = 760;
const CAMERA_WIDTH = 1550;
const PLAYER_SPEED = 4.2;
const INTERACTION_DISTANCE = 140;

const DISTRICTS: DistrictZone[] = [
  { id: "party", left: 120, top: 120, width: 520, height: 300 },
  { id: "strategy", left: 1180, top: 120, width: 520, height: 300 },
  { id: "cozy", left: 120, top: 820, width: 520, height: 300 },
  { id: "mystery", left: 1180, top: 820, width: 520, height: 300 },
];

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

function getDistrictId(session: HubSession): DistrictZone["id"] {
  const x = session.x;
  const y = session.y;

  if (x < WORLD_WIDTH / 2 && y < WORLD_HEIGHT / 2) return "party";
  if (x >= WORLD_WIDTH / 2 && y < WORLD_HEIGHT / 2) return "strategy";
  if (x < WORLD_WIDTH / 2 && y >= WORLD_HEIGHT / 2) return "cozy";
  return "mystery";
}

function getDistrictById(id: DistrictZone["id"]) {
  return DISTRICTS.find((district) => district.id === id)!;
}

function getSafeSessionPosition(session: HubSession): HubSession {
  const district = getDistrictById(getDistrictId(session));

  const headerReserve = 96;
  const horizontalPadding = 56;
  const bottomPadding = 44;

  return {
    ...session,
    x: clamp(
      session.x,
      district.left + horizontalPadding,
      district.left + district.width - horizontalPadding
    ),
    y: clamp(
      session.y,
      district.top + headerReserve,
      district.top + district.height - bottomPadding
    ),
  };
}

function District({
  x,
  y,
  width,
  height,
  title,
  subtitle,
  gradient,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <div
      className="absolute overflow-hidden rounded-[36px] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
      style={{
        left: x,
        top: y,
        width,
        height,
        background:
          "linear-gradient(180deg, rgba(10,15,28,0.92), rgba(8,12,24,0.98))",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-24"
        style={{
          background: gradient,
          opacity: 0.95,
        }}
      />

      <div className="absolute inset-x-5 top-[88px] bottom-5 rounded-[28px] border border-white/6 bg-white/[0.03]" />

      <div className="relative z-10 p-6 text-white">
        <div className="text-2xl font-extrabold">{title}</div>
        <div className="mt-1 text-sm text-white/80">{subtitle}</div>
      </div>
    </div>
  );
}

function BoothPad({
  x,
  y,
  glow,
  size = 136,
}: {
  x: number;
  y: number;
  glow: string;
  size?: number;
}) {
  return (
    <>
      <div
        className="absolute rounded-full blur-2xl"
        style={{
          left: x - size / 2,
          top: y - size / 2 + 10,
          width: size,
          height: size,
          background: glow,
          opacity: 0.22,
        }}
      />
      <div
        className="absolute rounded-full border border-white/10"
        style={{
          left: x - size / 2,
          top: y - size / 2 + 10,
          width: size,
          height: size,
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), rgba(255,255,255,0.025) 58%, rgba(0,0,0,0.16) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      />
    </>
  );
}

function DecorativeTable({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) {
  return (
    <div
      className="absolute rounded-full border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
      style={{
        left: x,
        top: y,
        width: 72,
        height: 72,
        background: color,
        opacity: 0.85,
      }}
    >
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
    </div>
  );
}

function SmallCarpet({
  x,
  y,
  width,
  height,
  color,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}) {
  return (
    <div
      className="absolute rounded-[24px] border border-white/10"
      style={{
        left: x,
        top: y,
        width,
        height,
        background: color,
        opacity: 0.24,
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

  const displaySessions = useMemo(() => {
    return sessions.map(getSafeSessionPosition);
  }, [sessions]);

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
    return getNearestSession(player, displaySessions, INTERACTION_DISTANCE);
  }, [player, displaySessions]);

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

  const cameraLeft = clamp(
    player.x - CAMERA_WIDTH / 2,
    0,
    WORLD_WIDTH - CAMERA_WIDTH
  );
  const cameraTop = clamp(
    player.y - VIEWPORT_HEIGHT / 2,
    0,
    WORLD_HEIGHT - VIEWPORT_HEIGHT
  );

  return (
    <div
      className="overflow-hidden rounded-[34px] border border-white/10"
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
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          <div
            className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 36%, rgba(255,255,255,0.03) 72%, transparent 100%)",
              boxShadow:
                "0 0 120px rgba(59,130,246,0.12), inset 0 0 40px rgba(255,255,255,0.05)",
            }}
          />

          <div
            className="absolute left-[330px] top-[560px] h-[140px] w-[1240px] rounded-full border border-white/10"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.11), rgba(255,255,255,0.06))",
            }}
          />
          <div
            className="absolute left-[880px] top-[130px] h-[980px] w-[140px] rounded-full border border-white/10"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.11), rgba(255,255,255,0.06))",
            }}
          />

          <div className="absolute left-[670px] top-[560px] h-[140px] w-[220px] rounded-r-full bg-white/[0.04]" />
          <div className="absolute left-[1010px] top-[560px] h-[140px] w-[220px] rounded-l-full bg-white/[0.04]" />
          <div className="absolute left-[880px] top-[350px] h-[220px] w-[140px] rounded-b-full bg-white/[0.04]" />
          <div className="absolute left-[880px] top-[700px] h-[220px] w-[140px] rounded-t-full bg-white/[0.04]" />

          <div className="absolute left-[860px] top-[540px] h-[180px] w-[180px] rounded-full border border-cyan-300/15 bg-[radial-gradient(circle,rgba(34,211,238,0.18),rgba(34,211,238,0.04),transparent)]" />

          <SmallCarpet
            x={180}
            y={230}
            width={400}
            height={160}
            color="linear-gradient(135deg, rgba(255,122,24,0.24), rgba(255,179,71,0.10))"
          />
          <SmallCarpet
            x={1220}
            y={230}
            width={400}
            height={160}
            color="linear-gradient(135deg, rgba(83,51,237,0.24), rgba(143,107,255,0.10))"
          />
          <SmallCarpet
            x={180}
            y={930}
            width={400}
            height={160}
            color="linear-gradient(135deg, rgba(0,184,148,0.24), rgba(85,239,196,0.10))"
          />
          <SmallCarpet
            x={1220}
            y={930}
            width={400}
            height={160}
            color="linear-gradient(135deg, rgba(181,23,158,0.24), rgba(255,77,141,0.10))"
          />

          <DecorativeTable x={170} y={250} color="linear-gradient(135deg, #ff7a18 0%, #ffb347 100%)" />
          <DecorativeTable x={520} y={250} color="linear-gradient(135deg, #ff7a18 0%, #ffb347 100%)" />
          <DecorativeTable x={1220} y={250} color="linear-gradient(135deg, #5333ed 0%, #8f6bff 100%)" />
          <DecorativeTable x={1560} y={250} color="linear-gradient(135deg, #5333ed 0%, #8f6bff 100%)" />
          <DecorativeTable x={170} y={950} color="linear-gradient(135deg, #00b894 0%, #55efc4 100%)" />
          <DecorativeTable x={520} y={950} color="linear-gradient(135deg, #00b894 0%, #55efc4 100%)" />
          <DecorativeTable x={1220} y={950} color="linear-gradient(135deg, #b5179e 0%, #ff4d8d 100%)" />
          <DecorativeTable x={1560} y={950} color="linear-gradient(135deg, #b5179e 0%, #ff4d8d 100%)" />

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
            x={1180}
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
            x={1180}
            y={820}
            width={520}
            height={300}
            title="Mystery Lounge"
            subtitle="Clues · Lies · Deduction"
            gradient="linear-gradient(135deg, #b5179e 0%, #ff4d8d 100%)"
          />

          {displaySessions.map((session) => (
            <BoothPad
              key={`pad-${session.id}`}
              x={session.x}
              y={session.y + 14}
              glow={session.gradient}
            />
          ))}

          {displaySessions.map((session) => (
            <HostedGameSpot
              key={session.id}
              session={session}
              isNearby={nearestSession?.id === session.id}
              onSelect={() => setSelected(session)}
            />
          ))}

          <PlayerAvatar x={player.x} y={player.y} moving={moving} />
        </div>

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

      <SessionPreviewCard session={selected} onClose={() => setSelected(null)} />
    </div>
  );
}