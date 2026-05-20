"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, User } from "lucide-react";
import { UserAvatar } from "@/app/components/profile/UserAvatar";

function profileHrefForRole(role) {
  if (role === "DOCTOR") return "/doctor/profile";
  if (role === "PATIENT") return "/patient/profile";
  return null;
}

/**
 * @param {{
 *   icon: import("lucide-react").LucideIcon;
 *   label: string;
 *   href?: string;
 *   onClick?: () => void;
 *   disabled?: boolean;
 *   tone?: "default" | "danger";
 * }} props
 */
function MenuRow({ icon: Icon, label, href, onClick, disabled, tone = "default" }) {
  const className = [
    "flex items-center gap-3 w-[calc(100%-0.5rem)] mx-1 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
    "disabled:opacity-50 disabled:pointer-events-none",
    tone === "danger"
      ? "text-foreground/80 hover:bg-red-50 hover:text-red-700"
      : "text-foreground/85 hover:bg-surface-high/90 hover:text-foreground",
  ].join(" ");

  const inner = (
    <>
      <span
        className={[
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          tone === "danger" ? "bg-red-500/10 text-red-600" : "bg-primary/[0.07] text-primary",
        ].join(" ")}
      >
        <Icon size={16} strokeWidth={2} />
      </span>
      <span className="flex-1 text-left">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} role="menuitem" onClick={onClick} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" onClick={onClick} disabled={disabled} className={className}>
      {inner}
    </button>
  );
}

/**
 * @param {{
 *   user: { name: string; email?: string; role: string; avatarUrl?: string | null };
 *   subtitle: string;
 * }} props
 */
export function DashboardUserMenu({ user, subtitle }) {
  const router = useRouter();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const profileHref = profileHrefForRole(user.role);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.dispatchEvent(new Event("auth-changed"));
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex items-center gap-2 sm:gap-2.5 pl-1 sm:pl-2 pr-1.5 py-1 rounded-xl transition-[background,box-shadow,transform] duration-150",
          "active:scale-[0.98]",
          open
            ? "bg-surface-high/90 ring-2 ring-primary/12 shadow-sm"
            : "hover:bg-surface-high/80",
        ].join(" ")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <div className="text-right hidden sm:block min-w-0 max-w-[9rem]">
          <p className="text-sm font-semibold leading-tight truncate">{user.name}</p>
          <p className="text-[11px] text-foreground/50 leading-tight truncate">{subtitle}</p>
        </div>
        <UserAvatar
          name={user.name}
          avatarUrl={user.avatarUrl}
          className="w-8 h-8 rounded-full ring-2 ring-surface-lowest"
          textClassName="text-xs"
        />
        <ChevronDown
          size={14}
          className={[
            "text-foreground/40 shrink-0 transition-transform duration-200 ease-out",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-full mt-2 w-[min(17rem,calc(100vw-1.5rem))] rounded-2xl bg-surface-lowest border border-primary/[0.06] shadow-[0_20px_50px_rgba(15,23,42,0.12)] overflow-hidden z-50"
          >
            <div className="px-3.5 py-3.5 border-b border-primary/[0.06] bg-gradient-to-b from-primary/[0.03] to-transparent">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  className="w-11 h-11 rounded-full ring-2 ring-surface-lowest shadow-sm"
                  textClassName="text-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold font-manrope tracking-tight truncate">{user.name}</p>
                  {user.email ? (
                    <p className="text-[11px] text-foreground/50 truncate mt-0.5">{user.email}</p>
                  ) : null}
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 mt-1.5">
                    {subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-1.5">
              {profileHref ? (
                <>
                  <MenuRow
                    href={profileHref}
                    icon={User}
                    label="Profile settings"
                    onClick={() => setOpen(false)}
                  />
                  <div className="mx-3 my-1 h-px bg-primary/[0.06]" role="separator" />
                </>
              ) : null}
              <MenuRow
                icon={LogOut}
                label={signingOut ? "Signing out…" : "Sign out"}
                onClick={signOut}
                disabled={signingOut}
                tone="danger"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
