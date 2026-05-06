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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative transition-colors dark:bg-[#111112] dark:border dark:border-gray-800 bg-white"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-400 hover:text-[#0052FF] transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-10">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-display tracking-tight mb-2 dark:text-white text-[#111827]">Weekly AI Review</h2>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Deep scanning your productivity metrics</p>
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-8">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 180, 360],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        className="w-16 h-16 rounded-2xl border-2 border-blue-100 border-t-[#0052FF]"
                                    />
                                    <div className="space-y-3 text-center">
                                        <motion.p
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="text-[#0052FF] font-black tracking-[0.2em] text-xs uppercase"
                                        >
                                            Synthesizing Cognitive Logs
                                        </motion.p>
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Cross-referencing goals with performance data</p>
                                    </div>
                                </div>
                            ) : data ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="flex justify-center">
                                        <div className="relative flex items-center justify-center">
                                            <svg className="w-40 h-40 transform -rotate-90">
                                                <circle
                                                    cx="80"
                                                    cy="80"
                                                    r="70"
                                                    className="stroke-gray-100 dark:stroke-gray-800 fill-none"
                                                    strokeWidth="12"
                                                />
                                                <motion.circle
                                                    cx="80"
                                                    cy="80"
                                                    r="70"
                                                    className="stroke-[#0052FF] fill-none"
                                                    strokeWidth="12"
                                                    strokeDasharray={439.8}
                                                    initial={{ strokeDashoffset: 439.8 }}
                                                    animate={{ strokeDashoffset: 439.8 - (439.8 * data.score) / 100 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-5xl font-display dark:text-white text-[#111827]">{data.score}</span>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Health Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="p-6 rounded-[32px] border dark:bg-gray-800/50 dark:border-gray-800 bg-gray-50 border-gray-100"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#0052FF]">
                                                   <Activity size={18} />
                                                </div>
                                                <h4 className="text-xs font-black uppercase tracking-widest dark:text-white text-[#111827]">Analysis</h4>
                                            </div>
                                            <p className="text-sm dark:text-gray-400 text-gray-600 leading-relaxed font-medium">{data.review}</p>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="p-6 rounded-[32px] border dark:bg-blue-900/20 dark:border-blue-900/30 bg-blue-50 border-blue-100"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[#0052FF]">
                                                   <Zap size={18} />
                                                </div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-[#0052FF]">Action Item</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{data.recommendation}</p>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-center py-16 text-gray-400 font-medium uppercase tracking-widest text-xs">
                                    Data retrieval failed. Please try again.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
