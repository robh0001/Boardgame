import Link from "next/link";
import { DiceSuggestion } from "@/components/DiceSuggestion";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <section className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16 md:py-24 lg:py-28">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl lg:text-6xl">
          Play board games.
          <br />
          <span className="text-[var(--accent)]">Meet people.</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--muted)] sm:mt-6 sm:text-lg">
          Set your preferences, search for games you like, and host or join
          sessions around your city. No need to buy — just show up and play.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Get started
          </Link>

          <Link
            href="/games"
            className="rounded-full border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-base font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Browse games
          </Link>

          <Link
            href="/hub"
            className="rounded-full border border-[#201217] bg-white px-6 py-3 text-base font-semibold text-[var(--foreground)] shadow-[0_4px_0_#f5d5c2] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_0_#f5d5c2]"
          >
            Enter the hub
          </Link>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--card)]/50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <h2 className="text-center text-xl font-semibold text-[var(--foreground)] sm:text-2xl">
            How it works
          </h2>

          <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/15 text-xl font-bold text-[var(--accent)]">
                1
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">
                Set your preferences
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Tell us your city, favorite games, and how far you’re willing to
                travel.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/15 text-xl font-bold text-[var(--accent)]">
                2
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">
                Find or host a game
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Search for a game you want to play. Host a session or join one
                near you.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/15 text-xl font-bold text-[var(--accent)]">
                3
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">
                Play and connect
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Show up, play without buying the game, and meet new people who
                love board games too.
              </p>
            </div>
          </div>
        </div>
      </section>

      <DiceSuggestion />
    </div>
  );
}