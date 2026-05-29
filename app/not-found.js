import Link from "next/link";
import { ArrowRight, Home, MapPin, Stethoscope } from "lucide-react";

export const metadata = {
  title: "Page not found | CareHub",
  description: "The page you requested could not be found on CareHub.",
};

export default function NotFound() {
  return (
    <div className="bg-surface pt-20 pb-24 sm:pb-32 px-4 sm:px-8 lg:px-20">
      <div className="container mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6">
          <MapPin size={14} aria-hidden />
          Page not found
        </div>

        <p className="text-7xl sm:text-8xl font-black font-manrope text-primary/15 tracking-tight leading-none mb-4">
          404
        </p>

        <h1 className="text-3xl sm:text-4xl font-black font-manrope text-foreground tracking-tight mb-4">
          We couldn&apos;t find that page
        </h1>

        <p className="text-base sm:text-lg text-foreground/55 leading-relaxed mb-10 max-w-md mx-auto">
          The link may be broken, or the page may have moved. You can return home or browse our clinic
          services below.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors"
          >
            <Home size={18} aria-hidden />
            Back to home
          </Link>
          <Link
            href="/doctors"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold border border-outline-variant/30 text-foreground/80 hover:bg-surface-low transition-colors"
          >
            <Stethoscope size={18} aria-hidden />
            Find a doctor
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        <div className="rounded-2xl border border-primary/[0.08] bg-surface-lowest p-6 text-left tonal-card">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/45 mb-3">
            Popular pages
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {[
              { href: "/services", label: "Services" },
              { href: "/about", label: "About us" },
              { href: "/contact", label: "Contact" },
              { href: "/login", label: "Sign in" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 px-3 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
