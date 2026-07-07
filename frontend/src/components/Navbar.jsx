import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  LogOut,
  LayoutDashboard,
  User,
  Settings,
  Bell,
  CreditCard,
  HelpCircle,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { toast } from "sonner";

const NAV_ITEMS = [
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Team", href: "/#team" },
  { label: "HQ's", href: "/#hq" },
  { label: "FAQ's", href: "/#faq" },
  { label: "Reviews", href: "/#reviews" },
  { label: "AI Infra", href: "/ai-infra", isRoute: true },
];

const Avatar = ({ user, size = "h-8 w-8", textClass = "text-[12px]" }) => {
  const [hasError, setHasError] = useState(false);
  const storedAvatar = typeof window !== "undefined" ? localStorage.getItem("lumi.avatar.url") : null;
  const picture = storedAvatar || user?.picture || user?.customPicture;

  if (picture && !hasError) {
    return (
      <img
        src={picture}
        alt={user.name}
        onError={() => setHasError(true)}
        className={`${size} rounded-full object-cover ring-2 ring-[#2455FF]/30`}
        draggable="false"
      />
    );
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-[#2455FF] to-[#00e5ff] text-white flex items-center justify-center font-display font-bold shadow-sm ring-2 ring-[#2455FF]/30 ${textClass}`}>
      {initial}
    </div>
  );
};

export const Navbar = ({ user, onLoginClick, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownOpen]);

  // Handle Escape key to close the dropdown
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    if (dropdownOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropdownOpen]);

  const handleNavClick = (e, item) => {
    if (item.isRoute) {
      e.preventDefault();
      navigate(item.href);
      return;
    }
    // If it's a hash link, and we are not on the home page, redirect to home page with hash
    if (!isHome) {
      e.preventDefault();
      navigate(item.href);
    }
  };

  const getRoleLabel = (role) => {
    if (role === "SUPER_ADMIN") return "Admin";
    if (role === "DEVELOPER") return "Developer";
    return "Client";
  };


  const menuItems = [
    {
      label: "My Dashboard",
      icon: LayoutDashboard,
      onClick: () => {
        setDropdownOpen(false);
        navigate("/account?tab=dashboard");
      },
    },
    {
      label: "My Profile",
      icon: User,
      onClick: () => {
        setDropdownOpen(false);
        navigate("/account?tab=profile");
      },
    },
    {
      label: "Account Settings",
      icon: Settings,
      onClick: () => {
        setDropdownOpen(false);
        navigate("/account?tab=settings");
      },
    },
    {
      label: "Notifications",
      icon: Bell,
      onClick: () => {
        setDropdownOpen(false);
        navigate("/account?tab=notifications");
      },
    },
    {
      label: "Billing",
      icon: CreditCard,
      onClick: () => {
        setDropdownOpen(false);
        navigate("/account?tab=billing");
      },
    },
    {
      label: "Help & Support",
      icon: HelpCircle,
      onClick: () => {
        setDropdownOpen(false);
        navigate("/account?tab=support");
      },
    },
  ];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed top-0 inset-x-0 z-50"
      data-testid="lumi-navbar"
    >
      <div className="mx-auto mt-4 max-w-[1320px] px-4 relative">
        <div className="glass-strong rounded-full px-3 py-2 flex items-center gap-4">
          {/* ============ LEFT — LUMI AI | LUPUS AI LABS ============ */}
          <div
            className="flex items-center gap-3 pl-2 pr-2 cursor-pointer"
            onClick={() => navigate("/")}
            data-testid="navbar-brand-left"
          >
            {/* LUMI logomark */}
            <div className="flex items-center gap-2">
              <span className="font-cine text-[16px] tracking-[0.14em] text-[#050a1a] leading-none">
                LUMI&nbsp;AI
              </span>
            </div>

            <span className="hidden sm:block h-5 w-px bg-[#2455FF]/30" />

            {/* LUPUS AI LABS — accent block */}
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
                onClick={(e) => handleNavClick(e, item)}
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

          {/* ============ RIGHT — User Avatar or Say Your Name ============ */}
          <div className="flex items-center gap-2">
            {!user ? (
              <button
                onClick={onLoginClick}
                data-testid="navbar-say-your-name-btn"
                className="group relative inline-flex items-center gap-2 rounded-2xl bg-[#050a1a] text-white pl-3 sm:pl-4 pr-1.5 sm:pr-2 py-1.5 sm:py-2 text-[11px] sm:text-[13px] font-semibold ring-lumi hover:bg-[#0b1530] transition-colors"
              >
                <span className="relative z-10 font-cine tracking-[0.06em] sm:tracking-[0.14em]">
                  Say&nbsp;Your&nbsp;Name
                </span>
                <span className="relative z-10 inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-xl bg-[#2455FF]">
                  <ArrowUpRight
                    className="h-3 w-3 sm:h-4 sm:w-4 text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={2.4}
                  />
                </span>
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar Button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 focus:outline-none transition group"
                  data-testid="navbar-avatar-btn"
                  aria-expanded={dropdownOpen}
                >
                  <div className="relative">
                    <Avatar user={user} size="h-9 w-9" textClass="text-[14px]" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#25D366] ring-2 ring-white" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#050a1a]/40 group-hover:text-[#2455FF] transition-colors" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-64 glass-strong rounded-2xl shadow-[0_24px_60px_-15px_rgba(36,85,255,0.3)] border border-[#2455FF]/15 py-1 z-50 overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3.5 border-b border-[#2455FF]/10 flex items-center gap-3 bg-white/50">
                        <Avatar user={user} size="h-10 w-10" textClass="text-[16px]" />
                        <div className="leading-tight overflow-hidden flex-1">
                          <div className="font-cine text-[14.5px] tracking-[0.1em] text-[#050a1a] font-bold truncate">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-[#050a1a]/55 truncate">
                            {user.email || `${user.name.toLowerCase().replace(/\s+/g, "")}@lumi.ai`}
                          </div>
                          <div className="mt-1.5 inline-flex items-center rounded-full bg-[#2455FF]/8 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#2455FF] font-semibold leading-none">
                            {getRoleLabel(user.role)}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown List Items */}
                      <div className="p-1 space-y-0.5">
                        {menuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.label}
                              onClick={item.onClick}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#050a1a]/70 hover:text-[#2455FF] hover:bg-[#2455FF]/5 rounded-xl transition-all"
                            >
                              <Icon className="h-4 w-4 shrink-0 opacity-70" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="h-px bg-[#2455FF]/10 my-1" />

                      {/* Logout Action */}
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Hamburger Button for Mobile/Tablet */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#050a1a]/5 hover:bg-[#050a1a]/10 text-[#050a1a] transition focus:outline-none focus:ring-2 focus:ring-[#2455FF]/40"
              aria-label="Toggle menu"
              data-testid="navbar-mobile-toggle"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute top-full left-4 right-4 mt-2 glass-strong rounded-3xl p-4 border border-[#2455FF]/15 z-40 lg:hidden overflow-hidden shadow-2xl"
              data-testid="navbar-mobile-drawer"
            >
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleNavClick(e, item);
                    }}
                    className="px-4 py-3 rounded-xl hover:bg-[#2455FF]/5 text-[#050a1a]/70 hover:text-[#2455FF] transition-all font-display text-[16px] sm:text-[18px] tracking-[0.05em]"
                    data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/[^a-z]/g, "")}`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sliding Notifications Drawer */}
        <AnimatePresence>
          {isNotificationsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[160] flex justify-end bg-[#050a1a]/30 backdrop-blur-sm"
            >
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="absolute inset-0 cursor-default outline-none bg-transparent border-0"
                aria-label="Close notifications overlay"
              />
              
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="w-full max-w-[360px] h-full bg-white/95 dark:bg-[#050a1a]/95 border-l border-[#2455FF]/12 shadow-2xl relative z-10 flex flex-col p-5 text-left"
              >
                <div className="flex items-center justify-between border-b border-[#2455FF]/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#2455FF]" />
                    <span className="font-cine text-[14px] tracking-wider text-[#050a1a] dark:text-white uppercase font-bold">
                      System logs & alerts
                    </span>
                  </div>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 transition"
                    aria-label="Close notifications"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  <div className="p-3 rounded-xl border border-[#2455FF]/15 bg-[#2455FF]/5 text-xs space-y-1">
                    <div className="flex justify-between font-mono text-[9px] text-[#2455FF] font-semibold">
                      <span>INTAKE ENGINE STATUS</span>
                      <span>JUST NOW</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-350 leading-normal">
                      AI session intake analysis completed. Product Requirements Document (PRD) is compiled and ready for review in Studio.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 text-xs space-y-1">
                    <div className="flex justify-between font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>SOW CONTRACT SIGNED</span>
                      <span>1 hour ago</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-350 leading-normal">
                      Super Admin approved milestone and signed Statement of Work contract terms for staged workspace node.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-cyan-500/15 bg-cyan-500/5 text-xs space-y-1">
                    <div className="flex justify-between font-mono text-[9px] text-cyan-600 dark:text-cyan-400 font-semibold">
                      <span>GPU CLUSTER ESTIMATOR</span>
                      <span>2 hours ago</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-350 leading-normal">
                      Interactive custom compute deployment configurations registered successfully on AI Infra console.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toast.success("Logs cleared.");
                    setIsNotificationsOpen(false);
                  }}
                  className="w-full py-2.5 bg-[#2455FF] hover:bg-[#1a44e0] text-white font-mono text-xs uppercase tracking-wider rounded-xl transition font-semibold"
                >
                  Clear all alerts
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Navbar;
