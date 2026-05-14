"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from "@/services/api";
import { X, Calendar, Plus, Trash2, Zap, Clock, CheckCircle2, Coffee, Sparkles, Loader2, AlertCircle } from "lucide-react";

export interface Task {
  title: string;
  durationMinutes: number;
  priority: 'High' | 'Medium' | 'Low';
  deadline?: string;
}

export interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

interface ScheduleItem {
  time: string;
  task: string;
  duration: number;
  type: 'work' | 'break';
}

interface GeneratedSchedule {
  schedule: ScheduleItem[];
  message: string;
}

export default function TimetableModal({ isOpen, onClose, userId }: TimetableModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({ title: '', durationMinutes: 30, priority: 'Medium' });
  const [availableTime, setAvailableTime] = useState<number>(120); // default 2 hours
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddTask = () => {
    if (!newTask.title.trim() || newTask.durationMinutes <= 0) return;
    setTasks([...tasks, newTask]);
    setNewTask({ title: '', durationMinutes: 30, priority: 'Medium' });
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (tasks.length === 0) {
      setError("Add at least one task protocol to begin calibration.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setSchedule(null);
    
    try {
      const res = await fetch(`${API_BASE}/api/timetable/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          tasks: tasks,
          available_time_minutes: availableTime
        })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Timetable synthesis failed.");
      }
      
      const data = await res.json();
      setSchedule(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Neural link error.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 dark:bg-[#0A0A0B]/90 bg-white/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.98, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 10 }}
        className="relative w-full max-w-2xl dark:bg-[#111112] bg-white border dark:border-gray-800 border-gray-100 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors"
      >
        <div className="p-8 border-b dark:border-gray-800 border-gray-100 flex justify-between items-center dark:bg-gray-900/30 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold dark:text-white text-[#111827]">Temporal <span className="text-indigo-500">Planner.</span></h2>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Neural Schedule Synthesis</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl dark:bg-gray-800 bg-white border dark:border-gray-700 border-gray-200 text-gray-400 flex items-center justify-center hover:text-indigo-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto styled-scrollbar flex-1">
          {schedule ? (
            <div className="space-y-8">
              <div className="p-6 rounded-3xl dark:bg-indigo-500/10 dark:border-indigo-500/20 bg-indigo-50 border-indigo-100 text-indigo-700 dark:text-indigo-300 text-sm font-medium leading-relaxed">
                <Sparkles size={16} className="inline mr-2 -mt-1" />
                {schedule.message}
              </div>
              
              <div className="space-y-4 relative">
                <div className="absolute left-[21px] top-4 bottom-4 w-px dark:bg-gray-800 bg-gray-100" />
                
                {schedule.schedule.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className="relative flex items-center gap-5 group"
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all ${item.type === 'break' ? 'dark:bg-gray-800 bg-gray-100 text-gray-400' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}>
                      {item.type === 'break' ? <Coffee size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <div className={`flex-1 p-5 rounded-3xl border transition-all ${item.type === 'break' ? 'dark:border-gray-800/50 border-gray-100 dark:bg-gray-900/40 bg-gray-50/50' : 'dark:border-indigo-500/30 border-indigo-100 dark:bg-indigo-500/5 bg-indigo-50/30'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-display font-bold ${item.type === 'break' ? 'text-gray-500' : 'dark:text-white text-gray-800'}`}>{item.task}</p>
                          <div className="flex items-center gap-3 mt-1.5 opacity-60">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                               <Clock size={12} /> {item.time}
                            </div>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                               {item.duration} Min Session
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex justify-end gap-3 pt-6">
                <button onClick={() => setSchedule(null)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-500 transition-colors">
                  Reset Architecture
                </button>
                <button onClick={onClose} className="px-8 py-3 bg-indigo-500 text-white rounded-2xl font-display font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-600 active:scale-95">
                  Confirm Plan
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-2">Available Window</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={availableTime} 
                      onChange={(e) => setAvailableTime(parseInt(e.target.value) || 0)}
                      className="w-full dark:bg-gray-900 bg-gray-50 border dark:border-gray-800 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold dark:text-white text-gray-800 focus:border-indigo-500/50 outline-none transition-all pl-12"
                    />
                    <Clock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">MINS</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-2">Protocol Priority</label>
                  <div className="flex gap-2">
                     {['High', 'Medium', 'Low'].map((p) => (
                       <button 
                         key={p}
                         onClick={() => setNewTask({...newTask, priority: p as Task["priority"]})}
                         className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${newTask.priority === p ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'dark:bg-gray-900 bg-gray-50 dark:border-gray-800 border-gray-100 text-gray-400'}`}
                       >
                         {p}
                       </button>
                     ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-2">Task Injection</label>
                
                <div className="flex flex-col md:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="Identify active objective..." 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    className="flex-1 dark:bg-gray-900 bg-gray-50 border dark:border-gray-800 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold dark:text-white text-gray-800 focus:border-indigo-500/50 outline-none transition-all"
                  />
                  <div className="flex gap-3">
                    <div className="relative w-28 shrink-0">
                      <input 
                        type="number" 
                        placeholder="MIN" 
                        value={newTask.durationMinutes}
                        onChange={e => setNewTask({...newTask, durationMinutes: parseInt(e.target.value) || 0})}
                        className="w-full dark:bg-gray-900 bg-gray-50 border dark:border-gray-800 border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold dark:text-white text-gray-800 focus:border-indigo-500/50 outline-none transition-all pr-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-400">MIN</span>
                    </div>
                    <button 
                      onClick={handleAddTask}
                      className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-90"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 mt-4">
                  {tasks.length === 0 ? (
                    <div className="py-12 border-2 border-dashed dark:border-gray-800 border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-gray-300">
                       <Zap size={32} className="opacity-10 mb-3" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Awaiting Node Input</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tasks.map((t, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={idx} 
                          className="flex justify-between items-center p-4 rounded-2xl dark:bg-gray-900/40 bg-gray-50/50 border dark:border-gray-800 border-gray-100 group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${t.priority === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : t.priority === 'Medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} />
                            <div className="overflow-hidden">
                                <p className="dark:text-white text-gray-800 text-xs font-bold truncate font-display">{t.title}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.durationMinutes} Min Session</p>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveTask(idx)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || tasks.length === 0}
                className="w-full mt-6 py-5 bg-indigo-500 text-white font-display font-black text-[11px] uppercase tracking-[0.3em] rounded-[24px] hover:bg-indigo-600 shadow-2xl shadow-indigo-500/30 transition-all disabled:opacity-40 disabled:grayscale flex items-center justify-center gap-3 group"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Synchronizing Matrix...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                    Generate Neural Plan
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
