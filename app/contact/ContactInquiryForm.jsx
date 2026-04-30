"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";

export default function ContactInquiryForm({ className = "" }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(data.error || "Could not send your message.");
        return;
      }
      toast.success("Thanks — we received your message and will reply soon.");
      setName("");
      setEmail("");
      setMessage("");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <label
          htmlFor="contact-name"
          className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-4"
        >
          Full Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-16 px-8 rounded-2xl bg-surface-lowest border-none focus:ring-2 focus:ring-primary/20 text-lg transition-all"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="contact-email"
          className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-4"
        >
          Email Address
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="e.g. john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-16 px-8 rounded-2xl bg-surface-lowest border-none focus:ring-2 focus:ring-primary/20 text-lg transition-all"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="contact-message"
          className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-4"
        >
          Your Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="How can our practitioners help you?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-8 rounded-2xl bg-surface-lowest border-none focus:ring-2 focus:ring-primary/20 text-lg transition-all resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full h-16 bg-primary text-white rounded-2xl text-lg font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? "Sending…" : "Send Inquiry"}{" "}
        {!pending ? <Send size={20} /> : null}
      </button>
    </form>
  );
}
