import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  FileText,
  Eye,
  Users,
  MessageSquare,
  Send,
  X,
  Calendar,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STORE_KEY = "lumi.admin.pwd.v1";

const StatCard = ({ icon: Icon, label, value, color = "#2455FF" }) => (
  <div
    className="glass rounded-2xl p-4 ring-1 ring-[#2455FF]/15"
    data-testid={`admin-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
  >
    <div className="flex items-center justify-between">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2455FF]/8 ring-1 ring-[#2455FF]/15">
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={2.4} />
      </span>
    </div>
    <div className="mt-3 font-display text-3xl text-[#050a1a]">{value}</div>
    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#050a1a]/55 mt-1">
      {label}
    </div>
  </div>
);

const PrdViewer = ({ prd, onClose }) => (
  <AnimatePresence>
    {prd && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        data-testid="admin-prd-viewer"
      >
        <button onClick={onClose} className="absolute inset-0 bg-[#050a1a]/35 backdrop-blur-sm" />
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative glass-strong rounded-2xl w-full max-w-[860px] max-h-[85vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2455FF]/12">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#2455FF]/70">
                PRD · {prd.client_name || "—"}
              </div>
              <div className="font-cine text-[18px] tracking-[0.06em] text-[#050a1a] leading-none mt-0.5">
                {prd.title}
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" data-testid="admin-prd-close" className="h-8 w-8 rounded-full bg-white/60 ring-1 ring-[#2455FF]/15 hover:bg-white flex items-center justify-center text-[#050a1a]/60 hover:text-[#2455FF] transition">
              <X className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
          <div className="overflow-y-auto p-6 bp-grid bp-wash flex-1">
            {(prd.body_markdown || "").split("\n").map((line, i) => {
              if (line.startsWith("# ")) return <h1 key={i} className="font-display text-2xl text-[#050a1a] mb-2">{line.slice(2)}</h1>;
              if (line.startsWith("## ")) return <h2 key={i} className="font-cine text-base tracking-[0.1em] text-[#2455FF] mt-4 mb-2">{line.slice(3)}</h2>;
              if (line.startsWith("---")) return <hr key={i} className="my-4 border-[#2455FF]/15" />;
              if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#050a1a]/65">{line.replace(/\*\*/g, "")}</p>;
              if (!line.trim()) return <div key={i} className="h-2" />;
              return <p key={i} className="text-[13px] text-[#050a1a]/85 leading-relaxed mb-1">{line}</p>;
            })}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState(() => sessionStorage.getItem(STORE_KEY) || "");
  const [pwdInput, setPwdInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [prds, setPrds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewerPrd, setViewerPrd] = useState(null);
  const [otpLogs, setOtpLogs] = useState([]);
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // try existing stored password
  useEffect(() => {
    const stored = sessionStorage.getItem(STORE_KEY);
    if (!stored) return undefined;
    const t = setTimeout(() => verifyAndLoad(stored, true), 0);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyAndLoad = async (password, silent = false) => {
    try {
      await axios.post(`${API}/admin/login`, { password });
      sessionStorage.setItem(STORE_KEY, password);
      setPwd(password);
      setAuthed(true);
      await Promise.all([loadStats(password), loadPrds(password), loadBookings(password), loadOtpLogs(password)]);
    } catch (e) {
      if (!silent) toast.error("Wrong password.");
      sessionStorage.removeItem(STORE_KEY);
      setAuthed(false);
    }
  };

  const loadStats = async (password = pwd) => {
    try {
      const res = await axios.get(`${API}/admin/stats`, { params: { password } });
      setStats(res.data);
    } catch {
      /* */
    }
  };

  const loadPrds = async (password = pwd) => {
    try {
      const res = await axios.get(`${API}/admin/prds`, { params: { password } });
      setPrds(res.data || []);
    } catch {
      /* */
    }
  };

  const loadBookings = async (password = pwd) => {
    try {
      const res = await axios.get(`${API}/admin/bookings`, { params: { password } });
      setBookings(res.data || []);
    } catch {
      /* */
    }
  };

  const loadOtpLogs = async (password = pwd) => {
    try {
      const res = await axios.get(`${API}/admin/otp-logs`, { params: { password } });
      setOtpLogs(res.data || []);
    } catch {
      /* */
    }
  };

  const handleSendTestOtp = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) return;
    setSendingTest(true);
    try {
      const res = await axios.post(`${API}/admin/test-otp`, {
        password: pwd,
        phone: testPhone.trim()
      });
      toast.success(`Test OTP SMS successfully dispatched! Code: ${res.data.otp}`, {
        description: `Twilio Message SID: ${res.data.sid}`
      });
      setTestPhone("");
      loadOtpLogs();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to send test OTP.");
    } finally {
      setSendingTest(false);
    }
  };

  const onLogin = async (e) => {
    e?.preventDefault?.();
    if (!pwdInput.trim()) return;
    setLoginLoading(true);
    await verifyAndLoad(pwdInput.trim());
    setLoginLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadPrds(), loadBookings(), loadOtpLogs()]);
    setRefreshing(false);
  };

  const logout = () => {
    sessionStorage.removeItem(STORE_KEY);
    setAuthed(false);
    setPwd("");
    setPwdInput("");
  };

  if (!authed) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white bp-grid bp-wash">
        <form
          onSubmit={onLogin}
          className="relative glass-strong rounded-2xl w-full max-w-[400px] p-7 bracket"
          data-testid="admin-login-form"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2455FF]/8 px-2.5 py-1 ring-1 ring-[#2455FF]/30">
            <ShieldCheck className="h-3.5 w-3.5 text-[#2455FF]" strokeWidth={2.4} />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2455FF]">
              Admin · Lumi Lab
            </span>
          </div>
          <h2 className="mt-3 font-cine text-[26px] tracking-[0.06em] text-[#050a1a]">
            Enter the lab
          </h2>
          <p className="mt-1 text-[12.5px] text-[#050a1a]/60">
            Only the cook gets the keys.
          </p>
          <label className="block mt-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#050a1a]/55">
              Admin password
            </span>
            <input
              autoFocus
              type="password"
              value={pwdInput}
              onChange={(e) => setPwdInput(e.target.value)}
              placeholder="••••••••"
              data-testid="admin-password-input"
              className="mt-1.5 w-full rounded-xl bg-white/70 ring-1 ring-[#2455FF]/15 focus:ring-[#2455FF]/50 outline-none px-3.5 py-2.5 font-mono text-[14px] text-[#050a1a]"
            />
          </label>
          <button
            type="submit"
            disabled={loginLoading || !pwdInput.trim()}
            data-testid="admin-login-btn"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2455FF] hover:bg-[#1a44e0] disabled:opacity-50 text-white px-4 py-3 text-sm font-semibold transition"
          >
            {loginLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.6} /> Verifying…</>
            ) : (
              <><LogIn className="h-4 w-4" strokeWidth={2.6} /> Sign In</>
            )}
          </button>
          <a
            href="/"
            className="block text-center mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#050a1a]/45 hover:text-[#2455FF]"
          >
            ← back to lab home
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <header className="border-b border-[#2455FF]/12 bg-white/70 backdrop-blur-md px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-cine text-[15px] tracking-[0.14em] text-[#050a1a]">LUMI&nbsp;AI</span>
          <span className="h-4 w-px bg-[#2455FF]/25" />
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#2455FF]/70">
            Admin · Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={refreshing}
            data-testid="admin-refresh-btn"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/70 ring-1 ring-[#2455FF]/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#050a1a]/70 hover:text-[#2455FF] transition"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} strokeWidth={2.6} />
            Refresh
          </button>
          <button
            onClick={logout}
            data-testid="admin-logout-btn"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#050a1a]/5 hover:bg-[#050a1a]/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#050a1a]/70 hover:text-[#2455FF] transition"
          >
            <LogOut className="h-3 w-3" strokeWidth={2.6} />
            Sign out
          </button>
        </div>
      </header>

      <div className="px-5 sm:px-8 py-6 bp-grid bp-wash min-h-[calc(100vh-49px)]">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3" data-testid="admin-stats">
          <StatCard icon={Users} label="Leads" value={stats?.leads ?? "—"} />
          <StatCard icon={MessageSquare} label="Chat Sessions" value={stats?.sessions ?? "—"} />
          <StatCard icon={FileText} label="PRDs Ready" value={stats?.prds_ready ?? "—"} color="#FFA600" />
          <StatCard icon={Send} label="PRDs Sent" value={stats?.prds_sent ?? "—"} color="#25D366" />
          <StatCard icon={Calendar} label="Discovery Calls" value={stats?.bookings ?? "—"} color="#00E5FF" />
          <StatCard icon={Mail} label="Newsletter List" value={stats?.subscribers ?? "—"} color="#9B5DE5" />
        </div>

        <div className="mt-6 glass rounded-2xl p-4 ring-1 ring-[#2455FF]/15">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#2455FF]">
              All PRDs ({prds.length})
            </div>
          </div>

          <div className="mt-3 overflow-x-auto" data-testid="admin-prd-table-wrap">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#050a1a]/55">
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Lang</th>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {prds.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-[#050a1a]/45">
                      No PRDs yet — they appear here after a chat finalizes.
                    </td>
                  </tr>
                )}
                {prds.map((p) => (
                  <tr key={p.id} className="border-t border-[#2455FF]/10 hover:bg-[#2455FF]/4" data-testid={`admin-prd-row-${p.id}`}>
                    <td className="py-2.5 pr-3 text-[13px] text-[#050a1a] font-medium">{p.client_name || "—"}</td>
                    <td className="py-2.5 pr-3 text-[13px] text-[#050a1a]/75">{p.company || "—"}</td>
                    <td className="py-2.5 pr-3 text-[13px] text-[#050a1a]/75 max-w-[280px] truncate">{p.title}</td>
                    <td className="py-2.5 pr-3 text-[12px] font-mono text-[#050a1a]/70">{p.phone || "—"}</td>
                    <td className="py-2.5 pr-3 text-[11px] font-mono uppercase tracking-[0.18em] text-[#2455FF]">{p.language || "en"}</td>
                    <td className="py-2.5 pr-3 text-[11px] font-mono text-[#050a1a]/55">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <button
                        onClick={() => setViewerPrd(p)}
                        data-testid={`admin-view-prd-${p.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#2455FF] hover:bg-[#1a44e0] text-white px-2.5 py-1.5 text-[11.5px] font-semibold transition"
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={2.6} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bookings Block */}
        <div className="mt-6 glass rounded-2xl p-4 ring-1 ring-[#2455FF]/15">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#2455FF]">
              All Discovery Calls ({bookings.length})
            </div>
          </div>

          <div className="mt-3 overflow-x-auto" data-testid="admin-bookings-table-wrap">
            <table className="w-full text-left border-collapse text-slate-700">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#050a1a]/55 border-b border-[#2455FF]/10">
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Email / Phone</th>
                  <th className="py-2 pr-3">Topic</th>
                  <th className="py-2 pr-3">Expert</th>
                  <th className="py-2 pr-3">Platform</th>
                  <th className="py-2 pr-3">Time Slot</th>
                  <th className="py-2 pr-3">When Booked</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-[#050a1a]/45">
                      No discovery calls booked yet.
                    </td>
                  </tr>
                )}
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-[#2455FF]/10 hover:bg-[#2455FF]/4">
                    <td className="py-2.5 pr-3 text-[13px] text-[#050a1a] font-medium">
                      <div>{b.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{b.company || "—"}</div>
                    </td>
                    <td className="py-2.5 pr-3 text-[12px] font-mono text-[#050a1a]/70">
                      <div>{b.email}</div>
                      <div>{b.phone}</div>
                    </td>
                    <td className="py-2.5 pr-3 text-[13px] text-[#050a1a]/75 max-w-[200px] truncate">{b.discussionTopic}</td>
                    <td className="py-2.5 pr-3 text-[13px] text-[#050a1a]/75">{b.preferredExpert}</td>
                    <td className="py-2.5 pr-3 text-[12px] font-mono uppercase tracking-wider text-[#2455FF]">{b.meetingPlatform}</td>
                    <td className="py-2.5 pr-3 text-[12px] text-slate-700">
                      <div className="font-semibold">{b.date}</div>
                      <div className="text-[11px] text-slate-400">{b.timeSlot} ({b.timezone})</div>
                    </td>
                    <td className="py-2.5 pr-3 text-[11px] font-mono text-[#050a1a]/55">
                      {b.created_at ? new Date(b.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Twilio OTP Status Logs & Testing Gateway */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Form */}
          <div className="glass rounded-2xl p-5 ring-1 ring-[#2455FF]/15 space-y-4">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#2455FF]">
              Twilio Gateway Check
            </div>
            <p className="text-[12px] text-slate-500">
              Send a test verification SMS to any phone number to verify API SID, Token, and dispatch limits.
            </p>
            <form onSubmit={handleSendTestOtp} className="space-y-4">
              <label className="block">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-400">Recipient Phone (with country code)</span>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-white/70 ring-1 ring-[#2455FF]/15 focus:ring-[#2455FF]/40 outline-none px-3.5 py-2 text-xs font-mono text-[#050a1a]"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={sendingTest || !testPhone.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2455FF] hover:bg-[#1a44e0] disabled:opacity-50 text-white px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition shadow-md"
              >
                {sendingTest ? "Sending..." : "Send Test SMS"}
              </button>
            </form>
          </div>

          {/* Logs Table */}
          <div className="glass rounded-2xl p-5 ring-1 ring-[#2455FF]/15 lg:col-span-2 space-y-3">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#2455FF]">
              SMS Verification Activity Logs ({otpLogs.length})
            </div>
            
            <div className="overflow-y-auto max-h-[220px] pr-1">
              <table className="w-full text-left border-collapse text-slate-700">
                <thead>
                  <tr className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#050a1a]/55 border-b border-[#2455FF]/10">
                    <th className="py-2 pr-3">Event Action</th>
                    <th className="py-2 pr-3">Target Details</th>
                    <th className="py-2 pr-3">Dispatched Time</th>
                  </tr>
                </thead>
                <tbody>
                  {otpLogs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#050a1a]/45">
                        No SMS events logged.
                      </td>
                    </tr>
                  )}
                  {otpLogs.map((log, idx) => (
                    <tr key={idx} className="border-t border-[#2455FF]/10 hover:bg-[#2455FF]/4">
                      <td className="py-2 pr-3 text-[12px] font-semibold text-[#050a1a]">
                        {log.action === "OTP_SENT_RESENT" ? "OTP Resent" : "OTP Sent"}
                      </td>
                      <td className="py-2 pr-3 text-[11.5px] font-mono text-[#050a1a]/70">
                        {log.metadata?.phone || "—"}
                      </td>
                      <td className="py-2 pr-3 text-[11px] font-mono text-[#050a1a]/55">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[#050a1a]/40">
          LUPUS&nbsp;AI&nbsp;LABS · Admin · {new Date().getFullYear()}
        </p>
      </div>

      <PrdViewer prd={viewerPrd} onClose={() => setViewerPrd(null)} />
    </div>
  );
};

export default Admin;
