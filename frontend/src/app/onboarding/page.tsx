"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/services/api";
import { 
  User, Briefcase, Target, Rocket, 
  ArrowRight, ArrowLeft, Check, Sparkles,
  Sun, Moon, Trash2, ShieldAlert, Camera, X, Upload
} from "lucide-react";

const PROFESSIONS = [
  { label: "Engineering", icon: "⚙️" },
  { label: "Medicine",    icon: "🩺" },
  { label: "Business",   icon: "📊" },
  { label: "Sciences",   icon: "🔬" },
  { label: "Arts",       icon: "🎨" },
  { label: "Law",        icon: "⚖️" },
  { label: "Teaching",   icon: "📖" },
  { label: "Research",   icon: "🧪" },
  { label: "Design",     icon: "✏️" },
  { label: "Other",      icon: "🌐" },
];

const OBJECTIVE_PRESETS = [
  "Ace semester exams",
  "Get a top internship",
  "Build a personal project",
  "Improve CGPA / GPA",
  "Research & publish",
  "Learn a new skill",
];

// Optimized Background Component with CSS animations instead of Framer Motion
const Background = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#0052FF]/5 rounded-full blur-[120px] animate-pulse-slow" />
    <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
  </div>
));
Background.displayName = "Background";

function Steps({ current, total, isDarkMode }: { current: number; total: number; isDarkMode: boolean }) {
  return (
    <div className="flex items-center gap-3 justify-center mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-500 ${
            i === current ? "w-10 bg-[#0052FF]" : i < current ? "w-3 bg-[#0052FF]/60" : `w-2.5 ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`
          }`}
        />
      ))}
    </div>
  );
}

const slide = {
  enter: (direction: number) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 30 : -30, opacity: 0 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const stored = localStorage.getItem("skillo_user_id");
    if (!stored) { router.replace("/login"); return; }
    setUserId(stored);

    const savedTheme = localStorage.getItem("skillo_theme");
    if (savedTheme !== "light") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, [router]);

  const [step, setStep]           = useState(0); 
  const [name, setName]           = useState("");
  const [profession, setProfession] = useState("");
  const [customProf, setCustomProf] = useState("");
  const [objective, setObjective] = useState("");
  const [customObj, setCustomObj] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const finalProf = profession === "Other" ? customProf : profession;
  const finalObj  = objective  === "__custom" ? customObj : objective;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const next = () => {
    if (step === 0 && !name.trim()) { setError("Name is compulsory."); return; }
    if (step === 1 && !finalProf.trim()) { setError("Profession is compulsory."); return; }
    setError(""); 
    setDirection(1);
    setStep(s => s + 1);
  };
  const back = () => { 
    setError(""); 
    setDirection(-1);
    setStep(s => s - 1); 
  };

  const handleSubmit = async () => {
    if (!finalObj.trim()) { setError("Tasks are compulsory."); return; }
    setIsLoading(true); setError("");

    const uid = userId ?? localStorage.getItem("skillo_user_id") ?? "";
    try {
      const res = await fetch(`${API_BASE}/api/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uid,
          name: name.trim(),
          profession: finalProf.trim(),
          picture: imagePreview,
          goals: finalObj.split("\n").map(l => l.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to save. Please try again.");
      localStorage.setItem("skillo_user_name", name.trim());
      if (imagePreview) localStorage.setItem("skillo_user_picture", imagePreview);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm.toLowerCase() !== "delete") {
      setError('Type "delete" to confirm.'); return;
    }
    setDeleting(true);
    const uid = userId ?? localStorage.getItem("skillo_user_id") ?? "";
    try {
      await fetch(`${API_BASE}/api/user/${uid}`, { method: "DELETE" });
    } catch (_) {}
    localStorage.clear();
    router.replace("/login");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0B] text-white' : 'bg-[#FAFAFB] text-[#111827]'}`}>
      
      <Background />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[560px] z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
           <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#0052FF] flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-xl shadow-blue-500/20">S</div>
           <span className="font-display text-xl md:text-2xl tracking-tight">Skillo<span className="text-[#0052FF]">.</span></span>
        </div>

        <Steps current={step} total={4} isDarkMode={isDarkMode} />

        <div className={`relative rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl border transition-colors ${isDarkMode ? 'bg-[#111112] border-gray-800' : 'bg-white border-white'}`}>
          <div className="p-6 md:p-14">
            <AnimatePresence mode="wait" custom={direction}>
              
              {/* STEP 0: Name */}
              {step === 0 && (
                <motion.div key="s0" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeOut" }}>
                  <div className="text-center mb-8 md:mb-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[18px] md:rounded-[24px] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#0052FF] mx-auto mb-4 md:mb-6">
                      <User size={24} className="md:w-8 md:h-8" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-display tracking-tight mb-2">Welcome to Skillo</h1>
                    <p className="text-gray-400 font-medium text-xs md:text-sm italic">&ldquo;Your journey to master focus begins here.&rdquo;</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                       <label className="block text-[10px] font-black text-[#0052FF] uppercase tracking-[0.3em]">Full Name</label>
                       <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Compulsory</span>
                    </div>
                    <input
                      autoFocus
                      value={name}
                      onChange={e => { setName(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && next()}
                      placeholder="e.g. Gaurav Yadav"
                      className={`w-full rounded-[20px] md:rounded-[24px] px-6 md:px-8 py-4 md:py-5 outline-none transition-all text-base md:text-lg font-medium border ${isDarkMode ? 'bg-gray-900 border-gray-800 focus:border-[#0052FF] text-white' : 'bg-gray-50 border-gray-100 focus:border-[#0052FF] text-[#111827]'}`}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 1: Profession */}
              {step === 1 && (
                <motion.div key="s1" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeOut" }}>
                  <div className="text-center mb-8 md:mb-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[18px] md:rounded-[24px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 mx-auto mb-4 md:mb-6">
                      <Briefcase size={24} className="md:w-8 md:h-8" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-display tracking-tight mb-2">Your Profession</h1>
                    <div className="flex items-center justify-center gap-2">
                       <p className="text-gray-400 font-medium text-sm">Tell us what you do.</p>
                       <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Compulsory</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    {PROFESSIONS.map(p => (
                      <button key={p.label}
                        onClick={() => { setProfession(p.label); setCustomProf(""); setError(""); }}
                        className={`flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 rounded-[16px] md:rounded-[20px] text-xs md:text-sm font-bold transition-all border ${
                          profession === p.label
                            ? "bg-[#0052FF] text-white border-[#0052FF] shadow-lg shadow-blue-500/20"
                            : isDarkMode ? "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        <span className="text-base md:text-lg">{p.icon}</span>{p.label}
                      </button>
                    ))}
                  </div>
                  {profession === "Other" && (
                    <motion.input
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      autoFocus value={customProf}
                      onChange={e => { setCustomProf(e.target.value); setError(""); }}
                      placeholder="Specify your field..."
                      className={`mt-4 w-full rounded-[16px] md:rounded-[20px] px-5 md:px-6 py-3 md:py-4 outline-none transition-all text-xs md:text-sm font-medium border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-100 text-[#111827]'}`}
                    />
                  )}
                </motion.div>
              )}

              {/* STEP 2: Tasks */}
              {step === 2 && (
                <motion.div key="s2" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeOut" }}>
                  <div className="text-center mb-8 md:mb-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[18px] md:rounded-[24px] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 mx-auto mb-4 md:mb-6">
                      <Target size={24} className="md:w-8 md:h-8" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-display tracking-tight mb-2">Main Tasks</h1>
                    <div className="flex items-center justify-center gap-2">
                       <p className="text-gray-400 font-medium text-sm">What tasks will you focus on?</p>
                       <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Compulsory</span>
                    </div>
                  </div>
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {OBJECTIVE_PRESETS.map(o => (
                        <button key={o}
                          onClick={() => { setObjective(o); setCustomObj(""); setError(""); }}
                          className={`px-3 md:px-4 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all border ${
                            objective === o
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-lg"
                              : isDarkMode ? "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                      <button 
                        onClick={() => { setObjective("__custom"); setError(""); }}
                        className={`px-3 md:px-4 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all border ${
                          objective === "__custom"
                            ? "bg-[#0052FF] text-white border-[#0052FF] shadow-lg"
                            : isDarkMode ? "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700" : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        ✏️ Custom Task
                      </button>
                    </div>
                    {(objective === "__custom" || true) && (
                      <motion.textarea
                        autoFocus rows={3}
                        value={customObj}
                        onChange={e => { setCustomObj(e.target.value); setError(""); }}
                        placeholder="Define your objectives, one per line..."
                        className={`w-full rounded-[20px] md:rounded-[24px] px-5 md:px-6 py-4 md:py-5 outline-none transition-all text-xs md:text-sm font-medium border resize-none ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-100 text-[#111827]'}`}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Profile Photo */}
              {step === 3 && (
                <motion.div key="s3" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeOut" }}>
                  <div className="text-center mb-8 md:mb-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[18px] md:rounded-[24px] bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-500 mx-auto mb-4 md:mb-6">
                      <Camera size={24} className="md:w-8 md:h-8" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-display tracking-tight mb-2">Profile Photo</h1>
                    <p className="text-gray-400 font-medium text-sm">Add a photo to personalize your profile.</p>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Optional</span>
                  </div>

                  <div className="flex flex-col items-center gap-4 md:gap-6">
                    <div className="relative group">
                      <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center overflow-hidden transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-white shadow-xl'}`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="md:w-[48px] md:h-[48px] text-gray-300" />
                        )}
                      </div>
                      {imagePreview && (
                        <button 
                          onClick={() => setImagePreview(null)}
                          className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X size={12} className="md:w-4 md:h-4" />
                        </button>
                      )}
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all border ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-600 shadow-sm'}`}
                    >
                      <Upload size={16} className="md:w-[18px] md:h-[18px]" />
                      {imagePreview ? "Change Photo" : "Upload Photo"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-red-500 text-[10px] font-bold text-center mt-4 md:mt-6 uppercase tracking-widest">
                {error}
              </p>
            )}

            <div className="flex gap-3 md:gap-4 mt-8 md:mt-12">
              {step > 0 && (
                <button onClick={back} className={`flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-[16px] md:rounded-[24px] border transition-all ${isDarkMode ? 'border-gray-800 text-gray-400 hover:bg-gray-800' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
                  <ArrowLeft size={20} className="md:w-6 md:h-6" />
                </button>
              )}
              <button
                onClick={step === 3 ? handleSubmit : next}
                disabled={isLoading}
                className="flex-1 h-12 md:h-16 rounded-[16px] md:rounded-[24px] bg-[#0052FF] text-white font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : step === 3 ? (
                  <>Launch Skillo <Rocket size={16} className="md:w-5 md:h-5" /></>
                ) : (
                  <>Continue <ArrowRight size={16} className="md:w-5 md:h-5" /></>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center space-y-6">
           <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              <Sparkles size={14} className="text-[#0052FF]" />
              Personalizing your workspace
           </div>

           {!showDelete ? (
             <button onClick={() => setShowDelete(true)} className="text-[10px] font-bold text-red-400/50 hover:text-red-400 transition-colors uppercase tracking-[0.2em]">Delete account</button>
           ) : (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-red-900/10 border-red-900/20' : 'bg-red-50 border-red-100'} space-y-4`}>
                <div className="flex items-center justify-center gap-2 text-red-500">
                   <ShieldAlert size={18} />
                   <p className="text-[10px] font-black uppercase tracking-widest">Permanent Deletion</p>
                </div>
                <input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder='Type "delete" to confirm'
                  className={`w-full rounded-2xl px-5 py-3 outline-none text-xs font-bold border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-red-500'}`}
                />
                <div className="flex gap-2">
                   <button onClick={() => setShowDelete(false)} className="flex-1 py-3 text-[10px] font-bold text-gray-400 uppercase">Cancel</button>
                   <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase">Confirm</button>
                </div>
             </motion.div>
           )}
        </div>
      </motion.div>
    </div>
  );
}
