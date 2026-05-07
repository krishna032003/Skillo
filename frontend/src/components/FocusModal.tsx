"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Zap, Shield, Clock, Plus, Minus, 
  Play, Square, AlertCircle, CheckCircle2,
  Lock, Layout, AppWindow
} from "lucide-react";

interface FocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (durationMinutes: number, apps: string[]) => void;
  onStop: () => void;
  active: boolean;
  endTime: string | null;
}

const COMMON_APPS = [
  { name: "WhatsApp", icon: "💬" },
  { name: "Discord",  icon: "🎮" },
  { name: "Spotify",  icon: "🎵" },
  { name: "Slack",    icon: "💼" },
  { name: "Notes",    icon: "📝" },
  { name: "Mail",     icon: "✉️" },
  { name: "Messages", icon: "📱" },
];

export default function FocusModal({ isOpen, onClose, onStart, onStop, active, endTime }: FocusModalProps) {
  const [selectedApps, setSelectedApps] = useState<string[]>(["WhatsApp", "Discord"]);
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(100);
  const [blockAll, setBlockAll] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (active && endTime) {
      const end = new Date(endTime).getTime();
      const start = new Date(endTime).getTime() - (duration * 60000);
      
      interval = setInterval(() => {
        const now = new Date().getTime();
        const total = end - start;
        const remaining = end - now;

        if (remaining <= 0) {
          setTimeLeft("00:00");
          setProgress(0);
          onStop();
        } else {
          const m = Math.floor(remaining / 60000);
          const s = Math.floor((remaining % 60000) / 1000);
          setTimeLeft(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
          setProgress((remaining / total) * 100);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [active, endTime, onStop, duration]);

  const toggleApp = (app: string) => {
    if (blockAll) return;
    setSelectedApps((prev) => prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]);
  };

  const adjustDuration = (amount: number) => {
    setDuration(prev => Math.max(5, Math.min(240, prev + amount)));
  };

  const handleStart = () => {
    const appsToBlock = blockAll ? ["__ALL__"] : selectedApps;
    onStart(duration, appsToBlock);
  };

  if (!isOpen && !active) return null;

  return (
    <AnimatePresence>
      {(isOpen || active) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 dark:bg-[#0A0A0B]/90 bg-white/80 backdrop-blur-xl"
            onClick={active ? undefined : onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="w-full max-w-lg overflow-hidden dark:bg-[#111112] bg-white border dark:border-gray-800 border-gray-100 rounded-[48px] shadow-2xl relative z-10 transition-colors"
          >
            {active ? (
              <div className="p-12 flex flex-col items-center text-center space-y-10">
                <div className="relative w-64 h-64 flex items-center justify-center">
                   {/* Background Glow */}
                   <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-[80px]" />
                   
                   {/* Progress Ring */}
                   <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
                      <circle 
                        cx="128" 
                        cy="128" 
                        r="110" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="transparent" 
                        className="dark:text-gray-800/40 text-gray-100" 
                      />
                      <motion.circle 
                        cx="128" 
                        cy="128" 
                        r="110" 
                        stroke="currentColor" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={691}
                        animate={{ strokeDashoffset: 691 * (1 - progress / 100) }}
                        transition={{ duration: 1, ease: "linear" }}
                        className="text-indigo-500" 
                        strokeLinecap="round"
                      />
                   </svg>

                   <div className="flex flex-col items-center relative z-20">
                      <span className="text-6xl font-display font-black tracking-tighter dark:text-white text-[#111827] tabular-nums">
                        {timeLeft || "..."}
                      </span>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3 opacity-60">Temporal Sync</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <h2 className="text-3xl font-display font-bold dark:text-white text-[#111827]">Deep Work <span className="text-indigo-500">Active.</span></h2>
                   <div className="inline-flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-5 py-2 rounded-full border border-emerald-500/20">
                      <Shield size={14} className="animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Neural Shield Engaged</span>
                   </div>
                   <p className="text-gray-400 font-medium text-xs max-w-xs leading-relaxed uppercase tracking-widest opacity-80">
                      {blockAll 
                        ? "Protocol: Total Isolation // All non-essential nodes offline"
                        : `Protocol: Selective Filter // Blocking ${selectedApps.length} neural distractions`}
                   </p>
                </div>

                <button 
                  onClick={onStop}
                  className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-500/10"
                >
                  <Square size={14} fill="currentColor" />
                  Terminate Session
                </button>
              </div>
            ) : (
              <>
                <div className="p-8 border-b dark:border-gray-800 border-gray-100 flex justify-between items-center dark:bg-gray-900/30 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold dark:text-white text-[#111827]">Focus <span className="text-indigo-500">Shield.</span></h2>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Initialize Deep Work Protocol</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="w-10 h-10 rounded-xl dark:bg-gray-800 bg-white border dark:border-gray-700 border-gray-200 text-gray-400 flex items-center justify-center hover:text-indigo-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-10 space-y-10">
                  {/* Timer Setup */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Temporal Scope</label>
                       <span className="text-[11px] font-display font-black dark:text-gray-400 text-gray-600 uppercase tracking-widest">{duration} Minutes</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <button onClick={() => adjustDuration(-5)} className="w-14 h-14 rounded-2xl dark:bg-gray-800 bg-gray-50 dark:text-white text-gray-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all active:scale-90 border dark:border-gray-700 border-gray-200 shadow-sm">
                          <Minus size={20} />
                       </button>
                       <div className="flex-1 h-14 rounded-2xl dark:bg-gray-900 bg-gray-50 border dark:border-gray-800 border-gray-100 flex items-center justify-center px-6">
                          <input 
                            type="range" min="5" max="240" step="5" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full accent-indigo-500"
                          />
                       </div>
                       <button onClick={() => adjustDuration(5)} className="w-14 h-14 rounded-2xl dark:bg-gray-800 bg-gray-50 dark:text-white text-gray-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all active:scale-90 border dark:border-gray-700 border-gray-200 shadow-sm">
                          <Plus size={20} />
                       </button>
                    </div>
                  </div>

                  {/* App Blocking Options */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Shield Calibration</label>
                    </div>
                    
                    <button 
                      onClick={() => setBlockAll(!blockAll)}
                      className={`w-full flex items-center justify-between p-6 rounded-[28px] border transition-all ${blockAll ? 'bg-red-500/10 border-red-500/30' : 'dark:bg-gray-900 bg-gray-50 dark:border-gray-800 border-gray-100 hover:border-indigo-500/30'}`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${blockAll ? 'bg-red-500 text-white' : 'dark:bg-gray-800 bg-white border dark:border-gray-700 border-gray-200 text-gray-400'}`}>
                             <Lock size={20} />
                          </div>
                          <div className="text-left">
                             <p className={`text-sm font-display font-bold ${blockAll ? 'text-red-500' : 'dark:text-white text-gray-800'}`}>Total Node Isolation</p>
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Maximum Focus Integrity</p>
                          </div>
                       </div>
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${blockAll ? 'bg-red-500 border-red-500 scale-110' : 'dark:border-gray-700 border-gray-200'}`}>
                          {blockAll && <CheckCircle2 size={14} className="text-white" />}
                       </div>
                    </button>

                    {!blockAll && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Selective Node Filtering</p>
                        <div className="flex flex-wrap gap-2.5">
                          {COMMON_APPS.map(app => (
                            <button
                              key={app.name}
                              onClick={() => toggleApp(app.name)}
                              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border transition-all text-[11px] font-bold ${
                                selectedApps.includes(app.name) 
                                ? "bg-red-500/10 border-red-500/30 text-red-500" 
                                : "dark:bg-gray-900 bg-white dark:border-gray-800 border-gray-200 text-gray-500 hover:border-indigo-500/30"
                              }`}
                            >
                              <span className="text-base">{app.icon}</span>
                              {app.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleStart}
                    className="w-full py-6 rounded-[32px] bg-indigo-500 text-white font-display font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Play size={18} fill="currentColor" />
                    Engage Neural Shield
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
