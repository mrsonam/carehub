"use client";

import { motion } from "framer-motion";
import { Stethoscope, Baby, Activity, Users, PlusCircle } from "lucide-react";
import Link from "next/link";

const mainServices = [
  {
    icon: <Stethoscope className="text-emerald-500" />,
    title: "General Practice",
    description: "Your first point of contact for daily health needs and long-term wellness management.",
  },
  {
    icon: <Baby className="text-orange-500" />,
    title: "Pediatric Care",
    description: "Dedicated medical support for the growth and development of your children.",
  },
  {
    icon: <Activity className="text-red-500" />,
    title: "Chronic Care",
    description: "Expert management for long-term health journeys like diabetes or heart health.",
  },
  {
    icon: <Users className="text-blue-500" />,
    title: "Family Health",
    description: "Comprehensive care plans designed to protect every member of your household.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Specialties() {
  return (
    <section id="services" className="py-24 bg-surface-low px-20">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold font-manrope text-foreground mb-4">Our Core Clinical Services</h2>
          <p className="text-lg text-foreground/50 max-w-2xl mx-auto">
            We provide a base of reliable, expert care designed to keep our community healthy and supported.
          </p>
        </div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {mainServices.map((service, index) => (
            <motion.div
              key={index}
              variants={item}
              className="p-8 rounded-2xl bg-surface-lowest tonal-card group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-low flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold font-manrope text-foreground mb-3">{service.title}</h3>
              <p className="text-sm text-foreground/50 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-8 rounded-[2rem] bg-surface-high flex flex-col md:flex-row items-center justify-between gap-8 text-foreground overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
              <PlusCircle size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-manrope">Looking for more?</h3>
              <p className="text-foreground/50">Browse our complete directory of clinical services and medical diagnostics.</p>
            </div>
          </div>
          
          <Link href="/services" className="relative z-10 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-container transition-all cursor-pointer">
            Explore All Services
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
