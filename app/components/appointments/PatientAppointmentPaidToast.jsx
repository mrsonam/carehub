"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastProvider";

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
    if (paid === "1") {
      toast.success("Payment received. Thank you!");
    } else {
      toast.info("Checkout was cancelled. You can pay anytime before your visit.");
    }

    router.replace(pathname, { scroll: false });
  }, [pathname, router, searchParams, toast]);

  return null;
}
