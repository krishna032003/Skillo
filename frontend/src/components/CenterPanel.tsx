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
  { label: "AUTO_PLAN", desc: "Sync your Classroom & build a daily plan", icon: Calendar, action: "auto_schedule", cmd: "Auto-Schedule My Day", color: "bg-blue-50 text-[#0052FF] dark:bg-blue-900/30" },
  { label: "STUDY_GUIDE", desc: "AI-driven prioritization for your materials", icon: BookOpen, action: "study_today", cmd: "What Should I Study Today", color: "bg-green-50 text-green-600 dark:bg-green-900/30" },
  { label: "FOCUS_MODE", desc: "Start a distraction-free study session", icon: Zap, action: "focus", cmd: "", color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30" },
  { label: "LIBRARY", desc: "Search your documents and notes", icon: Search, action: "materials", cmd: "", color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30" },
];

function EmptyWorkspace({ onAction, onOpenFocus, onOpenMaterials, assignmentsData, totalFocusMinutes }: any) {
  return (
    <div className="flex-1 overflow-y-auto px-10 py-16 space-y-16 max-w-6xl mx-auto w-full">
      
      {/* Hero Header */}
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-6xl leading-tight dark:text-white text-[#111827]">
            Hello, <span className="text-[#0052FF]">Gaurav.</span> <br />
            Ready to <span className="italic">start?</span>
          </h1>
          <p className="text-gray-400 font-medium text-lg mt-4 max-w-xl leading-relaxed">
            Your workspace is synced and ready. Use the commands below to plan your day or start a focus session.
          </p>
        </motion.div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: "Tasks", val: assignmentsData.length || "0", sub: "CLASSROOM SYNCED", color: "text-[#0052FF]" },
          { label: "Focus Time", val: `${totalFocusMinutes}M`, sub: "WEEKLY TOTAL", color: "text-green-600" },
          { label: "Status", val: "ACTIVE", sub: "ALL SYSTEMS READY", color: "text-blue-500" },
        ].map((m, i) => (
          <div key={i} className="p-6 border rounded-3xl shadow-sm hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800 bg-white border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{m.label}</p>
            <p className={`text-3xl font-display uppercase tracking-tighter ${m.color}`}>{m.val}</p>
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Protocol Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Quick Actions</h3>
           <div className="h-px flex-1 mx-6 dark:bg-gray-800 bg-gray-100" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          {CARDS.map((c, i) => (
            <button key={i} onClick={() => c.action === "focus" ? onOpenFocus() : c.action === "materials" ? onOpenMaterials() : onAction(c.action, c.cmd)}
              className="group p-8 border rounded-[32px] text-left transition-all flex items-start gap-6 dark:bg-gray-900 dark:border-gray-800 hover:border-[#0052FF]/30 bg-white border-gray-100 hover:shadow-lg">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${c.color}`}>
                <c.icon size={24} />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="font-display text-xl uppercase tracking-tight dark:text-white text-[#111827]">{c.label}</h4>
                   <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0052FF] transition-colors" />
                </div>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">{c.desc}</p>
              </div>
            </button>
          ))}
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 border rounded-[40px] dark:bg-blue-900/20 dark:border-blue-900/30 bg-blue-50/50 border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center text-white">
                      <Sparkles size={16} />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest text-[#0052FF]">AI Summary</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>{finalAnswer}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat History */}
          <div className="space-y-10">
            {chatHistory.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${msg.role === "user" ? "dark:bg-gray-800 bg-gray-100 text-gray-500" : "bg-blue-100 dark:bg-blue-900/30 text-[#0052FF]"}`}>
                      {msg.role === "user" ? <User size={18} /> : <Sparkles size={18} />}
                   </div>
                   <div className={`p-6 rounded-[28px] ${msg.role === "user" ? "dark:bg-gray-800 dark:text-gray-300 bg-gray-50 text-gray-700" : "dark:bg-gray-900 dark:border-gray-800 bg-white border border-gray-100 dark:text-gray-400 text-gray-600"}`}>
                      {msg.role === "ai" && !msg.text
                        ? <div className="flex items-center gap-3"><Loader2 className="animate-spin text-[#0052FF]" size={14} /><span className="text-xs font-bold text-[#0052FF] uppercase tracking-widest">Thinking...</span></div>
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
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0052FF] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-20">
            {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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
