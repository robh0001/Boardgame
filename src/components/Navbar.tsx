"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/sessions", label: "Sessions" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/hub", label: "Hub" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  const linkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return `block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--accent)] sm:rounded-full sm:px-0 sm:py-0 sm:block ${
      isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-extrabold tracking-tight text-[var(--accent)] sm:text-xl"
        >
          Play & Meet
        </Link>

        {/* Desktop: full links */}
        <div className="hidden items-center gap-4 md:flex md:gap-6">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className={linkClass("/profile")}>
                Profile
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_3px_0_#f06a25] transition-all hover:translate-y-0.5 hover:shadow-[0_1px_0_#f06a25]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_3px_0_#f06a25] transition-all hover:translate-y-0.5 hover:shadow-[0_1px_0_#f06a25]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            <Link
              href="/profile"
              className="rounded-full bg-[var(--accent)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--accent)]"
            >
              Profile
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--border)]"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <span className="text-lg leading-none">×</span>
            ) : (
              <span className="text-lg leading-none">☰</span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen ? (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                {label}
              </Link>
            ))}
            {user ? (
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link href="/login" className={linkClass("/login")}>
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[var(--accent)] px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}