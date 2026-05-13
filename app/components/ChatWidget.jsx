"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Bot, Sparkles, CalendarDays } from "lucide-react";

const QUICK_ACTIONS = [
  "Find a doctor",
  "How to book an appointment",
  "Contact clinic",
  "Opening hours",
];

function shouldHideWidget(pathname) {
  return pathname != null && /^(\/dashboard|\/admin|\/doctor|\/patient)(\/|$)/.test(pathname);
}

export default function ChatWidget() {
  const pathname = usePathname();
  const hidden = useMemo(() => shouldHideWidget(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const latestAssistantRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi I am CareHub's assistant. Ask me about our services, doctors, hours, booking, and contact details.",
      doctorCards: null,
      navLinks: null,
    },
  ]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    // Skip auto-scroll for the initial welcome-only state
    if (messages.length <= 1) return;

    const el = latestAssistantRef.current;
    const container = scrollRef.current;
    if (!el || !container) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    });
  }, [messages]);

  if (hidden) return null;

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", text, doctorCards: null, navLinks: null }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: nextMessages.slice(-20) }),
      });
      const payload = await response.json().catch(() => null);
      const assistantText = payload?.reply || payload?.error || "Sorry, I could not respond right now.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: assistantText,
          doctorCards: payload?.doctorCards ?? null,
          navLinks: payload?.navLinks ?? null,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I am having trouble connecting right now. Please try again shortly.",
          doctorCards: null,
          navLinks: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[120]">
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="w-[380px] max-w-[calc(100vw-2rem)] h-[600px] rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.16)] flex flex-col overflow-hidden bg-white/85 backdrop-blur-xl"
          >
            <div className="px-5 pt-4 pb-3 bg-gradient-to-br from-primary to-primary-container text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-9 w-9 rounded-xl bg-white/20 inline-flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-tight">CareHub Assistant</p>
                    <p className="text-[11px] text-white/80 mt-0.5">
                      Clinic and website guidance only
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/25 transition-colors"
                  aria-label="Close chatbot"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-white/90 max-w-[92%]">
                Informational assistant only. For urgent symptoms, contact emergency services immediately.
              </p>
            </div>

            <div className="px-4 py-3 bg-white/55 backdrop-blur-md">
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action, index) => (
                  <motion.button
                    key={action}
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.2 }}
                    onClick={() => sendMessage(action)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white text-primary shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all"
                  >
                    {action}
                  </motion.button>
                ))}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-white/70 to-surface-lowest/70 space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isLatestAssistant =
                    message.role === "assistant" && index === messages.length - 1;
                  return (
                  <motion.div
                    key={`${message.role}-${index}`}
                    ref={isLatestAssistant ? latestAssistantRef : undefined}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={
                      (message.role === "user" ? "flex justify-end" : "flex justify-start") +
                      (message.role === "assistant" ? " scroll-mt-3" : "")
                    }
                  >
                    <div className={message.role === "user" ? "max-w-[84%]" : "max-w-[90%]"}>
                      {(message.role === "user" ||
                        (message.role === "assistant" &&
                          String(message.text || "").trim().length > 0)) && (
                        <div
                          className={
                            message.role === "user"
                              ? "rounded-2xl rounded-br-md px-3.5 py-2.5 bg-primary text-white text-[13px] leading-relaxed whitespace-pre-line shadow-sm"
                              : "rounded-2xl rounded-bl-md px-3.5 py-2.5 bg-white text-foreground text-[13px] leading-relaxed whitespace-pre-line shadow-sm"
                          }
                        >
                          {message.text}
                        </div>
                      )}
                      {message.role === "assistant" &&
                      Array.isArray(message.doctorCards) &&
                      message.doctorCards.length > 0 ? (
                        <div className="mt-2 grid grid-cols-1 gap-2">
                          {message.doctorCards.map((doctor, cardIndex) => (
                            <div
                              key={doctor.id || `${doctor.name}-${cardIndex}`}
                              className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-primary/10"
                            >
                              <p className="text-sm font-semibold text-foreground">{doctor.name}</p>
                              {doctor.title ? (
                                <p className="text-xs text-foreground/70 mt-1">{doctor.title}</p>
                              ) : null}
                              {doctor.bio ? (
                                <p className="text-xs text-foreground/80 mt-2 leading-relaxed whitespace-pre-line">
                                  {doctor.bio}
                                </p>
                              ) : null}
                              <div className="mt-2 flex items-start gap-1.5 text-xs text-foreground/75">
                                <CalendarDays size={13} className="mt-0.5 shrink-0 text-primary" />
                                <span>{doctor.availability}</span>
                              </div>
                              <p className="text-[11px] text-foreground/50 mt-2">
                                Book via Doctors page or your appointments — {doctor.bookingPath || "/doctors"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {message.role === "assistant" &&
                      Array.isArray(message.navLinks) &&
                      message.navLinks.length > 0 ? (
                        <div className="mt-2 flex flex-col gap-1.5">
                          {message.navLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setOpen(false)}
                              className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-primary bg-white shadow-sm ring-1 ring-primary/15 hover:bg-primary/5 hover:ring-primary/25 transition-colors"
                            >
                              <span className="block">{link.label}</span>
                              {link.purpose ? (
                                <span className="block text-[11px] font-normal text-foreground/60 mt-0.5">
                                  {link.purpose}
                                </span>
                              ) : null}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>
              {loading ? (
                <div className="inline-flex items-center gap-2 text-xs text-foreground/60 px-1">
                  <Sparkles size={12} className="text-primary" />
                  Assistant is preparing a response...
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
              className="p-3 bg-white/75 backdrop-blur-md"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-white px-2 py-2 shadow-sm">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="flex-1 h-9 px-2 bg-transparent text-sm outline-none placeholder:text-foreground/45"
                  placeholder="Ask about doctors, booking, contact, or pages..."
                  maxLength={800}
                />
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={loading}
                  className="h-9 w-9 rounded-xl bg-primary text-white inline-flex items-center justify-center shadow-sm disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            key="chat-launcher"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            type="button"
            onClick={() => setOpen(true)}
            className="h-14 w-14 rounded-full bg-primary text-white shadow-[0_14px_30px_rgba(14,116,144,0.35)] inline-flex items-center justify-center hover:bg-primary-container transition-colors"
            aria-label="Open chatbot"
          >
            <MessageCircle size={22} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
