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
            className="absolute inset-0 bg-[#0A0A0B]/90 backdrop-blur-xl"
            onClick={active ? undefined : onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg overflow-hidden bg-[#111112] border border-gray-800 rounded-[48px] shadow-2xl relative z-10"
          >
            {active ? (
              <div className="p-12 flex flex-col items-center text-center space-y-10">
                <div className="relative w-64 h-64 flex items-center justify-center">
                   {/* Progress Ring */}
                   <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                      <motion.circle 
                        cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={754}
                        animate={{ strokeDashoffset: 754 * (1 - progress / 100) }}
                        transition={{ duration: 1, ease: "linear" }}
                        className="text-[#0052FF]" 
                      />
                   </svg>
                   <div className="flex flex-col items-center">
                      <span className="text-6xl font-display tracking-tighter text-white tabular-nums">
                        {timeLeft || "..."}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Time Remaining</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <h2 className="text-3xl font-display text-white">Deep Work <span className="text-[#0052FF]">Active.</span></h2>
                   <div className="flex items-center justify-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                      <Shield size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Focus Shield Engaged</span>
                   </div>
                   <p className="text-gray-400 font-medium text-sm max-w-xs leading-relaxed">
                      {blockAll 
                        ? "All non-essential applications are currently blocked to protect your flow."
                        : `Guarding your focus by auto-quitting ${selectedApps.length} distraction sources.`}
                   </p>
                </div>

                <button 
                  onClick={onStop}
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
                >
                  <Square size={14} fill="currentColor" />
                  Abort Focus Session
                </button>
              </div>
            ) : (
              <>
                <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0052FF] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-display text-white">Focus <span className="text-[#0052FF]">Shield.</span></h2>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Initialize Deep Work Session</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-10 space-y-10">
                  {/* Timer Setup */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-[#0052FF] uppercase tracking-[0.2em]">Session Duration</label>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{duration} Minutes</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <button onClick={() => adjustDuration(-5)} className="w-14 h-14 rounded-2xl bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-all active:scale-90">
                          <Minus size={20} />
                       </button>
                       <div className="flex-1 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                          <input 
                            type="range" min="5" max="240" step="5" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-[80%] accent-[#0052FF]"
                          />
                       </div>
                       <button onClick={() => adjustDuration(5)} className="w-14 h-14 rounded-2xl bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-all active:scale-90">
                          <Plus size={20} />
                       </button>
                    </div>
                  </div>

                  {/* App Blocking Options */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-[#0052FF] uppercase tracking-[0.2em]">Shield Configuration</label>
                    </div>
                    
                    <button 
                      onClick={() => setBlockAll(!blockAll)}
                      className={`w-full flex items-center justify-between p-5 rounded-[24px] border transition-all ${blockAll ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${blockAll ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                             <Lock size={18} />
                          </div>
                          <div className="text-left">
                             <p className={`text-sm font-bold ${blockAll ? 'text-red-400' : 'text-white'}`}>Block ALL Non-Essential Apps</p>
                             <p className="text-[10px] text-gray-500 font-medium">Maximum isolation mode</p>
                          </div>
                       </div>
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${blockAll ? 'bg-red-500 border-red-500' : 'border-gray-700'}`}>
                          {blockAll && <CheckCircle2 size={14} className="text-white" />}
                       </div>
                    </button>

                    {!blockAll && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Selective Distraction Blocking</p>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_APPS.map(app => (
                            <button
                              key={app.name}
                              onClick={() => toggleApp(app.name)}
                              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-xs font-bold ${
                                selectedApps.includes(app.name) 
                                ? "bg-red-500/10 border-red-500/30 text-red-500" 
                                : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
                              }`}
                            >
                              <span>{app.icon}</span>
                              {app.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleStart}
                    className="w-full py-6 rounded-[28px] bg-[#0052FF] text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Play size={18} fill="currentColor" />
                    Engage Focus Protocol
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
