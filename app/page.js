"use client";

import { motion } from "framer-motion";
import Hero from "./components/Hero";
import Specialties from "./components/Specialties";
import TrustSection from "./components/TrustSection";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <>
      <Hero />

      <Specialties />

      <TrustSection />

      {/* Final CTA Section */}
      <section className="py-24 bg-surface px-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden"
          >
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black font-manrope mb-8 tracking-tight">
                Start Your Journey to <span className="text-secondary-container">Better Health</span> Today
              </h2>
              <p className="text-xl text-white/80 mb-12 leading-relaxed">
                Join thousands of patients who have simplified their healthcare management. Experience clinical coordination at your fingertips.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto bg-white text-primary px-10 py-5 rounded-2xl text-xl font-black shadow-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 group">
                  Create Appoinment
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto bg-primary-container/20 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white/10 transition-all">
                  Register Facility
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
