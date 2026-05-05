"use client";

import Link from "next/link";
import { Activity, LifeBuoy } from "lucide-react";
import { dashboardHomeForRole } from "@/lib/dashboard-routes";
import DashboardNav from "./DashboardNav";
import SignOutButton from "./SignOutButton";

export function DashboardSidebarContents({ role, onNavigate, headerEnd }) {
  const afterNav = onNavigate;
  const dashboardHome = dashboardHomeForRole(role);

  return (
    <>
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-2 shrink-0 border-b border-primary/[0.06] lg:border-b-0">
        <Link
          href={dashboardHome}
          onClick={() => afterNav?.()}
          className="flex items-center gap-2 group min-w-0"
          title="Dashboard home"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-105 shrink-0">
            <Activity size={18} />
          </div>
          <span className="text-lg font-bold font-manrope tracking-tight text-primary truncate">
            CareHub
          </span>
        </Link>
        {headerEnd ? <div className="shrink-0 flex items-center">{headerEnd}</div> : null}
      </div>

      <DashboardNav role={role} onNavigate={afterNav} />

      <div className="px-3 pb-4 flex flex-col gap-0.5 pt-3 mt-auto border-t border-primary/[0.06] lg:border-t-0">
        <Link
          href="/contact"
          onClick={() => afterNav?.()}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-surface-low transition-colors"
        >
          <LifeBuoy size={16} className="opacity-70" />
          <span>Support</span>
        </Link>
        <SignOutButton onBeforeSignOut={afterNav} />
      </div>
    </>
  );
}
