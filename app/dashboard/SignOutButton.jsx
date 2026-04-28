"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton({ onBeforeSignOut }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    if (pending) return;
    onBeforeSignOut?.();
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.dispatchEvent(new Event("auth-changed"));
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-surface-low transition-colors disabled:opacity-50"
    >
      <LogOut size={16} className="opacity-70" />
      <span>{pending ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
