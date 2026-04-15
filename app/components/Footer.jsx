"use client";

import { Activity, Mail, Phone, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-low pt-24 pb-12 px-20 border-t border-outline-variant/10">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-110">
                <Activity size={18} />
              </div>
              <span className="text-xl font-bold font-manrope tracking-tight text-primary">CareHub</span>
            </Link>
            <p className="text-sm text-foreground/50 leading-relaxed">
              Serving our community with reliable, clinical care. Your health journey, simplified.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/contact" className="flex items-center gap-3 text-foreground/60 text-sm hover:text-primary transition-colors">
                <MapPin size={16} className="text-primary" />
                <span>123 Medical Drive, Health Plaza</span>
              </Link>
              <Link href="/contact" className="flex items-center gap-3 text-foreground/60 text-sm hover:text-primary transition-colors">
                <Phone size={16} className="text-primary" />
                <span>(02) 5555 1234</span>
              </Link>
              <Link href="/contact" className="flex items-center gap-3 text-foreground/60 text-sm hover:text-primary transition-colors">
                <Mail size={16} className="text-primary" />
                <span>contact@carehubclinic.com</span>
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-6">Clinic Information</h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start gap-2 text-sm text-foreground/60">
                  <Clock size={16} className="text-primary mt-1" />
                  <div>
                    <p className="font-bold">Operating Hours</p>
                    <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                    <p>Sat: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </li>
              <li>
                <Link href="/doctors" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors cursor-pointer">About Our Doctors</Link>
              </li>
              <li>
                <Link href="/about" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors cursor-pointer">Clinic History</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors cursor-pointer">Get in Touch</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-6">Medical Services</h4>
            <ul className="space-y-4">
              {[
                { name: "General Practice", href: "/services" },
                { name: "Pediatrics", href: "/services" },
                { name: "Chronic Care", href: "/services" },
                { name: "Vaccinations", href: "/services" },
                { name: "All Services", href: "/services" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors cursor-pointer">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-6">Patient Portal</h4>
            <ul className="space-y-4">
              {["Sign In", "Book Appointment", "Privacy Policy", "Terms of Service"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors cursor-pointer">{link}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/40">
            © {new Date().getFullYear()} CareHub Clinic. An MVP for academic practice.
          </p>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-foreground/30">
            <span>Powered by Supabase</span>
            <span>Built with Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
