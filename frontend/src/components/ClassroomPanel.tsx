"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  GraduationCap, Book, Calendar, ExternalLink, 
  Clock, CheckCircle2, ChevronRight, Search,
  Filter, SortAsc, RefreshCw, Loader2
} from "lucide-react";

interface Course {
  id?: string;
  name?: string;
  section?: string;
  descriptionHeading?: string;
  alternateLink?: string;
}

interface Assignment {
  title?: string;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours: number; minutes: number };
  courseName?: string;
  alternateLink?: string;
}

interface ClassroomPanelProps {
  courses: Course[];
  assignments: Assignment[];
  isLoading: boolean;
  onSync: () => void;
}

export default function ClassroomPanel({ 
  courses, assignments, isLoading, onSync 
}: ClassroomPanelProps) {
  return (
    <div className="flex flex-col h-full dark:bg-[#0A0A0B] bg-white transition-colors overflow-hidden">
      {/* ── Header ── */}
      {/* ── Header ── */}
      <header className="px-6 md:px-10 py-6 md:py-8 border-b dark:border-gray-800 border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 text-center sm:text-left">
        <div className="space-y-1">
          <h1 className="font-display text-3xl md:text-4xl dark:text-white text-[#111827] tracking-tight">
            Classroom<span className="text-indigo-500">.</span>
          </h1>
          <p className="text-gray-400 font-medium text-[8px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] opacity-80">
            Node: {courses.length} Active Courses // {assignments.length} Tasks
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <button 
            onClick={onSync}
            disabled={isLoading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl md:rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-display font-bold text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
           >
             {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
             Refresh Nodes
           </button>
           <button className="p-3 rounded-xl md:rounded-2xl dark:bg-gray-900 dark:border-gray-800 border border-gray-100 text-gray-400 hover:text-indigo-500 transition-all shrink-0">
             <Filter size={18} />
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 md:py-10 space-y-10 md:space-y-12 styled-scrollbar">
        
        {/* ── Assignments Section ── */}
        <section className="space-y-5 md:space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Clock size={16} />
                </div>
                <h3 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">Priority Protocols</h3>
             </div>
             <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest shrink-0 ml-2">
               {assignments.length} Pending
             </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {isLoading && assignments.length === 0 ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-28 rounded-3xl dark:bg-gray-900/50 bg-gray-50 animate-pulse" />
              ))
            ) : assignments.length > 0 ? (
              assignments.map((assignment, i) => (
                <motion.a
                  key={i}
                  href={assignment.alternateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 md:p-5 dark:bg-gray-900/40 bg-white border dark:border-gray-800 border-gray-100 rounded-[24px] md:rounded-[28px] hover:border-indigo-500/40 hover:shadow-xl transition-all group flex items-center justify-between"
                >
                  <div className="space-y-1 min-w-0 pr-3 md:pr-4">
                    <p className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest truncate">
                      {assignment.courseName || "General Protocol"}
                    </p>
                    <h4 className="font-display font-bold text-sm dark:text-gray-100 text-gray-800 group-hover:text-indigo-500 transition-colors line-clamp-2 break-words">
                      {assignment.title}
                    </h4>
                    {assignment.dueDate && (
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-medium flex items-center gap-1.5 mt-1 md:mt-1.5">
                        <Calendar size={12} className="text-indigo-500/50" />
                        Due: {assignment.dueDate.day}/{assignment.dueDate.month}
                      </p>
                    )}
                  </div>
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl dark:bg-gray-800 bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0">
                    <ExternalLink size={14} />
                  </div>
                </motion.a>
              ))
            ) : (
              <div className="col-span-full py-10 flex flex-col items-center justify-center border-2 border-dashed dark:border-gray-800 border-gray-100 rounded-[28px] md:rounded-[32px]">
                 <CheckCircle2 size={28} className="text-emerald-500/20 mb-3" />
                 <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">Protocol Complete</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Courses Section ── */}
        <section className="space-y-5 md:space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <GraduationCap size={16} />
                </div>
                <h3 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">Knowledge Nodes</h3>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {isLoading && courses.length === 0 ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-40 rounded-3xl dark:bg-gray-900/50 bg-gray-50 animate-pulse" />
              ))
            ) : courses.length > 0 ? (
              courses.map((course, i) => (
                <motion.a
                  key={course.id || i}
                  href={course.alternateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5 md:p-6 dark:bg-gray-900/40 bg-white border dark:border-gray-800 border-gray-100 rounded-[28px] md:rounded-[32px] hover:border-indigo-500/40 hover:shadow-2xl transition-all group flex flex-col justify-between aspect-square min-h-[160px]"
                >
                  <div className="space-y-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      <Book size={18} />
                    </div>
                    <h4 className="font-display font-bold text-sm md:text-base dark:text-white text-[#111827] leading-tight line-clamp-2">
                      {course.name}
                    </h4>
                    {course.section && (
                      <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-60 truncate">
                        {course.section}
                      </p>
                    )}
                  </div>
                  
                  <div className="pt-4 md:pt-5 flex items-center justify-between border-t dark:border-gray-800 border-gray-50">
                    <span className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Launch Module</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition-all transform group-hover:translate-x-1" />
                  </div>
                </motion.a>
              ))
            ) : (
              <div className="col-span-full py-16 md:py-20 flex flex-col items-center justify-center dark:bg-gray-900/50 bg-gray-50 rounded-[32px] md:rounded-[40px] border dark:border-gray-800 border-gray-100">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full dark:bg-gray-800 bg-white shadow-sm flex items-center justify-center mb-4 md:mb-6">
                  <Search size={24} className="text-gray-400 opacity-20" />
                </div>
                <h4 className="text-sm md:text-base font-display text-gray-500 uppercase tracking-widest mb-2">No Active Nodes</h4>
                <p className="text-[9px] md:text-[10px] text-gray-400 max-w-[240px] text-center font-bold uppercase tracking-widest leading-relaxed">
                  Awaiting synchronization with Classroom architecture.
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
