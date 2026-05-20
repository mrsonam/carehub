"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";

function isActiveTab() {
  return typeof document !== "undefined" && document.visibilityState === "visible" && document.hasFocus();
}

function formatRelativeTime(date) {
  const ms = Date.now() - date.getTime();
  if (!Number.isFinite(ms) || ms < 0) return "Just now";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const lastSeenIdRef = useRef(null);
  const rootRef = useRef(null);

  const hasUnread = unread > 0;

  const label = useMemo(() => (hasUnread ? `${unread} unread notifications` : "Notifications"), [hasUnread, unread]);

  async function refresh() {
    const res = await fetch("/api/notifications", { cache: "no-store" }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (!data?.ok) return;

    setUnread(data.unreadCount ?? 0);
    setItems(data.notifications ?? []);

    const newest = data.notifications?.[0];
    if (!newest?.id) return;

    if (!lastSeenIdRef.current) {
      lastSeenIdRef.current = newest.id;
      return;
    }

    if (newest.id !== lastSeenIdRef.current && isActiveTab()) {
      toast.info(newest.title);
      lastSeenIdRef.current = newest.id;
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => null);
    await refresh();
  }

  async function markOneRead(id) {
    if (!id) return;
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => null);
    await refresh();
  }

  useEffect(() => {
    refresh();
    const id = window.setInterval(() => refresh(), 12_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      const node = rootRef.current;
      if (!node || node.contains(event.target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-md flex items-center justify-center text-foreground/55 hover:text-foreground hover:bg-surface-high transition-colors"
      >
        <Bell size={16} />
        {hasUnread ? (
          <>
            <span
              className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center"
              aria-hidden
            >
              {unread > 9 ? "9+" : unread}
            </span>
            <span className="sr-only">{label}</span>
          </>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] overflow-hidden z-50"
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold tracking-tight">Notifications</p>
                <p className="text-[11px] text-foreground/50 mt-0.5">
                  {hasUnread ? `${unread} unread` : "All caught up"}
                </p>
              </div>
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <Check size={14} />
                Mark all read
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto px-2 pb-2">
              {items.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-foreground/60">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-1">
                  {items.map((n) => {
                    const createdAt = new Date(n.createdAt);
                    const unreadDot = !n.readAt;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={async () => {
                          await markOneRead(n.id);
                          setOpen(false);
                        }}
                        className="w-full text-left rounded-xl px-3 py-2.5 hover:bg-surface-high/60 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                              {unreadDot ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden />
                              ) : null}
                            </div>
                            <p className="text-xs text-foreground/65 mt-0.5 whitespace-pre-line line-clamp-3">
                              {n.message}
                            </p>
                          </div>
                          <p className="text-[11px] text-foreground/45 shrink-0 mt-0.5">
                            {formatRelativeTime(createdAt)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

