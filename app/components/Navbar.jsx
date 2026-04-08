"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between"
    >
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-110">
          <Activity size={24} />
        </div>
        <span className="text-xl font-bold font-manrope tracking-tight text-primary">CareHub</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        {[
          { name: "Services", href: "/services" },
          { name: "Doctors", href: "#doctors" },
          { name: "About Us", href: "#about-us" },
          { name: "Contact", href: "#contact" }
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors cursor-pointer"
          >
            {item.name}
          </Link>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
          Sign In
        </button>
        <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-primary-container transition-all cursor-pointer">
          Book Appointment
        </button>
      </div>
    </motion.nav>
  );
}
