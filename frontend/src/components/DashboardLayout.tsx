"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, Search, Settings, User, Terminal, 
  Cpu, Activity, Globe, Shield, Zap, Layout,
  Sun, Moon, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LogEntry { id: string; agent: string; message: string; timestamp: string; status: string; }

interface DashboardLayoutProps {
  userProfile: { picture?: string } | null;
  sidebarContent: React.ReactNode;
  centralArea: React.ReactNode;
  logs: LogEntry[];
  pipelineStatus: string;
  onNav: (key: string) => void;
}

export default function DashboardLayout({
  userProfile, sidebarContent, centralArea, logs, pipelineStatus, onNav
}: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [showMonitor, setShowMonitor] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => { 
    const savedTheme = localStorage.getItem("skillo_theme");
    const shouldUseDarkMode = savedTheme === "dark";
    if (shouldUseDarkMode) {
      document.documentElement.classList.add("dark");
    }
    const mountedTimer = window.setTimeout(() => {
      setMounted(true);
      setIsDarkMode(shouldUseDarkMode);
      // Auto-hide activity log on small screens
      if (window.innerWidth < 1280) {
        setShowMonitor(false);
      }
    }, 0);
    return () => window.clearTimeout(mountedTimer);
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
      
      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <div className={`fixed inset-y-0 left-0 z-[50] lg:relative lg:z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {sidebarContent}
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col relative overflow-hidden w-full">
        
        {/* ── Top Navigation Bar ── */}
        <header className={`h-16 px-4 md:px-10 flex items-center justify-between border-b z-20 transition-all duration-500 ${isDarkMode ? 'bg-[#111112]/80 border-gray-800/50 backdrop-blur-xl' : 'bg-white/80 border-gray-200/50 backdrop-blur-xl'}`}>
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Layout size={20} className="text-[#0052FF]" />
            </button>

            <div className="hidden md:flex items-center gap-8">
              {[
                { id: "command", label: "Dashboard" },
                { id: "hub", label: "Explore Hub" },
                { id: "classroom", label: "Classroom" }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => onNav(t.id)}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-indigo-500'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            {/* Search Control */}
            <div className={`hidden sm:flex items-center gap-3 px-4 py-2 border rounded-xl cursor-pointer transition-all w-[220px] group ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:border-white/20' : 'bg-gray-50/50 border-gray-100 text-gray-400 hover:bg-gray-100 hover:border-gray-200'}`}>
               <Search size={14} className="group-hover:text-indigo-500 transition-colors" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Search...</span>
            </div>

            {/* Main Action Toolbar */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isDarkMode ? 'bg-white/5 text-yellow-400 hover:bg-white/10' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <div className="flex items-center gap-1 text-gray-400">
                 <button 
                   onClick={() => setIsActivityOpen(!isActivityOpen)}
                   className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isActivityOpen ? 'bg-indigo-500/10 text-indigo-500' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                 >
                   <Activity size={16} />
                 </button>
                 <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:text-indigo-500 transition-all">
                   <Bell size={16} />
                 </button>
                 <button onClick={() => onNav('settings')} className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:text-indigo-500 transition-all">
                   <Settings size={16} />
                 </button>
              </div>

              {/* User Profile */}
              <button onClick={() => onNav('settings')} className={`ml-2 w-9 h-9 rounded-xl border overflow-hidden relative cursor-pointer transition-all hover:ring-2 hover:ring-indigo-500/20 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                 {userProfile?.picture || localStorage.getItem("skillo_user_picture") ? (
                   <img src={userProfile?.picture || localStorage.getItem("skillo_user_picture")!} alt="avatar" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 text-[10px] font-black uppercase">
                      {localStorage.getItem("skillo_user_name")?.slice(0, 2).toUpperCase() || "SK"}
                   </div>
                 )}
              </button>
            </div>
          </div>
        </header>

        {/* ── Content Viewport ── */}
        <div className="flex-1 relative overflow-hidden flex">
          
          {/* Main workspace */}
          <div className="flex-1 overflow-hidden h-full">
            {centralArea}
          </div>

          {/* ── Activity Panel (Overlay on mobile, Aside on desktop) ── */}
          <AnimatePresence>
            {(showMonitor || isActivityOpen) && (
              <>
                {/* Mobile Activity Overlay */}
                {isActivityOpen && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsActivityOpen(false)}
                    className="fixed inset-0 bg-black/40 z-[40] lg:hidden"
                  />
                )}
                
                <motion.aside
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  className={`fixed lg:relative inset-y-0 right-0 w-72 border-l flex flex-col z-[50] lg:z-10 h-full shadow-2xl transition-colors ${isDarkMode ? 'bg-[#111112] border-gray-800' : 'bg-white border-gray-200'}`}
                >
                  {/* Header */}
                  <div className={`p-6 border-b flex items-center justify-between transition-colors ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <Activity size={14} className="text-indigo-500" />
                      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-400' : 'text-[#111827]'}`}>Activity Log</span>
                    </div>
                    <button onClick={() => { setShowMonitor(false); setIsActivityOpen(false); }} className="lg:hidden p-1 text-gray-400 hover:text-white">
                       <X size={14} />
                    </button>
                    <div className="hidden lg:flex gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${pipelineStatus === 'thinking' || pipelineStatus === 'streaming' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                    </div>
                  </div>

                  {/* Real-time Logs */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 styled-scrollbar min-h-0">
                    {logs.map((log, i) => (
                      <motion.div key={log.id || i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="flex gap-3 items-start group">
                        <div className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform shrink-0" />
                        <p className={`text-[11px] font-mono leading-relaxed break-words font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          <span className="text-indigo-500/50 uppercase mr-1">[{log.timestamp || 'SYNCING'}]</span> 
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
                    <div ref={logEndRef} />
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
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
