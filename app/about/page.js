"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, Heart, Zap, 
  MapPin, Phone, Mail, 
  ArrowRight, Activity
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-surface pt-20 pb-40 px-20">
      <div>
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6"
            >
              <ShieldCheck size={14} />
              Our Mission & Values
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black font-manrope text-foreground tracking-tight mb-8"
            >
              A Legacy of Care, <br />
              <span className="text-primary italic">Reimagined for the Digital Age.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-foreground/50 leading-relaxed"
            >
              CareHub bridges the gap between small-clinic personalization and modern digital efficiency. We are dedicated to providing the community with precise, accessible, and dignified medical care.
            </motion.p>
          </div>

          {/* Story & Image Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square lg:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/5"
            >
              <Image
                src="/clinic-office.png"
                alt="CareHub Clinic Interior"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-extrabold font-manrope text-foreground">Our Community Story</h2>
              <div className="space-y-6">
                <p className="text-lg text-foreground/60 leading-relaxed">
                  For over a decade, our clinic has been a cornerstone of local health. We've seen families grow and the medical landscape evolve. However, we realized that the "traditional" ways of booking—phone queues and paper records—were no longer serving our patients as they should.
                </p>
                <p className="text-lg text-foreground/60 leading-relaxed font-bold">
                  In 2026, we launched CareHub.
                </p>
                <p className="text-lg text-foreground/60 leading-relaxed">
                  CareHub is more than just a booking portal; it's our clinical response to the need for modernized care. By centralizing our schedules and patient records in a secure, digital hub, we ensure that our practitioners can focus on what matters most: your health.
                </p>
              </div>
              
              <div className="pt-8 border-t border-outline-variant/10 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-3xl font-black font-manrope text-primary tracking-tight">3-5</p>
                  <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mt-1">Resident Doctors</p>
                </div>
                <div>
                  <p className="text-3xl font-black font-manrope text-primary tracking-tight">Digital-First</p>
                  <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mt-1">Clinical Approach</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Core Values Section */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold font-manrope text-foreground">Clinical Core Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Activity className="text-primary" />,
                  title: "Clinical Precision",
                  desc: "We utilize evidence-based practices and modern diagnostics to ensure every patient journey is accurate and effective."
                },
                {
                  icon: <Heart className="text-red-500" />,
                  title: "Patient Dignity",
                  desc: "Every interaction is handled with the utmost respect for personal privacy and individual healthcare needs."
                },
                {
                  icon: <Zap className="text-orange-500" />,
                  title: "Community Access",
                  desc: "By removing digital barriers, we make quality healthcare a simple, accessible reality for our entire local community."
                }
              ].map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-[2.5rem] bg-surface-lowest tonal-card flex flex-col items-center text-center gap-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-surface-low flex items-center justify-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold font-manrope text-foreground">{value.title}</h3>
                  <p className="text-sm text-foreground/50 leading-relaxed">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Meet the Team Summary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 md:p-20 rounded-[3rem] bg-surface-low flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="max-w-xl">
              <h2 className="text-4xl font-extrabold font-manrope text-foreground mb-6">Expert Hands, <br /> Compassionate Hearts.</h2>
              <p className="text-lg text-foreground/60 leading-relaxed mb-8">
                Our clinic is anchored by a select team of resident medical practitioners—General Practitioners, Pediatricians, and Chronic Care Specialists. 
              </p>
              <Link href="/doctors" className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-widest text-sm hover:translate-x-2 transition-transform">
                Read Practitioner Bios <ArrowRight size={18} />
              </Link>
            </div>

            <div className="flex -space-x-4">
              {["/doctor-sarah.png", "/doctor-robert.png", "/doctor-elena.png"].map((img, i) => (
                <div key={i} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-surface-lowest overflow-hidden shadow-xl grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer">
                  <Image src={img} alt="Doctor Thumbnail" width={128} height={128} className="object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
