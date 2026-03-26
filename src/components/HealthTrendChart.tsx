"use client";

import { motion } from "framer-motion";
import { TrendingDown, Info } from "lucide-react";

export function HealthTrendChart() {
    const data = [
        { month: "Oct '25", value: 10.7, status: "Critical" },
        { month: "Nov '25", value: 8.5, status: "Warning" },
        { month: "Dec '25", value: 7.2, status: "Good" },
    ];

    // Simple helpers for scaling (assuming range 6.0 to 12.0)
    const MAX = 12.0;
    const MIN = 6.0;
    const RANGE = MAX - MIN;
    const getHeight = (val: number) => {
        return ((val - MIN) / RANGE) * 100;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[2.5rem] border-white/5 p-10 bg-slate-950/40 backdrop-blur-3xl shadow-2xl overflow-hidden relative"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tighter uppercase mb-2">
                        Glycemic Control Trajectory (HbA1c)
                        <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-3 py-1 rounded-full border border-cyan-500/20 font-black tracking-widest uppercase">
                            Target Threshold Achieved
                        </span>
                    </h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Bio-marker synchronization complete. Longitudinal HbA1c has dropped by <span className="text-cyan-400 font-black">3.5%</span> over {data.length} months.
                    </p>
                </div>
                <div className="bg-cyan-500/10 text-cyan-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
                    <TrendingDown size={18} />
                    -32.4% Net Improvement
                </div>
            </div>

            {/* CHART AREA */}
            <div className="relative h-64 w-full bg-slate-950/40 rounded-3xl border border-white/5 p-8 flex items-end justify-between px-16 md:px-32 relative group/chart">
                
                {/* Visual Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-50" />

                {/* Background Grid Lines */}
                <div className="absolute inset-0 p-8 pointer-events-none flex flex-col justify-between z-0">
                    {[12, 10, 8, 6].map((line, i) => (
                        <div key={i} className="w-full border-t border-white/5 h-0 relative">
                            <span className="absolute -left-10 -top-2 text-[9px] text-slate-600 font-black tracking-tighter uppercase">{line}%</span>
                        </div>
                    ))}
                </div>

                {/* Data Points */}
                {data.map((item, idx) => {
                    const heightPercent = getHeight(item.value);
                    const isOptimal = item.value < 7.5;
                    const isCritical = item.value > 10;
                    
                    const colorClass = isCritical ? "bg-red-500 shadow-red-500/40" : !isOptimal ? "bg-amber-400 shadow-amber-400/40" : "bg-cyan-500 shadow-cyan-500/40";
                    const textClass = isCritical ? "text-red-400" : !isOptimal ? "text-amber-400" : "text-cyan-400";

                    return (
                        <div key={idx} className="relative flex flex-col items-center justify-end h-full z-10 group w-16">
                            {/* Vertical Support Line */}
                            <div className="absolute bottom-0 w-[1px] bg-white/5 h-full left-1/2 -translate-x-1/2 -z-10" />
                            
                            {/* Bar segment */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercent}%` }}
                                transition={{ duration: 1.5, delay: idx * 0.2, ease: "circOut" }}
                                className="w-[2px] bg-gradient-to-t from-transparent via-white/10 to-white/20 relative flex items-start justify-center group-hover:bg-cyan-500/20 transition-colors"
                            >
                                {/* Active Point / Pulse */}
                                <div className="absolute -top-3 flex items-center justify-center">
                                    <div className={`absolute w-10 h-10 rounded-full ${colorClass.split(' ')[0]} opacity-20 blur-xl group-hover:opacity-40 transition-opacity animate-pulse`} />
                                    <div className={`w-6 h-6 rounded-full border-4 border-slate-950 shadow-2xl ${colorClass} transition-all duration-500 group-hover:scale-125 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]`} />
                                </div>

                                {/* Tooltip */}
                                <div className="absolute -top-16 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 shadow-2xl pointer-events-none">
                                    {item.value}% // {item.status}
                                </div>
                            </motion.div>

                            {/* Label */}
                            <div className="absolute -bottom-10 text-center">
                                <span className={`text-lg font-black block tracking-tighter ${textClass} mb-0.5`}>{item.value}%</span>
                                <span className="text-[9px] uppercase font-black text-slate-600 tracking-widest">{item.month}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-14 flex flex-wrap gap-8 text-[9px] font-black uppercase tracking-[0.2em] justify-center opacity-60">
                <span className="flex items-center gap-2 text-cyan-400"><div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div> Target Optimization</span>
                <span className="flex items-center gap-2 text-amber-400"><div className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div> Pre-Clinical Elevation</span>
                <span className="flex items-center gap-2 text-red-500"><div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div> High-Critical Risk</span>
            </div>
        </motion.div>
    );
}
