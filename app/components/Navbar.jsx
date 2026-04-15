"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
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

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass px-20 py-6 flex items-center justify-between"
    >
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-110">
          <Activity size={24} />
        </div>
        <span className="text-xl font-bold font-manrope tracking-tight text-primary">CareHub</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        {[
          { name: "Services", href: "/services" },
          { name: "Doctors", href: "/doctors" },
          { name: "About Us", href: "/about" },
          { name: "Contact", href: "/contact" }
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors cursor-pointer"
          >
            {item.name}
          </Link>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
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
    </motion.nav>
  );
}
