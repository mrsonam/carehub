"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Users,
  Stethoscope,
  ClipboardList,
  BarChart3,
  UserPlus,
} from "lucide-react";

const NAV_BY_ROLE = {
  ADMIN: [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Team", href: "/admin/users", icon: UserPlus },
    { name: "Appointments", href: "/admin/appointments", icon: CalendarDays },
    { name: "Patients", href: "/admin/patients", icon: Users },
    { name: "Doctors", href: "/admin/doctors", icon: Stethoscope },
    { name: "Activity", href: "/admin/activity", icon: ClipboardList },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ],
  DOCTOR: [
    { name: "Overview", href: "/doctor/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/doctor/schedule", icon: CalendarDays },
    { name: "Availability", href: "/doctor/availability", icon: Clock },
    { name: "Patients", href: "/doctor/patients", icon: Users },
  ],
  PATIENT: [
    { name: "Overview", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Appointments", href: "/patient/appointments", icon: CalendarDays },
    { name: "Doctors", href: "/patient/doctors", icon: Stethoscope },
  ],
};

function activeHrefFor(pathname, items) {
  let best = null;
  for (const item of items) {
    if (pathname === item.href) return item.href;
    if (pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.length) best = item.href;
    }
  }
  return best;
}

export default function DashboardNav({ role, onNavigate }) {
  const pathname = usePathname() ?? "";
  const items = NAV_BY_ROLE[role] ?? [];
  const activeHref = activeHrefFor(pathname, items);

  return (
    <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 min-h-0 overflow-y-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.()}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold bg-primary/10 text-primary"
                : "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-foreground/65 hover:text-foreground hover:bg-surface-low transition-colors"
            }
          >
            {isActive ? (
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary"
                aria-hidden
              />
            ) : null}
            <Icon size={16} className={isActive ? "shrink-0" : "shrink-0 opacity-70"} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
