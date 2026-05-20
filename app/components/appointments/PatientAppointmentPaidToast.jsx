"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastProvider";

function appointmentIdFromPath(pathname) {
  const match = pathname.match(/\/patient\/appointments\/([^/]+)/);
  return match?.[1] ?? null;
}

export function PatientAppointmentPaidToast() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const paid = searchParams.get("paid");
    if (paid !== "1" && paid !== "0") return;

    handled.current = true;
    const appointmentId = appointmentIdFromPath(pathname);

    async function run() {
      if (paid === "0") {
        toast.info("Checkout was cancelled. You can pay anytime before your visit.");
        router.replace(pathname, { scroll: false });
        return;
      }

      if (!appointmentId) {
        toast.error("Could not confirm payment for this appointment.");
        router.replace(pathname, { scroll: false });
        return;
      }

      try {
        const sessionId = searchParams.get("session_id");
        const r = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId, sessionId }),
        });
        const data = await r.json().catch(() => ({}));

        if (r.ok && data.appointment?.paymentStatus === "PAID") {
          toast.success("Payment received. Thank you!");
          router.refresh();
        } else if (!r.ok) {
          toast.error(
            data.error ||
              "Payment completed on Stripe but could not be confirmed. Ask staff to verify, or try again in a moment."
          );
        } else {
          toast.error("Payment could not be confirmed yet. Refresh the page in a few seconds.");
        }
      } catch {
        toast.error("Could not confirm payment. Check your connection and refresh.");
      }

      router.replace(pathname, { scroll: false });
    }

    run();
  }, [pathname, router, searchParams, toast]);

  return null;
}
