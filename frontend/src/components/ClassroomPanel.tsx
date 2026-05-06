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
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* ── Header ── */}
      <header className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <div>
          <h1 className="font-display text-4xl text-[#111827] tracking-tight">
            Classroom.
          </h1>
          <p className="text-gray-400 font-medium text-sm mt-1">
            Managing {courses.length} courses and {assignments.length} pending assignments.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
            onClick={onSync}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-50 text-[#0052FF] font-bold text-xs uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-50"
           >
             {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
             Refresh Data
           </button>
           <button className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
             <Filter size={18} />
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-10 space-y-12 styled-scrollbar">
        
        {/* ── Assignments Section ── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                 <Clock size={16} />
               </div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Pending Assignments</h3>
             </div>
             <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold">
               {assignments.length} PENDING
             </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading && assignments.length === 0 ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-24 rounded-3xl bg-gray-50 animate-pulse" />
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
                  className="p-6 bg-white border border-gray-100 rounded-[28px] hover:border-orange-200 hover:shadow-xl transition-all group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                      {assignment.courseName || "General"}
                    </p>
                    <h4 className="font-display text-lg text-[#111827] group-hover:text-[#0052FF] transition-colors line-clamp-1">
                      {assignment.title}
                    </h4>
                    {assignment.dueDate && (
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-1">
                        <Calendar size={12} />
                        Due: {assignment.dueDate.day}/{assignment.dueDate.month}/{assignment.dueDate.year}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#0052FF] group-hover:text-white transition-all">
                    <ExternalLink size={16} />
                  </div>
                </motion.a>
              ))
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[32px]">
                 <CheckCircle2 size={40} className="text-green-200 mb-4" />
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">All caught up!</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Courses Section ── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0052FF]">
                 <GraduationCap size={16} />
               </div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">My Courses</h3>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading && courses.length === 0 ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 rounded-3xl bg-gray-50 animate-pulse" />
              ))
            ) : courses.length > 0 ? (
              courses.map((course, i) => (
                <motion.a
                  key={course.id || i}
                  href={course.alternateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8 bg-white border border-gray-100 rounded-[32px] hover:border-[#0052FF]/30 hover:shadow-2xl transition-all group flex flex-col justify-between aspect-square"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0052FF] flex items-center justify-center group-hover:bg-[#0052FF] group-hover:text-white transition-all">
                      <Book size={24} />
                    </div>
                    <h4 className="font-display text-xl text-[#111827] leading-tight">
                      {course.name}
                    </h4>
                    {course.section && (
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Section: {course.section}
                      </p>
                    )}
                  </div>
                  
                  <div className="pt-6 flex items-center justify-between border-t border-gray-50">
                    <span className="text-[10px] font-black text-[#0052FF] uppercase tracking-widest">Open Course</span>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0052FF] transition-all transform group-hover:translate-x-1" />
                  </div>
                </motion.a>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50 rounded-[40px] border border-gray-100">
                <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                  <Search size={32} className="text-gray-200" />
                </div>
                <h4 className="text-lg font-display text-[#111827] mb-2">No Courses Found</h4>
                <p className="text-sm text-gray-400 max-w-xs text-center font-medium leading-relaxed">
                  We couldn't find any active courses in your Google Classroom. Try refreshing your data.
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
