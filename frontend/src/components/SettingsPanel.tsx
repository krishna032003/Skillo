"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Globe, Terminal,
  Cpu, Zap, Save, ChevronRight, Moon,
  Monitor, Smartphone, Keyboard, Camera, Upload, X, LogOut, Target, List
} from "lucide-react";

import { useRouter } from "next/navigation";
import { API_BASE } from "@/services/api";

interface UserProfile {
  name?: string;
  profession?: string;
  picture?: string | null;
  goals?: string[];
  active_goals?: string[];
  objectives?: string[];
}

export default function SettingsPanel({ onProfileUpdate }: { onProfileUpdate?: () => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState("profile");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Form State
  const [editName, setEditName] = useState("");
  const [editProfession, setEditProfession] = useState("");
  const [editGoals, setEditGoals] = useState("");
  const [editObjectives, setEditObjectives] = useState("");
  const [editPicture, setEditPicture] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    const savedTheme = localStorage.getItem("skillo_theme");
    if (savedTheme === "dark") setIsDarkMode(true);
  }, []);

  const fetchProfile = async () => {
    const userId = localStorage.getItem("skillo_user_id");
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/user/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditName(data.name || "");
        setEditProfession(data.profession || "");

        // Handle both 'goals' and legacy 'active_goals'
        const currentGoals = data.goals || data.active_goals || [];
        setEditGoals(currentGoals.join("\n"));

        const currentObjs = data.objectives || [];
        setEditObjectives(currentObjs.join("\n"));

        setEditPicture(data.picture || null);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    const userId = localStorage.getItem("skillo_user_id");
    if (!userId) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: editName,
          profession: editProfession,
          picture: editPicture,
          goals: editGoals.split("\n").map(l => l.trim()).filter(Boolean),
          objectives: editObjectives.split("\n").map(l => l.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        localStorage.setItem("skillo_user_name", editName);
        if (editPicture) localStorage.setItem("skillo_user_picture", editPicture);

        alert("Profile updated successfully!");
        if (onProfileUpdate) onProfileUpdate();
        fetchProfile();
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      alert("Error: Connection to server failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem("skillo_user_id");
    if (!userId) return;

    const confirmed = window.confirm(
      "CAUTION: This will permanently delete your Skillo account and all associated data. This action cannot be undone. Are you sure?"
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Account deleted successfully.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || "Failed to delete account"}`);
      }
    } catch (error) {
      alert("Error: Connection to server failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Security", icon: Shield },
    { id: "system", label: "System", icon: Cpu },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center dark:bg-[#0A0A0B] bg-white">
        <div className="w-8 h-8 border-2 border-[#0052FF] border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  const initials = editName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden transition-colors dark:bg-[#0A0A0B] bg-white text-gray-500">
      {/* ── Sub-Sidebar ── */}
      <aside className="w-full lg:w-64 border-b lg:border-r flex flex-row lg:flex-col p-4 lg:p-6 gap-2 lg:space-y-1 shrink-0 dark:bg-[#111112] dark:border-gray-800 border-gray-100 overflow-x-auto lg:overflow-x-visible no-scrollbar">
        <p className="hidden lg:block px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Configuration</p>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2.5 md:gap-3.5 px-4 md:px-5 py-3 md:py-3.5 rounded-xl md:rounded-2xl transition-all duration-300 shrink-0 ${activeSection === s.id
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10"
                : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10"
              }`}
          >
            <s.icon size={16} className={activeSection === s.id ? "text-white" : "group-hover:scale-110 transition-transform"} />
            <span className="text-[9px] md:text-[10px] font-display font-bold uppercase tracking-[0.1em] whitespace-nowrap">{s.label}</span>
          </button>
        ))}

        <div className="hidden lg:block mt-auto pt-6 border-t dark:border-gray-800 border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Settings Content ── */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 md:py-12 styled-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8 md:space-y-10">
          <header className="space-y-2">
            <h1 className="font-display text-3xl md:text-4xl tracking-tight dark:text-white text-[#111827]">
              {sections.find(s => s.id === activeSection)?.label} <span className="text-indigo-500">Config.</span>
            </h1>
            <p className="text-gray-400 font-medium text-[8px] md:text-xs uppercase tracking-widest opacity-80">
              System Nodes: {activeSection.toUpperCase()} <span aria-hidden="true">{"//"}</span> Core Calibration
            </p>
          </header>

          <div className="space-y-8 md:space-y-10">
            {activeSection === "profile" && (
              <div className="space-y-8 md:space-y-10">

                {/* Profile Header Card */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 p-6 md:p-8 border rounded-[32px] md:rounded-[40px] dark:bg-gray-900/50 dark:border-gray-800 bg-gray-50/50 border-gray-100 backdrop-blur-sm text-center sm:text-left">
                  <div className="relative group">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white dark:border-gray-800 shadow-2xl flex items-center justify-center overflow-hidden bg-white dark:bg-gray-800 ring-4 ring-indigo-500/5">
                      {editPicture ? (
                        <img src={editPicture} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black text-indigo-500 font-display">{initials || "GY"}</span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-gray-900"
                    >
                      <Camera size={14} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg md:text-xl font-display font-bold dark:text-white text-[#111827]">{editName || "New User"}</h3>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">{editProfession || "Skillo Member"}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 md:gap-3 mt-4">
                      <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest">Pro Protocol</div>
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest">Node Active</div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="space-y-6">
                  <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Identity & Objectives</h3>

                  <div className="grid grid-cols-1 gap-5 md:gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 ml-2">
                        <User size={12} className="text-indigo-500" />
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Display Name</label>
                      </div>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-2xl border dark:bg-gray-900/40 dark:border-gray-800 dark:text-white bg-white border-gray-100 outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 ml-2">
                        <Globe size={12} className="text-indigo-500" />
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Profession</label>
                      </div>
                      <input
                        value={editProfession}
                        onChange={(e) => setEditProfession(e.target.value)}
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-2xl border dark:bg-gray-900/40 dark:border-gray-800 dark:text-white bg-white border-gray-100 outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 ml-2">
                        <Target size={12} className="text-indigo-500" />
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Primary Objectives</label>
                      </div>
                      <textarea
                        value={editObjectives}
                        onChange={(e) => setEditObjectives(e.target.value)}
                        rows={3}
                        placeholder="e.g. Master React, Finish semester exams"
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-2xl border dark:bg-gray-900/40 dark:border-gray-800 dark:text-white bg-white border-gray-100 outline-none focus:border-indigo-500/50 transition-all font-bold text-sm resize-none styled-scrollbar"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 ml-2">
                        <List size={12} className="text-indigo-500" />
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Tasks / Goals</label>
                      </div>
                      <textarea
                        value={editGoals}
                        onChange={(e) => setEditGoals(e.target.value)}
                        rows={3}
                        placeholder="e.g. Study 4 hours daily, Work on side project"
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-2xl border dark:bg-gray-900/40 dark:border-gray-800 dark:text-white bg-white border-gray-100 outline-none focus:border-indigo-500/50 transition-all font-bold text-sm resize-none styled-scrollbar"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 md:px-10 py-4 bg-indigo-500 text-white rounded-2xl font-display font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSaving ? <span className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Save size={16} />}
                    Sync Profile Nodes
                  </button>
                </div>
              </div>
            )}

            {activeSection === "privacy" && (
              <div className="space-y-6">
                <div className="p-6 md:p-10 border border-red-500/20 dark:bg-red-500/5 bg-red-50 rounded-[32px] md:rounded-[40px] space-y-6">
                  <div className="flex items-center gap-4 text-red-500">
                    <Shield size={24} />
                    <h3 className="text-xl md:text-2xl font-display font-bold">Danger Zone</h3>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-widest opacity-70">
                    Permanently purge your Skillo existence. All neural nodes and data will be liquidated.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 md:px-10 py-4 bg-red-500 text-white rounded-2xl font-display font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {isDeleting ? "Purging..." : "Liquidate Account"}
                  </button>
                </div>
              </div>
            )}

            {(activeSection !== "profile" && activeSection !== "privacy") && (
              <div className="py-16 md:py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[32px] md:rounded-[48px] text-gray-300">
                <Terminal size={40} className="mb-4 opacity-20" />
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Feature Coming Soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
