"use client";
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send, Loader2, Calendar, Brain, BarChart2, BookOpen, Zap, Clock,
  Sparkles, Terminal, Activity, ChevronRight, MessageSquare, Search, User
} from "lucide-react";

interface ChatMessage { id: string; role: "user" | "ai"; text: string; }
interface Assignment { title?: string; dueDate?: { year: number; month: number; day: number }; courseName?: string; }
interface CenterPanelProps {
  chatHistory: ChatMessage[]; chatInput: string;
  setChatInput: (v: string) => void; onSubmit: (e?: React.FormEvent) => void;
  isThinking: boolean; finalAnswer: string; assignmentsData: Assignment[];
  totalFocusMinutes: number; onAction: (cmd: string, label: string) => void;
  onOpenTimetable: () => void; onOpenFocus: () => void; onOpenMaterials: () => void;
}

/* ─── Markdown Renderer ─── */
const MD = {
  h1:     ({...p}) => <h1     className="font-display text-2xl mb-4 mt-8 dark:text-white text-[#111827]" {...p} />,
  h2:     ({...p}) => <h2     className="font-display text-xl mb-3 mt-6 border-b border-gray-100 dark:border-gray-800 pb-1 dark:text-white text-[#111827]" {...p} />,
  p:      ({...p}) => <p      className="text-sm leading-relaxed mb-4 dark:text-gray-400 text-gray-600" {...p} />,
  ul:     ({...p}) => <ul     className="space-y-2 mb-4 ml-4" {...p} />,
  li:     ({...p}) => <li     className="text-sm dark:text-gray-500 text-gray-500 list-disc" {...p} />,
  strong: ({...p}) => <strong className="text-[#0052FF] font-bold" {...p} />,
  code: ({ className, children, ...p }: React.ComponentPropsWithoutRef<"code">) => {
    return <code className="bg-blue-50 dark:bg-blue-900/30 text-[#0052FF] px-1.5 py-0.5 rounded font-mono text-xs uppercase" {...p}>{children}</code>;
  },
};

const CARDS = [
  { label: "Intelligent Planner", desc: "Sync & build daily schedule", icon: Calendar, action: "auto_schedule", cmd: "Auto-Schedule My Day", color: "indigo" },
  { label: "Academic Insights", desc: "AI material prioritization", icon: BookOpen, action: "study_today", cmd: "What Should I Study Today", color: "emerald" },
  { label: "Focus Protocol", desc: "Start deep study session", icon: Zap, action: "focus", cmd: "", color: "amber" },
  { label: "Knowledge Base", desc: "Search documents & notes", icon: Search, action: "materials", cmd: "", color: "purple" },
];

interface EmptyWorkspaceProps {
  onAction: (cmd: string, label: string) => void;
  onOpenFocus: () => void;
  onOpenMaterials: () => void;
  assignmentsData: Assignment[];
  totalFocusMinutes: number;
}

function EmptyWorkspace({ onAction, onOpenFocus, onOpenMaterials, assignmentsData, totalFocusMinutes }: EmptyWorkspaceProps) {
  return (
    <div className="flex-1 overflow-y-auto px-10 py-16 space-y-16 max-w-6xl mx-auto w-full">
      
      {/* Hero Header */}
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-5xl leading-tight dark:text-white text-[#111827]">
            Hello, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Gaurav.</span> <br />
            Ready to <span className="italic opacity-80">optimize?</span>
          </h1>
          <p className="text-gray-400 font-medium text-base mt-4 max-w-lg leading-relaxed">
            Systems are calibrated and ready. Execute a protocol below to begin.
          </p>
        </motion.div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Active Tasks", val: assignmentsData.length || "0", sub: "SYNCED", color: "text-indigo-500" },
          { label: "Focus Duration", val: `${totalFocusMinutes}M`, sub: "WEEKLY", color: "text-emerald-500" },
          { label: "Node Status", val: "ACTIVE", sub: "STABLE", color: "text-purple-500" },
        ].map((m, i) => (
          <div key={i} className="px-6 py-5 border rounded-2xl transition-all dark:bg-gray-900/50 dark:border-gray-800 bg-white border-gray-100 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{m.label}</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-black tracking-tight ${m.color}`}>{m.val}</p>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Protocol Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">System Protocols</h3>
           <div className="h-[1px] flex-1 dark:bg-gray-800 bg-gray-100" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          {CARDS.map((c, i) => {
            const colorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
              indigo: { text: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", glow: "hover:border-indigo-500/50 hover:shadow-indigo-500/10" },
              emerald: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "hover:border-emerald-500/50 hover:shadow-emerald-500/10" },
              amber: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "hover:border-amber-500/50 hover:shadow-amber-500/10" },
              purple: { text: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "hover:border-purple-500/50 hover:shadow-purple-500/10" },
            };
            const theme = colorMap[c.color];
            
            return (
              <motion.button
                key={i}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => c.action === "focus" ? onOpenFocus() : c.action === "materials" ? onOpenMaterials() : onAction(c.action, c.cmd)}
                className={`group p-6 border rounded-3xl text-left transition-all duration-500 flex items-center gap-5 dark:bg-gray-900/40 bg-white shadow-sm hover:shadow-lg ${theme.border} ${theme.glow}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${theme.bg} ${theme.text} group-hover:scale-110 shadow-inner`}>
                  <c.icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between">
                      <h4 className="text-sm font-display font-bold tracking-tight dark:text-gray-100 text-gray-800 transition-colors duration-300 group-hover:text-indigo-500">{c.label}</h4>
                      <ChevronRight size={16} className={`transition-all duration-500 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1`} />
                   </div>
                   <p className="text-[11px] text-gray-400 truncate mt-1 font-medium">{c.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CenterPanel({
  chatHistory, chatInput, setChatInput, onSubmit, isThinking,
  finalAnswer, assignmentsData, totalFocusMinutes,
  onAction, onOpenTimetable, onOpenFocus, onOpenMaterials,
}: CenterPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, finalAnswer]);

  const isEmpty = chatHistory.length === 0 && !finalAnswer;

  return (
    <div className="flex flex-col h-full relative dark:bg-[#0A0A0B] bg-white transition-colors">
      
      {isEmpty ? (
        <EmptyWorkspace onAction={onAction} onOpenFocus={onOpenFocus} onOpenMaterials={onOpenMaterials} assignmentsData={assignmentsData} totalFocusMinutes={totalFocusMinutes} />
      ) : (
        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-12 styled-scrollbar">
          
          {/* Final Insight */}
          <AnimatePresence>
            {finalAnswer && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 border rounded-3xl dark:bg-gray-900/40 dark:border-gray-800 bg-white border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 via-[#0052FF] to-purple-500" />
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 via-[#0052FF] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <Sparkles size={16} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Neural Synthesis</span>
                </div>
                <div className="prose prose-sm max-w-none relative z-10">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>{finalAnswer}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat History */}
          <div className="space-y-10">
            {chatHistory.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                   <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === "user" ? "dark:bg-gray-800 bg-gray-100 text-gray-500" : "bg-gradient-to-br from-indigo-600 via-[#0052FF] to-purple-600 text-white"}`}>
                      {msg.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
                   </div>
                   <div className={`p-5 rounded-2xl shadow-sm leading-relaxed text-sm ${msg.role === "user" ? "dark:bg-gray-800 dark:text-gray-300 bg-gray-50 text-gray-700" : "dark:bg-gray-900 dark:border-gray-800 bg-white border border-gray-100 dark:text-gray-300 text-gray-600"}`}>
                      {msg.role === "ai" && !msg.text
                        ? <div className="flex items-center gap-3"><Loader2 className="animate-spin text-indigo-500" size={14} /><span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Neural Processing...</span></div>
                        : <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>{msg.text}</ReactMarkdown>
                      }
                   </div>
                </div>
              </div>
            ))}
          </div>
          <div ref={endRef} className="h-10" />
        </div>
      )}

      {/* Input Terminal */}
      <div className={`p-10 pt-4 bg-gradient-to-t transition-colors ${isEmpty ? 'from-transparent' : 'dark:from-[#0A0A0B] dark:via-[#0A0A0B] from-white via-white to-transparent'}`}>
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto relative group">
          <textarea
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
            disabled={isThinking}
            placeholder="Ask a question or plan your day..."
            rows={1}
            className="w-full border rounded-[32px] pl-8 pr-20 py-6 outline-none transition-all text-sm font-medium placeholder-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:focus:border-blue-500/50 dark:focus:bg-gray-800 bg-gray-50 border-gray-200 focus:border-[#0052FF]/30 focus:bg-white text-gray-900 dark:text-white"
          />
          <button type="submit" disabled={isThinking || !chatInput.trim()}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-indigo-600 via-[#0052FF] to-purple-600 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-20 group">
            {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
          </button>
        </form>
        <div className="flex justify-center items-center gap-8 mt-6">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">System Ready</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Stable Connection</span>
           </div>
        </div>
      </div>
    </div>
  );
}
