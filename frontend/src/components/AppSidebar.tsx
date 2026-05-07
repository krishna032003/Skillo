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
  userProfile: any;
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
  userProfile, activeNav, onNav, focusProgress, totalFocusMinutes, 
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
      <div className="h-20 px-8 flex items-center">
        <span className="font-display text-2xl font-black tracking-tighter dark:text-white text-[#111827] uppercase leading-none">
          Skillo<span className="text-indigo-500">.</span>
        </span>
      </div>

      {/* ── User Context ── */}
      <div className="px-6 mb-8">
        <div className="p-5 rounded-3xl border flex flex-col gap-4 group transition-all duration-300 dark:bg-gray-900/40 dark:border-gray-800/50 bg-gray-50/80 border-gray-100 hover:border-[#0052FF]/20 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 via-[#0052FF] to-purple-500">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-[#0052FF] font-bold overflow-hidden relative">
                   {userProfile?.picture || localStorage.getItem("lifeos_user_picture") ? (
                     <img src={userProfile?.picture || localStorage.getItem("lifeos_user_picture")!} alt="avatar" className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xs">{localStorage.getItem("lifeos_user_name")?.slice(0, 2).toUpperCase() || "GY"}</span>
                   )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black uppercase tracking-wider dark:text-white text-[#111827] truncate">
                   {userProfile?.name || localStorage.getItem("lifeos_user_name") || "Gaurav Yadav"}
                 </p>
                 <div className="flex items-center gap-1.5 mt-0.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${isFocusActive ? 'bg-emerald-500 animate-pulse' : 'bg-[#0052FF]'}`} />
                   <p className={`text-[9px] font-bold uppercase tracking-widest ${isFocusActive ? 'text-emerald-500' : 'text-[#0052FF]'}`}>
                     {isFocusActive ? "Deep Focus" : "System Ready"}
                   </p>
                 </div>
              </div>
           </div>
           
           {/* Focus Progress Mini Bar */}
           <div className="space-y-2">
             <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">
               <span>Focus Protocol</span>
               <span className="dark:text-gray-300 text-gray-600">{focusProgress}%</span>
             </div>
             <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${focusProgress}%` }}
                 className="h-full bg-gradient-to-r from-[#0052FF] to-[#80AFFF]"
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
            <motion.button
              key={item.id}
              onClick={() => onNav(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full group flex items-center gap-3.5 px-6 py-3 rounded-2xl transition-all duration-500 relative overflow-hidden ${
                isActive 
                ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] ring-1 ring-white/20" 
                : "text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="glow"
                  className="absolute inset-0 bg-white/10 blur-xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
              <item.icon size={18} className={`transition-all duration-300 ${isActive ? "text-white scale-110 drop-shadow-md" : "group-hover:text-indigo-500 group-hover:scale-110"}`} />
              <span className={`text-[11px] font-display font-bold tracking-[0.1em] uppercase transition-all duration-300 ${isActive ? "text-white translate-x-1" : "group-hover:translate-x-1"}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-indicator" 
                  className="absolute left-0 w-1 h-1/2 bg-white rounded-full ml-1"
                  initial={{ height: 0 }}
                  animate={{ height: "40%" }}
                />
              )}
            </motion.button>
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
            className="w-full group flex items-center gap-3.5 px-6 py-2.5 rounded-2xl text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-all duration-500"
           >
              <item.icon size={15} className={item.loading ? "animate-spin" : "group-hover:scale-110 transition-transform"} />
              <span className="text-[10px] font-display font-bold uppercase tracking-[0.15em]">{item.label}</span>
           </button>
          ))}
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
        <button 
          onClick={() => onNav("settings")}
          className={`w-full flex items-center gap-3.5 px-6 py-3 rounded-2xl transition-all duration-500 text-[11px] font-display font-bold uppercase tracking-[0.1em] ${
            activeNav === 'settings' 
            ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-[0_10px_25px_-8px_rgba(79,70,229,0.4)] ring-1 ring-white/10' 
            : 'text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10'
          }`}
        >
          <Settings size={16} />
          Settings
        </button>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="w-full flex items-center gap-3.5 px-6 py-3 rounded-2xl transition-all duration-500 text-[11px] font-display font-bold uppercase tracking-[0.1em] dark:bg-gray-900/40 dark:text-gray-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
