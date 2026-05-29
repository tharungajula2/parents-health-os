"use client";

import { useState, useMemo, useEffect } from "react";
import { useParentsAuth } from "../lib/supabase/context";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Activity, Brain, Heart, Wind, Zap, Bone, Utensils, Moon, 
    Smile, Shield, AlertTriangle, CheckCircle, RotateCcw, 
    User, Phone, ChevronRight, ChevronLeft, Check, Compass, Star 
} from "lucide-react";
import { useToast } from "./ui/Toast";
import { ParentAssessmentAnswers, generateCarePlan } from "../utils/carePlanEngine";

const CONDITIONS_LIST = [
    "Diabetes",
    "Hypertension",
    "Heart Issues",
    "Kidney Condition",
    "Thyroid",
    "Asthma/COPD",
    "Arthritis",
    "None"
];

export function ClinicalEngine() {
    const { isSupabaseEnabled, activeParent, updateScorecard, resetScorecard, medications } = useParentsAuth();
    const { showToast } = useToast();
    const [activeStage, setActiveStage] = useState<"A" | "B" | "C" | "D">("A");
    const [answers, setAnswers] = useState<ParentAssessmentAnswers>({
        relation: "",
        age: "",
        language: "English",
        conditions: [],
        mobility: "Independent",
        allergies: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        doctor_contact_name: "",
        doctor_contact_phone: "",
        
        bathing: "Independent",
        dressing: "Independent",
        toileting: "Independent",
        transferring: "Independent",
        walking: "Independent",
        eating: "Independent",

        falls_12m: "No",
        dizziness: "No",
        breathlessness: "No",
        forgetfulness: "No",
        low_mood: "No",
        poor_sleep: "No",
        appetite_loss: "No",
        constipation: "No",
        severe_pain: "No",

        wake_up_time: "7:00 AM",
        bp_frequency: "Daily",
        sugar_frequency: "Daily",
        hydration_target: 8,
        exercise_reminder: "Yes",
        whatsapp_language: "English",
        
        stageA_completed: false,
        stageB_completed: false,
        stageC_completed: false,
        stageD_completed: false
    });

    useEffect(() => {
        if (activeParent) {
            const scorecardObj = activeParent.scorecard_answers as any;
            if (scorecardObj?.answers) {
                setAnswers(prev => ({ ...prev, ...scorecardObj.answers }));
                if (scorecardObj.answers.stageA_completed) {
                    // Start in the latest incomplete stage
                    if (!scorecardObj.answers.stageB_completed) setActiveStage("B");
                    else if (!scorecardObj.answers.stageC_completed) setActiveStage("C");
                    else if (!scorecardObj.answers.stageD_completed) setActiveStage("D");
                    else setActiveStage("A");
                }
            } else {
                // Clear state when parent has no baseline
                resetStateToDefaults();
            }
        } else {
            resetStateToDefaults();
        }
    }, [activeParent]);

    const resetStateToDefaults = () => {
        setAnswers({
            relation: "",
            age: "",
            language: "English",
            conditions: [],
            mobility: "Independent",
            allergies: "",
            emergency_contact_name: "",
            emergency_contact_phone: "",
            doctor_contact_name: "",
            doctor_contact_phone: "",
            
            bathing: "Independent",
            dressing: "Independent",
            toileting: "Independent",
            transferring: "Independent",
            walking: "Independent",
            eating: "Independent",

            falls_12m: "No",
            dizziness: "No",
            breathlessness: "No",
            forgetfulness: "No",
            low_mood: "No",
            poor_sleep: "No",
            appetite_loss: "No",
            constipation: "No",
            severe_pain: "No",

            wake_up_time: "7:00 AM",
            bp_frequency: "Daily",
            sugar_frequency: "Daily",
            hydration_target: 8,
            exercise_reminder: "Yes",
            whatsapp_language: "English",
            
            stageA_completed: false,
            stageB_completed: false,
            stageC_completed: false,
            stageD_completed: false
        });
        setActiveStage("A");
    };

    // Calculate score compatibility metric
    const scores = useMemo(() => {
        let metabolic = 0;
        let cardiovascular = 0;
        let cognitive = 0;
        let muscular = 0;
        let frailty = 0;
        let digestive = 0;
        let emotional = 0;
        let sleep = 0;
        let lifestyle = 0;
        let resilience = 0;

        // Stage A Conditions & Profile scoring
        if (answers.conditions?.includes("Diabetes")) metabolic += 15;
        if (answers.conditions?.includes("Hypertension")) cardiovascular += 10;
        if (answers.conditions?.includes("Heart Issues")) cardiovascular += 15;
        
        const ageNum = parseInt(answers.age || "0");
        if (ageNum >= 70) resilience += 15;
        else if (ageNum >= 56) resilience += 10;
        else if (ageNum >= 40) resilience += 5;

        if (answers.mobility === "Needs support for stairs") {
            frailty += 5;
            muscular += 5;
        } else if (answers.mobility === "Uses walking stick/walker") {
            frailty += 10;
            muscular += 10;
        } else if (answers.mobility === "Bedridden") {
            frailty += 15;
            muscular += 15;
        }

        // ADLs scoring (Stage B)
        const adlHelpCount = ["bathing", "dressing", "toileting", "transferring", "walking", "eating"]
            .filter(key => (answers as any)[key] === "Needs help").length;
        frailty += adlHelpCount * 5;

        // Risk signals scoring (Stage C)
        if (answers.falls_12m === "Yes") frailty += 10;
        if (answers.dizziness === "Yes") resilience += 10;
        if (answers.breathlessness === "Yes") resilience += 10;
        if (answers.forgetfulness === "Yes") cognitive += 10;
        if (answers.low_mood === "Yes") emotional += 10;
        if (answers.poor_sleep === "Yes") sleep += 10;
        if (answers.appetite_loss === "Yes") digestive += 5;
        if (answers.constipation === "Yes") digestive += 5;
        if (answers.severe_pain === "Yes") muscular += 10;

        // Stage D preferences check
        if (answers.exercise_reminder === "No") lifestyle += 10;

        const total = metabolic + cardiovascular + cognitive + muscular + frailty + digestive + emotional + sleep + lifestyle + resilience;

        let riskLevel = "Healthy Baseline";
        let riskColor = "bg-emerald-50 text-emerald-800 border-emerald-200/80";
        let riskIcon = CheckCircle;

        if (total > 40) {
            riskLevel = "High Risk: Action Required";
            riskColor = "bg-red-50 text-red-700 border-red-200/80";
            riskIcon = AlertTriangle;
        } else if (total > 20) {
            riskLevel = "Moderate Attention";
            riskColor = "bg-amber-50 text-amber-800 border-amber-200/80";
            riskIcon = AlertTriangle;
        }

        const categories = [
            { name: "Metabolic", score: metabolic, max: 15, icon: Zap },
            { name: "Cardiovascular", score: cardiovascular, max: 15, icon: Heart },
            { name: "Cognitive", score: cognitive, max: 20, icon: Brain },
            { name: "Muscular", score: muscular, max: 20, icon: Bone },
            { name: "Frailty", score: frailty, max: 20, icon: Activity },
            { name: "Digestive", score: digestive, max: 10, icon: Utensils },
            { name: "Emotional", score: emotional, max: 10, icon: Smile },
            { name: "Sleep", score: sleep, max: 10, icon: Moon },
            { name: "Lifestyle", score: lifestyle, max: 20, icon: Wind },
            { name: "Resilience", score: resilience, max: 35, icon: Shield },
        ];

        return { categories, total, riskLevel, riskColor, RiskIcon: riskIcon };
    }, [answers]);

    // Handle Input change
    const updateField = (field: keyof ParentAssessmentAnswers, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Toggle array inputs (conditions)
    const toggleCondition = (cond: string) => {
        setAnswers(prev => {
            const current = prev.conditions || [];
            if (cond === "None") {
                return { ...prev, conditions: ["None"] };
            }
            let next = current.filter(c => c !== "None");
            if (next.includes(cond)) {
                next = next.filter(c => c !== cond);
            } else {
                next = [...next, cond];
            }
            return { ...prev, conditions: next };
        });
    };

    // Complete active Stage
    const handleSaveStage = async (stage: "A" | "B" | "C" | "D") => {
        // Validation check for Stage A
        if (stage === "A") {
            if (!answers.relation) {
                showToast("Please enter relation to caregiver.", "error");
                return;
            }
            if (!answers.age || isNaN(Number(answers.age))) {
                showToast("Please enter a valid numeric age.", "error");
                return;
            }
            if (!answers.emergency_contact_name || !answers.emergency_contact_phone) {
                showToast("Emergency Contact name & phone are required.", "error");
                return;
            }
        }

        const updatedAnswers = {
            ...answers,
            [`stage${stage}_completed`]: true
        };

        setAnswers(updatedAnswers);
        
        // Push assessment update to parent profile
        const result = await updateScorecard(updatedAnswers, {
            categories: scores.categories.map(c => ({ name: c.name, score: c.score, max: c.max })),
            total: scores.total,
            riskLevel: scores.riskLevel
        });

        if (result.success) {
            showToast(`Stage ${stage} Baseline Saved! ✅`, "success");
            // Progress window
            if (stage === "A") setActiveStage("B");
            else if (stage === "B") setActiveStage("C");
            else if (stage === "C") setActiveStage("D");
            else {
                showToast("Care Plan configured completely! Proceeding to Dashboard.", "success");
            }
        } else {
            showToast("Failed to save progress.", "error");
        }
    };

    const handleSkipStage = (stage: "B" | "C" | "D") => {
        const updatedAnswers = {
            ...answers,
            [`stage${stage}_completed`]: true
        };
        setAnswers(updatedAnswers);
        
        showToast(`Skipped Stage ${stage}. Default answers assumed.`, "info");
        
        if (stage === "B") setActiveStage("C");
        else if (stage === "C") setActiveStage("D");
        else setActiveStage("A");
    };

    const handleReset = async () => {
        if (confirm("Are you sure? This will clear the baseline parent health profile completely.")) {
            await resetScorecard();
            resetStateToDefaults();
            localStorage.removeItem("parents_health_assessment_data_v2");
            showToast("Profile reset successfully. Please complete Stage A again.", "info");
        }
    };

    // Calculate progression percentages
    const currentProgressPercentage = useMemo(() => {
        let count = 0;
        if (answers.stageA_completed) count += 25;
        if (answers.stageB_completed) count += 25;
        if (answers.stageC_completed) count += 25;
        if (answers.stageD_completed) count += 25;
        return count;
    }, [answers]);

    return (
        <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-14rem)] gap-8 overflow-y-auto lg:overflow-hidden pb-32 lg:pb-0 font-[family-name:var(--font-inter)] text-slate-800">
            {/* Left Panel: Progressive Form Wizard */}
            <div className="w-full lg:flex-1 overflow-y-auto pr-1 lg:pr-8 custom-scrollbar">
                
                {/* Header Profile Title */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-2">
                    <div>
                        <h2 className="text-2xl md:text-5xl font-bold text-[#0E5E5A] font-[family-name:var(--font-outfit)] uppercase tracking-tight mb-2 md:mb-3">
                            Care Profile Builder
                        </h2>
                        <p className="text-xs md:text-sm text-slate-600 font-normal tracking-wide leading-relaxed">
                            Establish a warm, proactive care baseline for your parent. Minimum completion of **Stage A** is required to activate Daily Logs.
                        </p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="group flex items-center gap-3 text-slate-500 hover:text-red-600 transition-all px-4 py-2.5 rounded-2xl bg-teal-50/60 border border-[#0E5E5A]/10 hover:bg-red-50 hover:border-red-200 active:scale-95 cursor-pointer text-xs font-semibold"
                    >
                        <RotateCcw size={14} className="group-hover:rotate-180 transition-transform duration-700 opacity-60 text-red-500" />
                        Reset Onboarding
                    </button>
                </div>

                {/* Progress bar and Stage Nav Pills */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 mb-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">Baseline Progress</span>
                        <span className="text-xs font-black text-[#0E5E5A] font-[family-name:var(--font-outfit)]">{currentProgressPercentage}% Completed</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden mb-6">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-[#0E5E5A] transition-all duration-700 rounded-full"
                            style={{ width: `${Math.max(currentProgressPercentage, 8)}%` }}
                        />
                    </div>

                    {/* Stage Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                            { code: "A", name: "Stage A: Setup", label: "Mandatory Setup", done: answers.stageA_completed },
                            { code: "B", name: "Stage B: ADLs", label: "Independence Mode", done: answers.stageB_completed },
                            { code: "C", name: "Stage C: Risks", label: "Daily Risk Signals", done: answers.stageC_completed },
                            { code: "D", name: "Stage D: Routine", label: "Care Preferences", done: answers.stageD_completed }
                        ].map(stg => (
                            <button
                                key={stg.code}
                                onClick={() => {
                                    if (stg.code !== "A" && !answers.stageA_completed) {
                                        showToast("Complete Stage A setup first!", "error");
                                        return;
                                    }
                                    setActiveStage(stg.code as any);
                                }}
                                className={`p-3 rounded-2xl border text-left transition-all active:scale-98 cursor-pointer relative ${
                                    activeStage === stg.code 
                                        ? "bg-white border-[#0E5E5A] shadow-md shadow-[#0E5E5A]/5" 
                                        : "bg-slate-50/50 border-slate-200/80 hover:bg-white hover:border-slate-300"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className={`text-xs font-bold font-[family-name:var(--font-outfit)] ${activeStage === stg.code ? "text-[#0E5E5A]" : "text-slate-600"}`}>
                                        {stg.name}
                                    </span>
                                    {stg.done && (
                                        <div className="h-4 w-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">✓</div>
                                    )}
                                </div>
                                <p className="text-[9px] text-slate-500 font-medium truncate">{stg.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Switchboard */}
                <AnimatePresence mode="wait">
                    {activeStage === "A" && (
                        <motion.div
                            key="stage-a"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="glass-card p-6 md:p-8 rounded-[2rem] border-slate-200 bg-white shadow-sm space-y-6">
                                <div className="border-b border-slate-100 pb-4 mb-4">
                                    <h3 className="text-lg font-bold text-[#0E5E5A] font-[family-name:var(--font-outfit)] flex items-center gap-3">
                                        <User size={20} className="text-[#E05E1B]" />
                                        STAGE A: Primary Baseline Profile (Setup Required)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">Provide core identification, diagnosed health parameters, and emergency logistics.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Relation to you</label>
                                        <select
                                            value={answers.relation}
                                            onChange={e => updateField("relation", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        >
                                            <option value="">Select Relationship</option>
                                            <option value="Father">Father</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Grandfather">Grandfather</option>
                                            <option value="Grandmother">Grandmother</option>
                                            <option value="Other">Other Family Member</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Numeric Age</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 72"
                                            value={answers.age || ""}
                                            onChange={e => updateField("age", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Primary Language</label>
                                        <select
                                            value={answers.language}
                                            onChange={e => updateField("language", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        >
                                            <option value="English">English</option>
                                            <option value="Hindi">Hindi (हिंदी)</option>
                                            <option value="Telugu">Telugu (తెలుగు)</option>
                                            <option value="Tamil">Tamil (தமிழ்)</option>
                                            <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                                            <option value="Bengali">Bengali (বাংলা)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Mobility Support Needs</label>
                                        <select
                                            value={answers.mobility}
                                            onChange={e => updateField("mobility", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        >
                                            <option value="Independent">Fully Independent</option>
                                            <option value="Needs support for stairs">Needs help with stairs/walking outside</option>
                                            <option value="Uses walking stick/walker">Uses a walking stick, walker, or support</option>
                                            <option value="Bedridden">Mainly bedbound / wheel-chair assisted</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Diagnosed Conditions */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Major Diagnosed Conditions (Select all that apply)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CONDITIONS_LIST.map(cond => {
                                            const isChecked = answers.conditions?.includes(cond) || false;
                                            return (
                                                <button
                                                    key={cond}
                                                    type="button"
                                                    onClick={() => toggleCondition(cond)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                                        isChecked 
                                                            ? "bg-[#0E5E5A] text-white border-[#0E5E5A]" 
                                                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                                                    }`}
                                                >
                                                    {cond}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Known Allergies / Food Restrictions</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Sulfa medications, Peanut allergy, Salt restricted"
                                            value={answers.allergies || ""}
                                            onChange={e => updateField("allergies", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Emergency Contact Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Ramesh Kumar (Uncle)"
                                            value={answers.emergency_contact_name || ""}
                                            onChange={e => updateField("emergency_contact_name", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Emergency Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="e.g. +91 98765 43210"
                                            value={answers.emergency_contact_phone || ""}
                                            onChange={e => updateField("emergency_contact_phone", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">GP / Primary Doctor Name (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Dr. Verma (Cardiologist)"
                                            value={answers.doctor_contact_name || ""}
                                            onChange={e => updateField("doctor_contact_name", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">GP Doctor Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            placeholder="e.g. +91 99887 76655"
                                            value={answers.doctor_contact_phone || ""}
                                            onChange={e => updateField("doctor_contact_phone", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleSaveStage("A")}
                                        className="flex items-center gap-3 px-8 py-4 bg-[#0E5E5A] hover:bg-[#0E5E5A]/90 text-white font-bold rounded-2xl active:scale-95 transition-all text-xs tracking-wider uppercase cursor-pointer shadow-md"
                                    >
                                        Save & Continue
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeStage === "B" && (
                        <motion.div
                            key="stage-b"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="glass-card p-6 md:p-8 rounded-[2rem] border-slate-200 bg-white shadow-sm space-y-6">
                                <div className="border-b border-slate-100 pb-4 mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0E5E5A] font-[family-name:var(--font-outfit)] flex items-center gap-3">
                                            <Compass size={20} className="text-[#E05E1B]" />
                                            STAGE B: Functional ADLs (Optional)
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">Review basic self-care tasks (Activities of Daily Living) to adjust care scheduling.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSkipStage("B")}
                                        className="text-slate-500 hover:text-slate-700 bg-slate-100 px-4 py-2 rounded-xl text-xs font-semibold active:scale-95 cursor-pointer border border-slate-200/50"
                                    >
                                        Skip this stage
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { field: "bathing", title: "Bathing & Showering", desc: "Able to bath independently or needs physical oversight." },
                                        { field: "dressing", title: "Dressing", desc: "Selects outfit, manages buttons/zippers independently." },
                                        { field: "toileting", title: "Toileting & Continence", desc: "Uses washroom and manages cleanliness independently." },
                                        { field: "transferring", title: "Transferring & Mobility", desc: "Able to sit, stand from chair/sofa, or walk across rooms." },
                                        { field: "walking", title: "Walking Up Stairs", desc: "Able to manage stair steps safely without help." },
                                        { field: "eating", title: "Eating & Feeding", desc: "Able to feed self prepared plates independently." }
                                    ].map(adl => (
                                        <div key={adl.field} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-50/50 rounded-2xl border border-slate-100/80 transition-all">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">{adl.title}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">{adl.desc}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {["Independent", "Needs help"].map(opt => {
                                                    const isChecked = (answers as any)[adl.field] === opt;
                                                    return (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => updateField(adl.field as any, opt)}
                                                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                                                isChecked 
                                                                    ? "bg-[#0E5E5A] text-white border-[#0E5E5A]" 
                                                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setActiveStage("A")}
                                        className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-600 font-bold rounded-2xl active:scale-95 transition-all text-xs tracking-wider uppercase cursor-pointer hover:bg-slate-50"
                                    >
                                        <ChevronLeft size={14} />
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSaveStage("B")}
                                        className="flex items-center gap-3 px-8 py-4 bg-[#0E5E5A] hover:bg-[#0E5E5A]/90 text-white font-bold rounded-2xl active:scale-95 transition-all text-xs tracking-wider uppercase cursor-pointer shadow-md"
                                    >
                                        Save & Continue
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeStage === "C" && (
                        <motion.div
                            key="stage-c"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="glass-card p-6 md:p-8 rounded-[2rem] border-slate-200 bg-white shadow-sm space-y-6">
                                <div className="border-b border-slate-100 pb-4 mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0E5E5A] font-[family-name:var(--font-outfit)] flex items-center gap-3">
                                            <Activity size={20} className="text-[#E05E1B]" />
                                            STAGE C: Daily Risk Signals (Optional)
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">Review active warning indicators over the past months to design support mechanisms.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSkipStage("C")}
                                        className="text-slate-500 hover:text-slate-700 bg-slate-100 px-4 py-2 rounded-xl text-xs font-semibold active:scale-95 cursor-pointer border border-slate-200/50"
                                    >
                                        Skip this stage
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { field: "falls_12m", title: "Falls in past 12 Months", desc: "Any slip, imbalance, or fracture incidents?" },
                                        { field: "dizziness", title: "Dizziness & Fainting", desc: "Complaining of head spins or lightheadedness?" },
                                        { field: "breathlessness", title: "Breathlessness on exertion", desc: "Shortness of breath doing regular tasks?" },
                                        { field: "forgetfulness", title: "Forgetfulness / Confusion", desc: "Struggling to remember names or medications?" },
                                        { field: "low_mood", title: "Low Mood / Loneliness", desc: "Expressing boredom, anxiety, or low energy levels?" },
                                        { field: "poor_sleep", title: "Poor Sleep Quality", desc: "Trouble sleeping or sleeping excessively during the day?" },
                                        { field: "appetite_loss", title: "Appetite / Weight Loss", desc: "Skipping meals or sudden unexplained loss of weight?" },
                                        { field: "constipation", title: "Constipation / Bloating", desc: "Frequent digestive complaints or gut concerns?" },
                                        { field: "severe_pain", title: "Severe Joint Pain", desc: "Pain that limits movements or chair standing?" }
                                    ].map(r => (
                                        <div key={r.field} className="p-4 hover:bg-slate-50/50 rounded-2xl border border-slate-100 transition-all flex flex-col justify-between gap-3">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800">{r.title}</h4>
                                                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                {["No", "Yes"].map(opt => {
                                                    const isChecked = (answers as any)[r.field] === opt;
                                                    return (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => updateField(r.field as any, opt)}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                                                isChecked 
                                                                    ? "bg-[#0E5E5A] text-white border-[#0E5E5A]" 
                                                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setActiveStage("B")}
                                        className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-600 font-bold rounded-2xl active:scale-95 transition-all text-xs tracking-wider uppercase cursor-pointer hover:bg-slate-50"
                                    >
                                        <ChevronLeft size={14} />
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSaveStage("C")}
                                        className="flex items-center gap-3 px-8 py-4 bg-[#0E5E5A] hover:bg-[#0E5E5A]/90 text-white font-bold rounded-2xl active:scale-95 transition-all text-xs tracking-wider uppercase cursor-pointer shadow-md"
                                    >
                                        Save & Continue
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeStage === "D" && (
                        <motion.div
                            key="stage-d"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="glass-card p-6 md:p-8 rounded-[2rem] border-slate-200 bg-white shadow-sm space-y-6">
                                <div className="border-b border-slate-100 pb-4 mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0E5E5A] font-[family-name:var(--font-outfit)] flex items-center gap-3">
                                            <Star size={20} className="text-[#E05E1B]" />
                                            STAGE D: Daily Care Routine Preferences (Optional)
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">Configure frequencies and channels for physical measurements and Anaya reminders.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSkipStage("D")}
                                        className="text-slate-500 hover:text-slate-700 bg-slate-100 px-4 py-2 rounded-xl text-xs font-semibold active:scale-95 cursor-pointer border border-slate-200/50"
                                    >
                                        Skip this stage
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Wake-up Time</label>
                                        <input
                                            type="text"
                                            value={answers.wake_up_time || ""}
                                            onChange={e => updateField("wake_up_time", e.target.value)}
                                            placeholder="e.g. 6:30 AM"
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block font-medium">WhatsApp Language Preference</label>
                                        <select
                                            value={answers.whatsapp_language}
                                            onChange={e => updateField("whatsapp_language", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        >
                                            <option value="English">English</option>
                                            <option value="Hindi">Hindi (हिंदी)</option>
                                            <option value="Telugu">Telugu (తెలుగు)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block font-medium">Blood Pressure Frequency</label>
                                        <select
                                            value={answers.bp_frequency}
                                            onChange={e => updateField("bp_frequency", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        >
                                            <option value="Daily">Daily Checks</option>
                                            <option value="Weekly">Weekly Baseline Checks</option>
                                            <option value="None">No routine logs needed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block font-medium">Blood Sugar Frequency</label>
                                        <select
                                            value={answers.sugar_frequency}
                                            onChange={e => updateField("sugar_frequency", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        >
                                            <option value="Daily">Daily Fasting Checks</option>
                                            <option value="Weekly">Weekly checks</option>
                                            <option value="None">No routine checks</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Daily Hydration Target (glasses)</label>
                                        <input
                                            type="number"
                                            value={answers.hydration_target || 8}
                                            onChange={e => updateField("hydration_target", Number(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block font-medium">Movement Reminders</label>
                                        <select
                                            value={answers.exercise_reminder}
                                            onChange={e => updateField("exercise_reminder", e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:border-[#0E5E5A] outline-none text-sm transition-all"
                                        >
                                            <option value="Yes">Remind parent every evening</option>
                                            <option value="No">No reminders</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setActiveStage("C")}
                                        className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-600 font-bold rounded-2xl active:scale-95 transition-all text-xs tracking-wider uppercase cursor-pointer hover:bg-slate-50"
                                    >
                                        <ChevronLeft size={14} />
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSaveStage("D")}
                                        className="flex items-center gap-3 px-8 py-4 bg-[#0E5E5A] hover:bg-[#0E5E5A]/90 text-white font-bold rounded-2xl active:scale-95 transition-all text-xs tracking-wider uppercase cursor-pointer shadow-md"
                                    >
                                        Finish & Setup OS
                                        <Check size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Panel: Dynamic Care Index Status Indicator */}
            <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
                <div className="glass-card p-6 md:p-10 rounded-[3.5rem] border-slate-200 bg-white h-full max-h-full flex flex-col shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0E5E5A]" />
                    
                    <div className="mb-10 text-center">
                        <p className="data-label !text-[#E05E1B] !tracking-[0.2em] font-black uppercase text-[10px]">Composite Care Index</p>
                        <div className="flex items-center justify-center gap-3 mt-4">
                            <span className="text-8xl font-bold text-[#0E5E5A] font-[family-name:var(--font-outfit)] tracking-tighter">{scores.total}</span>
                            <span className="text-xl text-slate-400 font-bold font-[family-name:var(--font-outfit)] self-end mb-4 opacity-70">/ 175</span>
                        </div>
                    </div>

                    {/* Risk Banner */}
                    <div className={`mb-10 rounded-[2rem] border p-6 flex items-start gap-5 transition-all ${scores.riskColor}`}>
                        <scores.RiskIcon size={24} strokeWidth={2} className="shrink-0 mt-1 opacity-80" />
                        <div>
                            <h4 className="font-bold text-xs uppercase tracking-widest leading-tight mb-2 font-[family-name:var(--font-outfit)]">{scores.riskLevel}</h4>
                            <p className="text-[11px] font-medium opacity-60 uppercase tracking-tighter">Automatic Care Profile Analysis</p>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-3 custom-scrollbar">
                        {scores.categories.map((cat) => (
                            <div key={cat.name} className="flex items-center gap-5 group/item">
                                <div className="flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-2xl bg-white border border-slate-200 text-[#0E5E5A] transition-all group-hover/item:scale-110 shadow-sm">
                                    <cat.icon size={20} strokeWidth={1.5} className="opacity-80" />
                                </div>
                                <div className="flex-1">
                                    <div className="mb-2 flex justify-between text-[9px] font-black uppercase">
                                        <span className="text-slate-500 font-semibold">{cat.name}</span>
                                        <span className="text-slate-800 font-bold">{cat.score}</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((cat.score / cat.max) * 100, 100)}%` }}
                                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                            className={`h-full rounded-full ${cat.score > (cat.max * 0.7) ? "bg-red-500/80" : cat.score > (cat.max * 0.4) ? "bg-amber-400/80" : "bg-[#0E5E5A]"}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="bg-teal-50/50 rounded-3xl p-5 border border-[#0E5E5A]/10 text-center">
                            <h4 className="data-label !text-[#0E5E5A] !text-[8px] mb-2 uppercase tracking-[0.4em]">Suggested Focus</h4>
                            <p className="font-bold text-xs text-slate-800 uppercase tracking-widest font-[family-name:var(--font-outfit)]">
                                {scores.total > 40 ? "Intensive Medical Audit" : scores.total > 20 ? "Targeted Home Routines" : "Baseline Active Aging"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
