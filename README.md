# Play & Meet — Board Game Social

A social website where users set preferences, search for board games, and **host or join** game sessions around their city. Play without buying and meet new people.

## Features

- **Auth** — Sign up / log in (Supabase Auth)
- **Profile & preferences** — Display name, city, bio, preferred cities, max travel distance, favorite games
- **Game catalog** — Browse and search board games (seeded list; no external API required)
- **Sessions** — Host a session (game, date/time, city, venue) or join others’ sessions
- **Session detail** — See host, when/where, player count, and join with one click

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the contents of **`supabase/schema.sql`** to create tables and RLS.
3. In **Authentication → URL Configuration**, set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to Redirect URLs.
4. In **Settings → API**, copy the project URL and the `anon` public key.

### 2. Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key  

### 3. Seed games (optional)

The app ships with a curated list of board games. To seed the database:

1. Sign up and log in once.
2. Open the browser console on your app and run:

```js
fetch('/api/seed-games', { method: 'POST', credentials: 'include' }).then(r => r.json()).then(console.log)
```

Or use any HTTP client to `POST /api/seed-games` while authenticated. Seeding is idempotent (skips if games already exist).

### 4. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech

- **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS**
- **Supabase** — Auth, PostgreSQL, RLS

## Project structure

- `src/app` — Routes: `/`, `/login`, `/signup`, `/games`, `/games/[id]`, `/sessions`, `/sessions/new`, `/sessions/[id]`, `/profile`
- `src/components` — `Navbar`
- `src/lib/supabase` — Browser/server clients, middleware
- `src/types/database.ts` — Shared types
- `supabase/schema.sql` — DB schema and RLS
