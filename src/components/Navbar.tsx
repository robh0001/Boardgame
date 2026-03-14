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
  { href: "/hub", label: "Hub" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-[var(--accent)]"
        >
          Play & Meet
        </Link>

        <div className="flex items-center gap-6">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors hover:text-[var(--accent)] ${
                  isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
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
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
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
      </nav>
    </header>
  );
}