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
            <div className="w-full lg:flex-1 overflow-y-auto pr-1 lg:pr-6 custom-scrollbar">
                <div className="mb-10 flex items-start justify-between">
                    <div className="mb-10 px-2">
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-2">Health Assessment</h2>
                        <p className="text-sm text-slate-400 font-medium tracking-tight">Complete the 15-point clinical protocol for deep phenotyping.</p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-all px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/20"
                    >
                        <RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                        Reset Profile
                    </button>
                </div>

                <div className="space-y-6">
                    {QUESTIONS.map((q, idx) => (
                        <div key={q.id} className="glass-card p-8 rounded-[2rem] border-white/5 bg-slate-900/40 hover:border-white/10 transition-all group">
                            <div className="mb-6 flex items-center gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-500/20">
                                    {idx + 1}
                                </span>
                                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">{q.text}</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {q.options.map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleSelect(q.id, opt.label)}
                                        className={`rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${answers[q.id] === opt.label
                                            ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-[1.02]"
                                            : "bg-white/5 border border-white/5 text-slate-400 hover:border-cyan-500/30 hover:text-white"
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
            <div className="w-full lg:w-96 shrink-0">
                <div className="glass-card p-8 rounded-[2.5rem] border-white/10 bg-slate-950/60 backdrop-blur-3xl h-full flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />
                    
                    <div className="mb-10 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Clinical Risk Composite</p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <span className="text-7xl font-black text-white tracking-tighter shadow-sm">{scores.total}</span>
                            <span className="text-xl text-slate-600 font-bold self-end mb-3">/ 175</span>
                        </div>
                    </div>

                    {/* Risk Banner */}
                    <div className={`mb-10 rounded-2xl border p-5 flex items-start gap-4 transition-all ${
                        scores.total > 40 ? "border-red-500/20 bg-red-500/5 text-red-400" :
                        scores.total > 20 ? "border-amber-500/20 bg-amber-500/5 text-amber-400" :
                        "border-cyan-500/20 bg-cyan-500/5 text-cyan-400"
                    }`}>
                        <scores.RiskIcon size={24} className="shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-black text-[10px] uppercase tracking-widest leading-tight mb-1">{scores.riskLevel}</h4>
                            <p className="text-[11px] font-bold opacity-70">Protocol-driven health insight.</p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {scores.categories.map((cat) => (
                            <div key={cat.name} className="flex items-center gap-4 group">
                                <div className={`flex h-9 w-9 min-w-[2.25rem] items-center justify-center rounded-xl bg-white/5 border border-white/5 text-cyan-400 transition-transform group-hover:scale-110 shadow-inner`}>
                                    <cat.icon size={18} />
                                </div>
                                <div className="flex-1">
                                    <div className="mb-1.5 flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">{cat.name}</span>
                                        <span className="text-white">{cat.score}</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((cat.score / cat.max) * 100, 100)}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className={`h-full rounded-full ${cat.score > (cat.max * 0.7) ? "bg-red-500" : cat.score > (cat.max * 0.4) ? "bg-amber-400" : "bg-cyan-500"} shadow-[0_0_8px_rgba(34,211,238,0.4)]`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="glass-card bg-white/5 rounded-2xl p-5 border-white/5 group hover:border-cyan-500/20 transition-all">
                            <h4 className="font-black text-[9px] uppercase tracking-[0.2em] text-cyan-400 mb-2">Protocol Recommendation</h4>
                            <p className="font-bold text-sm text-white leading-tight">Comprehensive Longevity Strategy Indicated</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
