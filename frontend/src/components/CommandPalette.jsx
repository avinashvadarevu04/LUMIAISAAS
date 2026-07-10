import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { Search, Terminal, Home, Code, Database, Sparkles, FileText } from "lucide-react";
import { SHOW_AI_INFRA } from "../config";

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle the menu when pressing cmd+k or ctrl+k
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Global Navigation Spotlight">
      <div className="flex items-center gap-3 px-4 border-b border-[#2455FF]/12">
        <Search className="h-4 w-4 text-[#2455FF]" />
        <Command.Input placeholder="Type a command or search console..." />
        <kbd className="px-1.5 py-0.5 rounded border border-[#2455FF]/25 bg-white/70 text-[#2455FF] text-[9.5px] font-mono shrink-0 select-none">
          ESC
        </kbd>
      </div>

      <Command.List className="max-h-[300px] overflow-y-auto p-2 space-y-1">
        <Command.Empty className="py-6 text-center font-mono text-[11px] text-[#050a1a]/40">
          No system diagnostics or routes match query.
        </Command.Empty>

        <Command.Group heading="Diagnostics & Navigation">
          <Command.Item onSelect={() => handleNavigate("/")}>
            <Home className="h-3.5 w-3.5 text-[#2455FF]" />
            <div className="flex-1 flex justify-between items-center">
              <span>Go to Lab Home Page</span>
              <span className="font-mono text-[9px] opacity-45">/</span>
            </div>
          </Command.Item>

          <Command.Item onSelect={() => handleNavigate("/studio")}>
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <div className="flex-1 flex justify-between items-center">
              <span>Go to AI Intake Studio (PRD Creator)</span>
              <span className="font-mono text-[9px] opacity-45">/studio</span>
            </div>
          </Command.Item>

          {SHOW_AI_INFRA && (
            <Command.Item onSelect={() => handleNavigate("/ai-infra")}>
              <Database className="h-3.5 w-3.5 text-cyan-500" />
              <div className="flex-1 flex justify-between items-center">
                <span>Go to Cloud GPU Infrastructure Marketplace</span>
                <span className="font-mono text-[9px] opacity-45">/ai-infra</span>
              </div>
            </Command.Item>
          )}

          <Command.Item onSelect={() => handleNavigate("/dashboard")}>
            <Code className="h-3.5 w-3.5 text-indigo-500" />
            <div className="flex-1 flex justify-between items-center">
              <span>Go to Deliveries & SOW Dashboard</span>
              <span className="font-mono text-[9px] opacity-45">/dashboard</span>
            </div>
          </Command.Item>
        </Command.Group>

        <Command.Separator className="h-px bg-[#2455FF]/10 my-1" />

        <Command.Group heading="Utility Operations">
          <Command.Item
            onSelect={() => {
              setOpen(false);
              if (window.location.pathname === "/") {
                const el = document.getElementById("hero-metrics");
                el?.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/");
                setTimeout(() => {
                  const el = document.getElementById("hero-metrics");
                  el?.scrollIntoView({ behavior: "smooth" });
                }, 250);
              }
            }}
          >
            <Terminal className="h-3.5 w-3.5 text-slate-500" />
            <div className="flex-1 flex justify-between items-center">
              <span>Check Platform Live Statistics Metrics</span>
              <span className="font-mono text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">STAT</span>
            </div>
          </Command.Item>

          <Command.Item
            onSelect={() => {
              setOpen(false);
              navigate("/dashboard");
            }}
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <div className="flex-1 flex justify-between items-center">
              <span>Open Statement of Work (SOW) Documents view</span>
              <span className="font-mono text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">SOW</span>
            </div>
          </Command.Item>
        </Command.Group>
      </Command.List>

      <div className="flex items-center justify-between px-4 py-2 bg-[#050a1a]/5 border-t border-[#2455FF]/12 text-[10px] font-mono text-slate-400 select-none">
        <span>Search or navigate diagnostics console.</span>
        <span className="flex items-center gap-1">
          <span>Open with</span>
          <kbd className="px-1 py-0.2 rounded border bg-white text-slate-600 font-sans text-[9px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1 py-0.2 rounded border bg-white text-slate-600 font-sans text-[9px]">K</kbd>
        </span>
      </div>
    </Command.Dialog>
  );
};

export default CommandPalette;
