import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Video,
  Globe,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "./Navbar";
import { useUser } from "@/lib/userStore";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api`;

const DISCUSSION_TOPICS = [
  "AI Chatbot",
  "Voice AI Agent",
  "AI Automation",
  "SaaS Product Development",
  "Custom Software Development",
  "Enterprise AI Solutions",
  "Web Development",
  "Mobile App Development",
  "Cloud & DevOps",
  "Cybersecurity",
  "AI Consulting",
  "B2B Business Consultation",
  "Startup MVP Development",
  "Digital Transformation",
  "Other",
];

const EXPERTS = [
  { role: "Business Consultant", icon: "👨💼", desc: "Expert in business strategy & MVP scoping." },
  { role: "AI Consultant", icon: "🧠", desc: "Specialist in enterprise AI strategy & architectures." },
  { role: "Full Stack Developer", icon: "💻", desc: "Expert in React, Node, and scaling web apps." },
  { role: "AI/ML Engineer", icon: "🤖", desc: "Specialist in fine-tuning LLMs & NLP systems." },
  { role: "Cloud Engineer", icon: "☁", desc: "Expert in AWS, GCP, and Kubernetes pipelines." },
  { role: "DevOps Engineer", icon: "⚙", desc: "Specialist in CI/CD, automation & infrastructure security." },
  { role: "Solutions Architect", icon: "🏗", desc: "Designer of reliable, complex cloud architectures." },
  { role: "Senior Developer", icon: "👨💻", desc: "Full stack leader specializing in high-performance apps." },
  { role: "Team Lead", icon: "👨💼", desc: "Coordinator of development execution and sprint targets." },
  { role: "Sales Representative", icon: "👥", desc: "Point-of-contact for commercial packages & custom SOW pricing." },
];

const PLATFORMS = [
  { name: "Google Meet", desc: "Video call via Google Meet (Recommended)", isDefault: true, icon: "Google Meet" },
  { name: "Zoom", desc: "Video call via Zoom Client", icon: "Zoom" },
  { name: "Microsoft Teams", desc: "Video call via MS Teams Suite", icon: "Teams" },
  { name: "Phone Call", desc: "Traditional cellular voice call", icon: "Phone" },
];

const TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "02:00 PM",
  "04:00 PM",
  "06:00 PM",
];

export const ScheduleMeetingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useUser();
  
  // Form State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    companyName: "",
    companyWebsite: "",
    country: "",
    topics: [],
    expert: "Suggest the Best Expert for Me",
    platform: "Google Meet",
    date: "",
    timeSlot: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    description: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // Calendar Helper variables
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Prepopulate if user details change
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Generate calendar days for the current month view
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const numberOfDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Add empty slots for days of the week before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    // Add day numbers
    for (let day = 1; day <= numberOfDays; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleMonthChange = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const isDateSelectable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only allow future dates
    if (date < today) return false;
    
    // Disable Sundays (Day 0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return false;
    
    return true;
  };

  const handleDateSelect = (date) => {
    if (!isDateSelectable(date)) return;
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setFormData({ ...formData, date: formattedDate });
  };

  const toggleTopic = (topic) => {
    const currentTopics = [...formData.topics];
    if (currentTopics.includes(topic)) {
      setFormData({ ...formData, topics: currentTopics.filter((t) => t !== topic) });
    } else {
      setFormData({ ...formData, topics: [...currentTopics, topic] });
    }
  };

  const nextStep = () => {
    // Validate Step 1
    if (step === 1) {
      if (!formData.name.trim()) return toast.error("Full name is required.");
      if (!formData.email.trim()) return toast.error("Business email is required.");
      if (!formData.phone.trim()) return toast.error("Mobile number is required.");
      if (!formData.country.trim()) return toast.error("Country is required.");
    }
    // Validate Step 2
    if (step === 2 && formData.topics.length === 0) {
      return toast.error("Please select at least one topic to discuss.");
    }
    // Validate Step 5
    if (step === 5) {
      if (!formData.date) return toast.error("Please select a meeting date from the calendar.");
      if (!formData.timeSlot) return toast.error("Please choose a time slot.");
    }

    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/bookings`, formData);
      setSubmitted(true);
      toast.success("Meeting Request Submitted Successfully!");
    } catch (err) {
      toast.error("Failed to book meeting. Please check your connection and try again.");
    }
  };

  const logout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <div className="relative w-full bg-white min-h-screen flex flex-col">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bp-grid pointer-events-none opacity-30" aria-hidden="true" />
      <div className="absolute inset-0 bp-wash pointer-events-none" aria-hidden="true" />

      {/* Focused Booking Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-5 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="font-display text-[20px] tracking-[0.08em] text-[#050a1a] leading-none font-black">
            LUMI&nbsp;<span className="text-[#2455FF]">AI</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
        </div>
        <button
          onClick={() => navigate("/")}
          className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2455FF]/15 bg-white/50 hover:bg-[#2455FF]/5 text-xs font-semibold text-slate-700 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-6 pb-12 relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-strong rounded-3xl p-6 sm:p-8 border border-[#2455FF]/18 shadow-2xl relative bracket"
            >
              {/* Stepper Header */}
              <div className="mb-8">
                <div className="flex justify-between items-center text-xs font-mono uppercase tracking-[0.2em] text-[#2455FF] font-semibold mb-2">
                  <span>Discovery Meeting Request</span>
                  <span>Step {step} of 7</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-[#2455FF]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2455FF] to-[#00E5FF] transition-all duration-300"
                    style={{ width: `${(step / 7) * 100}%` }}
                  />
                </div>
              </div>

              {/* Steps Layout */}
              <div className="min-h-[360px] flex flex-col justify-between">
                <div>
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div className="text-left">
                        <h2 className="font-cine text-3xl tracking-wide text-[#050a1a] font-bold">
                          Basic Details
                        </h2>
                        <p className="text-xs text-[#050a1a]/55 font-mono uppercase mt-1">
                          Let's introduce ourselves
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase text-[#050a1a]/60">Full Name *</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <UserIcon className="h-4 w-4 text-[#2455FF]/65" />
                            </span>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="e.g. Jesse Pinkman"
                              className="w-full bg-white/50 border border-[#2455FF]/15 focus:border-[#2455FF] focus:ring-1 focus:ring-[#2455FF] outline-none rounded-xl py-2.5 pl-9 pr-4 text-sm font-sans placeholder-slate-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase text-[#050a1a]/60">Business Email *</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-4 w-4 text-[#2455FF]/65" />
                            </span>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="e.g. business@lumi.ai"
                              className="w-full bg-white/50 border border-[#2455FF]/15 focus:border-[#2455FF] focus:ring-1 focus:ring-[#2455FF] outline-none rounded-xl py-2.5 pl-9 pr-4 text-sm font-sans placeholder-slate-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase text-[#050a1a]/60">Mobile Number *</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-4 w-4 text-[#2455FF]/65" />
                            </span>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="e.g. +91 98765 43210"
                              className="w-full bg-white/50 border border-[#2455FF]/15 focus:border-[#2455FF] focus:ring-1 focus:ring-[#2455FF] outline-none rounded-xl py-2.5 pl-9 pr-4 text-sm font-sans placeholder-slate-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase text-[#050a1a]/60">Company Name *</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Building className="h-4 w-4 text-[#2455FF]/65" />
                            </span>
                            <input
                              type="text"
                              value={formData.companyName}
                              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                              placeholder="e.g. Lupus Labs Inc."
                              className="w-full bg-white/50 border border-[#2455FF]/15 focus:border-[#2455FF] focus:ring-1 focus:ring-[#2455FF] outline-none rounded-xl py-2.5 pl-9 pr-4 text-sm font-sans placeholder-slate-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase text-[#050a1a]/60">Company Website (Optional)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Globe className="h-4 w-4 text-[#2455FF]/65" />
                            </span>
                            <input
                              type="url"
                              value={formData.companyWebsite}
                              onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                              placeholder="e.g. https://lumi.ai"
                              className="w-full bg-white/50 border border-[#2455FF]/15 focus:border-[#2455FF] focus:ring-1 focus:ring-[#2455FF] outline-none rounded-xl py-2.5 pl-9 pr-4 text-sm font-sans placeholder-slate-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase text-[#050a1a]/60">Country *</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Globe className="h-4 w-4 text-[#2455FF]/65" />
                            </span>
                            <input
                              type="text"
                              value={formData.country}
                              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                              placeholder="e.g. India"
                              className="w-full bg-white/50 border border-[#2455FF]/15 focus:border-[#2455FF] focus:ring-1 focus:ring-[#2455FF] outline-none rounded-xl py-2.5 pl-9 pr-4 text-sm font-sans placeholder-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-left">
                        <h2 className="font-cine text-3xl tracking-wide text-[#050a1a] font-bold">
                          What do you want to discuss?
                        </h2>
                        <p className="text-xs text-[#050a1a]/55 font-mono uppercase mt-1">
                          Select all that apply to your requirements
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left max-h-[300px] overflow-y-auto pr-1">
                        {DISCUSSION_TOPICS.map((topic) => {
                          const isSelected = formData.topics.includes(topic);
                          return (
                            <button
                              key={topic}
                              type="button"
                              onClick={() => toggleTopic(topic)}
                              className={`p-3 rounded-xl border transition text-xs font-medium flex items-center justify-between group ${
                                isSelected
                                  ? "bg-[#2455FF]/8 border-[#2455FF] text-[#2455FF]"
                                  : "bg-white/40 border-[#2455FF]/15 text-[#050a1a]/70 hover:bg-[#2455FF]/5 hover:border-[#2455FF]/30"
                              }`}
                            >
                              <span>{topic}</span>
                              <span
                                className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition shrink-0 ${
                                  isSelected
                                    ? "bg-[#2455FF] border-[#2455FF] text-white"
                                    : "border-slate-300 group-hover:border-slate-400"
                                }`}
                              >
                                {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-left">
                        <h2 className="font-cine text-3xl tracking-wide text-[#050a1a] font-bold">
                          Who would you like to meet?
                        </h2>
                        <p className="text-xs text-[#050a1a]/55 font-mono uppercase mt-1">
                          Choose your preferred expert host
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-h-[290px] overflow-y-auto pr-1">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, expert: "Suggest the Best Expert for Me" })}
                          className={`p-3.5 rounded-xl border transition text-left flex items-start gap-3 ${
                            formData.expert === "Suggest the Best Expert for Me"
                              ? "bg-[#2455FF]/8 border-[#2455FF] text-[#2455FF]"
                              : "bg-white/40 border-[#2455FF]/15 text-[#050a1a]/70 hover:bg-[#2455FF]/5"
                          }`}
                        >
                          <span className="text-2xl mt-0.5">🌟</span>
                          <div>
                            <div className="font-semibold text-sm">Suggest the Best Expert for Me</div>
                            <p className="text-[11px] opacity-75 mt-0.5">We will match you automatically based on your topics.</p>
                          </div>
                        </button>

                        {EXPERTS.map((e) => {
                          const isSelected = formData.expert === e.role;
                          return (
                            <button
                              key={e.role}
                              type="button"
                              onClick={() => setFormData({ ...formData, expert: e.role })}
                              className={`p-3.5 rounded-xl border transition text-left flex items-start gap-3 ${
                                isSelected
                                  ? "bg-[#2455FF]/8 border-[#2455FF] text-[#2455FF]"
                                  : "bg-white/40 border-[#2455FF]/15 text-[#050a1a]/70 hover:bg-[#2455FF]/5"
                              }`}
                            >
                              <span className="text-2xl mt-0.5">{e.icon}</span>
                              <div>
                                <div className="font-semibold text-sm">{e.role}</div>
                                <p className="text-[11px] opacity-75 mt-0.5">{e.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-left">
                        <h2 className="font-cine text-3xl tracking-wide text-[#050a1a] font-bold">
                          Meeting Platform
                        </h2>
                        <p className="text-xs text-[#050a1a]/55 font-mono uppercase mt-1">
                          Select the virtual room mode
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                        {PLATFORMS.map((p) => {
                          const isSelected = formData.platform === p.name;
                          return (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => setFormData({ ...formData, platform: p.name })}
                              className={`p-4 rounded-xl border transition text-left flex items-center justify-between group ${
                                isSelected
                                  ? "bg-[#2455FF]/8 border-[#2455FF] text-[#2455FF]"
                                  : "bg-white/40 border-[#2455FF]/15 text-[#050a1a]/70 hover:bg-[#2455FF]/5"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="p-2 bg-[#2455FF]/8 rounded-lg group-hover:bg-[#2455FF]/15 transition">
                                  <Video className="h-4.5 w-4.5 text-[#2455FF]" />
                                </span>
                                <div>
                                  <div className="font-semibold text-sm flex items-center gap-1.5">
                                    {p.name}
                                    {p.isDefault && (
                                      <span className="font-mono text-[8px] tracking-wider uppercase bg-[#2455FF]/15 text-[#2455FF] px-1.5 py-0.5 rounded font-bold">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] opacity-75 mt-0.5">{p.desc}</p>
                                </div>
                              </div>
                              <span
                                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                                  isSelected ? "border-[#2455FF]" : "border-slate-300"
                                }`}
                              >
                                {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-[#2455FF]" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {step === 5 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-left">
                        <h2 className="font-cine text-3xl tracking-wide text-[#050a1a] font-bold">
                          Date & Time
                        </h2>
                        <p className="text-xs text-[#050a1a]/55 font-mono uppercase mt-1">
                          Select slot in your time zone
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {/* Custom Calendar Card */}
                        <div className="p-4 bg-white/40 border border-[#2455FF]/15 rounded-2xl flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-semibold text-sm capitalize text-[#050a1a]">
                              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleMonthChange(-1)}
                                className="p-1 rounded-lg border border-[#2455FF]/15 bg-white/50 hover:bg-[#2455FF]/5 text-slate-700"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMonthChange(1)}
                                className="p-1 rounded-lg border border-[#2455FF]/15 bg-white/50 hover:bg-[#2455FF]/5 text-slate-700"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Days Header */}
                          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                            <span>Su</span>
                            <span>Mo</span>
                            <span>Tu</span>
                            <span>We</span>
                            <span>Th</span>
                            <span>Fr</span>
                            <span>Sa</span>
                          </div>

                          {/* Days Grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth(currentMonth).map((date, idx) => {
                              if (!date) return <div key={`empty-${idx}`} />;
                              
                              const isSelectable = isDateSelectable(date);
                              const isSelected =
                                formData.date ===
                                date.toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                });

                              return (
                                <button
                                  key={date.toISOString()}
                                  type="button"
                                  disabled={!isSelectable}
                                  onClick={() => handleDateSelect(date)}
                                  className={`aspect-square p-1 text-[11px] rounded-lg transition-colors font-medium flex items-center justify-center ${
                                    isSelected
                                      ? "bg-[#2455FF] text-white"
                                      : isSelectable
                                      ? "bg-white/60 hover:bg-[#2455FF]/10 text-[#050a1a] border border-[#2455FF]/10"
                                      : "text-slate-300 cursor-not-allowed opacity-40"
                                  }`}
                                >
                                  {date.getDate()}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Slots & Timezone */}
                        <div className="space-y-4 flex flex-col justify-between">
                          <div className="space-y-2">
                            <label className="text-xs font-mono uppercase text-[#050a1a]/60">Select Time Slot</label>
                            <div className="grid grid-cols-3 gap-2">
                              {TIME_SLOTS.map((slot) => {
                                const isSelected = formData.timeSlot === slot;
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, timeSlot: slot })}
                                    className={`py-2 rounded-xl border text-xs font-semibold tracking-wide transition text-center ${
                                      isSelected
                                        ? "bg-[#2455FF] border-[#2455FF] text-white"
                                        : "bg-white/60 border-[#2455FF]/12 text-[#050a1a]/70 hover:bg-[#2455FF]/5"
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1.5 mt-2">
                            <label className="text-xs font-mono uppercase text-[#050a1a]/60">Your Time Zone</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-4 w-4 text-[#2455FF]/65" />
                              </span>
                              <input
                                type="text"
                                value={formData.timezone}
                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                placeholder="Time Zone"
                                className="w-full bg-white/50 border border-[#2455FF]/15 focus:border-[#2455FF] focus:ring-1 focus:ring-[#2455FF] outline-none rounded-xl py-2.5 pl-9 pr-4 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 6 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-left">
                        <h2 className="font-cine text-3xl tracking-wide text-[#050a1a] font-bold">
                          Project Description
                        </h2>
                        <p className="text-xs text-[#050a1a]/55 font-mono uppercase mt-1">
                          Tell us about your expectations
                        </p>
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-xs font-mono uppercase text-[#050a1a]/60">Project Goals & Details</label>
                        <textarea
                          rows={6}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Tell us about your project, business goals, expected features, timeline, and any specific requirements."
                          className="w-full bg-white/50 border border-[#2455FF]/15 focus:border-[#2455FF] focus:ring-1 focus:ring-[#2455FF] outline-none rounded-xl p-4 text-sm font-sans placeholder-slate-400 resize-none leading-relaxed"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 7 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-left">
                        <h2 className="font-cine text-3xl tracking-wide text-[#050a1a] font-bold">
                          Review Request
                        </h2>
                        <p className="text-xs text-[#050a1a]/55 font-mono uppercase mt-1">
                          Confirm summary details before request submission
                        </p>
                      </div>

                      <div className="glass rounded-2xl p-5 border border-[#2455FF]/15 text-left grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-2">
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#2455FF]/80 font-bold block">Meeting With</span>
                            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{formData.expert}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#2455FF]/80 font-bold block">Meeting Mode</span>
                            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{formData.platform}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#2455FF]/80 font-bold block">Selected Date</span>
                            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{formData.date || "Not Selected"}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#2455FF]/80 font-bold block">Selected Time</span>
                            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                              {formData.timeSlot ? `${formData.timeSlot} (${formData.timezone})` : "Not Selected"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#2455FF]/80 font-bold block">Contact Information</span>
                            <div className="mt-0.5 text-slate-800 space-y-0.5">
                              <div className="font-bold text-sm">{formData.name}</div>
                              <div>{formData.email}</div>
                              <div>{formData.phone}</div>
                              {formData.companyName && (
                                <div className="italic text-slate-500 mt-1">
                                  {formData.companyName} {formData.companyWebsite && `(${formData.companyWebsite})`}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#2455FF]/80 font-bold block">Discussion Topics</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formData.topics.map((t) => (
                                <span key={t} className="px-2 py-0.5 bg-[#2455FF]/8 border border-[#2455FF]/12 text-[10px] font-semibold text-[#2455FF] rounded-md">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {formData.description && (
                          <div className="md:col-span-2 border-t border-[#2455FF]/10 pt-3">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-[#2455FF]/80 font-bold block">Project Description Summary</span>
                            <p className="mt-1 text-slate-700 italic leading-relaxed text-[11.5px] whitespace-pre-wrap">
                              "{formData.description}"
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center border-t border-[#2455FF]/12 pt-6 mt-8">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Cancel
                    </button>
                  )}

                  {step < 7 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="group inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2455FF] hover:bg-[#1a44e0] transition-colors text-white px-5 py-2.5 text-[13px] font-semibold shadow"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#2455FF] hover:bg-[#1a44e0] transition-colors text-white px-6 py-2.5 text-[13px] font-semibold shadow"
                    >
                      Request Meeting
                      <ShieldCheck className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-3xl p-8 border border-[#2455FF]/18 shadow-2xl text-center bracket max-w-lg mx-auto"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-emerald-50 mb-6">
                <CheckCircle className="h-8 w-8 text-emerald-500" strokeWidth={2.4} />
              </div>
              <h2 className="font-cine text-3xl tracking-wide text-[#050a1a] font-bold">
                Request Submitted
              </h2>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[#2455FF]/85 font-semibold">
                Status: Awaiting review
              </p>
              
              <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-slate-700 text-xs leading-relaxed text-left max-w-sm mx-auto">
                <div className="font-bold text-slate-900 mb-1">
                  ✅ Meeting Request Submitted Successfully
                </div>
                Our team will review your request and send a confirmation along with the meeting invitation.
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-2.5 bg-[#050a1a] hover:bg-[#0b1530] text-white font-cine tracking-wider text-[15px] font-semibold rounded-xl transition shadow"
                >
                  Return to Lab Home
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setStep(1);
                    setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                      phone: user?.phone || "",
                      companyName: "",
                      companyWebsite: "",
                      country: "",
                      topics: [],
                      expert: "Suggest the Best Expert for Me",
                      platform: "Google Meet",
                      date: "",
                      timeSlot: "",
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
                      description: "",
                    });
                  }}
                  className="w-full py-2.5 bg-white border border-[#2455FF]/18 text-[#2455FF] hover:bg-[#2455FF]/5 font-mono text-xs uppercase tracking-wider rounded-xl transition font-semibold"
                >
                  Schedule Another Meeting
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
};

export default ScheduleMeetingPage;
