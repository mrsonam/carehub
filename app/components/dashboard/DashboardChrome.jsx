"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bell, LayoutDashboard, Menu, Search, X } from "lucide-react";
import { dashboardHomeForRole } from "@/lib/dashboard-routes";
import { DashboardSidebarContents } from "./DashboardSidebarContents";
import { motion } from "framer-motion";

const ROLE_LABEL = {
  ADMIN: "Administrator",
  DOCTOR: "Clinician",
  PATIENT: "Patient",
};

const SEARCH_PLACEHOLDER = {
  ADMIN: "Search patients, doctors, appointments",
  DOCTOR: "Search patients, doctors, appointments",
  PATIENT: "Search doctors, records, or health tips...",
};

function shortPatientId(id) {
  const tail = id.replace(/[^a-z0-9]/gi, "").slice(-6);
  return tail ? `CH-${tail.toUpperCase()}` : "CH-000000";
}

function initialsOf(name = "") {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function DashboardChrome({ user, children }) {
  const pathname = usePathname() ?? "";
  const isSetup = pathname.startsWith("/dashboard/setup");
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = useCallback(() => setMobileOpen(false), []);
  const open = useCallback(() => setMobileOpen(true), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, close]);

  const searchPh = SEARCH_PLACEHOLDER[user.role] ?? SEARCH_PLACEHOLDER.ADMIN;
  const dashboardHome = dashboardHomeForRole(user.role);

  if (isSetup) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col bg-surface-low">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(0,72,141,0.12),transparent_55%),radial-gradient(800px_400px_at_100%_50%,rgba(0,106,106,0.08),transparent_50%)]"
          aria-hidden
        />
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
          className="relative z-10 flex items-center justify-between px-4 sm:px-8 h-16 border-b border-primary/[0.08] bg-surface-lowest/80 backdrop-blur-md"
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Activity size={18} />
            </div>
            <span className="text-lg font-bold font-manrope text-primary">CareHub</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45">
            Account setup
          </span>
        </motion.header>
        <div className="relative z-10 flex-1 flex flex-col px-4 sm:px-6 py-10 sm:py-14">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-low">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-surface-lowest sticky top-0 h-screen">
        <div className="flex flex-col h-full min-h-0">
          <DashboardSidebarContents role={user.role} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-surface-low/85 backdrop-blur-xl border-b border-primary/[0.06] lg:border-b-0">
          <div className="flex items-center justify-between gap-3 sm:gap-6 pl-3 pr-4 sm:px-6 lg:px-10 h-16 min-h-16">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                type="button"
                onClick={open}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-foreground/80 hover:bg-surface-high border border-primary/[0.08] shrink-0"
                aria-expanded={mobileOpen}
                aria-controls="dashboard-mobile-drawer"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <Link
                href={dashboardHome}
                className="lg:hidden inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-primary/[0.12] bg-surface-lowest px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 hover:border-primary/25 transition-colors"
                title="Go to dashboard"
              >
                <LayoutDashboard size={14} aria-hidden />
                Dashboard
              </Link>
              <div className="flex-1 max-w-md relative min-w-0">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
                />
                <input
                  type="search"
                  placeholder={searchPh}
                  className="w-full h-10 pl-9 pr-4 text-sm rounded-lg bg-surface-lowest border border-primary/[0.08] shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none placeholder:text-foreground/40 focus:border-primary/20 focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                aria-label="Notifications"
                className="w-9 h-9 rounded-md flex items-center justify-center text-foreground/55 hover:text-foreground hover:bg-surface-high transition-colors"
              >
                <Bell size={16} />
              </button>

              <Link
                href={dashboardHome}
                className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 rounded-lg hover:bg-surface-high/80 transition-colors pr-1 -mr-1"
                title="Dashboard home"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold leading-tight">{user.name}</p>
                  <p className="text-[11px] text-foreground/50 leading-tight">
                    {user.role === "PATIENT"
                      ? `Patient ID · ${shortPatientId(user.id)}`
                      : ROLE_LABEL[user.role] ?? user.role}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-manrope">
                  {initialsOf(user.name)}
                </div>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-10 bg-surface-low min-h-0">
          {children}
        </div>
      </div>

      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={close}
          />
          <div
            id="dashboard-mobile-drawer"
            className="absolute left-0 top-0 bottom-0 w-[min(20rem,88vw)] flex flex-col bg-surface-lowest shadow-2xl shadow-primary/10 border-r border-primary/[0.08]"
          >
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <DashboardSidebarContents
                role={user.role}
                onNavigate={close}
                headerEnd={
                  <button
                    type="button"
                    onClick={close}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-foreground/70 hover:bg-surface-low"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                }
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
