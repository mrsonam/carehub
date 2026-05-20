"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Users, ShieldCheck, Phone, Search, X } from "lucide-react";

export default function DoctorsPageClient({ doctors }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "General", "Pediatrics", "Specialized"];

  const filteredDoctors = doctors.filter((d) => {
    const haystack = `${d.name} ${d.specialty} ${d.title} ${d.bio}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || d.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <main className="flex-grow pt-20 pb-24 sm:pb-40 px-4 sm:px-8 lg:px-20">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6"
            >
              <ShieldCheck size={14} />
              Resident Medical Experts
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black font-manrope text-foreground tracking-tight mb-8"
            >
              Meet Our <span className="text-primary italic">Resident Practitioners.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-foreground/50 leading-relaxed"
            >
              Our dedicated team of locally-focused, board-certified healthcare professionals is here to support your clinical journey with precision and dignity.
            </motion.p>
          </div>

          <section
            className="max-w-4xl mx-auto mb-10 flex flex-col gap-4"
            aria-label="Find a doctor"
          >
            <label className="relative block w-full">
              <span className="sr-only">Search doctors</span>
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, title, or specialty…"
                autoComplete="off"
                className="w-full h-11 sm:h-12 pl-11 pr-11 rounded-xl bg-surface-lowest border border-primary/[0.1] text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none placeholder:text-foreground/40 focus:border-primary/25 focus:ring-2 focus:ring-primary/15"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg inline-flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-surface-low transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} aria-hidden />
                </button>
              ) : null}
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-0.5 min-w-0 scroll-smooth">
                {categories.map((category) => {
                  const active = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      aria-pressed={active}
                      className={`h-9 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? "bg-primary text-white shadow-sm shadow-primary/20"
                          : "border border-primary/[0.12] bg-surface-lowest text-foreground/70 hover:border-primary/25 hover:bg-surface-low"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-foreground/50 shrink-0 tabular-nums">
                {filteredDoctors.length} practitioner{filteredDoctors.length === 1 ? "" : "s"}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col tonal-card rounded-[2rem] p-4"
              >
                <div className="aspect-[4/5] relative rounded-[2rem] overflow-hidden bg-surface-high mb-8 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-500">
                  <Image src={doctor.image} alt={doctor.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full">
                      {doctor.specialty}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-outline-variant/30" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">
                      {doctor.category}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black font-manrope text-foreground mb-2 tracking-tight leading-none group-hover:text-primary transition-colors">
                    {doctor.name}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-primary mb-4">{doctor.title}</p>

                  <p className="text-base text-foreground/50 leading-relaxed mb-8 max-w-sm">{doctor.bio}</p>

                  <div className="mt-auto pt-6 border-t border-outline-variant/10">
                    <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                      Availability
                    </span>
                    <p className="text-sm font-semibold text-primary mt-1">{doctor.availability}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredDoctors.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center">
              <div className="w-20 h-20 bg-surface-low rounded-full flex items-center justify-center mx-auto mb-6 text-foreground/20">
                <Users size={40} />
              </div>
              <h3 className="text-2xl font-bold font-manrope text-foreground">No practitioners found</h3>
              <p className="text-foreground/50">Try adjusting your search or category filters.</p>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 p-12 md:p-20 rounded-[3rem] bg-primary text-white flex flex-col items-center text-center gap-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black font-manrope mb-6">Unsure who to see?</h2>
              <p className="text-lg text-white/80 mb-10 leading-relaxed">
                Connect with our intake team. We’ll assess your needs and guide you to the right resident expert for your clinical care.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto bg-white text-primary px-10 py-4 rounded-2xl text-lg font-black shadow-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  Speak with Us
                </button>
                <div className="flex flex-col items-start text-left ml-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Phone size={14} />
                    <span>(02) 5555 1234</span>
                  </div>
                  <p className="text-xs text-white/60">Clinic Staff Available Mon-Sat</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
