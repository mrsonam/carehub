"use client";

import { Suspense, useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, Loader2, Search, Stethoscope, UserRound, X } from "lucide-react";
import { resolveSearchHref } from "@/lib/dashboard-search";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 220;

function typeIcon(type) {
  if (type === "doctor") return Stethoscope;
  if (type === "appointment") return CalendarClock;
  return UserRound;
}

function DashboardSearchBarInner({ role, placeholder, className = "" }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const listboxId = useId();
  const rootRef = useRef(null);
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery, pathname]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/dashboard/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await res.json().catch(() => null);
        if (!controller.signal.aborted) {
          setResults(data?.ok ? data.results ?? [] : []);
          setLoading(false);
        }
      } catch (err) {
        if (err?.name !== "AbortError" && !controller.signal.aborted) {
          setResults([]);
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open]);

  const showDropdown = open && query.trim().length >= MIN_QUERY;
  const viewAllHref = resolveSearchHref(role, pathname, query);

  const submit = (event) => {
    event.preventDefault();
    setOpen(false);
    router.push(viewAllHref);
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    router.push(resolveSearchHref(role, pathname, ""));
  };

  const pickResult = useCallback(
    (href) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form onSubmit={submit} className="relative" role="search">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= MIN_QUERY) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          className="w-full h-10 pl-9 pr-9 text-sm rounded-lg bg-surface-lowest border border-primary/[0.08] shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none placeholder:text-foreground/40 focus:border-primary/20 focus:ring-2 focus:ring-primary/15"
        />
        {query ? (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md inline-flex items-center justify-center text-foreground/45 hover:text-foreground hover:bg-surface-low transition-colors"
            aria-label="Clear search"
          >
            <X size={14} aria-hidden />
          </button>
        ) : null}
      </form>

      {showDropdown ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-xl border border-primary/[0.08] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
        >
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-foreground/55">
              <Loader2 size={15} className="animate-spin shrink-0" aria-hidden />
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-foreground/55">
              No results for &ldquo;{query.trim()}&rdquo;
            </div>
          ) : (
            <ul className="max-h-[min(24rem,70vh)] overflow-y-auto py-1">
              {results.map((item) => {
                const Icon = typeIcon(item.type);
                return (
                  <li key={item.id} role="option">
                    <button
                      type="button"
                      onClick={() => pickResult(item.href)}
                      className="w-full text-left px-3 py-2.5 hover:bg-surface-low/80 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={15} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {item.label}
                            </span>
                            <span className="shrink-0 rounded-full bg-surface-low px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/45">
                              {item.typeLabel}
                            </span>
                          </span>
                          {item.meta ? (
                            <span className="block text-xs text-foreground/50 truncate mt-0.5">
                              {item.meta}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-primary/[0.06] px-3 py-2 bg-surface-lowest/80">
            <Link
              href={viewAllHref}
              onClick={() => setOpen(false)}
              className="block w-full rounded-lg px-2 py-2 text-xs font-semibold text-primary hover:bg-primary/5 text-center transition-colors"
            >
              View all results
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardSearchBar(props) {
  return (
    <Suspense
      fallback={
        <div
          className={`h-10 rounded-lg bg-surface-lowest border border-primary/[0.08] ${props.className ?? ""}`}
          aria-hidden
        />
      }
    >
      <DashboardSearchBarInner {...props} />
    </Suspense>
  );
}
