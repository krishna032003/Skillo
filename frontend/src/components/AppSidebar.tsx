"use client";
import React from "react";
import { 
  LayoutDashboard, BookOpen, Clock, Zap, 
  Settings, LogOut, ChevronRight, MessageSquare,
  BarChart3, Brain, Layers, GraduationCap,
  Calendar, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";

interface AppSidebarProps {
  activeNav: string;
  onNav: (key: string) => void;
  focusProgress: number;
  totalFocusMinutes: number;
  isFocusActive: boolean;
  classroomData: any[];
  assignmentsData: any[];
  isClassroomLoading: boolean;
  onSyncClassroom: () => void;
}

export default function AppSidebar({ 
  activeNav, onNav, focusProgress, totalFocusMinutes, 
  isFocusActive, classroomData, assignmentsData, 
  isClassroomLoading, onSyncClassroom 
}: AppSidebarProps) {
  
  const menuItems = [
    { id: "command",   label: "Dashboard",       icon: LayoutDashboard },
    { id: "hub",       label: "Explore Hub",     icon: Layers },
    { id: "classroom", label: "Classroom",       icon: GraduationCap },
    { id: "materials", label: "Materials",       icon: BookOpen },
    { id: "focus",     label: "Focus Mode",      icon: Zap },
    { id: "review",    label: "Weekly Review",   icon: BarChart3 },
    { id: "timetable", label: "Daily Schedule",  icon: Calendar },
  ];

  return (
    <aside className="w-72 border-r flex flex-col h-full z-30 transition-colors dark:bg-[#111112] dark:border-gray-800 bg-white border-gray-200">
      
      {/* ── Brand Section ── */}
      <div className="h-20 px-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center text-white font-black text-xl">S</div>
        <span className="font-display text-2xl tracking-tight dark:text-white text-[#111827]">Skillo<span className="text-[#0052FF]">.</span></span>
      </div>

      {/* ── User Context ── */}
      <div className="px-6 mb-8">
        <div className="p-4 rounded-2xl border flex flex-col gap-3 group transition-all dark:bg-blue-900/20 dark:border-blue-900/30 bg-blue-50/50 border-blue-100 hover:border-[#0052FF]/30">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#0052FF] font-bold overflow-hidden relative">
                 {localStorage.getItem("lifeos_user_picture") ? (
                   <img src={localStorage.getItem("lifeos_user_picture")!} alt="avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span>{localStorage.getItem("lifeos_user_name")?.slice(0, 2).toUpperCase() || "GY"}</span>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold uppercase tracking-wider dark:text-white text-[#111827] truncate">
                   {localStorage.getItem("lifeos_user_name") || "Gaurav Yadav"}
                 </p>
                 <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 ${isFocusActive ? 'text-emerald-500 animate-pulse' : 'text-[#0052FF]'}`}>
                   {isFocusActive ? "Deep Focus" : "Status: Ready"}
                 </p>
              </div>
           </div>
           
           {/* Focus Progress Mini Bar */}
           <div className="space-y-1.5 pt-1">
             <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.1em] text-gray-400">
               <span>Focus Progress</span>
               <span>{focusProgress}%</span>
             </div>
             <div className="h-1 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${focusProgress}%` }}
                 className="h-full bg-[#0052FF]"
               />
             </div>
           </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto styled-scrollbar">
        <p className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Navigation</p>
        {menuItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative ${
                isActive 
                ? "bg-[#0052FF] text-white shadow-[0_4px_12px_rgba(0,82,255,0.2)]" 
                : "text-gray-500 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:bg-gray-50 hover:text-[#111827] dark:hover:text-white"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-white" : "group-hover:text-[#0052FF] transition-colors"} />
              <span className={`text-[13px] font-bold tracking-wide ${isActive ? "text-white" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div layoutId="active-pill" className="absolute right-4 w-1 h-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}

        <div className="pt-6 pb-2">
          <p className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Quick Actions</p>
          {[
            { id: "neural_rag", label: "Open Library", icon: Brain },
            { id: "sync_classroom", label: "Refresh Data", icon: RefreshCw, action: onSyncClassroom, loading: isClassroomLoading },
          ].map(item => (
             <button 
              key={item.id} 
              onClick={() => item.action ? item.action() : onNav(item.id)}
              className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#0052FF] transition-all"
             >
                <item.icon size={16} className={item.loading ? "animate-spin" : ""} />
                <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
             </button>
          ))}
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
        <button 
          onClick={() => onNav("settings")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${activeNav === 'settings' ? 'bg-[#0052FF] text-white' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
        >
          <Settings size={16} />
          Settings
        </button>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest dark:bg-gray-900 dark:text-gray-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
