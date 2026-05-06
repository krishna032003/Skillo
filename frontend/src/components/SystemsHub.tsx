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
    { id: "command",   label: "Dashboard",       desc: "Main interface & AI assistant", icon: Terminal, color: "bg-blue-50 text-[#0052FF] dark:bg-blue-900/30" },
    { id: "classroom", label: "Classroom",       desc: "Google Classroom integration", icon: GraduationCap, color: "bg-orange-50 text-orange-500 dark:bg-orange-900/30" },
    { id: "materials", label: "Materials",       desc: "Manage your study documents", icon: BookOpen, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30" },
    { id: "focus",     label: "Focus Mode",      desc: "Distraction-free study sessions", icon: Zap, color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30" },
    { id: "review",    label: "Weekly Review",   desc: "AI progress analysis", icon: BarChart3, color: "bg-green-50 text-green-600 dark:bg-green-900/30" },
    { id: "timetable", label: "Daily Schedule",  icon: Calendar, desc: "Schedule & task management", color: "bg-pink-50 text-pink-500 dark:bg-pink-900/30" },
    { id: "neural_rag", label: "Library",        desc: "Search your knowledge base", icon: Brain, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30" },
    { id: "settings",  label: "Settings",        desc: "Configure your workspace", icon: Settings, color: "bg-gray-50 text-gray-600 dark:bg-gray-800/50" },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto styled-scrollbar px-10 py-16 dark:bg-[#0A0A0B] bg-white transition-colors">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        <header>
          <h1 className="font-display text-5xl tracking-tight dark:text-white text-[#111827]">
            Explore <span className="text-[#0052FF]">Hub.</span>
          </h1>
          <p className="text-gray-400 font-medium text-lg mt-2">
            Access all features and tools to manage your learning.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systems.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => onNav(s.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-8 border rounded-[32px] text-left transition-all group flex flex-col justify-between aspect-square dark:bg-gray-900 dark:border-gray-800 hover:border-[#0052FF]/30 hover:shadow-xl bg-white border-gray-100"
            >
              <div className="space-y-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${s.color} group-hover:scale-110 transition-transform`}>
                  <s.icon size={28} />
                </div>
                <div>
                  <h4 className="font-display text-xl uppercase tracking-tight dark:text-white text-[#111827]">{s.label}</h4>
                  <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
              
              <div className="pt-6 flex items-center justify-between border-t dark:border-gray-800 border-gray-50">
                <span className="text-[10px] font-black text-[#0052FF] uppercase tracking-widest">Open Feature</span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0052FF] transition-all transform group-hover:translate-x-1" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* ── Status Section ── */}
        <section className="pt-12 border-t dark:border-gray-800 border-gray-100">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-[40px] border space-y-4 dark:bg-gray-900 dark:border-gray-800 bg-gray-50 border-gray-100">
                 <div className="flex items-center gap-3">
                    <Activity size={20} className="text-[#0052FF]" />
                    <span className="text-xs font-bold uppercase tracking-widest dark:text-white text-[#111827]">System Status</span>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                       <span>Stability</span>
                       <span className="text-green-500">99.9%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden border dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-100">
                       <div className="h-full bg-green-500 w-[99.9%]" />
                    </div>
                 </div>
              </div>

              <div className="p-8 rounded-[40px] border space-y-4 dark:bg-gray-900 dark:border-gray-800 bg-gray-50 border-gray-100">
                 <div className="flex items-center gap-3">
                    <Globe size={20} className="text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-widest dark:text-white text-[#111827]">Sync Status</span>
                 </div>
                 <p className="text-[10px] font-medium text-gray-400 leading-relaxed uppercase tracking-widest">
                    Last updated: {new Date().toLocaleTimeString()} <br />
                    Cloud connection active
                 </p>
              </div>

              <div className="p-8 rounded-[40px] bg-[#0052FF] text-white space-y-4 shadow-[0_20px_50px_rgba(0,82,255,0.3)]">
                 <div className="flex items-center gap-3">
                    <Sparkles size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">AI Assistant</span>
                 </div>
                 <p className="text-sm font-medium leading-relaxed">
                    Our AI is here to help you manage your study schedule and materials.
                 </p>
                 <button onClick={() => onNav('command')} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Back to Dashboard
                 </button>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
