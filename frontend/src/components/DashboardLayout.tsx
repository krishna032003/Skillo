"use client";
import React, { useState, useEffect } from "react";
import { 
  Bell, Search, Settings, User, Terminal, 
  Cpu, Activity, Globe, Shield, Zap, Layout,
  Sun, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LogEntry { id: string; agent: string; message: string; timestamp: string; status: string; }

interface DashboardLayoutProps {
  sidebarContent: React.ReactNode;
  centralArea: React.ReactNode;
  logs: LogEntry[];
  pipelineStatus: string;
  onNav: (key: string) => void;
}

export default function DashboardLayout({
  sidebarContent, centralArea, logs, pipelineStatus, onNav
}: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [showMonitor, setShowMonitor] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => { 
    setMounted(true);
    const savedTheme = localStorage.getItem("skillo_theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("skillo_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("skillo_theme", "light");
    }
  };

  if (!mounted) return null;

  return (
    <div className={`flex h-screen overflow-hidden selection:bg-[#0052FF]/10 font-body relative w-full ${isDarkMode ? 'bg-[#0A0A0B] text-white' : 'bg-[#F9FAFB] text-[#111827]'}`}>
      
      {/* ── Sidebar ── */}
      {sidebarContent}

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* ── Top Navigation Bar ── */}
        <header className={`h-16 px-10 flex items-center justify-between border-b z-20 shadow-sm shrink-0 transition-colors ${isDarkMode ? 'bg-[#111112] border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNav('command')}>
              <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center text-white font-black text-xl">S</div>
              <span className={`font-display text-xl tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-[#111827]'}`}>Skillo<span className="text-[#0052FF]">.</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              {[
                { id: "command", label: "Dashboard" },
                { id: "hub", label: "Explore Hub" },
                { id: "classroom", label: "Classroom" }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => onNav(t.id)}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-[#0052FF]'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border rounded-lg cursor-pointer transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-500 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}>
               <Search size={14} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Search Knowledge</span>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex items-center gap-4 text-gray-400">
               <Bell size={18} className="hover:text-[#0052FF] cursor-pointer transition-colors" />
               <Settings size={18} className="hover:text-[#0052FF] cursor-pointer transition-colors" onClick={() => onNav('settings')} />
               <div className={`w-8 h-8 rounded-full border overflow-hidden relative cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`} onClick={() => onNav('settings')}>
                  {localStorage.getItem("lifeos_user_picture") ? (
                    <img src={localStorage.getItem("lifeos_user_picture")!} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-[#0052FF] text-[10px] font-black uppercase">
                       {localStorage.getItem("lifeos_user_name")?.slice(0, 2).toUpperCase() || "GY"}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </header>

        {/* ── Content Viewport ── */}
        <div className="flex-1 relative overflow-hidden flex">
          
          {/* Main workspace */}
          <div className="flex-1 overflow-hidden h-full">
            {centralArea}
          </div>

          {/* ── Activity Panel (Right) ── */}
          <AnimatePresence>
            {showMonitor && (
              <motion.aside
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                className={`w-80 border-l flex flex-col z-10 h-full shadow-2xl transition-colors ${isDarkMode ? 'bg-[#111112] border-gray-800' : 'bg-white border-gray-200'}`}
              >
                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between transition-colors ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <Activity size={14} className="text-[#0052FF]" />
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-400' : 'text-[#111827]'}`}>Activity Log</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${pipelineStatus === 'thinking' || pipelineStatus === 'streaming' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                  </div>
                </div>

                {/* Real-time Logs */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 styled-scrollbar">
                  {logs.map((log, i) => (
                    <motion.div key={log.id || i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                      className="flex gap-3 items-start group">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-[#0052FF] group-hover:scale-150 transition-transform shrink-0" />
                      <p className={`text-[11px] font-mono leading-relaxed break-words font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <span className="text-[#0052FF]/50 uppercase mr-1">[{log.timestamp || 'SYNCING'}]</span> 
                        <span className={`font-bold mr-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{log.agent}:</span>
                        {log.message}
                      </p>
                    </motion.div>
                  ))}
                  {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
                      <Activity size={32} className="mb-4 opacity-20" />
                      <p className="text-[9px] font-bold uppercase tracking-[0.3em]">Awaiting Activity</p>
                    </div>
                  )}
                </div>

                {/* Footer Status */}
                <div className={`p-4 border-t flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest transition-colors ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <Globe size={10} />
                    <span>Sync Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={10} />
                    <span>Secure</span>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
