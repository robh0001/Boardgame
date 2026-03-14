

export type RawHubSession = {
  id: string;
  title: string;
  city: string;
  address: string | null;
  venue_name: string | null;
  starts_at: string;
  max_players: number;
  notes: string | null;
  status: "open" | "full" | "cancelled" | "completed";
  player_count: number;
  host_name: string;
  host_city: string | null;
  host_avatar_url: string | null;
  game_name: string;
  game_image_url: string | null;
  game_min_players: number | null;
  game_max_players: number | null;
  play_time_minutes: number | null;
  game_description: string | null;
};

export type HubZoneId =
  | "party-plaza"
  | "strategy-square"
  | "cozy-corner"
  | "mystery-alley";

export type HubSession = RawHubSession & {
  x: number;
  y: number;
  zone: HubZoneId;
  zoneLabel: string;
  accent: string;
  vibe: string;
  gradient: string;
};

export const WORLD_WIDTH = 2100;
export const WORLD_HEIGHT = 1240;

type ZoneConfig = {
  id: HubZoneId;
  label: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  accent: string;
  vibe: string;
  gradient: string;
};

const ZONES: ZoneConfig[] = [
  {
    id: "party-plaza",
    label: "Party Plaza",
    xMin: 90,
    xMax: 790,
    yMin: 110,
    yMax: 500,
    accent: "#ff7a18",
    vibe: "Fast, social, energetic",
    gradient: "linear-gradient(135deg, #ff7a18 0%, #ffb347 100%)",
  },
  {
    id: "strategy-square",
    label: "Strategy Square",
    xMin: 1030,
    xMax: 1800,
    yMin: 90,
    yMax: 510,
    accent: "#7b61ff",
    vibe: "Deep, tactical, competitive",
    gradient: "linear-gradient(135deg, #5333ed 0%, #8f6bff 100%)",
  },
  {
    id: "cozy-corner",
    label: "Cozy Corner",
    xMin: 100,
    xMax: 830,
    yMin: 720,
    yMax: 1120,
    accent: "#00b894",
    vibe: "Relaxed, beginner-friendly",
    gradient: "linear-gradient(135deg, #00b894 0%, #55efc4 100%)",
  },
  {
    id: "mystery-alley",
    label: "Mystery Alley",
    xMin: 1030,
    xMax: 1790,
    yMin: 720,
    yMax: 1120,
    accent: "#d63384",
    vibe: "Secrets, bluffing, deduction",
    gradient: "linear-gradient(135deg, #b5179e 0%, #ff4d8d 100%)",
  },
];

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededNumber(seed: string, min: number, max: number) {
  const hash = hashString(seed);
  const normalized = (hash % 10000) / 10000;
  return Math.round(min + normalized * (max - min));
}

function pickZone(session: RawHubSession): ZoneConfig {
  const text = `${session.title} ${session.game_name} ${
    session.game_description ?? ""
  }`.toLowerCase();

  const playTime = session.play_time_minutes ?? 0;
  const players = session.game_max_players ?? session.max_players;

  if (
    text.includes("mystery") ||
    text.includes("detective") ||
    text.includes("clue") ||
    text.includes("secret") ||
    text.includes("deception") ||
    text.includes("werewolf") ||
    text.includes("mafia")
  ) {
    return ZONES[3];
  }

  if (playTime >= 75 || players <= 4) {
    return ZONES[1];
  }

  if (
    text.includes("party") ||
    text.includes("word") ||
    text.includes("quick") ||
    text.includes("codenames") ||
    players >= 6
  ) {
    return ZONES[0];
  }

  return ZONES[2];
}

export function buildHubSessions(rawSessions: RawHubSession[]): HubSession[] {
    const zoneSlots: Record<HubZoneId, { x: number; y: number }[]> = {
      "party-plaza": [
        { x: 260, y: 330 },
        { x: 500, y: 330 },
        { x: 360, y: 470 },
        { x: 560, y: 470 },
      ],
      "strategy-square": [
        { x: 1400, y: 330 },
        { x: 1640, y: 330 },
        { x: 1520, y: 470 },
        { x: 1320, y: 470 },
      ],
      "cozy-corner": [
        { x: 260, y: 1030 },
        { x: 500, y: 1030 },
        { x: 360, y: 1170 },
        { x: 560, y: 1170 },
      ],
      "mystery-alley": [
        { x: 1400, y: 1030 },
        { x: 1640, y: 1030 },
        { x: 1520, y: 1170 },
        { x: 1320, y: 1170 },
      ],
    };
  
    const zoneCounts: Record<HubZoneId, number> = {
      "party-plaza": 0,
      "strategy-square": 0,
      "cozy-corner": 0,
      "mystery-alley": 0,
    };
  
    return rawSessions.map((session) => {
      const zone = pickZone(session);
      const count = zoneCounts[zone.id];
      const slots = zoneSlots[zone.id];
      const slot = slots[count % slots.length];
      zoneCounts[zone.id] += 1;
  
      return {
        ...session,
        x: slot.x,
        y: slot.y,
        zone: zone.id,
        zoneLabel: zone.label,
        accent: zone.accent,
        vibe: zone.vibe,
        gradient: zone.gradient,
      };
    });
  }

const now = new Date();
const inHours = (hours: number) =>
  new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

export const DUMMY_HUB_SESSIONS: RawHubSession[] = [
  {
    id: "dummy-catan-night",
    title: "Catan & Chill Friday",
    city: "Melbourne",
    address: "Docklands Community Room",
    venue_name: "Harbour Hub",
    starts_at: inHours(4),
    max_players: 4,
    notes: "Beginner-friendly. We’ll teach rules in the first 10 minutes.",
    status: "open",
    player_count: 3,
    host_name: "Ava",
    host_city: "Melbourne",
    host_avatar_url: null,
    game_name: "Catan",
    game_image_url: null,
    game_min_players: 3,
    game_max_players: 4,
    play_time_minutes: 75,
    game_description: "Trade, settle, and build your island empire.",
  },
  {
    id: "dummy-codenames-party",
    title: "Codenames After Class",
    city: "Clayton",
    address: "Campus Lounge",
    venue_name: "Student Commons",
    starts_at: inHours(2),
    max_players: 8,
    notes: "Short rounds and lots of laughs.",
    status: "open",
    player_count: 5,
    host_name: "Mia",
    host_city: "Clayton",
    host_avatar_url: null,
    game_name: "Codenames",
    game_image_url: null,
    game_min_players: 4,
    game_max_players: 8,
    play_time_minutes: 25,
    game_description: "Give clues and decode your team’s secret agents.",
  },
  {
    id: "dummy-avalon-night",
    title: "Avalon Bluff Night",
    city: "Carlton",
    address: "Level 2, Lantern Rooms",
    venue_name: "The Lantern",
    starts_at: inHours(6),
    max_players: 10,
    notes: "Perfect for people who love deception games.",
    status: "open",
    player_count: 7,
    host_name: "Noah",
    host_city: "Carlton",
    host_avatar_url: null,
    game_name: "Avalon",
    game_image_url: null,
    game_min_players: 5,
    game_max_players: 10,
    play_time_minutes: 35,
    game_description: "Hidden roles, lies, trust, and betrayal.",
  },
  {
    id: "dummy-ticket-to-ride",
    title: "Ticket to Ride Meetup",
    city: "Southbank",
    address: "Riverside Games Café",
    venue_name: "Riverside Games",
    starts_at: inHours(3),
    max_players: 5,
    notes: "Casual vibe. New players welcome.",
    status: "open",
    player_count: 2,
    host_name: "Lucas",
    host_city: "Southbank",
    host_avatar_url: null,
    game_name: "Ticket to Ride",
    game_image_url: null,
    game_min_players: 2,
    game_max_players: 5,
    play_time_minutes: 50,
    game_description: "Build routes and connect cities before others do.",
  },
  {
    id: "dummy-wingspan-cozy",
    title: "Wingspan Slow Evening",
    city: "Fitzroy",
    address: "Birdsong Café",
    venue_name: "Birdsong Café",
    starts_at: inHours(8),
    max_players: 5,
    notes: "Relaxed session with snacks and chill music.",
    status: "open",
    player_count: 3,
    host_name: "Ella",
    host_city: "Fitzroy",
    host_avatar_url: null,
    game_name: "Wingspan",
    game_image_url: null,
    game_min_players: 1,
    game_max_players: 5,
    play_time_minutes: 70,
    game_description: "Engine-building with beautiful birds and serene gameplay.",
  },
  {
    id: "dummy-blood-on-clocktower",
    title: "Clocktower Chaos",
    city: "Melbourne CBD",
    address: "Basement Room B",
    venue_name: "Midnight Meeples",
    starts_at: inHours(10),
    max_players: 12,
    notes: "Deduction-heavy. Expect chaos.",
    status: "open",
    player_count: 9,
    host_name: "Arjun",
    host_city: "Melbourne CBD",
    host_avatar_url: null,
    game_name: "Blood on the Clocktower",
    game_image_url: null,
    game_min_players: 8,
    game_max_players: 12,
    play_time_minutes: 90,
    game_description: "A social deduction game full of secrets and accusations.",
  },
];

export function mergeRealAndDummySessions(realSessions: RawHubSession[]) {
  if (realSessions.length >= 6) return realSessions;
  return [...realSessions, ...DUMMY_HUB_SESSIONS];
}