"use client";

import { useEffect, useState } from "react";
import { formatRelative } from "@/lib/dashboard-format";

/**
 * Relative timestamps ("5m ago") depend on Date.now(), which differs between SSR and hydration.
 * Render after mount to avoid hydration mismatches.
 */
export function RelativeTime({ from, className }) {
  const [text, setText] = useState("");

  useEffect(() => {
    const update = () => setText(formatRelative(from));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [from]);

  return (
    <span className={className} suppressHydrationWarning>
      {text || "\u00a0"}
    </span>
  );
}
