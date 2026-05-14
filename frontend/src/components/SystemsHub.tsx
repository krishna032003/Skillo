"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, Brain, BookOpen, Calendar, BarChart3, 
  Settings, GraduationCap, Terminal, Shield,
  Cpu, Globe, MessageSquare, Search, Layers,
  ChevronRight, Sparkles, Activity
} from "lucide-react";

interface SystemsHubProps {
  onNav: (key: string) => void;
  onAction: (cmd: string, label: string) => void;
}

export default function SystemsHub({ onNav, onAction }: SystemsHubProps) {
  const systems = [
    { id: "command",   label: "Core Dashboard",  desc: "Neural interface & AI assist", icon: Terminal, color: "indigo" },
    { id: "classroom", label: "Classroom Sync",  desc: "Google Classroom data nodes", icon: GraduationCap, color: "orange" },
    { id: "materials", label: "Learning Assets", desc: "Manage research documents", icon: BookOpen, color: "purple" },
    { id: "focus",     label: "Focus Mode",      desc: "Distraction-free protocols", icon: Zap, color: "amber" },
    { id: "review",    label: "Progress Audit",  desc: "AI-driven weekly analysis", icon: BarChart3, color: "emerald" },
    { id: "timetable", label: "Schedule Grid",   desc: "Dynamic task management", icon: Calendar, color: "pink" },
    { id: "neural_rag", label: "Knowledge Base", desc: "Query your internal library", icon: Brain, color: "indigo" },
    { id: "settings",  label: "Global Config",   desc: "System & API configuration", icon: Settings, color: "gray" },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto styled-scrollbar px-6 md:px-10 py-10 md:py-16 dark:bg-[#0A0A0B] bg-white transition-colors">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        <header>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight dark:text-white text-[#111827]">
            Explore <span className="text-[#0052FF]">Hub.</span>
          </h1>
          <p className="text-gray-400 font-medium text-base md:text-lg mt-2">
            Access all features and tools to manage your learning.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {systems.map((s, i) => {
             const colorMap: Record<string, string> = {
               indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-indigo-500/5",
               orange: "text-orange-500 bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50 hover:shadow-orange-500/5",
               purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50 hover:shadow-purple-500/5",
               amber:  "text-amber-500 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50 hover:shadow-amber-500/5",
               emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/5",
               pink:    "text-pink-500 bg-pink-500/10 border-pink-500/20 hover:border-pink-500/50 hover:shadow-pink-500/5",
               gray:    "text-gray-400 bg-gray-400/10 border-gray-400/20 hover:border-gray-400/50 hover:shadow-gray-400/5",
             };
             const theme = colorMap[s.color] || colorMap.indigo;

             return (
              <motion.button
                key={s.id}
                onClick={() => onNav(s.id)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ delay: i * 0.04 }}
                className={`p-5 md:p-6 border rounded-[28px] text-left transition-all group flex items-center gap-4 md:gap-5 dark:bg-gray-900/40 bg-white border-gray-100 shadow-sm ${theme}`}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/5 group-hover:scale-110 transition-transform shadow-inner">
                  <s.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-xs md:text-sm font-bold tracking-tight dark:text-white text-[#111827] group-hover:text-indigo-500 transition-colors">{s.label}</h4>
                    <ChevronRight size={14} className="hidden sm:block opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                  </div>
                  <p className="text-[10px] md:text-[11px] text-gray-400 font-medium mt-0.5 truncate">{s.desc}</p>
                </div>
              </motion.button>
             );
          })}
        </div>

        {/* ── Status Section ── */}
        <section className="pt-8 border-t dark:border-gray-800 border-gray-100">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-[28px] border space-y-4 dark:bg-gray-900/50 dark:border-gray-800 bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                       <Activity size={16} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-gray-400 text-gray-600">Core Stability</span>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold text-gray-400">
                       <span>UPTIME SYNC</span>
                       <span className="text-emerald-500 font-black">99.9%</span>
                    </div>
                    <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[99.9%]" />
                    </div>
                 </div>
              </div>

              <div className="p-6 rounded-[28px] border space-y-4 dark:bg-gray-900/50 dark:border-gray-800 bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                       <Globe size={16} className="text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-gray-400 text-gray-600">Cloud Nodes</span>
                 </div>
                 <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase tracking-[0.1em]">
                    Active Clusters: 12 <br />
                    Response Time: 24ms
                 </p>
              </div>

              <div className="p-6 rounded-[28px] bg-gradient-to-br from-indigo-600 to-violet-600 text-white space-y-4 shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                    <Sparkles size={64} />
                 </div>
                 <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Assist</span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed opacity-90">
                       Autonomous learning agent active. Standing by for protocol execution.
                    </p>
                    <button onClick={() => onNav('command')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all border border-white/20 backdrop-blur-md">
                       Command Terminal
                    </button>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
