"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const REASONS = [
  "Harassment or hateful behavior",
  "Spam or scam",
  "No-show / unreliable hosting",
  "Unsafe or inappropriate location",
  "Other",
] as const;

export function ReportHostButton({
  sessionId,
  reportedHostId,
}: {
  sessionId: string;
  reportedHostId: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [reason, setReason] = useState<(typeof REASONS)[number]>(REASONS[0]);
  const [details, setDetails] = useState("");

  const submit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error: err } = await supabase.from("session_host_reports").insert({
      session_id: sessionId,
      reported_host_id: reportedHostId,
      reporter_id: user.id,
      reason,
      details: details.trim() ? details.trim() : null,
      status: "open",
    });

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }

    setSuccess("Report submitted. Thank you.");
    setDetails("");
    setOpen(false);
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-medium text-[var(--muted)] hover:border-red-500/40 hover:text-red-500"
      >
        Report host
      </button>

      {success && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{success}</p>}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-[0_8px_0_#f5d5c2]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  Report host
                </h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  This report is private. Please share details so we can review.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Close
              </button>
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-4">
              <label className="block text-xs font-medium text-[var(--foreground)]">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as (typeof REASONS)[number])}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-[var(--foreground)]">
                Details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                placeholder="What happened?"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_3px_0_#991b1b] transition-all hover:translate-y-0.5 hover:shadow-[0_1px_0_#991b1b] disabled:opacity-50"
              >
                {loading ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

