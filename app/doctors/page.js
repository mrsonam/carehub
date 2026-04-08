"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import { 
  Users, Search, ArrowRight, ShieldCheck, 
  Star, Clock, Mail, Phone, Calendar,
  Stethoscope, Baby, Activity
} from "lucide-react";

const allDoctors = [
  {
    id: "dr-sarah",
    name: "Dr. Sarah Mitchell",
    title: "Senior General Practitioner",
    specialty: "General Medicine",
    experience: "12+ Years",
    image: "/doctor-sarah.png",
    bio: "Focused on preventive health and clinical wellness for our local community. Dr. Mitchell leads our primary care initiatives.",
    availability: "Next: Today, 2:30 PM",
    rating: "4.9",
    category: "General"
  },
  {
    id: "dr-robert",
    name: "Dr. Robert Chen",
    title: "Lead Pediatrician",
    specialty: "Pediatrics",
    experience: "15+ Years",
    image: "/doctor-robert.png",
    bio: "Dedicated to infant and childhood development. Dr. Chen provides a gentle, expert approach to pediatric clinical care.",
    availability: "Next: Tomorrow, 9:00 AM",
    rating: "4.8",
    category: "Pediatrics"
  },
  {
    id: "dr-elena",
    name: "Dr. Elena Rodriguez",
    title: "Internal Medicine Specialist",
    specialty: "Chronic Care",
    experience: "10+ Years",
    image: "/doctor-elena.png",
    bio: "Managing long-term health journeys with clinical precision. Specialist in diabetes and cardiovascular health management.",
    availability: "Next: Today, 4:15 PM",
    rating: "4.9",
    category: "Specialized"
  }
];

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "General", "Pediatrics", "Specialized"];

  const filteredDoctors = allDoctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                          d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || d.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      <main className="flex-grow pt-16 pb-32 px-6">
        <div className="container mx-auto">
          {/* Header Section */}
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
                placeholder="Search by name or specialty..."
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

          {/* Doctors Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredDoctors.map((doctor, i) => (
                <motion.div
                  key={doctor.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-[2.5rem] bg-surface-lowest tonal-card group cursor-pointer overflow-hidden border border-outline-variant/10"
                >
                  {/* Doctor Image Container */}
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-6 right-6">
                      <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl">
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                        <span className="text-sm font-black text-foreground">{doctor.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-md">
                        {doctor.specialty}
                      </span>
                      <div className="flex items-center gap-2 text-foreground/40 text-xs font-bold">
                        <Clock size={14} />
                        {doctor.experience} Exp.
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black font-manrope text-foreground mb-3">{doctor.name}</h3>
                    <p className="text-sm text-foreground/50 leading-relaxed mb-8 line-clamp-2">
                      {doctor.bio}
                    </p>

                    <div className="space-y-4 pt-6 border-t border-outline-variant/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-foreground/40 uppercase tracking-widest text-[10px]">Availability</span>
                        <span className="font-black text-green-600">{doctor.availability}</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <button className="flex-1 bg-surface-low text-foreground font-bold py-3 rounded-xl hover:bg-surface-high transition-all text-sm cursor-pointer">
                          View Profile
                        </button>
                        <button className="flex-1 bg-primary text-white font-black py-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm flex items-center justify-center gap-2 cursor-pointer group">
                          Book Now
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredDoctors.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center"
            >
               <div className="w-20 h-20 bg-surface-low rounded-full flex items-center justify-center mx-auto mb-6 text-foreground/20">
                <Users size={40} />
              </div>
              <h3 className="text-2xl font-bold font-manrope text-foreground">No practitioners found</h3>
              <p className="text-foreground/50">Try adjusting your search or category filters.</p>
            </motion.div>
          )}

          {/* Consultation CTA */}
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

      <Footer />
    </div>
  );
}
