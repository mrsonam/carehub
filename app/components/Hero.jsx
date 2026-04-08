"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Clock, ShieldCheck, CalendarCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface py-16 px-6 sm:py-24">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold tracking-wider uppercase mb-6">
            <ShieldCheck size={14} />
            Digital-First Community Clinic
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold font-manrope tracking-tight text-foreground leading-[1.1] mb-6">
            Modern Care for Our <span className="text-primary italic">Local Community.</span>
          </h1>
          <p className="text-lg text-foreground/60 leading-relaxed mb-10 max-w-lg">
            No more waiting on hold or tracking paper records. CareHub brings simple online booking and health management to your fingertips.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary-container hover:-translate-y-0.5 transition-all cursor-pointer">
              Book an Appointment
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold border border-outline-variant/30 hover:bg-surface-low transition-all cursor-pointer">
              About Our Clinic
            </button>
          </div>
          
          <div className="mt-12 flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CalendarCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Verified Digital Scheduling</p>
              <p className="text-sm text-foreground/50">Replacing manual records since 2026</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Main Hero Image/Card */}
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 tonal-card">
            <Image
              src="/doctor-sarah.png"
              alt="Dr. Sarah Mitchell"
              width={600}
              height={700}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-0 left-0 p-8 text-white w-full">
              <h3 className="text-2xl font-bold font-manrope">Dr. Sarah Mitchell</h3>
              <p className="text-white/80 font-medium whitespace-nowrap">Resident General Practitioner</p>
            </div>
          </div>
          
          {/* Floating Availability Card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 glass p-4 rounded-2xl shadow-xl hidden md:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Today's Schedule</p>
                <p className="text-sm font-extrabold text-foreground">Next Spot: 2:30 PM</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
