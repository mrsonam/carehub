"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, Stethoscope, Users } from "lucide-react";

function roleLabel(role) {
  return role === "ADMIN" ? "Admin" : "Doctor";
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TeamDirectory({ staff = [] }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");

  const stats = useMemo(() => {
    const doctors = staff.filter((member) => member.role === "DOCTOR").length;
    const admins = staff.filter((member) => member.role === "ADMIN").length;
    return { total: staff.length, doctors, admins };
  }, [staff]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return staff.filter((member) => {
      const matchesRole = role === "ALL" ? true : member.role === role;
      if (!matchesRole) return false;
      if (!needle) return true;
      return (
        member.name.toLowerCase().includes(needle) ||
        member.email.toLowerCase().includes(needle)
      );
    });
  }, [query, role, staff]);

  return (
    <section className="panel p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Team
        </p>
        <h2 className="mt-2 text-2xl font-extrabold font-manrope tracking-tight">
          Admins & doctors
        </h2>
        <p className="text-sm text-foreground/55 mt-1">
          Search, filter, and review who has operational access.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.2, 0, 0, 1] }}
        className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <div className="rounded-xl border border-primary/[0.08] bg-surface-low px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45 inline-flex items-center gap-1.5">
            <Users size={13} /> Total
          </p>
          <p className="mt-1 text-2xl font-black font-manrope">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-primary/[0.08] bg-surface-low px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45 inline-flex items-center gap-1.5">
            <Stethoscope size={13} /> Doctors
          </p>
          <p className="mt-1 text-2xl font-black font-manrope">{stats.doctors}</p>
        </div>
        <div className="rounded-xl border border-primary/[0.08] bg-surface-low px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45 inline-flex items-center gap-1.5">
            <Shield size={13} /> Admins
          </p>
          <p className="mt-1 text-2xl font-black font-manrope">{stats.admins}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.2, 0, 0, 1] }}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <label className="relative w-full sm:max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="w-full h-10 rounded-lg bg-surface-low border border-primary/[0.1] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="inline-flex rounded-lg border border-primary/[0.1] p-1 bg-surface-low w-full sm:w-auto">
          {[
            { id: "ALL", label: "All" },
            { id: "DOCTOR", label: "Doctors" },
            { id: "ADMIN", label: "Admins" },
          ].map((option) => {
            const active = role === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setRole(option.id)}
                className={`h-8 px-3 rounded-md text-xs font-semibold transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-foreground/65 hover:bg-surface-lowest"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[40rem]">
          <div className="grid grid-cols-[1.3fr_1.6fr_0.8fr_0.8fr] gap-3 border-b border-primary/[0.08] pb-2 text-[11px] font-bold uppercase tracking-widest text-foreground/45">
            <p>Name</p>
            <p>Email</p>
            <p>Role</p>
            <p>Added</p>
          </div>
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="py-6 text-sm text-foreground/50"
              >
                No team members match the current filter.
              </motion.p>
            ) : (
              filtered.map((member, index) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.14) }}
                  className="grid grid-cols-[1.3fr_1.6fr_0.8fr_0.8fr] gap-3 py-3 border-b border-primary/[0.06] text-sm hover:bg-surface-lowest/60 rounded-md"
                >
                  <p className="font-semibold font-manrope truncate">{member.name}</p>
                  <p className="text-foreground/70 truncate">{member.email}</p>
                  <p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                        member.role === "ADMIN"
                          ? "bg-primary/10 text-primary border-primary/15"
                          : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                      }`}
                    >
                      {roleLabel(member.role)}
                    </span>
                  </p>
                  <p className="text-foreground/55 text-xs tabular-nums">
                    {formatDate(member.createdAt)}
                  </p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
