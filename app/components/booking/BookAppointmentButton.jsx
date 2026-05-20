"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  bookingPathForRole,
  loginUrlForBooking,
} from "@/lib/booking-navigation";

/**
 * @param {{
 *   children: React.ReactNode;
 *   className?: string;
 *   disabledClassName?: string;
 * }} props
 */
export default function BookAppointmentButton({
  children,
  className = "",
  disabledClassName = "opacity-60 pointer-events-none",
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onClick = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      const user = data?.user;
      if (!user) {
        router.push(loginUrlForBooking());
        return;
      }
      router.push(bookingPathForRole(user.role));
    } catch {
      router.push(loginUrlForBooking());
    } finally {
      setPending(false);
    }
  }, [pending, router]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      className={`${className} ${pending ? disabledClassName : ""}`.trim()}
    >
      {children}
    </button>
  );
}
