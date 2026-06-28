// Tiny user store backed by localStorage so login state survives navigation.
const KEY = "lumi.user.v1";
const PHOTO_KEY_PREFIX = "lumi.user.photo.v1.";

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.id) {
      const photo = getUserPhoto(parsed.id);
      if (photo && !parsed.photo) parsed.photo = photo;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(KEY, JSON.stringify(user));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("lumi-user-change"));
}

export function getUserPhoto(userId) {
  if (typeof window === "undefined" || !userId) return null;
  try {
    return localStorage.getItem(PHOTO_KEY_PREFIX + userId);
  } catch {
    return null;
  }
}

export function setUserPhoto(userId, dataUrl) {
  if (typeof window === "undefined" || !userId) return;
  try {
    if (dataUrl) localStorage.setItem(PHOTO_KEY_PREFIX + userId, dataUrl);
    else localStorage.removeItem(PHOTO_KEY_PREFIX + userId);
    window.dispatchEvent(
      new CustomEvent("lumi-user-photo-change", { detail: { userId, photo: dataUrl } })
    );
  } catch {
    /* localStorage may be full — ignore. */
  }
}

import { useEffect, useState } from "react";

export function useUser() {
  const [user, setUser] = useState(() => getStoredUser());
  useEffect(() => {
    const refresh = () => setUser(getStoredUser());
    const onPhoto = () => refresh();
    window.addEventListener("lumi-user-change", refresh);
    window.addEventListener("lumi-user-photo-change", onPhoto);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("lumi-user-change", refresh);
      window.removeEventListener("lumi-user-photo-change", onPhoto);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return [user, (u) => setStoredUser(u)];
}