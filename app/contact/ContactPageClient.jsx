"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";
import ContactInquiryForm from "./ContactInquiryForm";

const CLINIC_PHONE = "(02) 5555 1234";
const CLINIC_PHONE_HREF = "tel:+61255551234";
const CLINIC_ADDRESS = "123 Medical Drive, Health Plaza, Suite 200, Metro City";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=123+Medical+Drive+Health+Plaza+Metro+City";

const QUICK_LINKS = [
  {
    icon: Phone,
    title: "Call the clinic",
    description: "Mon–Sat for bookings and general questions",
    href: "tel:+61255551234",
    cta: CLINIC_PHONE,
    external: false,
  },
  {
    icon: Calendar,
    title: "Book online",
    description: "Sign in to schedule with your clinician",
    href: "/login",
    cta: "Go to sign in",
    external: false,
  },
  {
    icon: HelpCircle,
    title: "Browse FAQs",
    description: "Answers to common patient questions",
    href: "#faq",
    cta: "Jump to FAQs",
    external: false,
  },
];

const FAQ_ITEMS = [
  {
    id: "book",
    question: "How do I book an appointment?",
    answer:
      "Create a CareHub account or sign in, then choose a clinician and an available time slot. You will receive confirmation once the clinic approves the booking.",
  },
  {
    id: "cancel",
    question: "Can I cancel or reschedule online?",
    answer:
      "Yes. Open your appointment from the patient dashboard. If cancellation is still allowed for that visit, you can cancel there; otherwise contact us by phone.",
  },
  {
    id: "reply",
    question: "How quickly will you reply to my message?",
    answer:
      "We aim to respond within one business day. For urgent clinical concerns, please call the clinic directly rather than using this form.",
  },
  {
    id: "privacy",
    question: "Is my health information secure?",
    answer:
      "CareHub uses secure sign-in and encrypted connections. Only authorized clinic staff can access your records. Never share passwords or sensitive details in a general inquiry email.",
  },
  {
    id: "new",
    question: "Are you accepting new patients?",
    answer:
      "Availability varies by clinician. Browse our doctors page or call the clinic and we will help you find the right practitioner.",
  },
];

const HOURS = [
  { day: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
  { day: "Saturday", hours: "9:00 AM – 2:00 PM" },
  { day: "Sunday & public holidays", hours: "Closed" },
];

function QuickLinkCard({ link }) {
  const Icon = link.icon;
  const className =
    "flex h-full flex-col gap-3 rounded-2xl border border-primary/[0.08] bg-surface-lowest p-5 cursor-pointer transition-colors duration-200 hover:border-primary/20 hover:bg-surface-low/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

  const body = (
    <>
      <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon size={20} aria-hidden />
      </span>
      <div>
        <p className="font-semibold font-manrope text-foreground">{link.title}</p>
        <p className="mt-1 text-sm text-foreground/55 leading-relaxed">{link.description}</p>
        <p className="mt-3 text-sm font-semibold text-primary">{link.cta}</p>
      </div>
    </>
  );

  if (link.href.startsWith("#") || link.href.startsWith("tel:")) {
    return (
      <a href={link.href} className={className}>
        {body}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {body}
    </Link>
  );
}

function FaqItem({ item, open, onToggle, reduceMotion }) {
  const panelId = `faq-panel-${item.id}`;
  const buttonId = `faq-button-${item.id}`;

  return (
    <div className="rounded-xl border border-primary/[0.08] bg-surface-lowest overflow-hidden">
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left cursor-pointer transition-colors duration-200 hover:bg-surface-low/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
      >
        <span className="text-sm font-semibold text-foreground font-manrope">{item.question}</span>
        <ChevronDown
          size={18}
          aria-hidden
          className={`shrink-0 text-foreground/45 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${reduceMotion ? "!transition-none" : ""}`}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className={open ? "block" : "hidden"}
      >
        <p className="px-4 pb-4 text-sm text-foreground/60 leading-relaxed border-t border-primary/[0.06] pt-3">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function ContactPageClient({ companyEmail }) {
  const reduceMotion = useReducedMotion();
  const [openFaqId, setOpenFaqId] = useState(FAQ_ITEMS[0]?.id ?? null);

  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: [0.2, 0, 0, 1] },
      };

  return (
    <div className="bg-surface pb-20 sm:pb-28">
      <div
        role="alert"
        aria-labelledby="contact-emergency-heading"
        className="border-b border-amber-500/25 bg-gradient-to-r from-amber-500/[0.12] via-amber-500/[0.06] to-transparent"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
          <div className="rounded-xl border border-amber-500/20 bg-surface-lowest/80 backdrop-blur-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 min-w-0 flex-1 border-l-4 border-amber-600">
                <span
                  className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0"
                  aria-hidden
                >
                  <AlertTriangle size={20} strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p
                    id="contact-emergency-heading"
                    className="text-sm font-bold font-manrope text-foreground tracking-tight"
                  >
                    Medical emergency
                  </p>
                  <p className="mt-1.5 text-sm text-foreground/65 leading-relaxed">
                    For life-threatening illness or injury, call triple zero (000) or go straight to
                    your nearest hospital emergency department.
                  </p>
                  <p className="mt-2 text-xs text-foreground/50 leading-relaxed">
                    This page and contact form are for non-urgent enquiries only. It is not monitored
                    24/7.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 p-4 sm:p-5 lg:w-56 xl:w-64 bg-amber-500/[0.04] border-t lg:border-t-0 lg:border-l border-amber-500/15 shrink-0">
                <a
                  href="tel:000"
                  className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-lowest"
                >
                  Call 000
                </a>
                <a
                  href={CLINIC_PHONE_HREF}
                  className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl border border-amber-600/30 bg-surface-lowest text-sm font-semibold text-foreground hover:bg-surface-low transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-lowest"
                >
                  <Phone size={16} className="mr-2 text-amber-700 shrink-0" aria-hidden />
                  {CLINIC_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <motion.header {...fadeUp} className="max-w-2xl pt-12 sm:pt-16 pb-10 sm:pb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45 mb-3">
            Contact & support
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-manrope text-foreground tracking-tight leading-tight">
            We&apos;re here to help with your care
          </h1>
          <p className="mt-4 text-base sm:text-lg text-foreground/60 leading-relaxed">
            Reach our clinic team by phone, email, or the form below. For booking changes, sign in to
            your patient dashboard for the fastest path.
          </p>
        </motion.header>

        <motion.ul
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12 sm:mb-16"
        >
          {QUICK_LINKS.map((link) => (
            <li key={link.title}>
              <QuickLinkCard link={link} />
            </li>
          ))}
        </motion.ul>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <motion.aside
            {...fadeUp}
            className="lg:col-span-5 flex flex-col gap-6"
            aria-label="Clinic details"
          >
            <section className="rounded-2xl border border-primary/[0.08] bg-surface-lowest p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Clock size={20} aria-hidden />
                </span>
                <h2 className="text-lg font-bold font-manrope text-foreground">Clinic hours</h2>
              </div>
              <ul className="space-y-0">
                {HOURS.map((row) => (
                  <li
                    key={row.day}
                    className="flex items-center justify-between gap-4 py-3 border-b border-primary/[0.06] last:border-0 text-sm"
                  >
                    <span className="text-foreground/60">{row.day}</span>
                    <span className="font-semibold text-foreground tabular-nums">{row.hours}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-primary/[0.08] bg-surface-low overflow-hidden">
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start gap-6">
                <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MapPin size={22} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold font-manrope text-foreground">Visit us</h2>
                  <p className="mt-2 text-sm text-foreground/60 leading-relaxed">{CLINIC_ADDRESS}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-container transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      Open in Google Maps
                    </a>
                    <a
                      href={CLINIC_PHONE_HREF}
                      className="inline-flex items-center justify-center min-h-11 px-4 rounded-xl border border-primary/[0.12] text-sm font-semibold text-foreground hover:bg-surface-high/80 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <Phone size={16} className="mr-2 text-primary" aria-hidden />
                      {CLINIC_PHONE}
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-t border-primary/[0.06] px-6 sm:px-8 py-4 flex items-start gap-2 bg-surface-low/50">
                <Shield size={16} className="text-primary shrink-0 mt-0.5" aria-hidden />
                <p className="text-xs text-foreground/55 leading-relaxed">
                  Parking is available on-site. Please arrive 10 minutes before your appointment for
                  check-in.
                </p>
              </div>
            </section>
          </motion.aside>

          <motion.section {...fadeUp} className="lg:col-span-7" aria-labelledby="form-heading">
            <div className="rounded-2xl border border-primary/[0.08] bg-surface-lowest p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-6">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail size={20} aria-hidden />
                </span>
                <div>
                  <h2 id="form-heading" className="text-2xl font-extrabold font-manrope text-foreground">
                    Send a message
                  </h2>
                  <p className="mt-1 text-sm text-foreground/60">
                    Email:{" "}
                    <a
                      href={`mailto:${companyEmail}`}
                      className="text-primary font-semibold break-all hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
                    >
                      {companyEmail}
                    </a>
                  </p>
                </div>
              </div>
              <ContactInquiryForm idPrefix="contact-main" />
            </div>
          </motion.section>
        </div>

        <motion.section
          id="faq"
          {...fadeUp}
          className="mt-14 sm:mt-20 pt-10 sm:pt-12 border-t border-primary/[0.08]"
          aria-labelledby="faq-heading"
        >
          <div className="max-w-2xl mb-8">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-extrabold font-manrope text-foreground">
              Common questions
            </h2>
            <p className="mt-2 text-sm sm:text-base text-foreground/60 leading-relaxed">
              Expand an answer below. Still stuck? Use the message form above.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            {FAQ_ITEMS.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                open={openFaqId === item.id}
                onToggle={() => setOpenFaqId((prev) => (prev === item.id ? null : item.id))}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
