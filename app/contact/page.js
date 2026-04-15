"use client";

import { motion } from "framer-motion";
import { 
  Phone, Mail, MapPin, 
  Clock, Send, ArrowRight,
  ShieldCheck, MessageSquare
} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-surface pt-20 pb-40 px-20">
      <div className="container mx-auto">
          {/* Header Section */}
          <div className="text-center max-w-4xl mx-auto mb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6"
            >
              <MessageSquare size={14} />
              Connect with Care
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black font-manrope text-foreground tracking-tight mb-8"
            >
              Always <span className="text-primary italic">Within Reach.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-foreground/50 leading-relaxed max-w-2xl mx-auto"
            >
              We are here to support your health journey with efficiency and clinical precision. Reach out through any of our channels or visit us in person.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-32">
            {/* Left Column: Contact Grid & Hours */}
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: <Phone size={24} className="text-primary" />,
                    title: "Clinical Phone",
                    value: "(02) 5555 1234",
                    sub: "Mon - Sat Booking Hub"
                  },
                  {
                    icon: <Mail size={24} className="text-primary" />,
                    title: "Email Support",
                    value: "info.carehubb@gmail.com",
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2rem] bg-surface-lowest tonal-card"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/30 mb-2">{item.title}</h3>
                    <p className="text-xl font-black font-manrope text-foreground mb-1">{item.value}</p>
                    <p className="text-xs font-bold text-foreground/40">{item.sub}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-10 rounded-[2.5rem] bg-surface-lowest tonal-card"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-surface-low flex items-center justify-center text-primary">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-2xl font-black font-manrope text-foreground">Clinic Hours</h3>
                </div>
                
                <div className="space-y-4">
                  {[
                    { day: "Monday - Friday", hours: "8:00 AM - 6:00 PM" },
                    { day: "Saturday", hours: "9:00 AM - 2:00 PM" },
                    { day: "Sunday & Holidays", hours: "Closed" }
                  ].map((sched, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-outline-variant/5 last:border-0">
                      <span className="text-base font-bold text-foreground/60">{sched.day}</span>
                      <span className="text-base font-black text-primary">{sched.hours}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-10 rounded-[2.5rem] bg-primary text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black font-manrope mb-4">Emergency Care?</h3>
                  <p className="text-white/70 leading-relaxed mb-8">
                    If you are experiencing a medical emergency, please call 000 immediately or visit the nearest hospital emergency department.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest">
                    Available 24/7
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Inquiry Form & Map */}
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-12 rounded-[3rem] bg-surface-low flex flex-col gap-10"
              >
                <div className="space-y-2">
                  <h3 className="text-3xl font-black font-manrope text-foreground tracking-tight">Rapid Inquiry</h3>
                  <p className="text-foreground/40 font-bold">Expect a clinical response within 1 business hour.</p>
                </div>

                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-4">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      className="w-full h-16 px-8 rounded-2xl bg-surface-lowest border-none focus:ring-2 focus:ring-primary/20 text-lg transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-4">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. john@example.com"
                      className="w-full h-16 px-8 rounded-2xl bg-surface-lowest border-none focus:ring-2 focus:ring-primary/20 text-lg transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-foreground/40 ml-4">Your Message</label>
                    <textarea 
                      placeholder="How can our practitioners help you?"
                      rows={5}
                      className="w-full p-8 rounded-2xl bg-surface-lowest border-none focus:ring-2 focus:ring-primary/20 text-lg transition-all resize-none"
                    ></textarea>
                  </div>
                  <button className="w-full h-16 bg-primary text-white rounded-2xl text-lg font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all">
                    Send Inquiry <Send size={20} />
                  </button>
                </form>
              </motion.div>

              {/* Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative aspect-video rounded-[3rem] overflow-hidden bg-surface-high border-8 border-surface-lowest shadow-2xl"
              >
                <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary shadow-xl mb-4">
                    <MapPin size={32} />
                  </div>
                  <h4 className="text-xl font-bold font-manrope text-foreground">123 Medical Drive</h4>
                  <p className="text-sm text-foreground/40">Health Plaza, Suite 200, Metro City</p>
                  <div className="mt-8 px-6 py-2 bg-white rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-primary">
                    Open in Google Maps
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
    </div>
  );
}
