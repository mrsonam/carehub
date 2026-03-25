"use client";

import { useEffect, useState } from "react";

export default function HealthCheck() {
  const [status, setStatus] = useState({ ok: null, error: null });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;

        if (data.ok) {
          setStatus({ ok: Boolean(data.dbOk), error: null });
        } else {
          setStatus({
            ok: false,
            error: data.error || "Health check failed",
          });
        }
      } catch (err) {
        if (cancelled) return;
        setStatus({
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full mt-10 p-5 rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        Supabase connection check (Prisma)
      </div>

      <div className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
        {status.ok === null
          ? "Checking..."
          : status.ok
            ? "Connected"
            : "Not connected"}
      </div>

      {status.error ? (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 wrap-break-word">
          {status.error}
        </div>
      ) : null}
    </div>
  );
}

