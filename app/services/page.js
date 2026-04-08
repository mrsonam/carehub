"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Heart, Baby, Activity, 
  Search, ArrowRight, ShieldCheck, Plus,
  Stethoscope, Thermometer, UserCog,
  Pill, Syringe, Users
} from "lucide-react";

const allSpecialties = [
  {
    icon: <Stethoscope size={28} />,
    title: "General Practice",
    category: "Primary Care",
    description: "Routine check-ups, preventive care, and management of common health conditions for all ages.",
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    icon: <Baby size={28} />,
    title: "Pediatrics",
    category: "Primary Care",
    description: "Compassionate medical care tailored specifically for infants, children, and teenagers.",
    color: "bg-orange-50 text-orange-600"
  },
  {
    icon: <Users size={28} />,
    title: "Family Wellness",
    category: "Primary Care",
    description: "Comprehensive health support and preventive advice for the whole family.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: <Activity size={28} />,
    title: "Chronic Care",
    category: "Specialized",
    description: "Personalized management plans for long-term conditions like diabetes or hypertension.",
    color: "bg-red-50 text-red-600"
  },
  {
    icon: <Syringe size={28} />,
    title: "Vaccinations",
    category: "Preventive",
    description: "Essential immunizations and booster shots for children, adults, and travel needs.",
    color: "bg-teal-50 text-teal-600"
  },
  {
    icon: <UserCog size={28} />,
    title: "Senior Health",
    category: "Specialized",
    description: "Focused medical attention and support for the unique health needs of older adults.",
    color: "bg-indigo-50 text-indigo-600"
  }
];

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Primary Care", "Specialized", "Preventive"];

  const filteredServices = allSpecialties.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      <main className="flex-grow pt-20 pb-40 px-20">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6"
            >
              <ShieldCheck size={14} />
              Community Focused Care
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black font-manrope text-foreground tracking-tight mb-8"
            >
              Clinic Services & <span className="text-primary italic">Expert Care.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-foreground/50 leading-relaxed"
            >
              Focused on clinical precision and patient dignity. We offer a core set of reliable services to keep our community healthy and supported.
            </motion.p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-16 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-foreground/30">
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Find a service..."
                className="w-full h-16 pl-16 pr-6 rounded-2xl bg-surface-low border-none focus:ring-2 focus:ring-primary/20 text-lg transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    activeCategory === cat 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-surface-lowest text-foreground/60 hover:bg-surface-high"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Services Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredServices.map((service, i) => (
                <motion.div
                  key={service.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="p-8 rounded-3xl bg-surface-lowest tonal-card group cursor-pointer relative overflow-hidden"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${service.color} transition-transform group-hover:scale-110`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold font-manrope text-foreground mb-3">{service.title}</h3>
                  <p className="text-sm text-foreground/50 leading-relaxed mb-8">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] uppercase font-black tracking-widest text-foreground/30">{service.category}</span>
                    <button className="flex items-center gap-2 text-sm font-bold text-primary opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      Book Visit <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredServices.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <h3 className="text-2xl font-bold font-manrope text-foreground">No services found</h3>
              <p className="text-foreground/50">Try a different search term or category.</p>
            </motion.div>
          )}

          {/* Consultation CTA */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="mt-32 p-12 md:p-16 rounded-[3rem] bg-surface-low flex flex-col items-center text-center gap-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-3xl md:text-5xl font-black font-manrope text-foreground leading-tight">Can't find what you need?</h2>
            <p className="max-w-xl text-lg text-foreground/50">Our clinic staff is here to help. Reach out to schedule a preliminary assessment or discuss your needs.</p>
            <button className="bg-primary text-white px-10 py-4 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all cursor-pointer">
              Contact Our Staff
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
