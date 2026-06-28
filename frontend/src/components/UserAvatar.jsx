import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  LayoutDashboard,
  Settings,
  LogOut,
  IdCard,
  Camera,
  X,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { setUserPhoto } from "@/lib/userStore";

const sizeMap = {
  xs: "h-7 w-7",
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-11 w-11",
  xl: "h-14 w-14",
};
const iconSizeMap = { xs: 14, sm: 18, md: 20, lg: 22, xl: 28 };

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "L";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ------------------------------------------------------------------
 * The circular avatar button itself. Used both logged-in and logged-out.
 * Renders the photo when present, else a glass circle with UserRound.
 * ------------------------------------------------------------------ */
export const AvatarCircle = ({
  user,
  size = "md",
  ring = true,
  onClick,
  testId,
  ariaLabel,
  className = "",
}) => {
  const circle = sizeMap[size] || sizeMap.md;
  const iconPx = iconSizeMap[size] || 20;
  const photo = user?.photo;
  const initial = initialsOf(user?.name);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || (user ? `${user.name} menu` : "Sign in")}
      data-testid={testId}
      className={`relative shrink-0 rounded-full overflow-hidden inline-flex items-center justify-center transition active:scale-[0.97] ${
        ring ? "ring-2 ring-[#2455FF]/40 hover:ring-[#2455FF]/70" : ""
      } ${circle} ${className}`}
      style={{
        background:
          "linear-gradient(140deg, rgba(255,255,255,0.85), rgba(36,85,255,0.10))",
        boxShadow:
          "0 8px 22px -10px rgba(36,85,255,0.45), 0 1px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt={user?.name || "profile"}
          className="absolute inset-0 h-full w-full object-cover"
          draggable="false"
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-cine text-[#2455FF]/40 select-none"
            style={{ fontSize: iconPx * 1.1 }}
          >
            {initial}
          </span>
          <UserRound
            className="relative text-[#2455FF]"
            size={iconPx}
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </>
      )}
      {user && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#25D366] ring-2 ring-white" />
      )}
    </button>
  );
};

/* ------------------------------------------------------------------
 * Profile modal — used for the "My Profile" entry from the avatar
 * dropdown when the user is in the Hero / Studio context (no
 * dashboard available). Management users see the same modal with an
 * extra "Open Dashboard Settings" button.
 * ------------------------------------------------------------------ */
const ProfileModal = ({ user, context, onClose, onNavigate }) => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [photo, setPhoto] = useState(user?.photo || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const savePhoto = () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      setUserPhoto(user.id, photo);
    } finally {
      setSaving(false);
      onClose?.();
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[120] flex items-center justify-center px-4"
      data-testid="profile-modal"
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[#050a1a]/40 backdrop-blur-sm"
        data-testid="profile-modal-backdrop"
      />
      <motion.div
        initial={{ y: 18, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 8, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative glass-strong bracket rounded-2xl w-full max-w-md p-6"
      >
        <button
          aria-label="Close"
          onClick={onClose}
          data-testid="profile-modal-close"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/60 ring-1 ring-[#2455FF]/15 hover:bg-white inline-flex items-center justify-center text-[#050a1a]/60 hover:text-[#2455FF] transition"
        >
          <X size={16} strokeWidth={2.4} />
        </button>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#2455FF]/10 px-3 py-1.5 text-[#2455FF] ring-1 ring-[#2455FF]/20">
          <IdCard size={13} strokeWidth={2.6} />
          <span className="font-mono text-[10px] uppercase tracking-[.2em]">
            My Profile
          </span>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <AvatarCircle user={{ ...user, photo }} size="xl" ring={false} />
          <div className="min-w-0 flex-1">
            <div className="font-cine text-xl tracking-[.08em] text-[#050a1a] truncate">
              {user?.name || "Lab Member"}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[.22em] text-[#2455FF]/70 truncate">
              {user?.phone || user?.role || "LUMI AI"}
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
          data-testid="profile-photo-input"
        />

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            data-testid="profile-upload-btn"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/75 ring-1 ring-[#2455FF]/20 hover:ring-[#2455FF]/40 hover:bg-white py-2.5 text-sm font-semibold text-[#050a1a] transition"
          >
            <Camera size={15} strokeWidth={2.4} />
            <span>Upload Photo</span>
          </button>
          {photo && (
            <button
              type="button"
              onClick={removePhoto}
              data-testid="profile-remove-btn"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 hover:bg-rose-100 py-2.5 text-sm font-semibold text-rose-600 transition"
            >
              <Trash2 size={15} strokeWidth={2.4} />
              <span>Remove</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mt-3 font-mono text-[11px] text-rose-600">{error}</div>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          {context === "dashboard" ? (
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onNavigate?.("/dashboard?tab=settings");
              }}
              data-testid="profile-open-settings-btn"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2455FF] hover:bg-[#1a44e0] py-2.5 text-sm font-semibold text-white transition"
            >
              <Settings size={15} strokeWidth={2.6} />
              <span>Open Dashboard Settings</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onNavigate?.("/dashboard?tab=settings");
              }}
              data-testid="profile-open-settings-btn"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2455FF] hover:bg-[#1a44e0] py-2.5 text-sm font-semibold text-white transition"
            >
              <Settings size={15} strokeWidth={2.6} />
              <span>Account Settings</span>
            </button>
          )}
          <button
            type="button"
            onClick={savePhoto}
            disabled={saving || photo === (user?.photo || null)}
            data-testid="profile-save-btn"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#050a1a] hover:bg-[#0b1530] py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={15} strokeWidth={2.6} />
            <span>Save</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------
 * The full UserAvatar component. Wraps AvatarCircle with a dropdown.
 *
 * Props:
 *  - user: { name, photo?, role?, id? } or null (logged out)
 *  - size: "xs" | "sm" | "md" | "lg" | "xl"
 *  - context: "hero" | "studio" | "dashboard" — affects dropdown actions
 *  - onLoginClick: () => void (called when logged-out avatar is clicked)
 *  - onLogout: () => void
 *  - onNavigate: (path: string) => void
 *  - loggedOutTestId / loggedInTestId: back-compat testid overrides
 * ------------------------------------------------------------------ */
export const UserAvatar = ({
  user,
  size = "md",
  context = "hero",
  onLoginClick,
  onLogout,
  onNavigate,
  loggedOutTestId = "navbar-say-your-name-btn",
  loggedInTestId = "navbar-user-pill",
}) => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isManagement = !!user?.role && context === "dashboard";

  // Logged-out branch — a single circular button that opens the auth modal.
  if (!user) {
    return (
      <AvatarCircle
        user={null}
        size={size}
        onClick={onLoginClick}
        testId={loggedOutTestId}
        ariaLabel="Sign in"
      />
    );
  }

  return (
    <div ref={ref} className="relative inline-flex" data-testid={loggedInTestId}>
      <AvatarCircle
        user={user}
        size={size}
        onClick={() => setOpen((v) => !v)}
        testId="navbar-user-avatar-btn"
        ariaLabel="Open user menu"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            key="avatar-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            data-testid="avatar-dropdown"
            className="absolute right-0 mt-2 w-56 rounded-2xl glass-strong ring-1 ring-[#2455FF]/22 shadow-[0_24px_60px_-20px_rgba(36,85,255,0.45)] z-50 overflow-hidden"
            style={{ top: "100%" }}
          >
            <div className="px-4 py-3 border-b border-[#2455FF]/12">
              <div className="font-cine text-[13px] tracking-[0.14em] text-[#050a1a] truncate">
                {user.name}
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#2455FF]/70 truncate">
                {user.phone || user.role || "Lab Member"}
              </div>
            </div>

            <div className="py-1.5">
              <DropdownItem
                icon={IdCard}
                label="My Profile"
                testId="avatar-menu-profile"
                onClick={() => {
                  setOpen(false);
                  setProfileOpen(true);
                }}
              />
              {!isManagement && (
                <DropdownItem
                  icon={LayoutDashboard}
                  label="Dashboard"
                  testId="navbar-dashboard-btn"
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.("/dashboard");
                  }}
                />
              )}
              <DropdownItem
                icon={Settings}
                label="Settings"
                testId="avatar-menu-settings"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.("/dashboard?tab=settings");
                }}
              />
            </div>

            <div className="border-t border-[#2455FF]/12 py-1.5">
              <DropdownItem
                icon={LogOut}
                label="Logout"
                tone="danger"
                testId="navbar-logout-btn"
                onClick={() => {
                  setOpen(false);
                  onLogout?.();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen && (
          <ProfileModal
            user={user}
            context={context}
            onClose={() => setProfileOpen(false)}
            onNavigate={(p) => onNavigate?.(p)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownItem = ({ icon: Icon, label, onClick, tone = "default", testId }) => {
  const toneCls =
    tone === "danger"
      ? "text-rose-600 hover:bg-rose-50"
      : "text-[#050a1a] hover:bg-[#2455FF]/8 hover:text-[#2455FF]";
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-medium transition ${toneCls}`}
    >
      <Icon size={15} strokeWidth={2.4} />
      <span>{label}</span>
    </button>
  );
};

export default UserAvatar;