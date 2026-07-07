import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LockKeyhole, Mail, KeyRound, Loader2, ArrowLeft } from "lucide-react";
import { managementApi as api, apiError } from "@/lib/managementApi";

const TOKEN = "lumi.management.token";
const USER = "lumi.management.user";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as SUPER_ADMIN, redirect immediately
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(USER));
      if (stored && stored.role === "SUPER_ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (e) {
      // ignore
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Credentials required", { description: "Email and password must be filled." });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      
      if (data.user && data.user.role === "SUPER_ADMIN") {
        localStorage.setItem(TOKEN, data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("lumi.management.refreshToken", data.refreshToken);
        }
        localStorage.setItem(USER, JSON.stringify(data.user));
        toast.success("Welcome, Super Admin", { description: "Logged into Executive Command Center." });
        navigate("/admin/dashboard", { replace: true });
      } else {
        toast.error("Access Denied", { description: "Non-admin accounts are unauthorized to access the Command Center." });
      }
    } catch (err) {
      toast.error("Authentication failed", { description: apiError(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#050a1a] text-white p-6 relative">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bp-grid pointer-events-none opacity-20" aria-hidden="true" />

      {/* Login Card */}
      <div className="glass-strong rounded-3xl p-8 max-w-[400px] w-full border border-[#2455FF]/25 shadow-[0_24px_60px_-15px_rgba(36,85,255,0.4)] relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-[#2455FF]/10 border border-[#2455FF]/30 flex items-center justify-center mx-auto text-[#00E5FF]">
            <LockKeyhole className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="font-cine text-xl tracking-[0.16em] uppercase font-bold text-white">
            Command Center
          </h2>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
            Secure Admin Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="block font-mono text-[8.5px] uppercase tracking-wider text-slate-400">
              Admin Email
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#2455FF]/20 bg-white/5 focus-within:ring-2 focus-within:ring-[#2455FF]/40 transition">
              <Mail className="h-4 w-4 text-[#2455FF]/60" />
              <input
                type="email"
                placeholder="admin@lupus.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-transparent border-0 outline-none text-xs text-white placeholder-slate-500 w-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-[8.5px] uppercase tracking-wider text-slate-400">
              Passkey
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#2455FF]/20 bg-white/5 focus-within:ring-2 focus-within:ring-[#2455FF]/40 transition">
              <LockKeyhole className="h-4 w-4 text-[#2455FF]/60" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-transparent border-0 outline-none text-xs text-white placeholder-slate-500 w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[9px] text-slate-400 mt-2">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
              <input
                type="checkbox"
                defaultChecked
                className="w-3.5 h-3.5 rounded bg-white/5 border border-[#2455FF]/20 text-[#2455FF] accent-[#2455FF]"
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => toast.info("Passkey recovery link dispatched.", { description: "Please check your registered administrator inbox." })}
              className="hover:text-white transition underline bg-transparent border-0"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2455FF] hover:bg-[#1a44e0] text-white font-mono text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Authorize Login</span>
            )}
          </button>
        </form>

        <div className="border-t border-white/5 pt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Lab Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
