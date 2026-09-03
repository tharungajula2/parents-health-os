"use client";

import { useState, useEffect, useMemo } from "react";
import { useParentsAuth } from "../lib/supabase/context";
import { 
  Pill, Check, Calendar as CalendarIcon, PlusCircle, AlertCircle, Clock, Trash2, 
  Activity, Heart, Scale, Droplet, ChevronLeft, ChevronRight, Edit3, ArrowLeft, 
  Watch, Bluetooth, MessageSquare, ShieldCheck, Sparkles, Smile, Footprints, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./ui/Toast";
import { generateCarePlan } from "../utils/carePlanEngine";

interface Medication {
    name: string;
    dosage: string;
    timing: string;
    type?: "Acute" | "Chronic";
    status?: "Active" | "Archived";
    duration?: string;
    startDate?: string;
    slots?: string[];
    relationToFood?: "Before Food" | "After Food";
    remarks?: string;
    instructions?: string;
}

interface Vitals {
    bpSys?: number;
    bpDia?: number;
    sugar?: number;
    weight?: number;
}

interface DailyLog {
    meds: string[]; // List of task IDs or med names completed
    vitals: Vitals;
    habits?: {
        mealPlan?: boolean;
        activity?: number;
        hydration?: number;
    };
    notes?: string;
}

interface MedicationTrackerProps {
    onNavigate?: (view: string) => void;
}



export function MedicationTracker({ onNavigate }: MedicationTrackerProps) {
    const { showToast } = useToast();
    const { 
        isSupabaseEnabled, 
        activeParent, 
        medications, 
        medicationLogs, 
        vitals: dbVitals, 
        addMedication, 
        toggleMedicationLog, 
        addVital,
        refreshData 
    } = useParentsAuth();
    
    const [localMeds, setLocalMeds] = useState<Medication[]>([]);
    const [activeTab, setActiveTab] = useState<"daily" | "calendar" | "manage">("daily");

    // Dynamic medications list mapping
    const meds = useMemo<Medication[]>(() => {
        if (isSupabaseEnabled && activeParent) {
            return medications.map(m => ({
                name: m.name,
                dosage: m.dosage || "1 tab",
                timing: (m as any).timing || "Morning",
                type: "Chronic",
                status: (m.is_active ? "Active" : "Archived") as "Active" | "Archived",
                relationToFood: "After Food",
                remarks: m.instructions || "",
                slots: [(m as any).timing as any || "Morning"]
            }));
        }
        return localMeds;
    }, [isSupabaseEnabled, activeParent, medications, localMeds]);

    // Date context
    const [todayKey, setTodayKey] = useState("");
    const [viewingDate, setViewingDate] = useState("");

    // Log Data for active date
    const [localActiveLog, setLocalActiveLog] = useState<DailyLog>({ meds: [], vitals: {} });

    const activeLog = useMemo(() => {
        if (isSupabaseEnabled && activeParent) {
            // Fetch checklist completions from both medication logs and local overrides
            const takenMedNames = medicationLogs
                .filter(log => log.log_date === viewingDate && log.taken)
                .map(log => {
                    const med = medications.find(m => m.id === log.medication_id);
                    return med ? `med-${med.name}-morning`.toLowerCase().replace(/\s+/g, '-') : "";
                })
                .filter(Boolean);

            const dayVital = dbVitals.find(v => {
                const vitalDate = v.measured_at?.split("T")[0] || v.created_at?.split("T")[0];
                return vitalDate === viewingDate;
            });

            return {
                meds: takenMedNames,
                vitals: {
                    bpSys: dayVital?.bp_sys || undefined,
                    bpDia: dayVital?.bp_dia || undefined,
                    sugar: dayVital?.sugar || undefined,
                    weight: dayVital?.weight || undefined
                },
                habits: {
                    mealPlan: false,
                    activity: 0,
                    hydration: 0
                }
            };
        }
        
        return localActiveLog;
    }, [isSupabaseEnabled, activeParent, medicationLogs, medications, dbVitals, viewingDate, localActiveLog]);

    // Extract Answers
    const answers = useMemo(() => {
        return (activeParent?.scorecard_answers as any)?.answers || {};
    }, [activeParent]);

    // Baseline guard completion check
    const isBaselineSetupCompleted = useMemo(() => {
        return !!(answers.relation || answers.age || answers.stageA_completed || Object.keys(answers).length >= 5);
    }, [answers]);

    // Generate computed Care Plan
    const carePlan = useMemo(() => {
        return generateCarePlan(answers, meds);
    }, [answers, meds]);

    // Form inputs state
    const [statsInput, setStatsInput] = useState<Vitals>({});
    const [habitsInput, setHabitsInput] = useState<{ mealPlan: boolean, activity: string, hydration: string }>({
        mealPlan: false, activity: "", hydration: ""
    });

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [historyData, setHistoryData] = useState<Record<string, DailyLog>>({});

    const [editingMed, setEditingMed] = useState<Medication | null>(null);
    const [isAddingMed, setIsAddingMed] = useState(false);
    const [newMed, setNewMed] = useState<Medication>({
        name: "", dosage: "", timing: "", type: "Chronic", status: "Active",
        slots: [], relationToFood: "After Food", remarks: ""
    });

    // SIMULATOR COMPANION STATES
    const [simulatedReply, setSimulatedReply] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // Initializer
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setTodayKey(today);
        if (!viewingDate) setViewingDate(today);
    }, [viewingDate]);

    const saveLog = (_date: string, log: DailyLog) => {
        setLocalActiveLog(log);
    };

    const simulateDeviceSync = (device: 'cgm' | 'watch') => {
        if (device === 'cgm') {
            setStatsInput(prev => ({ ...prev, sugar: 110 }));
            showToast("⚡ Synced 110 mg/dL from Freestyle Libre CGM", "success");
        }
        if (device === 'watch') {
            setStatsInput(prev => ({ ...prev, weight: 64.5 }));
            setHabitsInput(prev => ({ ...prev, activity: "45", hydration: "6" }));
            showToast("⚡ Synced Activity (45 min) & Weight from Apple Watch Ultra", "success");
        }
    };

    // Unified Task Toggle Persistence
    const toggleTask = async (taskId: string) => {
        const isTaken = activeLog.meds.includes(taskId);
        
        if (isSupabaseEnabled && activeParent) {
            if (taskId.startsWith("med-")) {
                const matchedMed = medications.find(m => {
                    const cleanName = m.name.toLowerCase().replace(/\s+/g, '-');
                    return taskId.includes(cleanName);
                });
                if (matchedMed) {
                    await toggleMedicationLog(matchedMed.id, !isTaken, viewingDate);
                    showToast(`Medication log updated for ${matchedMed.name}`, "success");
                    return;
                }
            }

            let updatedMeds = activeLog.meds || [];
            if (isTaken) {
                updatedMeds = updatedMeds.filter((m: string) => m !== taskId);
            } else {
                updatedMeds = [...updatedMeds, taskId];
            }
            const updatedLog = { ...activeLog, meds: updatedMeds };
            setLocalActiveLog(updatedLog);
            showToast(`Task checklist updated successfully`, "success");
            refreshData();
        } else {
            let newMedsList;
            if (isTaken) {
                newMedsList = activeLog.meds.filter(m => m !== taskId);
            } else {
                newMedsList = [...activeLog.meds, taskId];
            }
            const newLog = { ...activeLog, meds: newMedsList };
            saveLog(viewingDate, newLog);
            showToast(`Care task checklist updated`, "success");
        }
    };

    const saveVitalsAndHabits = async () => {
        if (isSupabaseEnabled && activeParent) {
            await addVital({
                bp_sys: statsInput.bpSys || 0,
                bp_dia: statsInput.bpDia || 0,
                sugar: statsInput.sugar || 0,
                weight: statsInput.weight || 0,
                source: "web_dashboard"
            });
        } else {
            const newLog = {
                ...activeLog,
                vitals: statsInput,
                habits: {
                    mealPlan: habitsInput.mealPlan,
                    activity: Number(habitsInput.activity),
                    hydration: Number(habitsInput.hydration)
                }
            };
            saveLog(viewingDate, newLog);
        }
        showToast(`Care indicators successfully logged! ✅`, "success");
    };

    const saveLocalMedsList = (newMeds: Medication[]) => {
        setLocalMeds(newMeds);
    };

    const changeDate = (days: number) => {
        const current = new Date(viewingDate);
        current.setDate(current.getDate() + days);
        setViewingDate(current.toISOString().split('T')[0]);
    };

    const updateMed = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMed) return;
        const updated = meds.map(m => m.name === editingMed.name ? editingMed : m);
        saveLocalMedsList(updated);
        setEditingMed(null);
        showToast("Medication reconfigured", "success");
    };

    const addMed = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMed.name) return;
        let derivedTiming = newMed.timing;
        if (!derivedTiming && newMed.slots && newMed.slots.length > 0) {
            derivedTiming = `${newMed.slots.join("-")} (${newMed.relationToFood})`;
        }
        const remarksStr = newMed.remarks || "";
        const instructions = newMed.relationToFood ? `${newMed.relationToFood}${remarksStr ? `. ${remarksStr}` : ""}` : remarksStr;

        if (isSupabaseEnabled && activeParent) {
            await addMedication({
                name: newMed.name,
                dosage: newMed.dosage || "1 tab",
                timing: derivedTiming || "Morning",
                instructions: instructions
            });
        } else {
            const toAdd = { ...newMed, timing: derivedTiming, startDate: new Date().toISOString().split('T')[0] };
            const updated = [...meds, toAdd];
            saveLocalMedsList(updated);
        }
        setIsAddingMed(false);
        setNewMed({
            name: "", dosage: "", timing: "", type: "Chronic", status: "Active",
            slots: [], relationToFood: "After Food", remarks: ""
        });
        showToast("New medication registered in care plan", "success");
    };

    // WHATSAPP COMPANION BRIDGE SIMULATOR TRIGGER
    const handleSimulateResponse = () => {
        setIsSimulating(true);
        setTimeout(() => {
            // Check off all tasks corresponding to Morning or appropriate time
            const morningTasks = carePlan.dailyTasks.filter(t => t.timeOfDay === "Morning");
            let list = [...activeLog.meds];
            morningTasks.forEach(t => {
                if (!list.includes(t.id)) list.push(t.id);
            });
            const newLog = { ...activeLog, meds: list };
            saveLog(viewingDate, newLog);

            setIsSimulating(false);
            setSimulatedReply("Parent (WhatsApp): 'Haan beta, maine subah ki dono dawai le li hai aur thoda garam paani bhi peeya hai.'");
            showToast("WhatsApp check-in simulated: morning compliance synced! ✅", "success");
        }, 1200);
    };

    // Baseline Gating Card
    if (!isBaselineSetupCompleted) {
        return (
            <div className="max-w-4xl mx-auto py-12 md:py-24 px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 md:p-16 rounded-[3.5rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-3xl text-center relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0E5E5A]/5 blur-3xl rounded-full -mr-32 -mt-32" />
                    
                    <div className="mx-auto h-20 w-20 rounded-3xl bg-[#0E5E5A]/10 border border-[#0E5E5A]/20 flex items-center justify-center text-[#0E5E5A] mb-8 group-hover:scale-105 transition-transform shadow-inner">
                        <ShieldCheck size={38} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-2xl md:text-4xl font-bold text-[#0E5E5A] mb-4 uppercase tracking-tight font-[family-name:var(--font-outfit)] leading-tight">
                        Daily Care Profile Setup Required
                    </h2>
                    
                    <p className="text-slate-500 text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed mb-10 font-[family-name:var(--font-inter)]">
                        To construct a clinical daily care plan, track medication schedules, and monitor physical trends, the care operations console needs a brief baseline health assessment of the parent.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => onNavigate && onNavigate("clinical")}
                            className="px-10 py-5 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
                        >
                            <Sparkles size={14} /> Begin Health Assessment
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            let log = historyData[dateStr];
            
            if (isSupabaseEnabled && activeParent) {
                const takenMedsForDay = medicationLogs
                    .filter(l => l.log_date === dateStr && l.taken)
                    .map(l => {
                        const med = medications.find(m => m.id === l.medication_id);
                        return med ? med.name : "";
                    })
                    .filter(Boolean);
                const hasVitalsForDay = dbVitals.some(v => (v.measured_at?.split("T")[0] || v.created_at?.split("T")[0]) === dateStr);
                
                log = {
                    meds: takenMedsForDay,
                    vitals: hasVitalsForDay ? { bpSys: 120, bpDia: 80 } : {}
                };
            }
            
            const isSelected = dateStr === viewingDate;
            let statusParams = "bg-slate-900 text-slate-500 border-white/5";
            let dotColor = null;

            if (new Date(dateStr) <= new Date()) {
                const activeMedsCount = carePlan.dailyTasks.length || 1;

                if (log) {
                    const takenCount = log.meds.length;
                    const hasVitals = Object.keys(log.vitals || {}).length > 0;
                    if (takenCount >= activeMedsCount) {
                        statusParams = "bg-cyan-500/20 text-cyan-400 font-black border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]";
                    } else if (takenCount > 0) {
                        statusParams = "bg-amber-500/20 text-amber-400 font-black border-amber-500/30";
                    } else {
                        statusParams = "bg-red-500/10 text-red-500 border-red-500/20 opacity-60";
                    }
                    if (hasVitals) dotColor = "bg-blue-400";
                }
            }

            days.push(
                <button
                    key={d}
                    onClick={() => { setViewingDate(dateStr); setActiveTab("daily"); }}
                    className={`h-11 w-11 md:h-14 md:w-14 rounded-2xl flex items-center justify-center relative text-xs font-black transition-all border ${isSelected ? "ring-2 ring-cyan-500 z-10 scale-110 shadow-[0_0_20px_rgba(34,211,238,0.3)]" : "hover:border-white/20"} ${statusParams}`}
                >
                    {d}
                    {dotColor && <div className={`absolute bottom-2 h-1.5 w-1.5 rounded-full ${dotColor} shadow-[0_0_8px_rgba(96,165,250,0.8)]`} />}
                </button>
            );
        }

        return (
            <div className="glass-card p-6 md:p-10 rounded-[3.5rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-4 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-cyan-400 transition-all active:scale-90 border border-white/5"><ChevronLeft size={18} strokeWidth={1.5} /></button>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)]">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-4 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-cyan-400 transition-all active:scale-90 border border-white/5"><ChevronRight size={18} strokeWidth={1.5} /></button>
                </div>
                <div className="grid grid-cols-7 gap-4 text-center mb-6">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="data-label !text-slate-600 !text-[8px]">{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-4">
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* HEADER */}
            <div className="px-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-5xl font-bold text-[#0E5E5A] tracking-tight uppercase font-[family-name:var(--font-outfit)]">Care Plan Hub</h2>
                    <p className="text-xs md:text-sm text-slate-400 font-light font-[family-name:var(--font-inter)] tracking-wide mt-1.5">
                        Clinically structured care tasks, active therapies, and compliance monitoring powered by Anaya care automation.
                    </p>
                </div>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-5 py-2.5 rounded-2xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Care Status:</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg ${
                        carePlan.careStatus === "Stable routine" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                        carePlan.careStatus === "Needs attention" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                    }`}>
                        {carePlan.careStatus}
                    </span>
                </div>
            </div>

            {/* TABS HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/[0.02] backdrop-blur-3xl p-2 md:p-3 rounded-3xl md:rounded-[2.5rem] border border-white/5 shadow-3xl">
                <div className="flex gap-1 md:gap-2 w-full md:w-auto">
                    {[
                        { id: "daily", label: "Daily Schedule", icon: Check },
                        { id: "calendar", label: "History Logs", icon: CalendarIcon },
                        { id: "manage", label: "Medication List", icon: Pill }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-4 px-4 md:px-10 py-4 md:py-5 rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-700 font-[family-name:var(--font-outfit)] cursor-pointer ${
                                activeTab === tab.id
                                    ? "bg-[#0E5E5A] text-white shadow-2xl scale-[1.02]"
                                    : "text-slate-500 hover:text-[#0E5E5A] hover:bg-[#0E5E5A]/5"
                            }`}
                        >
                            <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} className={activeTab === tab.id ? "text-white" : "text-[#E05E1B] opacity-80"} />
                            <span className="truncate">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB 1: DAILY CARE PLAN */}
            {activeTab === "daily" && (
                <div className="space-y-8">
                    {/* Date Selector */}
                    <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-3xl flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                        
                        <button onClick={() => changeDate(-1)} className="p-4 md:p-5 hover:bg-white/10 rounded-2xl text-slate-600 hover:text-cyan-400 transition-all active:scale-90 border border-white/5">
                            <ChevronLeft size={24} strokeWidth={1.5} />
                        </button>
                        
                        <div className="text-center px-2">
                            <div className="flex flex-col items-center gap-2 md:gap-4">
                                {viewingDate === todayKey ? (
                                    <span className="data-label !text-cyan-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full !text-[7px] md:!text-[8px] !tracking-[0.2em] uppercase">CURRENT TODAY</span>
                                ) : null}
                                <h3 className="text-lg md:text-3xl font-bold text-[#0E5E5A] tracking-tight uppercase font-[family-name:var(--font-outfit)] leading-tight">
                                    {new Date(viewingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </h3>
                            </div>
                            {viewingDate !== todayKey && (
                                <button onClick={() => setViewingDate(todayKey)} className="data-label !text-cyan-500 mt-3 md:mt-4 hover:!text-cyan-400 transition-all active:scale-95 text-[9px] uppercase">
                                    Reset to Today
                                </button>
                            )}
                        </div>
                        
                        <button onClick={() => changeDate(1)} className="p-4 md:p-5 hover:bg-white/10 rounded-2xl text-slate-600 hover:text-cyan-400 transition-all active:scale-90 border border-white/5">
                            <ChevronRight size={24} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT: Task Schedule & WhatsApp Simulator (7 cols) */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="flex items-center justify-between px-3">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-[#0E5E5A] tracking-tight uppercase mb-1 font-[family-name:var(--font-outfit)]">
                                        Clinical Daily Checklist
                                    </h3>
                                    <p className="text-[10px] data-label text-slate-400 !tracking-[0.1em] uppercase">
                                        Tasks computed from baseline care engine
                                    </p>
                                </div>
                                <span className="data-label !text-cyan-400 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-full shadow-inner text-[9px] md:text-[10px]">
                                    {carePlan.dailyTasks.filter(t => activeLog.meds.includes(t.id)).length} / {carePlan.dailyTasks.length} Completed
                                </span>
                            </div>

                            {/* Group Tasks by Time of Day */}
                            {Array.from(new Set(carePlan.dailyTasks.map(t => t.timeOfDay || "Morning"))).map((slot) => {
                                const tasksForSlot = carePlan.dailyTasks.filter(t => t.timeOfDay === slot || (!t.timeOfDay && slot === "Morning"));
                                if (tasksForSlot.length === 0) return null;

                                return (
                                    <div key={slot} className="space-y-4">
                                        <h4 className="text-[9px] font-bold text-slate-500 tracking-[0.25em] uppercase flex items-center gap-2 pl-3">
                                            <Clock size={12} className="text-[#E05E1B]" /> {slot} Schedule
                                        </h4>
                                        <div className="grid gap-4">
                                            {tasksForSlot.map((task) => {
                                                const isCompleted = activeLog.meds.includes(task.id);
                                                
                                                return (
                                                    <motion.div
                                                        key={task.id}
                                                        layout
                                                        onClick={() => toggleTask(task.id)}
                                                        className={`group cursor-pointer p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden ${
                                                            isCompleted
                                                                ? "bg-emerald-50/50 border-emerald-200 shadow-sm"
                                                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-6 relative z-10">
                                                            {/* Custom Checkbox */}
                                                            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                                                isCompleted 
                                                                    ? "bg-[#0E5E5A] text-white shadow-sm scale-105" 
                                                                    : "bg-slate-50 border border-slate-200 text-slate-400 group-hover:border-slate-300"
                                                            }`}>
                                                                {isCompleted ? <Check size={20} strokeWidth={3.5} /> : (
                                                                    task.category === "medicine" ? <Pill size={16} /> :
                                                                    task.category === "vitals" ? <Activity size={16} /> :
                                                                    task.category === "lifestyle" ? <Footprints size={16} /> :
                                                                    <Smile size={16} />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <h5 className={`font-bold tracking-tight text-sm font-[family-name:var(--font-outfit)] ${
                                                                        isCompleted ? "text-slate-500 line-through" : "text-slate-800"
                                                                    }`}>
                                                                        {task.label}
                                                                    </h5>
                                                                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                                                                        task.category === "medicine" ? "bg-pink-500/10 text-pink-400 border-pink-500/20" :
                                                                        task.category === "vitals" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                                                                        task.category === "lifestyle" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                                    }`}>
                                                                        {task.category}
                                                                    </span>
                                                                </div>
                                                                {task.instructions && (
                                                                    <p className="text-[10px] text-slate-500 font-light mt-1.5 font-[family-name:var(--font-inter)] leading-relaxed">
                                                                        {task.instructions}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* WHATSAPP HIGH-FIDELITY CHAT PREVIEW */}
                            <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-[#e2ded5] shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                                
                                <h3 className="text-[10px] font-bold text-[#0E5E5A] flex items-center gap-3 tracking-[0.2em] uppercase mb-6">
                                    <MessageSquare size={14} className="text-emerald-600" /> Anaya WhatsApp Automation Chat Simulator (Sandbox)
                                </h3>

                                <div className="space-y-4">
                                    {/* Preview message */}
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
                                        <span className="absolute -top-2.5 left-5 px-3 py-0.5 rounded-full bg-emerald-600 text-[7px] font-black text-white uppercase tracking-widest shadow-sm">ANAYA AUTOMATION PREVIEW</span>
                                        <p className="text-slate-700 text-xs leading-relaxed italic mt-2">
                                            "{carePlan.whatsappPrompts[0]?.message}"
                                        </p>
                                    </div>

                                    {simulatedReply && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200"
                                        >
                                            <p className="text-emerald-800 text-xs font-medium leading-relaxed">
                                                {simulatedReply}
                                            </p>
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={handleSimulateResponse}
                                        disabled={isSimulating}
                                        className="w-full py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                    >
                                        {isSimulating ? (
                                            <>
                                                <Activity size={12} className="animate-pulse" /> Simulating Remote Interaction...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={12} /> Trigger WhatsApp Response Simulation
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Vitals Logs, Device Sync, Guidelines (5 cols) */}
                        <div className="lg:col-span-5 space-y-8">
                            {/* VITALS MANUAL CARD */}
                            <div className="glass-card p-8 rounded-[2rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                                
                                <h3 className="text-[10px] font-bold text-blue-400 flex items-center gap-3 tracking-[0.2em] uppercase mb-6">
                                    <Activity size={14} strokeWidth={2} /> Key Physical Vitals
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Blood Pressure (Sys/Dia)</label>
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="120"
                                                    value={statsInput.bpSys || ""}
                                                    onChange={e => setStatsInput({ ...statsInput, bpSys: Number(e.target.value) })}
                                                    className="w-full bg-slate-900 border border-white/5 px-3 md:px-4 py-3 rounded-xl text-white font-black text-base md:text-lg focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                                />
                                            </div>
                                            <span className="text-slate-800 text-xl md:text-2xl font-black">/</span>
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="80"
                                                    value={statsInput.bpDia || ""}
                                                    onChange={e => setStatsInput({ ...statsInput, bpDia: Number(e.target.value) })}
                                                    className="w-full bg-slate-900 border border-white/5 px-3 md:px-4 py-3 rounded-xl text-white font-black text-base md:text-lg focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Glucose (mg/dL)</label>
                                            <input
                                                type="number"
                                                placeholder="100"
                                                value={statsInput.sugar || ""}
                                                onChange={e => setStatsInput({ ...statsInput, sugar: Number(e.target.value) })}
                                                className="w-full bg-slate-900 border border-white/5 px-4 py-3 rounded-xl text-white font-black text-lg focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Weight (kg)</label>
                                            <input
                                                type="number"
                                                placeholder="65"
                                                value={statsInput.weight || ""}
                                                onChange={e => setStatsInput({ ...statsInput, weight: Number(e.target.value) })}
                                                className="w-full bg-slate-900 border border-white/5 px-4 py-3 rounded-xl text-white font-black text-lg focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* NUTRITION & CLINICAL GUIDELINES */}
                            <div className="glass-card p-8 rounded-[2rem] border-white/5 bg-slate-950/40 relative overflow-hidden">
                                <h3 className="text-[10px] font-bold text-amber-500 flex items-center gap-3 tracking-[0.2em] uppercase mb-6">
                                    <AlertTriangle size={14} /> Care Guidelines
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nutrition Advice</h4>
                                        <ul className="list-disc pl-4 space-y-2 text-slate-800 text-xs font-light font-[family-name:var(--font-inter)]">
                                            {carePlan.nutritionWatch.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mobility & Fall Prevention</h4>
                                        <p className="text-slate-800 text-xs font-light font-[family-name:var(--font-inter)] leading-relaxed">
                                            {carePlan.mobilityGuidelines}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={saveVitalsAndHabits}
                                className="w-full py-6 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(14,94,90,0.2)] transition-all active:scale-[0.98] group flex items-center justify-center gap-3 cursor-pointer"
                            >
                                <Check size={18} strokeWidth={4} />
                                Commit Daily Log & Vitals
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: HISTORICAL CALENDAR */}
            {activeTab === "calendar" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        {renderCalendar()}
                    </div>
                    <div className="lg:col-span-4">
                        <div className="glass-card p-8 rounded-[3rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-3xl h-full flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                            
                            <h3 className="text-2xl font-bold text-[#0E5E5A] mb-4 uppercase tracking-tight font-[family-name:var(--font-outfit)]">History Legend</h3>
                            <p className="text-slate-500 text-sm font-light leading-relaxed mb-8 font-[family-name:var(--font-inter)]">
                                Monitor how consistently tasks and vitals check-ins are verified across past calendar days.
                            </p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-5 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                    <span className="data-label !text-slate-500 uppercase tracking-widest text-[9px]">FULL SYNC COMPLETED</span>
                                </div>
                                <div className="flex items-center gap-5 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                                    <span className="data-label !text-slate-500 uppercase tracking-widest text-[9px]">PARTIAL COMPLIANCE</span>
                                </div>
                                <div className="flex items-center gap-5 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                                    <span className="data-label !text-slate-500 uppercase tracking-widest text-[9px]">NO DAILY LOGS REGISTERED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: MANAGE MEDICATIONS */}
            {activeTab === "manage" && (
                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-3">
                        <div>
                            <h3 className="text-3xl font-bold text-[#0E5E5A] tracking-tight uppercase mb-2 font-[family-name:var(--font-outfit)]">Medication List</h3>
                            <p className="text-[10px] data-label text-slate-400 !tracking-[0.2em] leading-relaxed max-w-lg normal-case">
                                Add daily medications or reconfigure treatment plans securely.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAddingMed(true)}
                            className="flex items-center gap-4 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white px-10 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-3xl active:scale-95 group font-[family-name:var(--font-outfit)] cursor-pointer"
                        >
                            <PlusCircle size={16} strokeWidth={2.5} /> 
                            Add Medication
                        </button>
                    </div>

                    <div className="grid gap-6">
                        {isAddingMed && (
                            <motion.div layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-10 rounded-[2.5rem] border-cyan-500/20 bg-slate-950/60 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full -mr-20 -mt-20" />
                                
                                <h4 className="text-[10px] font-black text-cyan-400 mb-8 flex items-center gap-3 tracking-[0.2em] uppercase">
                                    <PlusCircle size={14} strokeWidth={3} /> Add New Entry
                                </h4>
                                
                                <form onSubmit={addMed} className="space-y-10">
                                    <div className="grid md:grid-cols-2 gap-6 md:gap-10">
                                        <div className="space-y-8">
                                            <div>
                                                <label className="data-label !text-slate-600 mb-3 block">Formulation Identity</label>
                                                <input
                                                    placeholder="e.g. Liposomal Curcumin"
                                                    value={newMed.name}
                                                    onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                                                    className="w-full bg-slate-900/50 border border-white/5 px-6 py-4 rounded-2xl text-white font-bold text-sm focus:border-cyan-500/30 outline-none transition-all placeholder:text-slate-800 font-[family-name:var(--font-outfit)]"
                                                    required
                                                />
                                            </div>
 
                                            <div>
                                                <label className="data-label !text-slate-600 mb-3 block">Dosage metric</label>
                                                <input
                                                    placeholder="e.g. 500mg Capsule"
                                                    value={newMed.dosage}
                                                    onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                                                    className="w-full bg-slate-900/50 border border-white/5 px-6 py-4 rounded-2xl text-white font-bold text-sm focus:border-cyan-500/30 outline-none transition-all placeholder:text-slate-800 font-[family-name:var(--font-outfit)]"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div>
                                                <label className="data-label !text-slate-600 mb-4 block">Recommended Timing</label>
                                                <div className="flex gap-3 flex-wrap">
                                                    {["Morning", "Afternoon", "Evening", "Night"].map((slot) => (
                                                        <button
                                                            key={slot}
                                                            type="button"
                                                            onClick={() => {
                                                                const current = newMed.slots || [];
                                                                const updated = current.includes(slot as any)
                                                                    ? current.filter(s => s !== slot)
                                                                    : [...current, slot];
                                                                setNewMed({ ...newMed, slots: updated as any });
                                                            }}
                                                            className={`px-6 py-3 rounded-xl data-label !text-[8px] transition-all border ${
                                                                (newMed.slots || []).includes(slot as any)
                                                                    ? "bg-[#0E5E5A] text-white border-[#0E5E5A] shadow-3xl"
                                                                    : "bg-white/5 text-slate-600 border-white/5 hover:border-white/10"
                                                            }`}
                                                        >
                                                            {slot}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="data-label !text-slate-600 mb-4 block">Meal Coordination</label>
                                                <div className="flex gap-8">
                                                    {["Before Food", "After Food"].map((opt) => (
                                                        <label key={opt} className="flex items-center gap-4 cursor-pointer group/radio">
                                                            <div className="relative flex items-center justify-center">
                                                                <input
                                                                    type="radio"
                                                                    name="foodRel"
                                                                    checked={newMed.relationToFood === opt}
                                                                    onChange={() => setNewMed({ ...newMed, relationToFood: opt as any })}
                                                                    className="sr-sr-only hidden"
                                                                />
                                                                <div className={`w-6 h-6 rounded-full border transition-all ${newMed.relationToFood === opt ? "border-cyan-400 bg-cyan-400/20" : "border-slate-800 bg-transparent group-hover/radio:border-slate-600"}`} />
                                                                {newMed.relationToFood === opt && <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
                                                            </div>
                                                            <span className={`data-label !text-[9px] transition-colors ${newMed.relationToFood === opt ? "!text-white" : "!text-slate-600"}`}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Categorization</label>
                                            <select 
                                                value={newMed.type} 
                                                onChange={e => setNewMed({ ...newMed, type: e.target.value as any })} 
                                                className="w-full bg-slate-900/50 border border-white/5 px-4 py-3 rounded-xl text-white font-black text-sm focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="Chronic" className="bg-slate-950">Chronic Protocol (Long-term)</option>
                                                <option value="Acute" className="bg-slate-950">Acute Protocol (Intervention)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Clinical Remarks</label>
                                            <input
                                                placeholder="e.g. Ingest with alkaline water"
                                                value={newMed.remarks || ""}
                                                onChange={e => setNewMed({ ...newMed, remarks: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-white/5 px-4 py-3 rounded-xl text-white font-black text-sm focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 justify-end pt-4 border-t border-white/5">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsAddingMed(false)} 
                                            className="px-8 py-4 text-slate-500 hover:text-[#0E5E5A] text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                                        >
                                            Abort
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="px-8 py-4 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 cursor-pointer"
                                        >
                                            Deploy Formulation
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            {meds.map((med, idx) => {
                                if (editingMed?.name === med.name) {
                                    return (
                                        <motion.div key={idx} layout className="glass-card p-6 md:p-10 rounded-[2.5rem] border-amber-500/20 bg-slate-950/60 backdrop-blur-3xl shadow-3xl relative overflow-hidden">
                                            <h4 className="data-label !text-amber-500 mb-8 flex items-center gap-4">
                                                <Edit3 size={16} strokeWidth={1.5} className="opacity-60" /> Reconfigure formulation
                                            </h4>
                                            
                                            <form onSubmit={updateMed} className="space-y-8">
                                                <div>
                                                    <label className="data-label !text-slate-600 mb-4 block">Chronology</label>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {["Morning", "Afternoon", "Evening", "Night"].map((slot) => (
                                                            <button
                                                                key={slot}
                                                                type="button"
                                                                onClick={() => {
                                                                    const current = editingMed.slots || [];
                                                                    const updated = current.includes(slot as any)
                                                                        ? current.filter(s => s !== slot)
                                                                        : [...current, slot];
                                                                    setEditingMed({ ...editingMed, slots: updated as any });
                                                                }}
                                                                className={`px-4 py-2 rounded-xl data-label !text-[7px] transition-all border ${
                                                                    (editingMed.slots || []).includes(slot as any)
                                                                        ? "bg-[#E05E1B] text-white border-[#E05E1B] shadow-xl"
                                                                        : "bg-white/5 text-slate-600 border-white/5 hover:border-white/10"
                                                                }`}
                                                            >
                                                                {slot}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="data-label !text-slate-600 mb-3 block">Dosage</label>
                                                        <input 
                                                            value={editingMed.dosage} 
                                                            onChange={e => setEditingMed({ ...editingMed, dosage: e.target.value })} 
                                                            className="w-full bg-slate-900/50 border border-white/5 px-4 py-3 rounded-xl text-white font-bold text-xs focus:border-amber-500/30 outline-none font-[family-name:var(--font-outfit)]" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="data-label !text-slate-600 mb-3 block">Context</label>
                                                        <select 
                                                            value={editingMed.type} 
                                                            onChange={e => setEditingMed({ ...editingMed, type: e.target.value as any })} 
                                                            className="w-full bg-slate-900 px-4 py-3 rounded-xl text-white font-bold text-xs focus:border-amber-500/30 outline-none appearance-none font-[family-name:var(--font-outfit)]"
                                                        >
                                                            <option value="Chronic">Baseline</option>
                                                            <option value="Acute">Short-term</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 justify-end pt-4">
                                                    <button type="button" onClick={() => setEditingMed(null)} className="data-label !text-slate-800 hover:!text-[#0E5E5A] px-4 transition-colors cursor-pointer">CANCEL</button>
                                                    <button type="submit" className="px-8 py-3 bg-[#E05E1B] hover:bg-[#d45316] text-white rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all shadow-3xl active:scale-95 font-[family-name:var(--font-outfit)] cursor-pointer">COMMIT UPDATES</button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <div key={idx} className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] backdrop-blur-3xl transition-all group relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.02] blur-2xl rounded-full -mr-12 -mt-12 transition-opacity" />
                                        
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 text-cyan-400 flex items-center justify-center shadow-inner group-hover:border-cyan-500/20 transition-all">
                                                    <Pill size={24} strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-base tracking-tight mb-2 group-hover:text-[#0E5E5A] transition-colors font-[family-name:var(--font-outfit)]">{med.name}</h4>
                                                    <div className="flex items-center gap-4">
                                                        <span className="data-label !text-[8px] !text-slate-700 bg-white/5 px-3 py-1 rounded-lg border border-white/10">{med.dosage}</span>
                                                        <span className="data-label !text-[8px] !text-cyan-400 opacity-80 group-hover:opacity-80 transition-opacity">// {med.timing}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => setEditingMed(med)} 
                                                    className="p-3 bg-white/5 text-slate-700 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-90"
                                                >
                                                    <Edit3 size={16} strokeWidth={1.5} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (confirm(`Deprioritize ${med.name}? It will be moved to archived memory.`)) {
                                                            const updated = meds.map(m => m.name === med.name ? { ...m, status: "Archived" as const } : m);
                                                            saveLocalMedsList(updated);
                                                        }
                                                    }} 
                                                    className="p-3 bg-white/5 text-slate-700 hover:text-red-400 hover:bg-red-950/20 border border-white/10 rounded-xl transition-all active:scale-90"
                                                >
                                                    <Trash2 size={16} strokeWidth={1.5} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
