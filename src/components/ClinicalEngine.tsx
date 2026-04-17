"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Brain, Heart, Wind, Zap, Bone, Utensils, Moon, Smile, Shield, AlertTriangle, CheckCircle, ClipboardList, RotateCcw } from "lucide-react";

// --- Data Structure (Exact Dictionary) ---
const QUESTIONS = [
    { id: "q1", text: "How old is the member?", options: [{ label: "Below 40", score: 0 }, { label: "40-55", score: 5 }, { label: "56-69", score: 10 }, { label: "70+", score: 15 }, { label: "Don’t Know", score: 5 }] },
    { id: "q2", text: "Have they been told they have high blood sugar, prediabetes, or diabetes?", options: [{ label: "No", score: 0 }, { label: "Prediabetes", score: 5 }, { label: "Diabetes", score: 15 }, { label: "Don't Know", score: 5 }] },
    { id: "q3", text: "Do they have high BP, Disturbed Cholesterol, or heart issues (stent, bypass, angina)?", options: [{ label: "No", score: 0 }, { label: "One Condition", score: 5 }, { label: "Multiple/Severe", score: 15 }, { label: "Don't Know", score: 5 }] },
    { id: "q4", text: "Do they get tired or breathless doing everyday activities?", options: [{ label: "Never", score: 0 }, { label: "Sometimes", score: 5 }, { label: "Often", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q5", text: "Have they had stroke, tremors (parkinsonism), limb weakness, or slowed movements?", options: [{ label: "No", score: 0 }, { label: "Mild signs", score: 5 }, { label: "Diagnosed/Visible", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q6", text: "Do they often seem confused, forgetful, or unsteady?", options: [{ label: "No", score: 0 }, { label: "Sometimes", score: 5 }, { label: "Often", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q7", text: "Have they been hospitalized or undergone major surgery (heart, brain, spine) or cancer?", options: [{ label: "No", score: 0 }, { label: "Once/Minor", score: 5 }, { label: "Multiple/Major/Cancer", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q8", text: "Do they complain of joint/back/knee pain that limits movement?", options: [{ label: "No", score: 0 }, { label: "Sometimes/Mild", score: 10 }, { label: "Severe/Daily", score: 20 }, { label: "Don't Know", score: 5 }] },
    { id: "q9", text: "Have they had falls or fractures in the last 2 years?", options: [{ label: "No", score: 0 }, { label: "Once", score: 5 }, { label: "Multiple", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q10", text: "Do they need help with stairs, bathing, dressing or getting off the floor?", options: [{ label: "No", score: 0 }, { label: "Occasionally", score: 5 }, { label: "Often", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q11", text: "Do they complain of bloating, acidity, constipation, or gut issues?", options: [{ label: "No", score: 0 }, { label: "Occasionally", score: 5 }, { label: "Frequently", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q12", text: "Do they often seem stressed, anxious, or emotionally low?", options: [{ label: "No", score: 0 }, { label: "Sometimes", score: 5 }, { label: "Often", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q13", text: "Do they sleep poorly, snore loudly or nap excessively?", options: [{ label: "Good/No", score: 0 }, { label: "Sometimes", score: 5 }, { label: "Often/Poor", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q14", text: "Do they usually eat unhealthy foods, eat at odd times, or drink too little water?", options: [{ label: "No", score: 0 }, { label: "Sometimes", score: 5 }, { label: "Often", score: 10 }, { label: "Don't Know", score: 5 }] },
    { id: "q15", text: "Do they smoke, drink often or avoid exercise completely?", options: [{ label: "None", score: 0 }, { label: "One habit", score: 5 }, { label: "Two or more", score: 10 }, { label: "Don't Know", score: 5 }] },
];

export function ClinicalEngine() {
    // Lazy init to avoid race conditions
    const [answers, setAnswers] = useState<Record<string, string>>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("yukti_assessment_data_v2");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return parsed.answers || {};
                } catch (e) {
                    console.error("Error loading saved data", e);
                }
            }
        }
        return {};
    });



    // --- Scoring Logic (useMemo) ---
    const scores = useMemo(() => {
        // Helper to find score by label
        const getScore = (qId: string) => {
            const selectedLabel = answers[qId];
            if (!selectedLabel) return 0;
            const question = QUESTIONS.find(q => q.id === qId);
            const option = question?.options.find(opt => opt.label === selectedLabel);
            return option?.score || 0;
        };

        const categories = [
            { name: "Metabolic", score: getScore("q2"), max: 15, icon: Zap, color: "text-yellow-600 bg-yellow-100" },
            { name: "Cardiovascular", score: getScore("q3"), max: 15, icon: Heart, color: "text-red-600 bg-red-100" },
            { name: "Cognitive", score: getScore("q5") + getScore("q6"), max: 20, icon: Brain, color: "text-purple-600 bg-purple-100" },
            { name: "Muscular", score: getScore("q8"), max: 20, icon: Bone, color: "text-stone-600 bg-stone-100" },
            { name: "Frailty", score: getScore("q9") + getScore("q10"), max: 20, icon: Activity, color: "text-orange-600 bg-orange-100" },
            { name: "Digestive", score: getScore("q11"), max: 10, icon: Utensils, color: "text-emerald-600 bg-emerald-100" },
            { name: "Emotional", score: getScore("q12"), max: 10, icon: Smile, color: "text-sky-600 bg-sky-100" },
            { name: "Sleep", score: getScore("q13"), max: 10, icon: Moon, color: "text-indigo-600 bg-indigo-100" },
            { name: "Lifestyle", score: getScore("q14") + getScore("q15"), max: 20, icon: Wind, color: "text-green-600 bg-green-100" },
            { name: "Resilience", score: getScore("q1") + getScore("q4") + getScore("q7"), max: 35, icon: Shield, color: "text-blue-600 bg-blue-100" },
        ];

        const total = categories.reduce((sum, cat) => sum + cat.score, 0);

        // Risk Logic: 0-20 Green, 21-40 Yellow, 41+ Red
        let riskLevel = "Healthy Baseline";
        let riskColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
        let riskIcon = CheckCircle;

        if (total > 40) {
            riskLevel = "High Risk: Immediate Action Required";
            riskColor = "bg-red-50 text-red-700 border-red-200";
            riskIcon = AlertTriangle;
        } else if (total > 20) {
            riskLevel = "Moderate Attention";
            riskColor = "bg-amber-50 text-amber-700 border-amber-200";
            riskIcon = AlertTriangle;
        }

        return { categories, total, riskLevel, riskColor, RiskIcon: riskIcon };
    }, [answers]);

    // Save to LocalStorage on change


    // Save to LocalStorage on change
    useEffect(() => {
        localStorage.setItem("yukti_assessment_data_v2", JSON.stringify({ answers, scores }));
    }, [answers, scores]);


    const handleSelect = (id: string, label: string) => {
        setAnswers((prev) => ({ ...prev, [id]: label }));
    };

    const handleReset = () => {
        if (confirm("Are you sure? This will clear your health profile and lock Smart Reports.")) {
            localStorage.removeItem("yukti_assessment_data_v2");
            setAnswers({}); // Clear state to reset UI
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-14rem)] gap-8 overflow-y-auto lg:overflow-hidden pb-32 lg:pb-0">
            {/* Left Panel: Questions */}
            <div className="w-full lg:flex-1 overflow-y-auto pr-1 lg:pr-8 custom-scrollbar">
                <div className="mb-12 flex items-start justify-between px-2">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white font-[family-name:var(--font-outfit)] uppercase tracking-tight mb-3">Assessment Hub</h2>
                        <p className="text-sm text-slate-400 font-light font-[family-name:var(--font-inter)] tracking-wide">Complete this exploratory health profiling protocol for the concept demonstration.</p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="group flex items-center gap-3 data-label !text-slate-600 hover:!text-red-400 transition-all px-5 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/20 active:scale-95"
                    >
                        <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-700 opacity-60" />
                        Reset Profile
                    </button>
                </div>

                <div className="space-y-6">
                    {QUESTIONS.map((q, idx) => (
                        <div key={q.id} className="glass-card p-10 rounded-[3rem] border-white/5 bg-slate-900/40 hover:bg-white/[0.03] transition-all group">
                            <div className="mb-8 flex items-start gap-6">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 data-label !text-cyan-400 shadow-inner">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <h3 className="text-xl font-semibold text-white font-[family-name:var(--font-outfit)] tracking-tight leading-snug pt-1">{q.text}</h3>
                            </div>
                            <div className="flex flex-wrap gap-3 pl-0 md:pl-16">
                                {q.options.map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleSelect(q.id, opt.label)}
                                        className={`rounded-2xl px-6 py-4 data-label transition-all active:scale-95 ${answers[q.id] === opt.label
                                            ? "bg-cyan-500 text-slate-950 shadow-xl shadow-cyan-500/20"
                                            : "bg-white/5 border border-white/5 text-slate-500 hover:border-cyan-500/30 hover:text-white"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Live Report Dashboard */}
            <div className="w-full lg:w-[400px] shrink-0">
                <div className="glass-card p-10 rounded-[3.5rem] border-white/5 bg-slate-950/60 backdrop-blur-3xl h-full flex flex-col shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20" />
                    
                    <div className="mb-12 text-center">
                        <p className="data-label !text-slate-500/50 !tracking-[0.2em] normal-case">Sample Health Index</p>
                        <div className="flex items-center justify-center gap-3 mt-4">
                            <span className="text-8xl font-bold text-white font-[family-name:var(--font-outfit)] tracking-tighter">{scores.total}</span>
                            <span className="text-xl text-slate-750 font-medium font-[family-name:var(--font-inter)] self-end mb-4 opacity-30">/ 175</span>
                        </div>
                    </div>

                    {/* Risk Banner */}
                    <div className={`mb-12 rounded-[2rem] border p-6 flex items-start gap-5 transition-all ${
                        scores.total > 40 ? "border-red-500/10 bg-red-500/[0.02] text-red-400" :
                        scores.total > 20 ? "border-amber-500/10 bg-amber-500/[0.02] text-amber-400" :
                        "border-cyan-500/10 bg-cyan-500/[0.02] text-cyan-400"
                    }`}>
                        <scores.RiskIcon size={24} strokeWidth={1.5} className="shrink-0 mt-1 opacity-60" />
                        <div>
                            <h4 className="font-bold text-xs uppercase tracking-widest leading-tight mb-2 font-[family-name:var(--font-outfit)]">{scores.riskLevel}</h4>
                            <p className="text-[11px] font-light font-[family-name:var(--font-inter)] opacity-50 uppercase tracking-tighter">Sample Profile Generated</p>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-3 custom-scrollbar">
                        {scores.categories.map((cat) => (
                            <div key={cat.name} className="flex items-center gap-5 group/item">
                                <div className="flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-cyan-400/60 transition-all group-hover/item:scale-110 shadow-inner">
                                    <cat.icon size={20} strokeWidth={1.5} className="opacity-80" />
                                </div>
                                <div className="flex-1">
                                    <div className="mb-2 flex justify-between data-label !text-[9px]">
                                        <span className="text-slate-500">{cat.name}</span>
                                        <span className="text-white opacity-80">{cat.score}</span>
                                    </div>
                                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/5 border border-white/[0.02]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((cat.score / cat.max) * 100, 100)}%` }}
                                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                            className={`h-full rounded-full ${cat.score > (cat.max * 0.7) ? "bg-red-500/80" : cat.score > (cat.max * 0.4) ? "bg-amber-400/80" : "bg-cyan-500/80"} shadow-[0_0_10px_rgba(34,211,238,0.2)]`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/5">
                        <div className="glass-card bg-white/[0.02] rounded-3xl p-6 border-white/5 group-hover:border-cyan-500/20 transition-all text-center">
                            <h4 className="data-label !text-cyan-400 !text-[8px] mb-2 uppercase tracking-[0.4em]">Suggested Focus</h4>
                            <p className="font-bold text-xs text-white uppercase tracking-widest font-[family-name:var(--font-outfit)]">Longevity Study Sample</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
