"use client";

import { useState, useEffect } from "react";
import { Pill, Check, Calendar as CalendarIcon, PlusCircle, AlertCircle, Clock, Trash2, Activity, Heart, Scale, Droplet, ChevronLeft, ChevronRight, Edit3, ArrowLeft, Watch, Bluetooth } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./ui/Toast";

interface Medication {
    name: string;
    dosage: string;
    timing: string;
    type?: "Acute" | "Chronic";
    status?: "Active" | "Archived";
    duration?: string;
    startDate?: string;
    // New Structured Fields
    slots?: ("Morning" | "Afternoon" | "Evening" | "Night")[];
    relationToFood?: "Before Food" | "After Food";
    remarks?: string;
}

interface Vitals {
    bpSys?: number;
    bpDia?: number;
    sugar?: number;
    weight?: number;
}

interface DailyLog {
    meds: string[]; // List of med names taken
    vitals: Vitals;
    habits?: {
        mealPlan?: boolean; // Yes/No
        activity?: number; // Mins
        hydration?: number; // Glasses
    };
    notes?: string;
}

interface MedicationTrackerProps {
    onTriggerCall?: () => void;
}

export function MedicationTracker({ onTriggerCall }: MedicationTrackerProps) {
    const { showToast } = useToast();
    // --- STATE ---
    const [meds, setMeds] = useState<Medication[]>([]);
    const [activeTab, setActiveTab] = useState<"daily" | "calendar" | "manage">("daily");

    // Date Context
    const [todayKey, setTodayKey] = useState("");
    const [viewingDate, setViewingDate] = useState(""); // The date currently being viewed/edited

    // Log Data for Viewing Date
    const [activeLog, setActiveLog] = useState<DailyLog>({ meds: [], vitals: {} });

    // Vitals & Habits Input (Temporary State for Form)
    const [statsInput, setStatsInput] = useState<Vitals>({});
    const [habitsInput, setHabitsInput] = useState<{ mealPlan: boolean, activity: string, hydration: string }>({
        mealPlan: false, activity: "", hydration: ""
    });

    // Calendar Data
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [historyData, setHistoryData] = useState<Record<string, DailyLog>>({}); // Cache of logs

    // Edit Mode (Manage Tab)
    const [editingMed, setEditingMed] = useState<Medication | null>(null);
    const [isAddingMed, setIsAddingMed] = useState(false);
    const [newMed, setNewMed] = useState<Medication>({
        name: "", dosage: "", timing: "", type: "Chronic", status: "Active",
        slots: [], relationToFood: "After Food", remarks: ""
    });

    // --- INITIALIZATION ---
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setTodayKey(today);

        // Default to today if not set
        if (!viewingDate) setViewingDate(today);

        // 1. Load Meds
        const savedMeds = localStorage.getItem("yukti_active_meds");
        if (savedMeds) {
            try {
                const parsed = JSON.parse(savedMeds);
                // Migration safety
                const migrated = parsed.map((m: any) => ({
                    ...m,
                    status: m.status || "Active",
                    type: m.type || "Chronic"
                }));
                setMeds(migrated);
            } catch (e) { console.error("Meds parse error", e); }
        }

        // 2. Load History for Calendar context
        loadHistoryContext();

        // 3. Timer Logic (Fake Call Trigger)
        const interval = setInterval(() => {
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes();
            if (m === 0 && (h === 9 || h === 13 || h === 21)) {
                const activeMedsExist = meds.some(m => !m.status || m.status === 'Active');
                if (activeMedsExist && onTriggerCall) onTriggerCall();
            }
        }, 60000);
        return () => clearInterval(interval);

    }, [meds.length]); // Re-load if meds list changes length/init

    // --- EFFECT: LOAD LOG WHEN DATE CHANGES ---
    useEffect(() => {
        if (!viewingDate) return;
        loadDailyLog(viewingDate).then(log => {
            setActiveLog(log);
            setStatsInput(log.vitals || {}); // Prefill inputs
            if (log.habits) {
                setHabitsInput({
                    mealPlan: log.habits.mealPlan || false,
                    activity: log.habits.activity?.toString() || "",
                    hydration: log.habits.hydration?.toString() || ""
                });
            } else {
                setHabitsInput({ mealPlan: false, activity: "", hydration: "" }); // Reset
            }
        });
    }, [viewingDate, historyData]); // Reload when date or history cache changes

    // --- LOGIC: DATA IO ---

    const getLogKey = (date: string) => `yukti_daily_log_${date}`;

    const loadDailyLog = async (date: string): Promise<DailyLog> => {
        const key = getLogKey(date);
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);

        // Fallback to history cache if available
        if (historyData[date]) return historyData[date];

        return { meds: [], vitals: {} };
    };

    const loadHistoryContext = () => {
        const cache: Record<string, DailyLog> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith("yukti_daily_log_")) {
                const date = key.replace("yukti_daily_log_", "");
                try {
                    cache[date] = JSON.parse(localStorage.getItem(key) || "{}");
                } catch (e) { }
            }
        }
        setHistoryData(cache);
    };

    const saveLog = (date: string, log: DailyLog) => {
        localStorage.setItem(getLogKey(date), JSON.stringify(log));
        // Update state cache and current view
        setHistoryData(prev => ({ ...prev, [date]: log }));
        setActiveLog(log);
    };

    // --- LOGIC: ACTIONS ---

    const simulateDeviceSync = (device: 'cgm' | 'watch') => {
        if (device === 'cgm') {
            setStatsInput(prev => ({ ...prev, sugar: 110 }));
            showToast("⚡ Synced 110 mg/dL from Freestyle Libre", "success");
        }
        if (device === 'watch') {
            setStatsInput(prev => ({ ...prev, weight: 64.5 }));
            setHabitsInput(prev => ({ ...prev, activity: "45" }));
            showToast("⚡ Synced Activity & Weight from Apple Health", "success");
        }
    };

    const toggleMed = (medName: string) => {
        const isTaken = activeLog.meds.includes(medName);
        let newMedsList;
        if (isTaken) {
            newMedsList = activeLog.meds.filter(m => m !== medName);
        } else {
            newMedsList = [...activeLog.meds, medName];
        }
        const newLog = { ...activeLog, meds: newMedsList };
        saveLog(viewingDate, newLog);
    };

    const saveVitalsAndHabits = () => {
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
        showToast(`Log updated for ${viewingDate}! ✅`, "success");
    };

    const saveMedsList = (newMeds: Medication[]) => {
        setMeds(newMeds);
        localStorage.setItem("yukti_active_meds", JSON.stringify(newMeds));
    };

    const changeDate = (days: number) => {
        const current = new Date(viewingDate);
        current.setDate(current.getDate() + days);
        setViewingDate(current.toISOString().split('T')[0]);
    };

    // --- MANAGE MEDS LOGIC ---
    // (Same as before)
    const updateMed = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMed) return;
        const updated = meds.map(m => m.name === editingMed.name ? editingMed : m);
        saveMedsList(updated);
        setEditingMed(null);
    };

    const addMed = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMed.name) return;
        let derivedTiming = newMed.timing;
        if (!derivedTiming && newMed.slots && newMed.slots.length > 0) {
            derivedTiming = `${newMed.slots.join("-")} (${newMed.relationToFood})`;
        }
        const toAdd = { ...newMed, timing: derivedTiming, startDate: new Date().toISOString().split('T')[0] };
        const updated = [...meds, toAdd];
        saveMedsList(updated);
        setIsAddingMed(false);
        setNewMed({
            name: "", dosage: "", timing: "", type: "Chronic", status: "Active",
            slots: [], relationToFood: "After Food", remarks: ""
        });
    };


    // --- CALENDAR RENDERER ---
    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const log = historyData[dateStr];
            const isToday = dateStr === todayKey;
            const isSelected = dateStr === viewingDate;

            let statusParams = "bg-slate-900 text-slate-500 border-white/5";
            let dotColor = null;

            if (new Date(dateStr) <= new Date()) {
                const activeMedsRaw = localStorage.getItem("yukti_active_meds");
                const currentMedsList = activeMedsRaw ? JSON.parse(activeMedsRaw) : [];
                const activeMedsCount = currentMedsList.filter((m: any) => !m.status || m.status === 'Active').length || 1;

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
                    onClick={() => { setViewingDate(dateStr); setActiveTab("daily"); }} // Go to daily view on click
                    className={`h-11 w-11 md:h-14 md:w-14 rounded-2xl flex items-center justify-center relative text-xs font-black transition-all border ${isSelected ? "ring-2 ring-cyan-500 z-10 scale-110 shadow-[0_0_20px_rgba(34,211,238,0.3)]" : "hover:border-white/20"
                        } ${statusParams}`}
                >
                    {d}
                    {dotColor && <div className={`absolute bottom-2 h-1.5 w-1.5 rounded-full ${dotColor} shadow-[0_0_8px_rgba(96,165,250,0.8)]`} />}
                </button>
            );
        }

        return (
            <div className="glass-card p-10 rounded-[3.5rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-4 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-cyan-400 transition-all active:scale-90 border border-white/5"><ChevronLeft size={18} strokeWidth={1.5} /></button>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight font-[family-name:var(--font-outfit)]">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
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

    // --- MAIN RENDER ---
    const activeMeds = meds.filter(m => !m.status || m.status === 'Active');

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            {/* --- HEADER --- */}
            <div className="px-2">
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase font-[family-name:var(--font-outfit)]">Health Routine</h2>
                <p className="text-sm text-slate-400 font-light font-[family-name:var(--font-inter)] tracking-wide mt-2">Management of daily health habits and physical readings.</p>
            </div>

            {/* TABS HEADER */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/[0.02] backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/5 shadow-3xl">
                <div className="flex gap-2 w-full md:w-auto">
                    {[
                        { id: "daily", label: "Today's Log", icon: Check },
                        { id: "calendar", label: "History", icon: CalendarIcon },
                        { id: "manage", label: "Medicine List", icon: pillIcon(meds.length) }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-4 px-10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-700 font-[family-name:var(--font-outfit)] ${activeTab === tab.id
                                ? "bg-white text-slate-950 shadow-2xl scale-[1.02]"
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} className={activeTab === tab.id ? "text-slate-950" : "text-cyan-400 opacity-60"} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Test Call */}
                <button 
                    onClick={onTriggerCall} 
                    className="flex data-label !text-[9px] !text-slate-500 hover:!text-cyan-400 gap-4 items-center px-8 py-3 bg-white/[0.03] border border-white/5 rounded-full transition-all hover:bg-white/[0.06] active:scale-95 translate-x-[-10px] md:translate-x-0"
                >
                    <Clock size={14} strokeWidth={1.5} className="opacity-60" /> 
                    <span>Daily Care Reminder</span>
                </button>
            </div>

            {/* --- TAB 1: DAILY CARE (Dynamic Date) --- */}
            {activeTab === "daily" && (
                <div className="space-y-8">
                    {/* DATE NAVIGATOR */}
                    <div className="glass-card p-8 rounded-[3rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-3xl flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                        
                        <button onClick={() => changeDate(-1)} className="p-5 hover:bg-white/10 rounded-2xl text-slate-600 hover:text-cyan-400 transition-all active:scale-90 border border-white/5">
                            <ChevronLeft size={24} strokeWidth={1.5} />
                        </button>
                        
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-4 justify-center font-[family-name:var(--font-outfit)]">
                                {viewingDate === todayKey ? (
                                    <span className="data-label !text-cyan-400 bg-white/5 border border-white/10 px-4 py-1 rounded-full !tracking-[0.4em]">CURRENT</span>
                                ) : null}
                                {new Date(viewingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </h3>
                            {viewingDate !== todayKey && (
                                <button onClick={() => setViewingDate(todayKey)} className="data-label !text-cyan-500 mt-4 hover:!text-cyan-400 transition-all active:scale-95">
                                    Reset to Today
                                </button>
                            )}
                        </div>
                        
                        <button onClick={() => changeDate(1)} className="p-5 hover:bg-white/10 rounded-2xl text-slate-600 hover:text-cyan-400 transition-all active:scale-90 border border-white/5">
                            <ChevronRight size={24} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* LEFT: Meds Checklist (7 cols) */}
                        <div className="md:col-span-7 space-y-8">
                            <div className="flex justify-between items-end px-3">
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight uppercase mb-2 font-[family-name:var(--font-outfit)]">
                                        Daily Tasks
                                    </h3>
                                    <p className="text-[10px] data-label text-slate-500/50 !tracking-[0.2em] normal-case">Consistency tracking demo</p>
                                </div>
                                <span className="data-label !text-cyan-400 bg-white/[0.03] border border-white/5 px-6 py-2 rounded-full shadow-inner">
                                    {activeLog.meds.length} / {activeMeds.length} Completed
                                </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {activeMeds.map((med, idx) => {
                                    const isTaken = activeLog.meds.includes(med.name);
                                    return (
                                        <motion.div
                                            key={idx}
                                            layout
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => toggleMed(med.name)}
                                            className={`group cursor-pointer p-8 rounded-[2.5rem] border transition-all duration-700 relative overflow-hidden ${isTaken
                                                ? "bg-cyan-500/[0.03] border-cyan-500/30 shadow-3xl shadow-cyan-500/5"
                                                : "bg-white/[0.01] border-white/5 hover:border-white/20 hover:bg-white/[0.03] shadow-xl"
                                                }`}
                                        >
                                            <div className="flex items-center gap-7 relative z-10">
                                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${isTaken 
                                                    ? "bg-white text-slate-950 shadow-3xl scale-110" 
                                                    : "bg-white/5 text-slate-700 border border-white/5"
                                                    }`}>
                                                    <Check size={28} strokeWidth={isTaken ? 3 : 1.5} className={isTaken ? "" : "opacity-40"} />
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold tracking-tight text-xl font-[family-name:var(--font-outfit)] ${isTaken ? "text-slate-600 line-through" : "text-white"}`}>{med.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                                        <span className={`data-label !text-[9px] ${isTaken ? "!text-slate-700" : "!text-cyan-400 opacity-60"}`}>{med.dosage}</span>
                                                        {med.slots && med.slots.length > 0 ? (
                                                            <div className="flex gap-2">
                                                                {med.slots.map(s => (
                                                                    <span key={s} className={`px-2 py-1 rounded-md data-label !text-[7px] border ${
                                                                        isTaken ? "bg-white/5 border-white/5 text-slate-800" : "bg-white/5 border-white/10 text-slate-500"
                                                                    }`}>{s}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className={`data-label !text-slate-700 ${isTaken ? "!text-slate-800" : ""}`}>// {med.timing}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT: Vitals & Habits (5 cols) */}
                        <div className="md:col-span-5 space-y-8">
                            {/* 1. VITALS CARD */}
                            <div className="glass-card p-8 rounded-[2rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                                
                                <h3 className="text-[10px] font-bold text-blue-400 flex items-center gap-3 tracking-[0.2em] uppercase mb-6">
                                    <Activity size={14} strokeWidth={2} /> Key Physical Vitals
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Blood Pressure (Sys/Dia)</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="120"
                                                    value={statsInput.bpSys || ""}
                                                    onChange={e => setStatsInput({ ...statsInput, bpSys: Number(e.target.value) })}
                                                    className="w-full bg-slate-900 border border-white/5 px-4 py-3 rounded-xl text-white font-black text-lg focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                                                />
                                            </div>
                                            <span className="text-slate-800 text-2xl font-black">/</span>
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="80"
                                                    value={statsInput.bpDia || ""}
                                                    onChange={e => setStatsInput({ ...statsInput, bpDia: Number(e.target.value) })}
                                                    className="w-full bg-slate-900 border border-white/5 px-4 py-3 rounded-xl text-white font-black text-lg focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700"
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

                            {/* 2. DEVICE SYNC */}
                            <div className="glass-card p-8 rounded-[2rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <Bluetooth size={100} strokeWidth={1} />
                                </div>
                                
                                <h3 className="text-[10px] font-bold text-cyan-400 flex items-center gap-3 tracking-[0.2em] uppercase mb-6">
                                    <Bluetooth size={14} strokeWidth={2} /> Device Sync (Demo)
                                </h3>

                                <div className="flex flex-col gap-4 relative z-10">
                                    {/* Card 1: CGM */}
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-slate-800/50 transition-all group/item">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover/item:bg-cyan-500 group-hover/item:text-slate-950 transition-colors">
                                                <Activity size={18} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-xs tracking-tight">FreeStyle Libre 3</h4>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Sample Data Link</p>
                                            </div>
                                        </div>
                                        <button onClick={() => simulateDeviceSync('cgm')} className="text-[9px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full hover:bg-cyan-500 hover:text-slate-950 transition-all uppercase tracking-widest">
                                            Sync
                                        </button>
                                    </div>

                                    {/* Card 2: Smart Watch */}
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-slate-800/50 transition-all group/item">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover/item:bg-blue-500 group-hover/item:text-slate-950 transition-colors">
                                                <Watch size={18} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-xs tracking-tight">Watch Ultra 2</h4>
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Activity & Vitals</p>
                                            </div>
                                        </div>
                                        <button onClick={() => simulateDeviceSync('watch')} className="text-[9px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full hover:bg-blue-500 hover:text-slate-950 transition-all uppercase tracking-widest">
                                            Sync
                                        </button>
                                    </div>

                                    {/* Card 3: BP Monitor (Disconnected) */}
                                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 border-dashed flex items-center justify-between opacity-40 hover:opacity-100 transition-all cursor-pointer group/item">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-800 text-slate-600 rounded-xl group-hover/item:bg-slate-700 transition-colors">
                                                <Heart size={18} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-500 text-xs tracking-tight">Omron X7 Smart</h4>
                                                <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-0.5">Not Connected</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover/item:text-cyan-400">Pair Device</span>
                                            </div>
                                </div>
                            </div>

                            {/* 3. HABITS CARD */}
                            <div className="glass-card p-10 rounded-[2rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                                
                                <h3 className="text-[10px] font-black text-emerald-400 flex items-center gap-3 tracking-[0.2em] uppercase mb-8">
                                    <Activity size={14} strokeWidth={3} /> Lifestyle habits
                                </h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between bg-slate-900/50 p-5 rounded-2xl border border-white/5 group-hover:bg-slate-800/50 transition-all">
                                        <label className="text-xs font-black text-white uppercase tracking-tight">Nutrition Plan Adherence</label>
                                        <button
                                            onClick={() => setHabitsInput({ ...habitsInput, mealPlan: !habitsInput.mealPlan })}
                                            className={`w-14 h-8 rounded-full transition-all duration-500 relative ${habitsInput.mealPlan ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-slate-800"}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500 ${habitsInput.mealPlan ? "translate-x-6" : "translate-x-0"}`} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Physical Activity (Min)</label>
                                            <input
                                                type="number"
                                                placeholder="30"
                                                value={habitsInput.activity}
                                                onChange={e => setHabitsInput({ ...habitsInput, activity: e.target.value })}
                                                className="w-full bg-slate-900 border border-white/5 px-4 py-3 rounded-xl text-white font-black text-lg focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Hydration (Liters/Gl)</label>
                                            <input
                                                type="number"
                                                placeholder="8"
                                                value={habitsInput.hydration}
                                                onChange={e => setHabitsInput({ ...habitsInput, hydration: e.target.value })}
                                                className="w-full bg-slate-900 border border-white/5 px-4 py-3 rounded-xl text-white font-black text-lg focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={saveVitalsAndHabits}
                                className="w-full py-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all active:scale-[0.98] group flex items-center justify-center gap-3"
                            >
                                <Check size={18} strokeWidth={4} />
                                Update Log for {new Date(viewingDate).toLocaleDateString()}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 2: CALENDAR --- */}
            {activeTab === "calendar" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    <div className="md:col-span-8">
                        {renderCalendar()}
                    </div>
                    <div className="md:col-span-4">
                        <div className="glass-card p-12 rounded-[3.5rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-3xl h-full flex flex-col justify-center items-center text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                            
                            <h3 className="text-2xl font-bold text-white mb-5 uppercase tracking-tight font-[family-name:var(--font-outfit)]">History Archives</h3>
                            <p className="text-slate-500 text-sm font-light leading-relaxed mb-10 font-[family-name:var(--font-inter)]">Review past habit synchronization and historical readings in the log gallery.</p>
                            
                            <div className="flex flex-col gap-5 w-full">
                                <div className="flex items-center gap-5 bg-white/[0.02] p-5 rounded-3xl border border-white/5">
                                    <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                    <span className="data-label !text-slate-500">SYNC COMPLETED</span>
                                </div>
                                <div className="flex items-center gap-5 bg-white/[0.02] p-5 rounded-3xl border border-white/5">
                                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                                    <span className="data-label !text-slate-500">PARTIAL LOG</span>
                                </div>
                                <div className="flex items-center gap-5 bg-white/[0.02] p-5 rounded-3xl border border-white/5">
                                    <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                                    <span className="data-label !text-slate-500">NO ENTRY</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 3: MANAGE MEDS --- */}
            {activeTab === "manage" && (
                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-3">
                        <div>
                            <h3 className="text-3xl font-bold text-white tracking-tight uppercase mb-2 font-[family-name:var(--font-outfit)]">Medicine List</h3>
                            <p className="text-[10px] data-label text-slate-500/50 !tracking-[0.2em] leading-relaxed max-w-lg normal-case">Review daily medications or add new entries to your health routine list.</p>
                        </div>
                        <button
                            onClick={() => setIsAddingMed(true)}
                            className="flex items-center gap-4 bg-white text-slate-950 hover:bg-cyan-400 px-10 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-3xl active:scale-95 group font-[family-name:var(--font-outfit)]"
                        >
                            <PlusCircle size={16} strokeWidth={2.5} /> 
                            Add Medication
                        </button>
                    </div>

                    <div className="grid gap-6">
                        {/* ADD NEW FORM */}
                        {isAddingMed && (
                            <motion.div layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 rounded-[2.5rem] border-cyan-500/20 bg-slate-950/60 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full -mr-20 -mt-20" />
                                
                                <h4 className="text-[10px] font-black text-cyan-400 mb-8 flex items-center gap-3 tracking-[0.2em] uppercase">
                                    <PlusCircle size={14} strokeWidth={3} /> Add New Entry
                                </h4>
                                                            <form onSubmit={addMed} className="space-y-10">
                                    <div className="grid md:grid-cols-2 gap-10">
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
                                                                    ? "bg-white text-slate-950 border-white shadow-3xl"
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
                                                                    className="sr-only"
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
                                            className="px-8 py-4 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                                        >
                                            Abort
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                                        >
                                            Deploy Formulation
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            {meds.map((med, idx) => {
                                // EDIT MODE (Inline)
                                if (editingMed?.name === med.name) {
                                    return (
                                        <motion.div key={idx} layout className="glass-card p-10 rounded-[2.5rem] border-amber-500/20 bg-slate-950/60 backdrop-blur-3xl shadow-3xl relative overflow-hidden">
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
                                                                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xl"
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
                                                    <button type="button" onClick={() => setEditingMed(null)} className="data-label !text-slate-800 hover:!text-white px-4 transition-colors">CANCEL</button>
                                                    <button type="submit" className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all shadow-3xl active:scale-95 font-[family-name:var(--font-outfit)]">COMMIT UPDATES</button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    );
                                }

                                // DISPLAY CARD
                                return (
                                    <div key={idx} className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] backdrop-blur-3xl transition-all group relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.02] blur-2xl rounded-full -mr-12 -mt-12 transition-opacity" />
                                        
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 text-cyan-400/60 flex items-center justify-center shadow-inner group-hover:border-cyan-500/20 transition-all">
                                                    <Pill size={24} strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-base tracking-tight mb-2 group-hover:text-cyan-400 transition-colors font-[family-name:var(--font-outfit)]">{med.name}</h4>
                                                    <div className="flex items-center gap-4">
                                                        <span className="data-label !text-[8px] !text-slate-700 bg-white/5 px-3 py-1 rounded-lg border border-white/10">{med.dosage}</span>
                                                        <span className="data-label !text-[8px] !text-cyan-400 opacity-40 group-hover:opacity-80 transition-opacity">// {med.timing}</span>
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
                                                            saveMedsList(updated);
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

function pillIcon(count: number) {
    return ({ size }: { size: number }) => (
        <div className="relative">
            <Pill size={size} />
            {count > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-orange-500 text-[8px] text-white">{count}</span>}
        </div>
    )
}
