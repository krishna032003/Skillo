import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, X } from 'lucide-react';

interface WeeklyReviewData {
    score: number;
    review: string;
    recommendation: string;
}

interface WeeklyReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    data: WeeklyReviewData | null;
}

export default function WeeklyReviewModal({ isOpen, onClose, isLoading, data }: WeeklyReviewModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.98, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.98, y: 10 }}
                        className="w-full max-w-lg rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl relative transition-colors dark:bg-[#0A0A0B] dark:border dark:border-gray-800 bg-white"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-indigo-500 transition-colors z-10 p-1"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6 md:p-10">
                            <div className="text-center mb-6 md:mb-10">
                                <h2 className="text-2xl md:text-3xl font-display tracking-tight mb-2 dark:text-white text-[#111827]">Neural Summary<span className="text-indigo-500">.</span></h2>
                                <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Synthesizing productivity architecture</p>
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 md:py-16 gap-6 md:gap-8">
                                    <div className="relative">
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-indigo-500/10 border-t-indigo-500"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Brain size={20} className="text-indigo-500 opacity-20" />
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-center">
                                        <motion.p
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="text-indigo-500 font-black tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-[10px] uppercase"
                                        >
                                            Deep Scanning Nodes
                                        </motion.p>
                                        <p className="text-gray-400 text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Calibrating performance metrics</p>
                                    </div>
                                </div>
                            ) : data ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6 md:space-y-8"
                                >
                                    <div className="flex justify-center">
                                        <div className="relative flex items-center justify-center group">
                                            <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                                            <svg className="w-36 h-36 md:w-44 md:h-44 transform -rotate-90 relative z-10" viewBox="0 0 176 176">
                                                <circle cx="88" cy="88" r="76" className="stroke-gray-100 dark:stroke-gray-800 fill-none" strokeWidth="10" />
                                                <motion.circle
                                                    cx="88" cy="88" r="76" className="stroke-indigo-500 fill-none"
                                                    strokeWidth="10" strokeDasharray={477.5}
                                                    initial={{ strokeDashoffset: 477.5 }}
                                                    animate={{ strokeDashoffset: 477.5 - (477.5 * data.score) / 100 }}
                                                    transition={{ duration: 2, ease: "circOut" }}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                                <span className="text-4xl md:text-5xl font-display font-bold dark:text-white text-[#111827]">{data.score}</span>
                                                <span className="text-[8px] md:text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">Health Index</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 md:space-y-4">
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="p-4 md:p-6 rounded-2xl md:rounded-3xl border dark:bg-gray-900/40 dark:border-gray-800 bg-gray-50 border-gray-100"
                                        >
                                            <div className="flex items-center gap-3 mb-2 md:mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                   <Activity size={16} />
                                                </div>
                                                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] dark:text-gray-300 text-gray-500">Neural Analysis</h4>
                                            </div>
                                            <p className="text-xs md:text-sm dark:text-gray-400 text-gray-600 leading-relaxed font-medium">{data.review}</p>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="p-4 md:p-6 rounded-2xl md:rounded-3xl border dark:bg-indigo-500/10 dark:border-indigo-500/20 bg-indigo-50 border-indigo-100"
                                        >
                                            <div className="flex items-center gap-3 mb-2 md:mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                                                   <Zap size={16} />
                                                </div>
                                                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Protocol Optimization</h4>
                                            </div>
                                            <p className="text-xs md:text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">{data.recommendation}</p>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-center py-12 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] opacity-40">
                                    Synchronization Error // Try Again
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const Brain = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 4.5V10" />
    <path d="M12 14v5.5" />
    <path d="M4.5 12H10" />
    <path d="M14 12h5.5" />
    <circle cx="12" cy="12" r="3" />
    <path d="m18.4 5.6-2.8 2.8" />
    <path d="m8.4 15.6-2.8 2.8" />
    <path d="m5.6 5.6 2.8 2.8" />
    <path d="m15.6 15.6 2.8 2.8" />
  </svg>
);
