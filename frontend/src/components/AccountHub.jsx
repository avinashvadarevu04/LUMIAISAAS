import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "@/lib/userStore";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { SHOW_AI_INFRA } from "../config";
import {
  LayoutDashboard,
  User,
  Settings,
  Bell,
  CreditCard,
  HelpCircle,
  ArrowRight,
  Database,
  Terminal,
  Activity,
  Plus,
  Compass,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  FolderDot,
  Trash2,
  Search,
  Upload,
  Shield,
  Sun,
  Moon,
  Sparkles,
  LifeBuoy
} from "lucide-react";

// Mock Data for Activities, Projects, Tasks
const RECENT_ACTIVITIES = [
  { id: 1, action: "Modified AI Studio config", time: "Just now", type: "studio" },
  { id: 2, action: "Viewed H100 GPU cluster stats", time: "30 mins ago", type: "infra" },
  { id: 3, action: "SOW milestone approval sent", time: "2 hours ago", type: "milestone" },
  { id: 4, action: "Signed SOW document", time: "1 day ago", type: "contract" }
];

const INITIAL_NOTIFICATIONS = [
  { id: "n1", category: "System", text: "LUMI platform upgraded to v1.2.5", read: false, time: "Just now" },
  { id: "n2", category: "Project", text: "Milestone 1 reviewed by client team", read: false, time: "2 hours ago" },
  { id: "n3", category: "PRD", text: "AI Studio PRD updated with Qdrant Vector DB details", read: true, time: "1 day ago" },
  { id: "n4", category: "Billing", text: "New invoice generated for subscription renewal", read: true, time: "3 days ago" },
  { id: "n5", category: "Security", text: "Successful login verified from IP 192.168.1.42", read: true, time: "4 days ago" }
];

const FAQS = [
  { q: "How do I allocate GPU nodes on LUMI AI?", a: "Go to the AI Infra console, choose your service card (e.g. H100 SXM5), specify your customized GPU core count and SSD requirements, and click 'Request Deploy'." },
  { q: "What is an MCP server?", a: "Model Context Protocol (MCP) nodes connect your custom LLMs to localized vector search caches, databases, or third-party APIs seamlessly." },
  { q: "Where can I view active Statements of Work?", a: "All active SOWs, milestone reviews, and change requests can be inspected inside the Deliveries & SOW Dashboard (/dashboard)." }
];

const AccountHub = () => {
  const [user, setUser] = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab state (default to profile, redirect dashboard to profile)
  const rawTab = searchParams.get("tab") || "profile";
  const activeTab = rawTab === "dashboard" ? "profile" : rawTab;

  // Shared states stored in local storage
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("lumi.profile.data");
    if (saved) return JSON.parse(saved);
    return {
      company: "Lupus Tech Labs",
      jobTitle: "Principal Architect",
      country: "United States",
      state: "California",
      timezone: "PST (GMT-8)",
      language: "English",
      bio: "Engineering cognitive pipelines and AI infrastructure systems.",
      twitter: "@lupus_labs",
      github: "github.com/lupus"
    };
  });

  const [settingsData, setSettingsData] = useState(() => {
    const saved = localStorage.getItem("lumi.settings.data");
    if (saved) return JSON.parse(saved);
    return {
      twoFactor: false,
      profileVisibility: "public",
      dashboardDensity: "cozy",
      preferredModel: "Claude 3.5 Sonnet",
      responseLength: 150
    };
  });

  const [avatarUrl, setAvatarUrl] = useState(() => {
    return localStorage.getItem("lumi.avatar.url") || "";
  });

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [notifSearch, setNotifSearch] = useState("");
  const [notifCategory, setNotifCategory] = useState("All");

  const [supportTickets, setSupportTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ subject: "", category: "billing", desc: "" });
  const [telemetry, setTelemetry] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    axios.get(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api/client-telemetry/${user.id}`)
      .then(res => {
        setTelemetry(res.data);
      })
      .catch(() => {});
  }, [user?.id]);

  // Sync back profile changes to store
  useEffect(() => {
    localStorage.setItem("lumi.profile.data", JSON.stringify(profileData));
  }, [profileData]);

  useEffect(() => {
    localStorage.setItem("lumi.settings.data", JSON.stringify(settingsData));
  }, [settingsData]);

  useEffect(() => {
    localStorage.setItem("lumi.avatar.url", avatarUrl);
  }, [avatarUrl]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050a1a] text-white p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-[#2455FF] mx-auto animate-bounce" />
          <h2 className="font-cine text-2xl tracking-widest">Authentication Required</h2>
          <p className="text-slate-400 font-mono text-xs">Please log in on the homepage to access your account profile console.</p>
          <button onClick={() => navigate("/")} className="px-5 py-2.5 bg-[#2455FF] hover:bg-[#1a44e0] text-white font-mono text-xs uppercase tracking-wider rounded-xl transition">
            Go to Lab Home
          </button>
        </div>
      </div>
    );
  }

  // Profile Picture Actions
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large", { description: "Maximum image file size is 2 MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        toast.success("Profile image updated.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarRemove = () => {
    setAvatarUrl("");
    toast.success("Profile image removed.");
  };

  // Support tickets
  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.desc.trim()) {
      toast.error("Incomplete fields", { description: "Subject and details are required." });
      return;
    }
    const ticket = {
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newTicket.subject,
      category: newTicket.category,
      desc: newTicket.desc,
      status: "OPEN",
      date: new Date().toLocaleDateString()
    };
    setSupportTickets([ticket, ...supportTickets]);
    setNewTicket({ subject: "", category: "billing", desc: "" });
    toast.success("Support ticket created", { description: `Ticket ID ${ticket.id} registered.` });
  };

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-[#050a1a] pb-12 relative overflow-hidden">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bp-grid pointer-events-none opacity-45" aria-hidden="true" />
      <div className="absolute inset-0 bp-wash pointer-events-none" aria-hidden="true" />

      <Navbar user={user} onLoginClick={() => {}} onLogout={() => { setUser(null); navigate("/"); }} />

      {/* Top Banner Grid */}
      <div className="relative pt-24 pb-6 bg-transparent">
        <div className="max-w-[1240px] mx-auto px-6 relative z-10">
          
          {/* User console Header Card */}
          <div className="glass rounded-3xl p-5 flex flex-wrap items-center justify-between gap-6 border border-[#2455FF]/15">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden ring-4 ring-[#2455FF]/30 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-[#2455FF] flex items-center justify-center text-white font-cine text-2xl font-bold">
                    {user.name?.[0] || "U"}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#25D366] ring-2 ring-white" />
              </div>
              <div className="text-left leading-tight">
                <div className="font-cine text-[20px] sm:text-[24px] tracking-wide text-[#050a1a] dark:text-white uppercase font-bold">
                  {user.name || "Lab User"}
                </div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#2455FF] font-semibold mt-0.5">
                  {user.email} · {user.role === "SUPER_ADMIN" ? "SUPER ADMIN" : user.role || "MEMBER"}
                </div>
              </div>
            </div>

            {/* Quick stats indicators */}
            <div className="flex flex-wrap gap-6 text-left">
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Account status</span>
                <span className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active Verified
                </span>
              </div>
              <div className="w-px h-8 bg-[#2455FF]/20 hidden sm:block" />
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Default Node Node</span>
                <span className="font-mono text-xs text-[#050a1a] dark:text-white font-semibold">lumi://use-west</span>
              </div>
            </div>
          </div>

          {/* Quick tab controls header */}
          <div className="flex flex-wrap gap-1 mt-6 pb-1">
            {[
              { key: "profile", label: "My Profile", icon: User },
              { key: "settings", label: "Account Settings", icon: Settings },
              { key: "notifications", label: "Notifications", icon: Bell },
              { key: "billing", label: "Billing Console", icon: CreditCard },
              { key: "support", label: "Support Center", icon: HelpCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 border ${
                    active
                      ? "bg-[#2455FF] border-[#2455FF] text-white font-bold"
                      : "bg-white/80 dark:bg-white/5 border-transparent hover:bg-[#2455FF]/8 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main body content tab router */}
      <div className="max-w-[1240px] mx-auto px-6 mt-8 w-full flex-1">
        
        {/* ================= TAB 1: MY PROFILE & PERSONAL DASHBOARD ================= */}
        {activeTab === "profile" && (
          <div className="space-y-6 max-w-[1240px] mx-auto">
            
            {/* statistics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass rounded-2xl p-4 text-left relative overflow-hidden border border-[#2455FF]/15">
                <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Active Workspace Projects</div>
                <div className="font-display text-3xl sm:text-4xl text-[#050a1a] dark:text-white mt-1">{telemetry ? telemetry.projects_count : 0}</div>
                <div className="font-mono text-[8px] text-emerald-600 mt-0.5">Live development units</div>
              </div>
              <div className="glass rounded-2xl p-4 text-left relative overflow-hidden border border-[#2455FF]/15">
                <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Completed PRDs</div>
                <div className="font-display text-3xl sm:text-4xl text-[#050a1a] dark:text-white mt-1">{telemetry ? telemetry.prds_count : 0}</div>
                <div className="font-mono text-[8px] text-slate-500 mt-0.5">Sent to build team</div>
              </div>
              <div className="glass rounded-2xl p-4 text-left relative overflow-hidden border border-[#2455FF]/15">
                <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Intake Chats</div>
                <div className="font-display text-3xl sm:text-4xl text-[#050a1a] dark:text-white mt-1">{telemetry ? telemetry.sessions_count : 0}</div>
                <div className="font-mono text-[8px] text-amber-600 mt-0.5">Workspace intake sessions</div>
              </div>
              <div className="glass rounded-2xl p-4 text-left relative overflow-hidden border border-[#2455FF]/15">
                <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Total Activities</div>
                <div className="font-display text-3xl sm:text-4xl text-[#050a1a] dark:text-white mt-1">{telemetry ? telemetry.activities?.length : 0}</div>
                <div className="font-mono text-[8px] text-[#2455FF] mt-0.5">Registered audit traces</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile Details Edit Card (Takes 2 columns) */}
              <div className="lg:col-span-2 glass rounded-3xl p-6 border border-[#2455FF]/15 text-left space-y-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2455FF] font-semibold mb-4">
                  Account Profile Identity
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Picture Upload Sidebar */}
                  <div className="flex flex-col items-center pr-4 space-y-4">
                    <div className="relative h-28 w-28 rounded-full overflow-hidden ring-4 ring-[#2455FF]/20 shadow-lg shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-[#2455FF] flex items-center justify-center text-white font-cine text-4xl font-bold">
                          {user.name?.[0] || "U"}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col w-full gap-2 px-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="py-1.5 px-3 rounded-lg bg-[#2455FF]/10 hover:bg-[#2455FF]/20 text-[#2455FF] font-mono text-[10.5px] font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        <Upload className="h-3 w-3" /> Change Picture
                      </button>
                      {avatarUrl && (
                        <button
                          onClick={handleAvatarRemove}
                          className="py-1.5 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-100/50 font-mono text-[10.5px] font-semibold transition flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Editable Fields Column */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Full Name</label>
                        <input
                          type="text"
                          value={user.name || ""}
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          className="w-full rounded-xl border dark:border-[#2455FF]/20 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Email Address</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="email"
                            value={user.email || ""}
                            disabled
                            className="flex-1 rounded-xl border border-slate-200 dark:border-[#2455FF]/20 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs text-slate-400 outline-none"
                          />
                          <span className="font-mono text-[8px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full shrink-0 uppercase tracking-wider font-semibold">
                            ✓ VERIFIED
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Mobile Number</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={user.phone || "+1 (555) 019-2834"}
                            disabled
                            className="flex-1 rounded-xl border border-slate-200 dark:border-[#2455FF]/20 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs text-slate-400 outline-none"
                          />
                          <span className="font-mono text-[8px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full shrink-0 uppercase tracking-wider font-semibold">
                            ✓ VERIFIED
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Company</label>
                        <input
                          type="text"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                          className="w-full rounded-xl border dark:border-[#2455FF]/20 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Job Title</label>
                        <input
                          type="text"
                          value={profileData.jobTitle}
                          onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                          className="w-full rounded-xl border dark:border-[#2455FF]/20 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Timezone</label>
                        <input
                          type="text"
                          value={profileData.timezone}
                          onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                          className="w-full rounded-xl border dark:border-[#2455FF]/20 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Country</label>
                        <input
                          type="text"
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                          className="w-full rounded-xl border dark:border-[#2455FF]/20 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">State</label>
                        <input
                          type="text"
                          value={profileData.state}
                          onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                          className="w-full rounded-xl border dark:border-[#2455FF]/20 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Bio</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="w-full h-16 rounded-xl border dark:border-[#2455FF]/20 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition resize-none"
                      />
                    </div>

                    <button
                      onClick={() => toast.success("Identity changes saved successfully.")}
                      className="px-5 py-2 bg-[#2455FF] hover:bg-[#1a44e0] text-white font-mono text-xs uppercase tracking-wider rounded-xl transition font-bold"
                    >
                      Save Profile Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Dashboard Activity / Operations (Takes 1 column) */}
              <div className="space-y-6">
                
                {/* Operations widget */}
                <div className="glass rounded-2xl p-5 border border-[#2455FF]/15 text-left">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2455FF] font-semibold border-b pb-2 mb-3">
                    Quick Operations
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => navigate("/studio")}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#2455FF]/5 border border-[#2455FF]/15 hover:bg-[#2455FF]/10 text-xs font-mono text-[#2455FF] uppercase tracking-wider font-semibold transition text-left flex items-center justify-between"
                    >
                      <span>Open Studio Intake</span>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#2455FF]/5 border border-[#2455FF]/15 hover:bg-[#2455FF]/10 text-xs font-mono text-[#2455FF] uppercase tracking-wider font-semibold transition text-left flex items-center justify-between"
                    >
                      <span>Check SOW Project Hub</span>
                      <Briefcase className="h-3.5 w-3.5" />
                    </button>
                    {SHOW_AI_INFRA && (
                      <button
                        onClick={() => navigate("/ai-infra")}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#2455FF]/5 border border-[#2455FF]/15 hover:bg-[#2455FF]/10 text-xs font-mono text-[#2455FF] uppercase tracking-wider font-semibold transition text-left flex items-center justify-between"
                      >
                        <span>Infra Services Marketplace</span>
                        <Database className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Active tasks widget */}
                <div className="glass rounded-2xl p-5 border border-[#2455FF]/15 text-left">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2455FF] font-semibold border-b pb-2 mb-3">
                    Pending Tasks
                  </div>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                      <div>
                        <span className="font-mono text-[8px] bg-[#2455FF]/10 text-[#2455FF] px-2 py-0.5 rounded font-bold uppercase tracking-wider">PROJECT ALPHA</span>
                        <div className="font-semibold text-xs text-[#050a1a] dark:text-white mt-1">Approve Milestone 2 SOW Contract terms</div>
                      </div>
                      <button onClick={() => navigate("/dashboard")} className="p-1.5 rounded-lg bg-[#2455FF] hover:bg-[#1a44e0] text-white transition">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {SHOW_AI_INFRA && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                        <div>
                          <span className="font-mono text-[8px] bg-[#2455FF]/10 text-[#2455FF] px-2 py-0.5 rounded font-bold uppercase tracking-wider">PROJECT BETA</span>
                          <div className="font-semibold text-xs text-[#050a1a] dark:text-white mt-1">Verify dynamic GPU nodes metrics</div>
                        </div>
                        <button onClick={() => navigate("/ai-infra")} className="p-1.5 rounded-lg bg-[#2455FF] hover:bg-[#1a44e0] text-white transition">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activities widget */}
                <div className="glass rounded-2xl p-5 border border-[#2455FF]/15 text-left">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2455FF] font-semibold border-b pb-2 mb-3">
                    Activity Logs
                  </div>
                  <div className="space-y-2.5">
                    {telemetry && telemetry.activities?.length > 0 ? (
                      telemetry.activities.map((act) => (
                        <div key={act.id} className="flex items-start gap-2.5 text-[11px] leading-normal">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#2455FF] mt-1.5 shrink-0" />
                          <div className="flex-1 flex justify-between gap-2">
                            <span className="text-[#050a1a] dark:text-white font-medium">{act.action}</span>
                            <span className="font-mono text-[8.5px] text-slate-400 shrink-0">
                              {new Date(act.time).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px]">No recent audit logs available.</span>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 3: ACCOUNT SETTINGS ================= */}
        {activeTab === "settings" && (
          <div className="glass rounded-3xl p-6 border border-[#2455FF]/15 text-left max-w-4xl mx-auto space-y-6">
            
            {/* Section 1: Security */}
            <div className="space-y-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2455FF] font-semibold mb-3">
                Security & Verification
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border dark:border-[#2455FF]/15 rounded-xl space-y-2">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Two-Factor Authentication (2FA)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#050a1a] dark:text-white/80">Require mobile verification code upon login</span>
                    <input
                      type="checkbox"
                      checked={settingsData.twoFactor}
                      onChange={(e) => setSettingsData({ ...settingsData, twoFactor: e.target.checked })}
                      className="w-4 h-4 rounded text-[#2455FF] accent-[#2455FF]"
                    />
                  </div>
                </div>
                <div className="p-4 border dark:border-[#2455FF]/15 rounded-xl space-y-2">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Change Password</span>
                  <button onClick={() => toast.success("Password reset request sent to your registered email.")} className="w-full py-2 bg-slate-100 dark:bg-white/5 text-[#050a1a] dark:text-white text-xs font-semibold rounded-lg hover:bg-slate-200/50 transition">
                    Request Password Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Appearance & Styling */}
            <div className="space-y-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2455FF] font-semibold mb-3">
                Preferences & Styling
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Dashboard Density</label>
                  <select
                    value={settingsData.dashboardDensity}
                    onChange={(e) => setSettingsData({ ...settingsData, dashboardDensity: e.target.value })}
                    className="w-full rounded-xl border dark:border-[#2455FF]/20 bg-white dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white"
                  >
                    <option value="cozy">Cozy (Default)</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Preferred AI Intake Model</label>
                  <select
                    value={settingsData.preferredModel}
                    onChange={(e) => setSettingsData({ ...settingsData, preferredModel: e.target.value })}
                    className="w-full rounded-xl border dark:border-[#2455FF]/20 bg-white dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white"
                  >
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="Claude 3.5 Haiku">Claude 3.5 Haiku</option>
                    <option value="LUMI Engine v2">LUMI Engine v2 (Alpha)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Response Max Tokens</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={settingsData.responseLength}
                    onChange={(e) => setSettingsData({ ...settingsData, responseLength: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-[#2455FF]/15 rounded-lg appearance-none cursor-pointer accent-[#2455FF] focus:outline-none mt-2"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-1">
                    <span>50 tokens</span>
                    <span>{settingsData.responseLength} tokens</span>
                    <span>500 tokens</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => toast.success("Configuration settings updated successfully.")}
              className="px-5 py-2.5 bg-[#2455FF] hover:bg-[#1a44e0] text-white font-mono text-xs uppercase tracking-wider rounded-xl transition"
            >
              Save settings
            </button>
          </div>
        )}

        {/* ================= TAB 4: NOTIFICATIONS ================= */}
        {activeTab === "notifications" && (
          <div className="glass rounded-3xl p-6 border border-[#2455FF]/15 text-left max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2455FF] font-semibold">
                Notification center
              </div>
              <button
                onClick={() => {
                  setNotifications(notifications.map(n => ({ ...n, read: true })));
                  toast.success("All logs marked as read.");
                }}
                className="text-xs font-mono text-[#2455FF] hover:underline"
              >
                Mark all read
              </button>
            </div>

            {/* Search & Categories */}
            <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
              <div className="flex items-center gap-2 bg-white dark:bg-[#050a1a] rounded-xl border border-slate-200 dark:border-[#2455FF]/20 px-3 py-1.5 flex-1 min-w-[200px]">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={notifSearch}
                  onChange={(e) => setNotifSearch(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs text-[#050a1a] dark:text-white placeholder-slate-450 w-full"
                />
              </div>

              <div className="flex gap-1.5">
                {["All", "System", "Project", "PRD", "Billing", "Security"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNotifCategory(cat)}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition ${
                      notifCategory === cat
                        ? "bg-[#2455FF] text-white"
                        : "bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications list */}
            <div className="space-y-2">
              {notifications
                .filter(n => notifCategory === "All" || n.category === notifCategory)
                .filter(n => n.text.toLowerCase().includes(notifSearch.toLowerCase()))
                .map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-4 transition ${
                      n.read
                        ? "bg-white/50 dark:bg-white/5 border-slate-100 dark:border-transparent opacity-85"
                        : "bg-[#2455FF]/5 border-[#2455FF]/20"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-mono text-[9px]">
                        <span className={`px-1.5 py-0.5 rounded font-semibold ${
                          n.category === "System" ? "bg-amber-100 text-amber-700" :
                          n.category === "Security" ? "bg-rose-100 text-rose-700" :
                          "bg-[#2455FF]/10 text-[#2455FF]"
                        }`}>
                          {n.category}
                        </span>
                        <span className="text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-[#050a1a] dark:text-white font-medium">{n.text}</p>
                    </div>

                    <div className="flex gap-2">
                      {!n.read && (
                        <button
                          onClick={() => {
                            setNotifications(notifications.map(x => x.id === n.id ? { ...x, read: true } : x));
                            toast.success("Marked as read.");
                          }}
                          className="text-[10px] font-mono text-[#2455FF] hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setNotifications(notifications.filter(x => x.id !== n.id));
                          toast.success("Notification log deleted.");
                        }}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

              {notifications.length === 0 && (
                <div className="py-8 text-center text-slate-400 font-mono text-xs">
                  All caught up! No notifications in index.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: BILLING ================= */}
        {activeTab === "billing" && (
          <div className="glass rounded-3xl p-6 border border-[#2455FF]/15 text-left max-w-4xl mx-auto space-y-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2455FF] font-semibold mb-4">
              Subscription & Usage Console
            </div>

            {/* Current plan detail card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border dark:border-white/5">
              <div className="space-y-1">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Current Plan</span>
                <strong className="text-[#2455FF] text-lg font-bold">Enterprise Pro Node</strong>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Status</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase font-mono">
                  ✓ ACTIVE ACCOUNT
                </span>
              </div>
              <div className="space-y-1">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">Next Renewal</span>
                <strong className="text-[#050a1a] dark:text-white text-sm">December 31, 2026</strong>
              </div>
            </div>

            {/* Usage progression bars */}
            <div className="space-y-4">
              <div className="font-semibold text-xs text-[#050a1a] dark:text-white font-mono uppercase tracking-wider">Quota Resource Usage</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 border dark:border-[#2455FF]/15 rounded-xl space-y-2 bg-white dark:bg-[#050a1a]">
                  <span className="block font-mono text-[9.5px] text-slate-400 uppercase">GPU Compute Hours</span>
                  <div className="flex justify-between font-mono text-[10.5px]">
                    <strong>45.2 Hrs Used</strong>
                    <span className="text-slate-400">/ 100 Hrs Limit</span>
                  </div>
                  <div className="w-full bg-[#2455FF]/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2455FF] h-full" style={{ width: "45.2%" }} />
                  </div>
                </div>

                <div className="p-4 border dark:border-[#2455FF]/15 rounded-xl space-y-2 bg-white dark:bg-[#050a1a]">
                  <span className="block font-mono text-[9.5px] text-slate-400 uppercase">Storage SSD Allocation</span>
                  <div className="flex justify-between font-mono text-[10.5px]">
                    <strong>1.2 TB Used</strong>
                    <span className="text-slate-400">/ 5 TB Limit</span>
                  </div>
                  <div className="w-full bg-[#2455FF]/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2455FF] h-full" style={{ width: "24%" }} />
                  </div>
                </div>

                <div className="p-4 border dark:border-[#2455FF]/15 rounded-xl space-y-2 bg-white dark:bg-[#050a1a]">
                  <span className="block font-mono text-[9.5px] text-slate-400 uppercase">REST API Node Requests</span>
                  <div className="flex justify-between font-mono text-[10.5px]">
                    <strong>18.4K Calls</strong>
                    <span className="text-slate-400">/ 50K Limit</span>
                  </div>
                  <div className="w-full bg-[#2455FF]/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2455FF] h-full" style={{ width: "36.8%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Future deployment integration comment block */}
            <div className="p-4 border border-dashed border-[#2455FF]/25 rounded-2xl bg-[#2455FF]/5 text-center space-y-1">
              <div className="font-mono text-[10px] text-[#2455FF] font-semibold uppercase tracking-wider">System Integration Notice</div>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                Billing will be available once subscription services are enabled. Payment gateway pipelines are configured and staged.
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 6: HELP & SUPPORT ================= */}
        {activeTab === "support" && (
          <div className="glass rounded-3xl p-6 border border-[#2455FF]/15 text-left max-w-4xl mx-auto space-y-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2455FF] font-semibold mb-4">
              Help Center & Diagnostics
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Support FAQs Accordions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-xs text-[#050a1a] dark:text-white uppercase font-mono tracking-wider">Frequently Asked Questions</h3>
                <div className="space-y-2">
                  {FAQS.map((faq, idx) => (
                    <div key={idx} className="p-3 border dark:border-[#2455FF]/15 rounded-xl bg-slate-50/50 dark:bg-white/5 text-xs space-y-1">
                      <strong className="text-[#050a1a] dark:text-white block font-sans">{faq.q}</strong>
                      <p className="text-slate-600 dark:text-slate-400 leading-normal">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Ticket Submission Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-xs text-[#050a1a] dark:text-white uppercase font-mono tracking-wider">Create Support Ticket</h3>
                <form onSubmit={handleCreateTicket} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block font-mono text-[8.5px] uppercase tracking-wider text-slate-450">Subject</label>
                    <input
                      type="text"
                      placeholder="Summary of issue..."
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      className="w-full rounded-xl border dark:border-[#2455FF]/20 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-mono text-[8.5px] uppercase tracking-wider text-slate-455">Category</label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                        className="w-full rounded-xl border dark:border-[#2455FF]/20 bg-white dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white"
                      >
                        <option value="billing">Billing & Quota</option>
                        <option value="infra">GPU / Cloud Cluster</option>
                        <option value="studio">AI Studio Intake</option>
                        <option value="bug">Report System Bug</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-mono text-[8.5px] uppercase tracking-wider text-slate-455">Emergency Level</label>
                      <span className="block text-rose-500 font-mono text-[10px] py-2 font-bold uppercase tracking-widest">
                        NORMAL RESPONSE
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-mono text-[8.5px] uppercase tracking-wider text-slate-450">Diagnostic Details</label>
                    <textarea
                      placeholder="Steps to reproduce or query support requirements..."
                      value={newTicket.desc}
                      onChange={(e) => setNewTicket({ ...newTicket, desc: e.target.value })}
                      className="w-full h-16 rounded-xl border dark:border-[#2455FF]/20 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs text-[#050a1a] dark:text-white outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#2455FF] hover:bg-[#1a44e0] text-white font-mono text-xs uppercase tracking-wider rounded-xl transition"
                  >
                    Submit Support Ticket
                  </button>
                </form>
              </div>
            </div>
            
            {/* List Submitted Support Tickets */}
            {supportTickets.length > 0 && (
              <div className="space-y-3.5 pt-4 mt-6">
                <h3 className="font-semibold text-xs text-[#050a1a] dark:text-white uppercase font-mono tracking-wider">Submitted Support Tickets</h3>
                <div className="space-y-2">
                  {supportTickets.map((t) => (
                    <div key={t.id} className="p-3 bg-slate-50 dark:bg-white/5 border dark:border-white/5 rounded-xl text-xs flex justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#2455FF]">{t.id}</span>
                          <span className="font-mono text-[9px] uppercase bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                            {t.category}
                          </span>
                        </div>
                        <div className="font-semibold mt-1">{t.subject}</div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{t.desc}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                          {t.status}
                        </span>
                        <div className="text-slate-400 text-[10px] mt-1 font-mono">{t.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AccountHub;
