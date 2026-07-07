import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

const USER = "lumi.management.user";

const AdminLogin = () => {
  const navigate = useNavigate();

  // If already logged in, redirect immediately to appropriate dashboard
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(USER));
      if (stored) {
        if (stored.role === "SUPER_ADMIN") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (e) {
      // ignore
    }
  }, [navigate]);

  return <Login onLogin={() => {}} />;
};

export default AdminLogin;
