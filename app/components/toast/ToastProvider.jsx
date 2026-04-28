"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const TONE_STYLES = {
  success: {
    shell: "border-emerald-500/25 bg-emerald-500/10 text-emerald-900",
    icon: CheckCircle2,
  },
  error: {
    shell: "border-red-500/25 bg-red-500/10 text-red-900",
    icon: AlertCircle,
  },
  info: {
    shell: "border-primary/20 bg-primary/10 text-foreground",
    icon: Info,
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, tone = "info", duration = 3200) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const api = useMemo(
    () => ({
      push,
      success: (message, duration) => push(message, "success", duration),
      error: (message, duration) => push(message, "error", duration),
      info: (message, duration) => push(message, "info", duration),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[120] w-[min(92vw,24rem)] pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const tone = TONE_STYLES[toast.tone] ?? TONE_STYLES.info;
            const Icon = tone.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                className={`pointer-events-auto mt-2 rounded-xl border px-3 py-2.5 shadow-lg shadow-black/5 backdrop-blur ${tone.shell}`}
              >
                <div className="flex items-start gap-2">
                  <Icon size={16} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="opacity-65 hover:opacity-100 transition-opacity"
                    aria-label="Dismiss notification"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return value;
}
