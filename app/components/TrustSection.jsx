"use client";

import { motion } from "framer-motion";
import { Calendar, UserCheck, History, Award, CheckCircle2 } from "lucide-react";

export default function TrustSection() {
  return (
    <section id="about-us" className="py-24 bg-surface px-20 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -translate-x-1/2" />
      
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold font-manrope text-foreground leading-tight">
              A Simpler Way to <span className="text-primary">Manage Your Care</span>
            </h2>
            <p className="text-lg text-foreground/50 leading-relaxed max-w-lg">
              We've replaced phone queues and manual tracking with a reliable digital system designed for your convenience.
            </p>
            
            <div className="space-y-6 mt-4">
              {[
                {
                  icon: <Calendar className="text-primary" />,
                  title: "Simple Digital Booking",
                  text: "Schedule your visit in under 60 seconds with real-time access to our resident doctors' availability."
                },
                {
                  icon: <UserCheck className="text-primary" />,
                  title: "Resident Practitioners",
                  text: "Work with our dedicated team of locally-focused, board-certified healthcare professionals."
                },
                {
                  icon: <History className="text-primary" />,
                  title: "Your Health Journey",
                  text: "Easily view your upcoming appointments and past consultation history in one secure portal."
                }
              ].map((feature, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface-lowest shadow-sm flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold font-manrope text-foreground mb-1">{feature.title}</h4>
                    <p className="text-sm text-foreground/50 leading-relaxed">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] bg-surface-high relative overflow-hidden flex items-center justify-center p-12">
              <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-20" />
              
              <div className="relative z-10 flex flex-col gap-6 w-full max-w-sm">
                <div className="p-6 rounded-2xl bg-white shadow-xl shadow-primary/5 flex items-center justify-between tonal-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Award size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-black font-manrope text-primary leading-none">MVP</p>
                      <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">Ready for Use</p>
                    </div>
                  </div>
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
                
                <div className="p-6 rounded-2xl bg-white shadow-xl shadow-primary/5 flex items-center gap-4 tonal-card">
                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <History size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">Patient Dashboard</p>
                    <p className="text-xs text-foreground/50">Secure Access to Your Record</p>
                  </div>
                </div>
                
                <div className="p-8 rounded-[2rem] bg-primary text-white text-center mt-4">
                  <h3 className="text-2xl font-black font-manrope mb-2 tracking-tight">Community Focused</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">Built for our Local Clinic</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
