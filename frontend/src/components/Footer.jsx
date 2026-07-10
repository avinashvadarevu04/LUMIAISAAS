import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Linkedin,
  Github,
  Instagram,
  Mail,
  Youtube,
  Send,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { SHOW_AI_INFRA } from "../config";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Studio", href: "/studio" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Careers", href: "/#careers" },
  { label: "Contact", href: "/#contact" },
];

const SOLUTIONS = [
  { label: "AI Agents" },
  { label: "Voice AI" },
  { label: "Enterprise AI" },
  { label: "SaaS Development" },
  { label: "Web Applications" },
  { label: "Mobile Apps" },
  { label: "Automation" },
  { label: "AI Consulting" },
];

const RESOURCES = [
  { label: "FAQs", href: "/#faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Documentation", href: "/docs" },
  { label: "Support Center", href: "/support" },
  { label: "Book a Meeting", href: "/schedule-meeting" },
];

export const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  const handleLinkClick = (e, href) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.replace("/#", "");
      if (window.location.pathname === "/") {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById(id);
          el?.scrollIntoView({ behavior: "smooth" });
        }, 250);
      }
    } else if (href.startsWith("/")) {
      e.preventDefault();
      navigate(href);
    }
  };

  const filteredSolutions = [
    ...SOLUTIONS,
    ...(SHOW_AI_INFRA ? [{ label: "AI Infrastructure", isRoute: true, href: "/ai-infra" }] : []),
  ];

  return (
    <footer className="relative w-full bg-white/80 border-t border-[#2455FF]/18 overflow-hidden pt-12 pb-6 z-30 font-sans">
      {/* Top glowing blue border/divider line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2455FF]/40 to-transparent shadow-[0_-4px_20px_rgba(36,85,255,0.4)]" />

      {/* Blueprint grid background */}
      <div className="absolute inset-0 bp-grid pointer-events-none opacity-20" aria-hidden="true" />
      <div className="absolute inset-0 bp-wash pointer-events-none" aria-hidden="true" />

      {/* Background Neural Network/AI node graphic */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 flex items-center justify-center opacity-[0.035]">
        <svg width="800" height="400" viewBox="0 0 800 400" fill="none" className="w-full max-w-[900px] h-auto">
          <line x1="100" y1="200" x2="250" y2="100" stroke="#2455FF" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="100" y1="200" x2="250" y2="300" stroke="#2455FF" strokeWidth="1.5" />
          <line x1="250" y1="100" x2="400" y2="100" stroke="#2455FF" strokeWidth="1.5" />
          <line x1="250" y1="100" x2="400" y2="200" stroke="#2455FF" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="250" y1="300" x2="400" y2="200" stroke="#2455FF" strokeWidth="1.5" />
          <line x1="250" y1="300" x2="400" y2="300" stroke="#2455FF" strokeWidth="1.5" />
          <line x1="400" y1="100" x2="550" y2="100" stroke="#2455FF" strokeWidth="1.5" />
          <line x1="400" y1="200" x2="550" y2="200" stroke="#2455FF" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="400" y1="300" x2="550" y2="300" stroke="#2455FF" strokeWidth="1.5" />
          <line x1="550" y1="100" x2="700" y2="200" stroke="#2455FF" strokeWidth="1.5" />
          <line x1="550" y1="200" x2="700" y2="200" stroke="#2455FF" strokeWidth="1.5" />
          <line x1="550" y1="300" x2="700" y2="200" stroke="#2455FF" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="100" cy="200" r="6" fill="#2455FF" />
          <circle cx="250" cy="100" r="5" fill="#00E5FF" />
          <circle cx="250" cy="300" r="5" fill="#2455FF" />
          <circle cx="400" cy="100" r="7" fill="#2455FF" />
          <circle cx="400" cy="200" r="6" fill="#00E5FF" />
          <circle cx="400" cy="300" r="7" fill="#2455FF" />
          <circle cx="550" cy="100" r="5" fill="#2455FF" />
          <circle cx="550" cy="200" r="5" fill="#00E5FF" />
          <circle cx="550" cy="300" r="5" fill="#2455FF" />
          <circle cx="700" cy="200" r="6" fill="#2455FF" />
        </svg>
      </div>

      {/* Oversized background watermark */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center z-0">
        <motion.div
          initial={{ opacity: 0.10 }}
          animate={{ opacity: [0.10, 0.15, 0.10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="font-display text-[14vw] leading-none bg-gradient-to-b from-[#2455FF] via-[#2455FF] to-transparent bg-clip-text text-transparent font-black tracking-[0.22em] uppercase whitespace-nowrap select-none drop-shadow-[0_4px_24px_rgba(36,85,255,0.06)] filter blur-[0.4px] inline-block"
        >
          LUMI AI
        </motion.div>
      </div>

      <div className="max-w-[1680px] mx-auto px-8 sm:px-12 md:px-16 relative z-10">
        {/* Main Footer Link Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6 text-left pb-6">
          
          {/* Logo & About Column */}
          <div className="lg:col-span-1 flex flex-col space-y-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[28px] tracking-[0.08em] text-[#050a1a] leading-none font-black">
                  LUMI&nbsp;<span className="text-[#2455FF]">AI</span>
                </span>
                <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-slate-400 mt-1.5">
                Lupus AI Labs
              </div>
            </div>
            
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#2455FF] font-bold">
              Engineering AI Solutions for the Future.
            </p>

            <div className="p-3 bg-[#2455FF]/5 border-l-2 border-[#2455FF] rounded-r-xl">
              <p className="text-[12.5px] text-[#050a1a] font-semibold leading-relaxed">
                Building Enterprise AI, Voice Agents, Automation & Intelligent Software.
              </p>
            </div>
            
            <p className="text-[12px] text-slate-500 leading-relaxed font-sans">
              We build AI Agents, Enterprise Software, Voice AI, Automation, Custom SaaS Platforms, and Intelligent Infrastructure for startups and enterprises.
            </p>

            <div className="space-y-2 pt-3 font-sans text-[12px] text-slate-600">
              <a href="mailto:hello@lumi.ai" className="flex items-center gap-2 hover:text-[#2455FF] transition-colors">
                <Mail className="h-3.5 w-3.5 text-[#2455FF]" />
                <span>hello@lumi.ai</span>
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-[#2455FF] transition-colors">
                <Phone className="h-3.5 w-3.5 text-[#2455FF]" />
                <span>+91 98765 43210</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#2455FF] shrink-0 mt-0.5" />
                <span>Hyderabad, Telangana, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-cine text-[16px] tracking-widest text-[#050a1a] font-bold border-b border-[#2455FF]/10 pb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2455FF]" />
              Company
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="group text-[13px] text-slate-500 hover:text-[#2455FF] transition-colors flex items-center gap-1.5"
                  >
                    <span className="h-1 w-1 bg-transparent group-hover:bg-[#2455FF] rounded-full transition-all" />
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#2455FF] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-cine text-[16px] tracking-widest text-[#050a1a] font-bold border-b border-[#2455FF]/10 pb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2455FF]" />
              Solutions
            </h4>
            <ul className="space-y-2.5">
              {filteredSolutions.map((sol) => (
                <li key={sol.label}>
                  {sol.href ? (
                    <a
                      href={sol.href}
                      onClick={(e) => handleLinkClick(e, sol.href)}
                      className="group text-[13px] text-slate-500 hover:text-[#2455FF] transition-colors flex items-center gap-1.5"
                    >
                      <span className="h-1 w-1 bg-transparent group-hover:bg-[#2455FF] rounded-full transition-all" />
                      <span className="relative">
                        {sol.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#2455FF] transition-all duration-300 group-hover:w-full" />
                      </span>
                    </a>
                  ) : (
                    <span className="text-[13px] text-slate-500 flex items-center gap-1.5">
                      <span className="h-1 w-1 bg-slate-300 rounded-full" />
                      <span>{sol.label}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-cine text-[16px] tracking-widest text-[#050a1a] font-bold border-b border-[#2455FF]/10 pb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2455FF]" />
              Resources
            </h4>
            <ul className="space-y-2.5">
              {RESOURCES.map((res) => (
                <li key={res.label}>
                  <a
                    href={res.href}
                    onClick={(e) => handleLinkClick(e, res.href)}
                    className="group text-[13px] text-slate-500 hover:text-[#2455FF] transition-colors flex items-center gap-1.5"
                  >
                    <span className="h-1 w-1 bg-transparent group-hover:bg-[#2455FF] rounded-full transition-all" />
                    <span className="relative">
                      {res.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#2455FF] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Directory Contact Details & Newsletter Column */}
          <div className="flex flex-col space-y-6">
            {/* Contact Details */}
            <div className="space-y-3">
              <h4 className="font-cine text-[16px] tracking-widest text-[#050a1a] font-bold border-b border-[#2455FF]/10 pb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2455FF]" />
                Contacts
              </h4>
              <div className="space-y-2 text-[12px] text-slate-600">
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400 block">Support Desk</span>
                  <a href="mailto:support@lumi.ai" className="font-semibold hover:text-[#2455FF] transition-colors">support@lumi.ai</a>
                </div>
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400 block">Sales Desk</span>
                  <a href="mailto:sales@lumi.ai" className="font-semibold hover:text-[#2455FF] transition-colors">sales@lumi.ai</a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-[#2455FF]" />
                  <span className="text-[11.5px]">Mon-Fri · 9AM - 6PM IST</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-600">
                  <Phone className="h-3 w-3" />
                  <span className="text-[11px] font-mono font-bold">EMERGENCY: +91 99999 99999</span>
                </div>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="space-y-2.5">
              <h5 className="font-cine text-[14px] tracking-wider text-[#050a1a] font-bold">
                Stay Updated with AI
              </h5>
              <AnimatePresence mode="wait">
                {!subscribed ? (
                  <motion.form
                    key="newsletter-form"
                    onSubmit={handleSubscribe}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-2"
                  >
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full bg-white/50 border border-[#2455FF]/15 focus:border-[#2455FF] focus:ring-1 focus:ring-[#2455FF] outline-none rounded-xl py-2 px-3 text-xs placeholder-slate-400 transition"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#050a1a] hover:bg-[#2455FF] text-white font-mono text-[10px] uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 font-semibold"
                    >
                      Subscribe
                      <Send className="h-3 w-3" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="newsletter-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/5 text-[11px] text-emerald-700 leading-normal flex items-start gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <div className="font-bold">✅ Subscribed Successfully</div>
                      Welcome to the Lupus AI Lab network.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mid bar for Social Icons & App Downloads */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-b border-[#2455FF]/10 py-4 mb-4 text-left">
          
          {/* Circular social icons with rich micro-interactions */}
          <div className="flex items-center gap-3">
            {[
              { icon: Linkedin, name: "LinkedIn", href: "https://linkedin.com" },
              { icon: Github, name: "GitHub", href: "https://github.com" },
              { icon: Instagram, name: "Instagram", href: "https://instagram.com" },
              { icon: Mail, name: "Email", href: "mailto:hello@lumi.ai" },
              { icon: Youtube, name: "YouTube", href: "https://youtube.com" },
            ].map((soc) => {
              const Icon = soc.icon;
              return (
                <motion.a
                  key={soc.name}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="h-9 w-9 rounded-full bg-slate-50 border border-[#2455FF]/12 flex items-center justify-center text-slate-600 hover:text-white hover:bg-[#2455FF] hover:shadow-[0_0_12px_rgba(36,85,255,0.45)] transition-all duration-300"
                  aria-label={soc.name}
                >
                  <Icon className="h-4.5 w-4.5" />
                </motion.a>
              );
            })}
          </div>

          {/* Reserved area for App downloads */}
          <div className="flex items-center gap-4 text-xs">
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
              App Downloads:
            </span>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-[#2455FF]/8 text-slate-400 font-mono text-[9.5px] uppercase select-none">
                Google Play (Soon)
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-[#2455FF]/8 text-slate-400 font-mono text-[9.5px] uppercase select-none">
                App Store (Soon)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright details strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-slate-450 uppercase tracking-widest">
          <div>
            © 2026 LUMI AI Labs. All Rights Reserved.
          </div>
          <div className="flex items-center gap-1.5 text-[9.5px]">
            Built with <span className="text-rose-500 animate-pulse">❤️</span> in Hyderabad, India
          </div>
          <div className="flex items-center gap-3 text-[9.5px] font-semibold">
            <span>Version 1.0.0</span>
            <span className="text-[#2455FF]">|</span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              System Status: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
