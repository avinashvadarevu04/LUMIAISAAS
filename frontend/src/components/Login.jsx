import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Loader2, LockKeyhole, Mail, Phone, ArrowLeft, UserPlus, Building, User, ShieldCheck
} from "lucide-react";
import PasswordStrengthMeter from "@/components/ui/password-strength-meter";
import { managementApi as api, apiError } from "@/lib/managementApi";

const TOKEN = "lumi.management.token";
const USER = "lumi.management.user";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [view, setView] = useState("signin"); // signin | signup | mobile | otp | profile | forgot | reset
  const [form, setForm] = useState({ email: "", password: "", name: "", confirmPassword: "", role: "CLIENT" });
  const [phoneForm, setPhoneForm] = useState({ phone: "", country_code: "+91" });
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const otpVal = otpArray.join("");
  const [resetOtpArray, setResetOtpArray] = useState(["", "", "", "", "", ""]);
  const [profileForm, setProfileForm] = useState({ company_name: "" });
  const [resetForm, setResetForm] = useState({ otp: "", new_password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 mins OTP expiry timer
  const [resendCooldown, setResendCooldown] = useState(60); // 60s resend cooldown

  useEffect(() => {
    let interval;
    if (view === "otp" && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  useEffect(() => {
    let interval;
    if (view === "otp" && resendCooldown > 0) {
      interval = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [view, resendCooldown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email: form.email, password: form.password });
      if (data.status === "PENDING_VERIFICATION") {
        toast.info("Phone verification is required.");
        setView("mobile");
      } else {
        localStorage.setItem(TOKEN, data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("lumi.management.refreshToken", data.refreshToken);
        }
        localStorage.setItem(USER, JSON.stringify(data.user));
        
        if (data.user.role === "SUPER_ADMIN") {
          toast.success("Welcome, Super Admin", { description: "Logged into Executive Command Center." });
          if (onLogin) onLogin(data.user);
          navigate("/admin/dashboard", { replace: true });
        } else {
          toast.success(`Welcome, ${data.user.name}`, { description: "Logged into Delivery Workspace." });
          if (onLogin) onLogin(data.user);
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      toast.success("Account created! Please verify your phone number.");
      setView("mobile");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const submitSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/send-otp", {
        email: form.email,
        phone: phoneForm.phone,
        country_code: phoneForm.country_code
      });
      toast.success("Verification code sent to email and mobile!");
      setOtpArray(["", "", "", "", "", ""]);
      setTimer(300);
      setView("otp");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const submitVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpVal.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", {
        email: form.email,
        otp: otpVal
      });
      localStorage.setItem(TOKEN, data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("lumi.management.refreshToken", data.refreshToken);
      }
      localStorage.setItem(USER, JSON.stringify(data.user));
      toast.success("Account verified successfully!");
      setView("profile");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const submitCompleteProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/complete-profile", {
        email: form.email,
        company_name: profileForm.company_name
      });
      const storedUser = JSON.parse(localStorage.getItem(USER));
      const updatedUser = { ...storedUser, company: profileForm.company_name };
      localStorage.setItem(USER, JSON.stringify(updatedUser));
      toast.success("Profile initialized! Welcome to the lab.");
      if (onLogin) onLogin(updatedUser);
      if (updatedUser.role === "SUPER_ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const submitForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", {
        phone: phoneForm.phone,
        country_code: phoneForm.country_code
      });
      toast.success("If the number is registered, an OTP code has been sent.");
      setResetOtpArray(["", "", "", "", "", ""]);
      setTimer(300);
      setResendCooldown(60);
      setView("reset");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const submitResetPassword = async (e) => {
    e.preventDefault();
    const resetOtpVal = resetOtpArray.join("");
    if (resetOtpVal.length !== 6) {
      toast.error("Please enter a 6-digit OTP code");
      return;
    }

    if (resetForm.new_password !== resetForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        phone: phoneForm.phone,
        country_code: phoneForm.country_code,
        otp: resetOtpVal,
        new_password: resetForm.new_password
      });
      toast.success("Password reset successfully! Please sign in.");
      setView("signin");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bp-grid flex items-center justify-center p-5">
      <AnimatePresence mode="wait">
        {view === "signin" && (
          <motion.form
            key="signin"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onSubmit={submitLogin}
            className="glass-strong bracket relative w-full max-w-md rounded-2xl p-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2455FF]/10 px-3 py-1.5 text-[#2455FF] ring-1 ring-[#2455FF]/20">
              <ShieldCheck size={15} />
              <span className="font-mono text-[10px] uppercase tracking-[.2em]">Secure workspace</span>
            </div>
            <h1 className="mt-5 font-cine text-4xl tracking-[.08em] text-[#050a1a]">Command Center</h1>
            <p className="mt-1 text-sm text-[#050a1a]/55">Projects, approvals and delivery—one controlled system.</p>

            <label className="mt-6 block text-xs font-semibold text-[#050a1a]">
              Work email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm"
                placeholder="you@company.com"
              />
            </label>

            <label className="mt-4 block text-xs font-semibold text-[#050a1a]">
              Password
              <input
                required
                minLength={8}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm"
              />
              <PasswordStrengthMeter value={form.password} />
            </label>
            
            <button
              disabled={loading}
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2455FF] py-3 font-semibold text-white transition hover:bg-[#1a44e0] disabled:opacity-60 text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>Sign in</span>
            </button>
            
            <div className="mt-5 flex justify-between items-center text-xs">
              <button type="button" onClick={() => setView("signup")} className="text-[#2455ff] hover:underline font-semibold">
                Create Account
              </button>
              <button type="button" onClick={() => setView("forgot")} className="text-slate-500 hover:text-[#2455ff] transition">
                Forgot password?
              </button>
            </div>

            <a href="/" className="mt-4 block text-center font-mono text-[10px] uppercase tracking-[.2em] text-[#050a1a]/45 hover:text-[#2455ff] transition">
              ← LUMI AI
            </a>
          </motion.form>
        )}

        {view === "signup" && (
          <motion.form
            key="signup"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onSubmit={submitRegister}
            className="glass-strong bracket relative w-full max-w-md rounded-2xl p-7"
          >
            <button type="button" onClick={() => setView("signin")} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#2455ff] mb-4">
              <ArrowLeft size={14} /> Back to login
            </button>
            <h1 className="font-cine text-3xl tracking-[.08em] text-[#050a1a]">Register Profile</h1>
            <p className="mt-1 text-sm text-[#050a1a]/55">Register as a developer or client to enter the workspace.</p>
            
            <label className="mt-5 block text-xs font-semibold text-[#050a1a]">
              Full Name
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm"
                placeholder="Jane Doe"
              />
            </label>

            <label className="mt-4 block text-xs font-semibold text-[#050a1a]">
              Email Address
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm"
                placeholder="jane@company.com"
              />
            </label>

            <div className="mt-4 block text-xs font-semibold text-[#050a1a]">
              Role Profile
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "CLIENT" })}
                  className={`py-2.5 rounded-xl border font-semibold text-xs transition ${
                    form.role === "CLIENT" ? "bg-[#2455FF] text-white border-[#2455FF]" : "bg-white/60 text-slate-700 hover:bg-white"
                  }`}
                >
                  Client Account
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "DEVELOPER" })}
                  className={`py-2.5 rounded-xl border font-semibold text-xs transition ${
                    form.role === "DEVELOPER" ? "bg-[#2455FF] text-white border-[#2455FF]" : "bg-white/60 text-slate-700 hover:bg-white"
                  }`}
                >
                  Developer Profile
                </button>
              </div>
            </div>

            <label className="mt-4 block text-xs font-semibold text-[#050a1a]">
              Password
              <input
                required
                minLength={8}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm"
              />
              <PasswordStrengthMeter value={form.password} />
            </label>

            <label className="mt-4 block text-xs font-semibold text-[#050a1a]">
              Confirm Password
              <input
                required
                minLength={8}
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm"
              />
            </label>
            
            <button
              disabled={loading}
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2455FF] py-3 font-semibold text-white transition hover:bg-[#1a44e0] disabled:opacity-60 text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>Create Account</span>
            </button>
          </motion.form>
        )}

        {view === "mobile" && (
          <motion.form
            key="mobile"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onSubmit={submitSendOtp}
            className="glass-strong bracket relative w-full max-w-md rounded-2xl p-7"
          >
            <h1 className="font-cine text-3xl tracking-[.08em] text-[#050a1a]">Mobile Verification</h1>
            <p className="mt-1 text-sm text-[#050a1a]/55">Provide your mobile number to receive a 6-digit security OTP.</p>
            
            <div className="mt-6 flex gap-2">
              <label className="block text-xs font-semibold text-[#050a1a] w-24">
                Country
                <select
                  value={phoneForm.country_code}
                  onChange={(e) => setPhoneForm({ ...phoneForm, country_code: e.target.value })}
                  className="mt-2 w-full rounded-xl border bg-white/75 px-3 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm h-11"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
              </label>

              <label className="block text-xs font-semibold text-[#050a1a] flex-1">
                Mobile Number
                <input
                  required
                  type="tel"
                  value={phoneForm.phone}
                  onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                  className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm h-11"
                  placeholder="9876543210"
                />
              </label>
            </div>
            
            <button
              disabled={loading}
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2455FF] py-3 font-semibold text-white transition hover:bg-[#1a44e0] disabled:opacity-60 text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>Send Verification Code</span>
            </button>
          </motion.form>
        )}

        {view === "otp" && (
          <motion.form
            key="otp"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onSubmit={submitVerifyOtp}
            className="glass-strong bracket relative w-full max-w-md rounded-2xl p-7"
          >
            <h1 className="font-cine text-3xl tracking-[.08em] text-[#050a1a]">Enter OTP</h1>
            <p className="mt-1 text-sm text-[#050a1a]/55">
              Enter the 6-digit code sent to your mobile: <strong className="text-[#2455ff]">{phoneForm.country_code} {phoneForm.phone}</strong>.
            </p>
            
            <div className="mt-6 block text-xs font-semibold text-[#050a1a] text-center">
              <span className="block mb-3">Verification Code</span>
              <div 
                className="flex justify-center gap-2 max-w-sm mx-auto" 
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  const nextArray = [...otpArray];
                  for (let i = 0; i < pastedData.length; i++) {
                    nextArray[i] = pastedData[i];
                  }
                  setOtpArray(nextArray);
                  const focusIdx = Math.min(pastedData.length, 5);
                  document.getElementById(`otp-input-${focusIdx}`)?.focus();
                }}
              >
                {otpArray.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const nextArray = [...otpArray];
                      nextArray[idx] = val.slice(-1);
                      setOtpArray(nextArray);
                      if (val && idx < 5) {
                        document.getElementById(`otp-input-${idx + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpArray[idx] && idx > 0) {
                        document.getElementById(`otp-input-${idx - 1}`)?.focus();
                      }
                    }}
                    className="w-11 h-11 text-center font-mono text-lg font-bold rounded-xl border bg-white/75 outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition"
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono">Expires in: {formatTime(timer)}</span>
              {resendCooldown > 0 ? (
                <span className="text-slate-400 font-mono">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={submitSendOtp}
                  className="text-[#2455ff] font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setView("mobile")}
                className="col-span-1 rounded-xl border bg-white text-slate-700 py-3 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Change Phone
              </button>
              <button
                disabled={loading || timer === 0}
                type="submit"
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 text-xs uppercase tracking-wider"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : null}
                <span>Verify OTP</span>
              </button>
            </div>
          </motion.form>
        )}

        {view === "profile" && (
          <motion.form
            key="profile"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onSubmit={submitCompleteProfile}
            className="glass-strong bracket relative w-full max-w-md rounded-2xl p-7"
          >
            <h1 className="font-cine text-3xl tracking-[.08em] text-[#050a1a]">Complete Profile</h1>
            <p className="mt-1 text-sm text-[#050a1a]/55">Provide final profile configurations to customize your workspace.</p>
            
            <label className="mt-6 block text-xs font-semibold text-[#050a1a]">
              Company Name (Optional)
              <input
                type="text"
                value={profileForm.company_name}
                onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm"
                placeholder="Acme Corp"
              />
            </label>
            
            <button
              disabled={loading}
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2455FF] py-3 font-semibold text-white transition hover:bg-[#1a44e0] disabled:opacity-60 text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>Complete Profile & Open Dashboard</span>
            </button>
          </motion.form>
        )}

        {view === "forgot" && (
          <motion.form
            key="forgot"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onSubmit={submitForgotPassword}
            className="glass-strong bracket relative w-full max-w-md rounded-2xl p-7"
          >
            <button type="button" onClick={() => setView("signin")} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#2455ff] mb-4">
              <ArrowLeft size={14} /> Back to login
            </button>
            <h1 className="font-cine text-3xl tracking-[.08em] text-[#050a1a]">Recover Password</h1>
            <p className="mt-1 text-sm text-[#050a1a]/55">Enter your registered mobile number to receive password recovery code.</p>
            
            <div className="mt-6 flex gap-2">
              <label className="block text-xs font-semibold text-[#050a1a] w-24">
                Country
                <select
                  value={phoneForm.country_code}
                  onChange={(e) => setPhoneForm({ ...phoneForm, country_code: e.target.value })}
                  className="mt-2 w-full rounded-xl border bg-white/75 px-3 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm h-11"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
              </label>

              <label className="block text-xs font-semibold text-[#050a1a] flex-1">
                Mobile Number
                <input
                  required
                  type="tel"
                  value={phoneForm.phone}
                  onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                  className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm h-11"
                  placeholder="9876543210"
                />
              </label>
            </div>
            
            <button
              disabled={loading}
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2455FF] py-3 font-semibold text-white transition hover:bg-[#1a44e0] disabled:opacity-60 text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>Request Password Reset</span>
            </button>
          </motion.form>
        )}

        {view === "reset" && (
          <motion.form
            key="reset"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onSubmit={submitResetPassword}
            className="glass-strong bracket relative w-full max-w-md rounded-2xl p-7"
          >
            <h1 className="font-cine text-3xl tracking-[.08em] text-[#050a1a]">Reset Password</h1>
            <p className="mt-1 text-sm text-[#050a1a]/55">Enter OTP received on your mobile and set a new password.</p>
            
            <div className="mt-6 block text-xs font-semibold text-[#050a1a] text-center">
              <span className="block mb-3 text-left">OTP Code (6-digits)</span>
              <div 
                className="flex justify-center gap-2 max-w-sm mx-auto" 
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  const nextArray = [...resetOtpArray];
                  for (let i = 0; i < pastedData.length; i++) {
                    nextArray[i] = pastedData[i];
                  }
                  setResetOtpArray(nextArray);
                  const focusIdx = Math.min(pastedData.length, 5);
                  document.getElementById(`reset-otp-input-${focusIdx}`)?.focus();
                }}
              >
                {resetOtpArray.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`reset-otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const nextArray = [...resetOtpArray];
                      nextArray[idx] = val.slice(-1);
                      setResetOtpArray(nextArray);
                      if (val && idx < 5) {
                        document.getElementById(`reset-otp-input-${idx + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !resetOtpArray[idx] && idx > 0) {
                        document.getElementById(`reset-otp-input-${idx - 1}`)?.focus();
                      }
                    }}
                    className="w-11 h-11 text-center font-mono text-lg font-bold rounded-xl border bg-white/75 outline-none focus:ring-2 focus:ring-[#2455FF]/30 transition"
                  />
                ))}
              </div>
            </div>

            <label className="mt-4 block text-xs font-semibold text-[#050a1a]">
              New Password
              <input
                required
                minLength={8}
                type="password"
                value={resetForm.new_password}
                onChange={(e) => setResetForm({ ...resetForm, new_password: e.target.value })}
                className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm"
              />
              <PasswordStrengthMeter value={resetForm.new_password} />
            </label>

            <label className="mt-4 block text-xs font-semibold text-[#050a1a]">
              Confirm New Password
              <input
                required
                minLength={8}
                type="password"
                value={resetForm.confirmPassword}
                onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                className="mt-2 w-full rounded-xl border bg-white/75 px-4 py-3 outline-none focus:ring-2 focus:ring-[#2455FF]/30 text-sm"
              />
            </label>
            
            <div className="mt-6 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setView("forgot")}
                className="col-span-1 rounded-xl border bg-white text-slate-700 py-3 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                type="submit"
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#2455FF] py-3 font-semibold text-white transition hover:bg-[#1a44e0] disabled:opacity-60 text-xs uppercase tracking-wider"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : null}
                <span>Reset Password</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </main>
  );
}
