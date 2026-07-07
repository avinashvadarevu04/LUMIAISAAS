import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Hero from "@/components/Hero";
import Studio from "@/components/Studio";
import ManagementDashboard from "@/components/ManagementDashboard";
import AIInfraPage from "@/components/AIInfraPage";
import CommandPalette from "@/components/CommandPalette";

function App() {
  return (
    <div className="App">
      <Toaster
        position="top-center"
        offset={88}
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(36,85,255,0.2)",
            color: "#050a1a",
            fontFamily: "IBM Plex Sans, sans-serif",
          },
        }}
      />
      <BrowserRouter>
        <CommandPalette />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ManagementDashboard />} />
          <Route path="/ai-infra" element={<AIInfraPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
