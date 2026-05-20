"use client";

import { Activity, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/app/components/icons/SocialIcons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { dashboardHomeForRole } from "@/lib/dashboard-routes";

const GUEST_FOOTER_LINKS = [
  { label: "Sign in", href: "/login" },
  { label: "Create account", href: "/register" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1P8gRYfkpD/?mibextid=wwXIfr",
    Icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/carehub8937?igsh=MTdjcmZ0dDlybGVndg==",
    Icon: InstagramIcon,
  },
];

/** @param {{ role: string }} user */
function footerLinksForUser(user) {
  const links = [{ label: "Dashboard", href: dashboardHomeForRole(user.role) }];

  if (user.role === "PATIENT") {
    links.push({ label: "My appointments", href: "/patient/appointments" });
    links.push({ label: "Find a doctor", href: "/patient/doctors" });
  } else if (user.role === "DOCTOR") {
    links.push({ label: "Schedule", href: "/doctor/schedule" });
  } else if (user.role === "ADMIN") {
    links.push({ label: "Appointments", href: "/admin/appointments" });
  }

  links.push({ label: "Contact", href: "/contact" });
  links.push({ label: "Privacy", href: "/privacy" });
  return links;
}

const linkClassName =
  "font-medium text-foreground/60 hover:text-primary transition-colors duration-200 cursor-pointer rounded px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      setLoading(true);
      fetch("/api/auth/me", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          setUser(data?.user ?? null);
        })
        .catch(() => {
          if (cancelled) return;
          setUser(null);
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });
    };

    const onAuthChanged = () => load();
    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("focus", onAuthChanged);
    load();

    return () => {
      cancelled = true;
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("focus", onAuthChanged);
    };
  }, [pathname]);

  const handleSignOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/");
      router.refresh();
    }
  }, [router]);

  const footerLinks = useMemo(() => {
    if (loading) {
      return [
        { label: "Contact", href: "/contact" },
        { label: "Privacy", href: "/privacy" },
      ];
    }
    if (user) return footerLinksForUser(user);
    return GUEST_FOOTER_LINKS;
  }, [loading, user]);

  const hideForAppShell =
    pathname != null &&
    /^(\/dashboard|\/admin|\/doctor|\/patient)(\/|$)/.test(pathname);

  if (hideForAppShell) {
    return null;
  }

  const year = new Date().getFullYear();
  const showSignOut = !loading && user;

  return (
    <footer className="mt-auto border-t border-primary/[0.08] bg-surface-lowest">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10 sm:py-12">
        <div className="flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 group cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white transition-colors group-hover:bg-primary-container">
                <Activity size={18} aria-hidden />
              </span>
              <span className="text-lg font-bold font-manrope tracking-tight text-primary">
                CareHub
              </span>
            </Link>
            <p className="mt-3 text-sm text-foreground/55 leading-relaxed">
              Book appointments and manage your care with your clinic, in one place.
            </p>
            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/40 mb-3">
                Follow us
              </p>
              <ul className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/[0.12] bg-surface-low text-foreground/65 hover:border-primary/25 hover:text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <Icon />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:items-end lg:text-right">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/40">
              Get in touch
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="tel:+61255551234"
                  className="inline-flex items-center gap-2.5 text-sm text-foreground/70 hover:text-primary transition-colors duration-200 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Phone size={16} className="text-primary shrink-0" aria-hidden />
                  (02) 5555 1234
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@carehubclinic.com"
                  className="inline-flex items-center gap-2.5 text-sm text-foreground/70 hover:text-primary transition-colors duration-200 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Mail size={16} className="text-primary shrink-0" aria-hidden />
                  contact@carehubclinic.com
                </a>
              </li>
            </ul>
            <p className="text-xs text-foreground/45 leading-relaxed max-w-xs">
              Mon–Fri 8:00–18:00 · Sat 9:00–14:00
              <br />
              123 Medical Drive, Health Plaza
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary/[0.06] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-foreground/45">
            © {year} CareHub Clinic. All rights reserved.
          </p>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
              {footerLinks.map((link, i) => (
                <li key={link.href} className="flex items-center">
                  {i > 0 ? (
                    <span className="mx-2 text-foreground/25 select-none" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <Link href={link.href} className={linkClassName}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {showSignOut ? (
                <li className="flex items-center">
                  <span className="mx-2 text-foreground/25 select-none" aria-hidden>
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={linkClassName}
                  >
                    Sign out
                  </button>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
