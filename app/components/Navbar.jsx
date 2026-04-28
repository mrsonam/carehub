"use client";

import { motion } from "framer-motion";
import { Activity, Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { name: "Services", href: "/services" },
  { name: "Doctors", href: "/doctors" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);

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

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeMobile();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, closeMobile]);

  const handleSignOut = async () => {
    closeMobile();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 glass px-4 sm:px-8 lg:px-20 py-4 md:py-6 flex items-center justify-between gap-4"
      >
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-110">
            <Activity size={24} />
          </div>
          <span className="text-xl font-bold font-manrope tracking-tight text-primary">
            CareHub
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors cursor-pointer"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-primary-container transition-all cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-primary-container transition-all"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-foreground/80 hover:bg-white/40 border border-outline-variant/20 shrink-0"
          onClick={openMobile}
          aria-expanded={mobileOpen}
          aria-controls="site-mobile-menu"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </motion.nav>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <div
            id="site-mobile-menu"
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm flex flex-col bg-surface-lowest shadow-2xl border-l border-primary/[0.08]"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-primary/[0.06] shrink-0">
              <span className="text-sm font-bold font-manrope text-primary">
                Menu
              </span>
              <button
                type="button"
                onClick={closeMobile}
                className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-foreground/70 hover:bg-surface-low"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className="py-3 text-base font-semibold text-foreground/80 hover:text-primary border-b border-primary/[0.06] last:border-0"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-5 border-t border-primary/[0.06] flex flex-col gap-3 shrink-0">
              {!loading && user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMobile}
                    className="flex items-center justify-center w-full py-3 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-container transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full py-3 rounded-lg border border-outline-variant/30 text-sm font-semibold text-foreground/80 hover:bg-surface-low transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="flex items-center justify-center w-full py-3 rounded-lg border border-outline-variant/30 text-sm font-semibold text-foreground/80 hover:bg-surface-low transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobile}
                    className="flex items-center justify-center w-full py-3 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary-container transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
