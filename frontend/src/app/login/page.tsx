"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { API_BASE } from "@/services/api";
import { ArrowRight, Play, Users, Brain, Zap, Calendar, Star, Globe, Layout, Palette, Sun, Moon } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("skillo_theme");
    const shouldUseDarkMode = savedTheme !== "light";
    if (shouldUseDarkMode) {
      document.documentElement.classList.add("dark");
    }
    const mountedTimer = window.setTimeout(() => {
      setMounted(true);
      setIsDarkMode(shouldUseDarkMode);
    }, 0);
    const existing = localStorage.getItem("skillo_user_id");
    if (!existing) return;
    fetch(`${API_BASE}/api/user/${encodeURIComponent(existing)}`)
      .then((res) => { if (res.ok) router.replace("/"); })
      .catch(() => {});
    return () => window.clearTimeout(mountedTimer);
  }, [router]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("skillo_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("skillo_theme", "light");
    }
  };

  const handleAuthSuccess = async (userId: string, email: string, name: string, onboarded: boolean = false) => {
    setIsAuthenticating(true);
    setStatusMsg(`Welcome, ${name}! Setting up your workspace…`);
    localStorage.setItem("skillo_user_id", userId);
    localStorage.setItem("skillo_user_email", email);
    localStorage.setItem("skillo_user_name", name);

    try {
      const accessToken = localStorage.getItem("skillo_google_access_token");
      if (accessToken) {
        fetch(`${API_BASE}/api/classroom/${encodeURIComponent(userId)}/token`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: accessToken }),
        }).catch(() => {});
      }
      
      router.push(onboarded ? "/" : "/onboarding");
    } catch {
      router.push("/onboarding");
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden selection:bg-[#0052FF]/10 font-body relative ${isDarkMode ? 'bg-[#0A0A0B] text-white' : 'bg-white text-[#111827]'}`}>
      
      {/* ── Theme Toggle (Floating) ── */}
      <div className="fixed top-8 right-8 z-50">
        <button 
          onClick={toggleTheme}
          className={`p-3 rounded-2xl shadow-lg transition-all backdrop-blur-md ${isDarkMode ? 'bg-gray-800/80 text-yellow-400 hover:bg-gray-700' : 'bg-white/80 text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      {/* ── Hero Section ── */}
      <section className="pt-20 lg:pt-32 pb-20 px-8 lg:px-20 max-w-8xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Copy */}
        <div className="flex-1 space-y-10 text-center lg:text-left z-20">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-10">
             <div className="w-10 h-10 rounded-xl bg-[#0052FF] flex items-center justify-center text-white font-black text-2xl">S</div>
             <span className={`font-display text-3xl tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111827]'}`}>Skillo<span className="text-[#0052FF]">.</span></span>
          </div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 className={`font-display text-[clamp(48px,8vw,80px)] leading-[1.1] mb-6 ${isDarkMode ? 'text-white' : 'text-[#111827]'}`}>
              Master Your Focus. <br /> Reach Your <span className="text-[#0052FF]">Goals.</span>
            </h1>
            <p className="text-gray-400 font-medium text-lg max-w-xl leading-relaxed mb-8">
              Skillo is your intelligent companion for maintaining deep focus, suggesting daily objectives, and managing tasks effortlessly.
            </p>
            
            <div className="flex items-center justify-center lg:justify-start gap-3 mt-4 mb-8">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 bg-gray-100 overflow-hidden relative ${isDarkMode ? 'border-gray-800' : 'border-white'}`}>
                    <Image src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" fill />
                  </div>
                ))}
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center text-white">
                <Zap size={14} fill="currentColor" />
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-2">Joined by 10k+ achievers</span>
            </div>

            <div className={`flex items-start gap-4 p-5 rounded-[28px] border max-w-md mx-auto lg:mx-0 shadow-sm transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-blue-50 border-blue-100'}`}>
               <div className="w-12 h-12 rounded-2xl bg-[#0052FF] flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                  <Star size={24} fill="currentColor" />
               </div>
               <div className="space-y-1">
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#111827]'}`}>Smart Task Suggestions</p>
                  <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                    Let AI prioritize your day based on your long-term goals and classroom objectives.
                  </p>
               </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
            {!isAuthenticating ? (
              <div className="btn-primary-skillo group cursor-pointer">
                <GoogleAuthButton 
                  onSuccess={handleAuthSuccess} 
                  onError={() => {}} 
                  customButton={
                    <span className="flex items-center gap-2 px-4">Get Started Free</span>
                  }
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 py-3">
                <span className="w-5 h-5 border-2 border-[#0052FF] border-t-transparent animate-spin rounded-full" />
                <p className="text-[#0052FF] font-semibold text-sm">{statusMsg}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Visual Area */}
        <div className="flex-1 relative w-full flex justify-center">
          
          {/* Main Hero Image */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative w-full aspect-[4/5] max-w-[600px] rounded-[40px] overflow-hidden shadow-2xl">
            <Image 
              src="/hero_woman_vr_skillo.png" 
              alt="Deep focus visualization" 
              fill 
              className="object-cover" 
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0052FF]/20 to-transparent" />
          </motion.div>

          {/* Floating UI Elements */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -left-10 top-1/3 z-30">
             <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-4 transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0052FF]">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Focus_Active</p>
                   <div className="w-20 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-[#0052FF]" />
                   </div>
                </div>
             </div>
          </motion.div>

          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute -right-6 top-1/4 z-30">
             <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-4 transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                   <Calendar size={18} />
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Task_Goal</p>
                   <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
                   <div className="w-16 h-2 bg-gray-100 dark:bg-gray-800 rounded-full opacity-50" />
                </div>
                <ArrowRight size={14} className="text-[#0052FF] ml-2" />
             </div>
          </motion.div>

          <div className="absolute -top-10 left-10 animate-pulse">
             <Brain size={40} className="text-[#0052FF]/30" />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`py-20 px-8 lg:px-20 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[13px] font-bold text-gray-400 uppercase tracking-widest">
           <div className="flex items-center gap-2 text-[#111827]">
             <div className="w-6 h-6 rounded bg-[#0052FF] flex items-center justify-center text-white text-[10px]">S</div>
             <span className={isDarkMode ? 'text-white' : 'text-[#111827]'}>Skillo</span>
           </div>
           <div className="flex gap-12">
             <span>Terms</span>
             <span>Privacy</span>
             <span>© 2026 Skillo</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
