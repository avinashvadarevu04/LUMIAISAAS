import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import UserAvatar from "./UserAvatar";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Team", href: "#team" },
  { label: "HQ's", href: "#hq" },
  { label: "FAQ's", href: "#faq" },
  { label: "Reviews", href: "#reviews" },
];

export const Navbar = ({ user, onLoginClick, onLogout, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on Escape + when resizing to lg.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed top-0 inset-x-0 z-50"
      data-testid="lumi-navbar"
    >
      <div className="mx-auto mt-4 max-w-[1320px] px-3 sm:px-4">
        <div className="glass-strong rounded-full px-2.5 sm:px-3 py-2 flex items-center gap-2 sm:gap-4">
          {/* ============ LEFT — LUMI AI | LUPUS AI LABS ============ */}
          <div
            className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 pr-1 sm:pr-2 min-w-0"
            data-testid="navbar-brand-left"
          >
            {/* LUMI logomark */}
            <div className="flex items-center gap-2">
              <span className="font-cine text-[15px] sm:text-[16px] tracking-[0.14em] text-[#050a1a] leading-none">
                LUMI&nbsp;AI
              </span>
            </div>

            <span className="h-5 w-px bg-[#2455FF]/30 hidden sm:inline-block" />

            {/* LUPUS AI LABS — accent block (hidden on small screens) */}
            <div className="hidden sm:flex items-center">
              <span className="relative inline-flex font-display text-[18px] sm:text-[19px] tracking-[0.05em] leading-none">
                <span className="text-[#2455FF]">LUPUS</span>
                <span className="ml-1 text-[#050a1a]">AI&nbsp;LABS</span>
              </span>
            </div>
          </div>

          {/* ============ CENTER — Nav links (truly centered) ============ */}
          <nav
            className="hidden lg:flex items-center gap-1 mx-auto"
            data-testid="navbar-links"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/[^a-z]/g, "")}`}
                className="group relative px-3.5 py-2 text-[13px] font-medium text-[#050a1a]/70 hover:text-[#2455FF] transition-colors"
              >
                <span className="relative">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#2455FF] transition-all duration-300 group-hover:w-full" />
                </span>
              </a>
            ))}
          </nav>

          {/* spacer for mobile when nav hidden */}
          <div className="lg:hidden flex-1" />

          {/* ============ RIGHT — Avatar + (mobile) hamburger ============ */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Compact Dashboard link — visible on sm+ when logged out. */}
            {!user && (
              <a
                href="/dashboard"
                className="hidden sm:inline-flex group relative items-center gap-1.5 rounded-2xl border border-[#2455FF]/20 bg-white/80 hover:bg-[#2455FF]/5 px-3 py-1.5 text-[13px] font-semibold text-[#050a1a] transition-all duration-300 shadow-sm"
                data-testid="navbar-dashboard-btn"
              >
                <span className="font-cine tracking-[0.12em] text-[#050a1a]">
                  Dashboard
                </span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 text-[#2455FF] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.4}
                />
              </a>
            )}

            <UserAvatar
              user={user}
              size={user ? "sm" : "md"}
              context="hero"
              onLoginClick={onLoginClick}
              onLogout={onLogout}
              onNavigate={onNavigate}
            />

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              data-testid="navbar-mobile-toggle"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 ring-1 ring-[#2455FF]/20 hover:bg-white text-[#050a1a]/70 hover:text-[#2455FF] transition"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ============ MOBILE DRAWER ============ */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-drawer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="lg:hidden mt-2 rounded-2xl glass-strong ring-1 ring-[#2455FF]/22 shadow-[0_24px_60px_-20px_rgba(36,85,255,0.4)] overflow-hidden"
              data-testid="navbar-mobile-drawer"
            >
              <div className="p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#2455FF]/70 px-2 py-1.5">
                  Navigate
                </div>
                <div className="flex flex-col">
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={closeMobile}
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(/[^a-z]/g, "")}`}
                      className="rounded-xl px-3 py-3 text-[14px] font-medium text-[#050a1a]/85 hover:bg-[#2455FF]/8 hover:text-[#2455FF] transition flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#2455FF]/12 p-3 space-y-1.5">
                <a
                  href="/dashboard"
                  onClick={closeMobile}
                  className="flex items-center justify-between rounded-xl bg-white/70 ring-1 ring-[#2455FF]/20 hover:bg-white px-3 py-2.5 text-[13.5px] font-semibold text-[#050a1a] transition"
                >
                  <span className="font-cine tracking-[0.12em]">Dashboard</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#2455FF]" />
                </a>
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      onLogout?.();
                    }}
                    data-testid="navbar-logout-btn"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3 py-2.5 text-[13.5px] font-semibold text-rose-600 hover:bg-rose-100 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      onLoginClick?.();
                    }}
                    data-testid="mobile-nav-signin"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2455FF] hover:bg-[#1a44e0] px-3 py-2.5 text-[13.5px] font-semibold text-white transition"
                  >
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Navbar;