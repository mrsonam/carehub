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

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {allDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col"
              >
                {/* Doctor Image Container - Clean & Professional */}
                <div className="aspect-[4/5] relative rounded-[2rem] overflow-hidden bg-surface-high mb-8 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-500">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                  {/* Subtle Tonal Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Doctor Info - Content Focus */}
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full">
                      {doctor.specialty}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-outline-variant/30" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">
                      {doctor.experience} Exp.
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black font-manrope text-foreground mb-4 tracking-tight leading-none group-hover:text-primary transition-colors">
                    {doctor.name}
                  </h3>
                  
                  <p className="text-base text-foreground/50 leading-relaxed mb-8 max-w-sm">
                    {doctor.bio}
                  </p>

                  <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Available</span>
                    </div>
                    <span className="text-sm font-black text-primary">{doctor.availability.split(": ")[1]}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

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
