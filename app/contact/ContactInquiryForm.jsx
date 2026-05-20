"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/app/components/toast/ToastProvider";
import {
  FormAlert,
  FormField,
  formInputClass,
  FORM_ERROR_KEY,
} from "@/app/components/forms/FormField";
import {
  errorsFromApiResponse,
  hasFieldErrors,
  validateEmail,
  validateMessage,
  validateRequired,
} from "@/lib/forms/validate";

const TOPICS = [
  { value: "booking", label: "Booking or scheduling" },
  { value: "account", label: "Account or login" },
  { value: "billing", label: "Billing or payments" },
  { value: "records", label: "Medical records" },
  { value: "other", label: "Something else" },
];

export default function ContactInquiryForm({ className = "", idPrefix = "contact" }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("booking");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  const clearError = (key) => setErrors((prev) => ({ ...prev, [key]: "" }));

  const submit = async (e) => {
    e.preventDefault();
    if (pending) return;

    const nextErrors = {};
    const nameError = validateRequired(name, "Full name is required.");
    const emailError = validateEmail(email);
    const messageError = validateMessage(message);
    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    if (messageError) nextErrors.message = messageError;

    setErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) return;

    setPending(true);
    try {
      const topicLabel = TOPICS.find((t) => t.value === topic)?.label ?? topic;
      const body = `[${topicLabel}]\n\n${message.trim()}`;

      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: body,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrors(errorsFromApiResponse(data, "Could not send your message."));
        return;
      }
      toast.success("Thanks — we received your message and will reply soon.");
      setName("");
      setEmail("");
      setTopic("booking");
      setMessage("");
      setErrors({});
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className={`flex flex-col gap-5 ${className}`} aria-busy={pending} noValidate>
      <FormAlert message={errors[FORM_ERROR_KEY]} />

      <FormField
        label="Full name"
        htmlFor={`${idPrefix}-name`}
        error={errors.name}
        labelClassName="text-sm font-semibold text-foreground"
      >
        <input
          id={`${idPrefix}-name`}
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError("name");
          }}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
          className={`${formInputClass(Boolean(errors.name))} w-full min-h-11 h-11 px-4 rounded-xl`}
        />
      </FormField>

      <FormField
        label="Email"
        htmlFor={`${idPrefix}-email`}
        error={errors.email}
        labelClassName="text-sm font-semibold text-foreground"
      >
        <input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError("email");
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${idPrefix}-email-error` : undefined}
          className={`${formInputClass(Boolean(errors.email))} w-full min-h-11 h-11 px-4 rounded-xl`}
        />
      </FormField>

      <FormField
        label="What is this about?"
        htmlFor={`${idPrefix}-topic`}
        labelClassName="text-sm font-semibold text-foreground"
      >
        <select
          id={`${idPrefix}-topic`}
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={`${formInputClass(false)} w-full min-h-11 h-11 px-4 rounded-xl cursor-pointer`}
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Message"
        htmlFor={`${idPrefix}-message`}
        error={errors.message}
        labelClassName="text-sm font-semibold text-foreground"
      >
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          rows={5}
          placeholder="Tell us how we can help. Please do not include urgent medical details — call us or 000 in an emergency."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            clearError("message");
          }}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${idPrefix}-message-error` : undefined}
          className={`${formInputClass(Boolean(errors.message))} w-full min-h-[120px] h-auto py-3 px-4 rounded-xl resize-y`}
        />
      </FormField>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 h-11 px-5 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm shadow-primary/15 flex items-center justify-center gap-2 hover:bg-primary-container transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-lowest"
      >
        {pending ? "Sending…" : "Send message"}
        {!pending ? <Send size={18} aria-hidden /> : null}
      </button>

      <p className="text-xs text-foreground/55 leading-relaxed">
        We typically reply within one business day. Messages are handled by our clinic team, not an
        automated bot.
      </p>
    </form>
  );
}
