"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useParentsAuth } from "../lib/supabase/context";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import { 
  UploadCloud, Loader2, FileText, AlertCircle, Lock, ArrowRight, ShieldCheck, 
  Pill, Brain, Activity, Clock, FileSearch, Trash2, Milestone, Check, 
  Smartphone, Sparkles, AlertTriangle, RefreshCw, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HealthTrendChart } from "./HealthTrendChart";

interface SmartReportProps {
    onNavigate?: () => void;
}

export function SmartReport({ onNavigate }: SmartReportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle");
    const { isSupabaseEnabled, activeParent, labReports, medications, addLabReport, deleteLabReport, addMedication, refreshData } = useParentsAuth();
    const parentId = activeParent?.id || "sandbox-parent-id";
    const [localIsLocked, setLocalIsLocked] = useState(true);
    const [localContext, setLocalContext] = useState("");
    const [localHistory, setLocalHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"current" | "history">("current");

    // NEW PHASE 5 SANDBOX & SIMULATION STATES
    const [useMock, setUseMock] = useState(true);
    const [consentChecked, setConsentChecked] = useState(false);
    const [medsToSync, setMedsToSync] = useState<any[] | null>(null);
    const [syncSelections, setSyncSelections] = useState<{ [key: string]: boolean }>({});
    const [duplicateOverwrite, setDuplicateOverwrite] = useState<{ [key: string]: boolean }>({});
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    // Reconstruct history list, parsing full JSON from full_analysis_markdown if database records exist
    const history = useMemo(() => {
        if (isSupabaseEnabled && activeParent) {
            return labReports.map(r => {
                try {
                    const parsed = JSON.parse(r.full_analysis_markdown || "{}");
                    if (parsed.reportType || parsed.summaryForChild) {
                        return { id: r.id, ...parsed };
                    }
                } catch (e) {
                    // Fallback to unstructured format
                }
                return {
                    id: r.id,
                    reportType: r.report_type || "Lab Report",
                    reportDate: r.report_date,
                    summaryForChild: r.summary,
                    summaryForParent: "Your medical record is synthesized safely. Keep up your active care routines!",
                    keyFindings: [r.summary],
                    biomarkers: r.biomarkers ? Object.entries(r.biomarkers).map(([k, v]: any) => ({
                        name: k,
                        value: v.value || String(v),
                        unit: v.unit || "",
                        status: v.status || "normal",
                        explanation: "Biological parameter value logged in historical records."
                     })) : [],
                    medicines: [],
                    possibleQuestionsForDoctor: ["Would you review the parameters from this report in detail?"],
                    redFlags: [],
                    disclaimer: "Computational AI support. Please verify with a doctor.",
                    full_analysis_markdown: r.full_analysis_markdown
                };
            });
        }
        return localHistory;
    }, [isSupabaseEnabled, activeParent, labReports, localHistory]);

    const isLocked = useMemo(() => {
        if (isSupabaseEnabled && activeParent) {
            const scorecardObj = activeParent.scorecard_answers as any;
            const answers = scorecardObj?.answers || {};
            return !(answers.relation || answers.age || answers.stageA_completed || Object.keys(answers).length >= 5);
        }
        return localIsLocked;
    }, [isSupabaseEnabled, activeParent, localIsLocked]);

    const context = useMemo(() => {
        if (isSupabaseEnabled && activeParent) {
            const scorecardObj = activeParent.scorecard_answers as any;
            const answers = scorecardObj?.answers || {};
            const scores = scorecardObj?.scores || {};
            return `
                Scores: ${JSON.stringify(scores?.categories || [])}
                Total Risk: ${activeParent.risk_level || "Healthy Baseline"} (${activeParent.health_index || 90}/175)
                User Answers: ${JSON.stringify(answers)}
            `;
        }
        return localContext;
    }, [isSupabaseEnabled, activeParent, localContext]);

    // Load Context & History when activeParent changes
    useEffect(() => {
        if (!parentId) return;

        // 1. Clinical Context (Gate)
        const pId = parentId;
        const savedData = localStorage.getItem(`parents_health_assessment_data_v2_${pId}`) || localStorage.getItem("parents_health_assessment_data_v2");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                const answers = parsed.answers || {};
                if (answers.relation || answers.age || answers.stageA_completed || Object.keys(answers).length >= 5) {
                    setLocalIsLocked(false);
                    const contextSummary = `
                Scores: ${JSON.stringify(parsed.scores?.categories)}
                Total Risk: ${parsed.scores?.riskLevel} (${parsed.scores?.total}/175)
                User Answers: ${JSON.stringify(parsed.answers)}
              `;
                    setLocalContext(contextSummary);
                } else {
                    setLocalIsLocked(true);
                }
            } catch (e) {
                setLocalContext("Assessment data corrupted.");
                setLocalIsLocked(false);
            }
        } else {
            setLocalIsLocked(true);
        }

        // 2. Report History (Memory)
        const savedHistory = localStorage.getItem(`parents_health_lab_reports_${pId}`) || localStorage.getItem(`parents_health_history_${pId}`) || localStorage.getItem("parents_health_history");
        if (savedHistory) {
            try {
                const parsedHist = JSON.parse(savedHistory);
                setLocalHistory(Array.isArray(parsedHist) ? parsedHist : []);
            } catch (e) { console.error("History parse error", e); }
        } else {
            setLocalHistory([]);
        }

        // 3. Holistic Summary Persistence
        const savedSummary = localStorage.getItem(`parents_health_latest_summary_${pId}`) || localStorage.getItem("parents_health_latest_summary");
        if (savedSummary) {
            try {
                const summaryData = JSON.parse(savedSummary);
                setAnalysisData(summaryData);
                setStatus("done");
            } catch (e) { 
                // Unstructured fallback
                setAnalysisData({
                    reportType: "Lab Report",
                    summaryForChild: savedSummary,
                    summaryForParent: "Your medical record is synthesized safely. Keep up your active care routines!",
                    keyFindings: [savedSummary],
                    biomarkers: [],
                    medicines: [],
                    possibleQuestionsForDoctor: ["Would you review the parameters from this report in detail?"],
                    redFlags: []
                });
                setStatus("done");
            }
        } else {
            setAnalysisData(null);
            setStatus("idle");
        }
    }, [parentId]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(selectedFile.type.startsWith('image') ? objectUrl : null);
            setAnalysisData(null);
            setMedsToSync(null);
            setSyncMessage(null);
            setStatus("idle");
            setActiveTab("current");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/png": [],
            "image/jpeg": [],
            "image/jpg": [],
            "application/pdf": [],
        },
        maxFiles: 1,
    });

    const analyzeReport = async () => {
        if (!file && !useMock) return;

        setStatus("analyzing");
        setMedsToSync(null);
        setSyncMessage(null);

        try {
            const formData = new FormData();
            if (file) {
                formData.append("file", file);
            }
            formData.append("clinicalContext", context);
            formData.append("useMock", useMock ? "true" : "false");
            
            const historyContext = history.slice(0, 3).map(h => ({ 
                date: h.reportDate || h.timestamp, 
                summary: h.summaryForChild || h.summary, 
                biomarkers: h.biomarkers 
            }));
            formData.append("historyContext", JSON.stringify(historyContext));

            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                const result = data.result;
                setAnalysisData(result);
                setStatus("done");

                // Save to History (Memory)
                const newHistoryItem = { ...result, timestamp: new Date().toISOString() };
                if (isSupabaseEnabled) {
                    await addLabReport({
                        report_date: result.reportDate || new Date().toISOString().split("T")[0],
                        report_type: result.reportType || "Medical Node",
                        summary: result.summaryForChild || result.summary || "Parsed Report Summary",
                        biomarkers: result.biomarkers || [],
                        full_analysis_markdown: JSON.stringify(result) // Preserve all parsed schema fields safely
                    });
                } else {
                    const updatedHistory = [newHistoryItem, ...localHistory];
                    setLocalHistory(updatedHistory);
                    localStorage.setItem("parents_health_history", JSON.stringify(updatedHistory));
                }

                // If medicines were extracted, prepare sync selections
                if (result.medicines && result.medicines.length > 0) {
                    setMedsToSync(result.medicines);
                    const initialSelections: { [key: string]: boolean } = {};
                    const initialOverwrites: { [key: string]: boolean } = {};
                    result.medicines.forEach((med: any) => {
                        initialSelections[med.name] = true;
                        
                        // Check duplicate status
                        const exists = medications.some(m => m.name.toLowerCase() === med.name.toLowerCase());
                        if (exists) {
                            initialOverwrites[med.name] = false;
                        }
                    });
                    setSyncSelections(initialSelections);
                    setDuplicateOverwrite(initialOverwrites);
                }

            } else {
                console.error(data.error);
                setAnalysisData({ error: data.details || data.error });
                setStatus("error");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    const handleMedicationSync = async () => {
        if (!medsToSync) return;

        let syncedCount = 0;
        let skippedCount = 0;

        for (const med of medsToSync) {
            if (!syncSelections[med.name]) continue;

            const isDuplicate = medications.some(
                m => m.name.toLowerCase() === med.name.toLowerCase()
            );

            // Skip if duplicate exists and caregiver unchecked force merge
            if (isDuplicate && duplicateOverwrite[med.name] === false) {
                skippedCount++;
                continue;
            }

            const specialInst = med.instruction || med.instructions || "None";
            const syncedInstructions = `(from uploaded report) ${specialInst}`;

            await addMedication({
                name: med.name,
                dosage: med.dosage || `${med.strength || ""} 1 tab`,
                timing: med.timing || "After food",
                instructions: syncedInstructions
            });
            syncedCount++;
        }

        if (refreshData) {
            await refreshData();
        }

        setSyncMessage(`Successfully synced ${syncedCount} medications! ${skippedCount > 0 ? `(${skippedCount} skipped duplicate timings)` : ""}`);
        setTimeout(() => {
            setMedsToSync(null);
            setSyncMessage(null);
        }, 3500);
    };

    const deleteHistoryItem = async (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Remove this report from history?")) {
            const item = history[index];
            if (isSupabaseEnabled && item.id) {
                await deleteLabReport(item.id);
            } else {
                const updated = localHistory.filter((_, i) => i !== index);
                setLocalHistory(updated);
                localStorage.setItem("parents_health_history", JSON.stringify(updated));
            }
            if (activeTab === "current" && analysisData === item) {
                setAnalysisData(null);
                setMedsToSync(null);
                setStatus("idle");
            }
        }
    };

    const clearAllHistory = () => {
        if (confirm("Are you sure you want to clear your local diagnostics history archive? This cannot be undone.")) {
            localStorage.removeItem("parents_health_history");
            setLocalHistory([]);
            setAnalysisData(null);
            setMedsToSync(null);
            setStatus("idle");
        }
    };

    if (isLocked) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center min-h-[500px] text-center p-6 md:p-12 glass-card rounded-[3.5rem] border-white/5 relative overflow-hidden bg-slate-950/40 backdrop-blur-3xl">
                <div className="absolute top-0 right-0 p-24 opacity-[0.03] scale-150 rotate-12">
                   <Lock size={150} className="text-[#0E5E5A]" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-10 h-20 w-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-[#0E5E5A] shadow-inner">
                        <Lock size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-[#0E5E5A] mb-5 font-[family-name:var(--font-outfit)] uppercase tracking-tight">Profile Setup Required</h3>
                    <p className="text-slate-500 font-light max-w-md mb-12 text-lg font-[family-name:var(--font-inter)] leading-relaxed">
                        To unlock automated insights, Parents-Health requires your baseline profile. Complete the 15-point assessment to view the diagnostics analysis.
                    </p>
                    <button
                        onClick={onNavigate}
                        className="flex items-center gap-4 bg-[#0E5E5A] text-white px-12 py-6 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#0c4e4b] transition-all shadow-xl active:scale-95 cursor-pointer"
                    >
                        View Insights <ArrowRight size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-10 pb-20">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h2 className="text-2xl md:text-5xl font-bold text-[#0E5E5A] font-[family-name:var(--font-outfit)] tracking-tight uppercase">Health View</h2>
                    <p className="text-xs md:text-sm text-slate-500 font-light font-[family-name:var(--font-inter)] tracking-wide mt-1.5 md:mt-2">AI-assisted synthesis of longitudinal health records and laboratory scans.</p>
                </div>
                <div className="flex items-center gap-4 data-label !text-[#0E5E5A] bg-white/[0.03] px-6 py-4 rounded-2xl border border-white/5 shadow-sm">
                    <ShieldCheck size={20} className="text-[#0E5E5A]" strokeWidth={1.5} />
                    <span>Diagnostics Registry: {history.length} Records</span>
                </div>
            </div>

            <HealthTrendChart />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: Upload Section */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* SANDBOX NOTIFICATION WARNING */}
                    <div className="p-5 rounded-[2rem] border border-amber-500/20 bg-amber-500/[0.02] relative overflow-hidden">
                        <div className="flex items-start gap-4">
                            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
                            <div>
                                <h5 className="text-[11px] font-semibold text-amber-600 tracking-wider uppercase font-[family-name:var(--font-outfit)]">Clinical Sandbox & AI Consent Notice</h5>
                                <p className="text-[10px] text-slate-500 font-light mt-1 font-[family-name:var(--font-inter)] leading-relaxed">
                                    AI report analysis uses the configured Gemini API. Only upload reports you are comfortable processing through this AI service. For testing, use synthetic or redacted reports. Parents Health OS and Anaya do not diagnose or replace a doctor.
                                </p>
                                <p className="text-[9px] text-slate-400 font-medium mt-2 leading-relaxed italic">
                                    ⚠️ Parents Health OS and Anaya do not provide diagnosis, prescriptions, emergency medical care, or doctor replacement. They help organize, summarize, and coordinate family care information.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* MOCK MODE SIMULATOR OPTION TOGGLE */}
                    <div className="p-6 glass-card rounded-[2.5rem] border border-white/5 bg-slate-950/20 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-3 font-semibold text-slate-800 text-[12px] font-[family-name:var(--font-outfit)] uppercase tracking-wide">
                                <Sparkles size={16} className="text-[#0E5E5A]" />
                                Sandbox Simulation
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={useMock} 
                                    onChange={(e) => setUseMock(e.target.checked)} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E5E5A]"></div>
                            </label>
                        </div>
                        <p className="text-[10px] text-slate-500 font-light font-[family-name:var(--font-inter)] leading-relaxed">
                            {useMock 
                                ? "Instant simulated parsing is active using Anaya's mock engine. No external API credentials required." 
                                : "Live clinical reading is enabled. Uploaded records will call Gemini AI for diagnostic extraction."}
                        </p>
                    </div>

                    {/* DROPZONE */}
                    <div
                        {...getRootProps()}
                        className={`glass-card rounded-[3rem] p-6 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[18rem] relative overflow-hidden border-dashed ${isDragActive
                            ? "border-[#0E5E5A] bg-[#0E5E5A]/5"
                            : "border-white/5 hover:bg-white/[0.03]"
                            }`}
                    >
                        <input {...getInputProps()} />
                        {preview ? (
                            <div className="relative w-full h-full flex flex-col items-center justify-center z-10 group">
                                <img src={preview} alt="Preview" className="max-h-52 rounded-3xl object-contain shadow-2xl transition-transform" />
                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                     <UploadCloud className="text-white" size={32} strokeWidth={1.5} />
                                </div>
                            </div>
                        ) : file ? (
                            <div className="flex flex-col items-center z-10">
                                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#0E5E5A] mb-5 border border-white/5 shadow-inner">
                                    <FileText size={28} strokeWidth={1.5} />
                                </div>
                                <p className="text-slate-800 font-bold tracking-tight px-4 truncate w-full font-[family-name:var(--font-outfit)]">{file.name}</p>
                                <p className="data-label !text-slate-500 mt-3">{(file.size / 1024 / 1024).toFixed(2)} MB // STATUS: READY</p>
                            </div>
                        ) : (
                            <>
                                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 text-slate-600 flex items-center justify-center mb-6 group-hover:text-[#0E5E5A] transition-all">
                                    <UploadCloud size={32} strokeWidth={1.5} />
                                </div>
                                <p className="text-slate-800 font-bold tracking-tight mb-2 uppercase text-sm font-[family-name:var(--font-outfit)]">Select Record</p>
                                <p className="text-[10px] text-slate-500 data-label">Labs / Scans / PDFs / Images</p>
                            </>
                        )}
                    </div>

                    {(file || useMock) && status !== "analyzing" && status !== "done" && (
                        <div className="space-y-4 w-full">
                            {!useMock && (
                                <div className="p-5 rounded-2xl border border-teal-600/30 bg-[#0E5E5A]/[0.02] text-[11px] text-slate-700 font-light leading-relaxed space-y-3">
                                    <span className="font-bold text-[#0E5E5A] block uppercase tracking-wider text-[9px] mb-1">🔒 Explicit Data & AI Consent Required</span>
                                    <p>
                                        Parents Health OS and its Anaya diagnostics suite respect patient privacy. To route this physical document safely through the Google Gemini API, you must explicitly review and consent:
                                    </p>
                                    <label className="flex items-start gap-3 cursor-pointer text-slate-800 font-medium select-none bg-white/40 p-3 rounded-xl hover:bg-white/60 transition-all border border-[#e2ded5]">
                                        <input
                                            type="checkbox"
                                            checked={consentChecked}
                                            onChange={(e) => setConsentChecked(e.target.checked)}
                                            className="mt-0.5 rounded border-slate-300 text-[#0E5E5A] focus:ring-[#0E5E5A]"
                                        />
                                        <span>I consent to sending this redacted, non-emergency document to Gemini AI for structural observation parsing.</span>
                                    </label>
                                </div>
                            )}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={analyzeReport}
                                disabled={!useMock && !consentChecked}
                                className={`w-full py-6 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl font-[family-name:var(--font-outfit)] ${
                                    (!useMock && !consentChecked)
                                        ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                                        : "bg-[#0E5E5A] hover:scale-[1.02] hover:bg-[#0c4e4b] cursor-pointer"
                                }`}
                            >
                                <Brain size={18} strokeWidth={2.5} />
                                {useMock ? "Run Sandbox Simulation" : "View Summary Insights"}
                            </motion.button>
                        </div>
                    )}

                    {status === "analyzing" && (
                        <div className="w-full p-6 md:p-10 glass-card rounded-[2rem] border-white/5 flex flex-col items-center justify-center gap-6 text-center">
                            <div className="relative h-14 w-14">
                                <Loader2 size={56} className="animate-spin text-[#0E5E5A]/40" strokeWidth={1.5} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity size={20} className="text-[#0E5E5A]" strokeWidth={1.5} />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-800 font-bold tracking-wider font-[family-name:var(--font-outfit)] uppercase text-xs">Synthesizing Diagnostic Data...</p>
                                <p className="data-label !text-slate-600 mt-2">Checking Longitudinal Base parameters</p>
                            </div>
                        </div>
                    )}

                    {/* HISTORY LIST */}
                    {history.length > 0 && (
                        <div className="glass-card rounded-[2.5rem] p-8 border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="data-label !text-slate-600 flex items-center gap-3">
                                    <Clock size={14} strokeWidth={1.5} /> Archival Memory
                                </h4>
                                <button 
                                    onClick={clearAllHistory}
                                    className="text-[9px] font-semibold text-red-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all font-[family-name:var(--font-outfit)]"
                                >
                                    <Trash2 size={10} />
                                    Clear Vault
                                </button>
                            </div>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                                {history.map((h, i) => (
                                    <div
                                        key={i}
                                        className={`group relative p-5 rounded-2xl border transition-all ${analysisData === h 
                                            ? "bg-white/[0.03] border-[#0E5E5A]/30" 
                                            : "glass-card border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                                            }`}
                                        onClick={() => {
                                            setAnalysisData(h);
                                            setStatus("done");
                                            setActiveTab("current");
                                            setMedsToSync(h.medicines || null);
                                            if (h.medicines) {
                                                const initialSelections: { [key: string]: boolean } = {};
                                                const initialOverwrites: { [key: string]: boolean } = {};
                                                h.medicines.forEach((med: any) => {
                                                    initialSelections[med.name] = true;
                                                    const exists = medications.some(m => m.name.toLowerCase() === med.name.toLowerCase());
                                                    if (exists) {
                                                        initialOverwrites[med.name] = false;
                                                    }
                                                });
                                                setSyncSelections(initialSelections);
                                                setDuplicateOverwrite(initialOverwrites);
                                            } else {
                                                setMedsToSync(null);
                                            }
                                            setSyncMessage(null);
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-800 text-[13px] font-[family-name:var(--font-outfit)] uppercase tracking-tight">{h.reportDate || "Recent Sync"}</p>
                                                <p className="data-label !text-slate-600 !text-[8px] mt-1.5">{h.reportType || "Lab Analysis"}</p>
                                            </div>
                                            <button
                                                onClick={(e) => deleteHistoryItem(i, e)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={14} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={async () => {
                            setStatus("analyzing");
                            setActiveTab("current");
                            try {
                                const formData = new FormData();
                                formData.append("mode", "summary");
                                formData.append("clinicalContext", context);
                                formData.append("useMock", useMock ? "true" : "false");
                                const historyContext = history.map(h => ({ 
                                    date: h.reportDate || h.timestamp, 
                                    summary: h.summaryForChild || h.summary, 
                                    biomarkers: h.biomarkers 
                                }));
                                formData.append("historyContext", JSON.stringify(historyContext));
                                const response = await fetch("/api/analyze", { method: "POST", body: formData });
                                const data = await response.json();
                                if (response.ok) {
                                    setAnalysisData({ ...data.result, isSummary: true });
                                    setStatus("done");
                                    localStorage.setItem("parents_health_latest_summary", JSON.stringify({ ...data.result, isSummary: true }));
                                } else {
                                    setAnalysisData({ error: "Holistic sync failed." });
                                    setStatus("error");
                                }
                            } catch (e) { setStatus("error"); }
                        }}
                        className="w-full py-5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] text-slate-400 hover:text-white rounded-2xl data-label !text-[9px] transition-all flex items-center justify-center gap-4 active:scale-95 cursor-pointer"
                    >
                        <Brain size={18} className="text-[#0E5E5A] opacity-60" strokeWidth={1.5} />
                        Synthesize Full Lineage
                    </button>
                </div>

                {/* RIGHT: Results Section */}
                <div className="lg:col-span-8 min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {status === "done" && analysisData ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-[3rem] border-white/10 bg-slate-950/60 backdrop-blur-3xl shadow-2xl h-full flex flex-col overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 pointer-events-none">
                                    <ShieldCheck size={180} className="text-[#0E5E5A]" />
                                </div>

                                  {analysisData.isSummary ? (
                                    <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar relative z-10">
                                        <div className="flex items-center gap-8 mb-14">
                                            <div className="h-20 w-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-[#0E5E5A] shadow-inner">
                                                <Brain size={40} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl md:text-4xl font-bold text-[#0E5E5A] tracking-tight uppercase font-[family-name:var(--font-outfit)]">{analysisData.title || "Health Summary"}</h3>
                                                <div className="data-label !text-cyan-400 mt-3 flex items-center gap-3">
                                                     <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                     Longitudinal Trajectory Synthesized
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            <div className="glass-card p-6 md:p-10 rounded-[3rem] bg-white/[0.02] border-white/5">
                                                <h4 className="data-label !text-slate-600 mb-6 flex items-center gap-3">
                                                    <Activity size={20} className="text-[#0E5E5A] opacity-60" strokeWidth={1.5} /> Physiological Trajectory
                                                </h4>
                                                <div className="text-slate-400 text-lg leading-relaxed font-light font-[family-name:var(--font-inter)] prose prose-invert max-w-none">
                                                    <ReactMarkdown>{analysisData.trendAnalysis}</ReactMarkdown>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="glass-card p-6 md:p-10 rounded-[3rem] bg-white/[0.01] border-white/5">
                                                    <h4 className="data-label !text-slate-600 mb-6 flex items-center gap-3">
                                                        <FileSearch size={20} className="text-amber-500 opacity-60" strokeWidth={1.5} /> Key Interventions
                                                    </h4>
                                                    <ul className="space-y-5">
                                                        {analysisData.keyFindings?.map((f: string, i: number) => (
                                                            <li key={i} className="flex gap-5 text-sm md:text-base text-slate-500 font-light leading-snug">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-400/40 mt-2 shrink-0" />
                                                                <ReactMarkdown>{f}</ReactMarkdown>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="glass-card p-6 md:p-10 rounded-[3rem] bg-[#0E5E5A]/[0.03] border-[#0E5E5A]/10 shadow-3xl shadow-[#0E5E5A]/5">
                                                    <h4 className="data-label !text-[#0E5E5A] mb-6 flex items-center gap-3">
                                                        <ShieldCheck size={20} strokeWidth={1.5} /> Care Focus
                                                    </h4>
                                                    <div className="text-[#0E5E5A] text-xl font-semibold tracking-tight leading-relaxed font-[family-name:var(--font-outfit)]">
                                                       {analysisData.recommendation}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* SINGLE REPORT HEADER */}
                                        <div className="p-6 md:p-12 border-b border-white/5 relative bg-white/[0.02] z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="text-[9px] font-semibold px-4 py-1.5 rounded-full border border-[#0E5E5A]/20 bg-[#0E5E5A]/10 text-[#0E5E5A] font-[family-name:var(--font-outfit)] uppercase tracking-wider">
                                                        {analysisData.reportType || "Lab Record"}
                                                    </span>
                                                    {analysisData.reportDate && (
                                                        <span className="text-[9px] font-semibold px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-500 font-[family-name:var(--font-outfit)] tracking-wider">
                                                            Dated: {analysisData.reportDate}
                                                        </span>
                                                    )}
                                                    {analysisData.patientName && (
                                                        <span className="text-[9px] font-semibold px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-500 font-[family-name:var(--font-outfit)] uppercase tracking-wider">
                                                            Patient: {analysisData.patientName}
                                                        </span>
                                                    )}
                                                    {analysisData.confidenceLevel && (
                                                        <span className="text-[9px] font-semibold px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/[0.02] text-cyan-500 font-[family-name:var(--font-outfit)] uppercase tracking-wider">
                                                            Confidence: {analysisData.confidenceLevel}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-2xl md:text-4xl font-bold text-[#0E5E5A] tracking-tight uppercase font-[family-name:var(--font-outfit)]">Diagnostic Synthesis</h3>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                                                <div className="data-label !text-[#0E5E5A] bg-[#0E5E5A]/5 px-4 py-2 border border-[#0E5E5A]/10 rounded-xl font-[family-name:var(--font-outfit)]">
                                                    Anaya OCR Engine v2.5
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-light font-[family-name:var(--font-inter)] tracking-tighter">AI watermarked analysis context</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar space-y-12 z-10">
                                            
                                            {/* DUAL DIGEST SUMMARY */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                
                                                {/* CAREGIVER (CHILD) DIGEST */}
                                                <div className="p-6 md:p-8 rounded-[2.5rem] border border-white/5 bg-[#0E5E5A]/[0.01] shadow-inner relative overflow-hidden space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-white/5 border border-white/10 text-[#0E5E5A] rounded-xl flex items-center justify-center">
                                                            <FileSearch size={16} />
                                                        </div>
                                                        <h5 className="text-[12px] font-bold text-slate-800 tracking-wider uppercase font-[family-name:var(--font-outfit)]">Longitudinal Caregiver Insight</h5>
                                                    </div>
                                                    <p className="text-slate-600 text-sm font-light font-[family-name:var(--font-inter)] leading-relaxed">
                                                        {analysisData.summaryForChild || analysisData.summary || "Summary parsed."}
                                                    </p>
                                                </div>

                                                {/* WHATSAPP REASSURING (PARENT) DIGEST */}
                                                <div className="p-6 md:p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/[0.02] shadow-sm relative overflow-hidden space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
                                                                <Smartphone size={16} />
                                                            </div>
                                                            <h5 className="text-[12px] font-bold text-emerald-700 tracking-wider uppercase font-[family-name:var(--font-outfit)]">Anaya Parent Digest</h5>
                                                        </div>
                                                        <span className="text-[8px] font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest font-[family-name:var(--font-outfit)]">
                                                            WhatsApp Digestion Ready
                                                        </span>
                                                    </div>
                                                    <div className="p-4 bg-white/5 rounded-2xl border border-emerald-500/5 relative">
                                                        <div className="absolute top-2 left-[-6px] w-3 h-3 bg-white/5 border-l border-b border-emerald-500/5 rotate-45 transform hidden md:block"></div>
                                                        <p className="text-slate-600 text-sm font-light font-[family-name:var(--font-inter)] leading-relaxed italic">
                                                            "{analysisData.summaryForParent || "Everything in your records is cataloged correctly. Rest assured, you are in great care!"}"
                                                        </p>
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 font-light font-[family-name:var(--font-inter)] mt-2">
                                                        💬 Summarized in highly comforting, simplified language for parent digital messaging.
                                                    </div>
                                                </div>

                                            </div>

                                            {/* BIOMARKER TABLE WITH ELI5 EXPLANATIONS */}
                                            {analysisData.biomarkers && analysisData.biomarkers.length > 0 && (
                                                <div className="space-y-6">
                                                    <h4 className="data-label !text-slate-600 flex items-center gap-3">
                                                        <Activity size={20} className="text-[#0E5E5A] opacity-60" strokeWidth={1.5} /> Extracted Bio-Signatures & Lab Metrics
                                                    </h4>
                                                    <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-950/40 shadow-inner">
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-left border-collapse min-w-[600px]">
                                                                <thead>
                                                                    <tr className="bg-white/5 border-b border-white/5 font-[family-name:var(--font-outfit)]">
                                                                        <th className="px-8 py-5 data-label !text-slate-500">Test / Biomarker</th>
                                                                        <th className="px-8 py-5 data-label !text-slate-500">Value Recorded</th>
                                                                        <th className="px-8 py-5 data-label !text-slate-500 text-center">Reference limits</th>
                                                                        <th className="px-8 py-5 data-label !text-slate-500 text-right">Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-white/5 font-[family-name:var(--font-inter)]">
                                                                    {analysisData.biomarkers.map((b: any, idx: number) => (
                                                                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                                                            <td className="px-8 py-6 max-w-xs">
                                                                                <p className="font-bold text-slate-800 text-[13px] font-[family-name:var(--font-outfit)] uppercase tracking-tight">{b.name}</p>
                                                                                <p className="text-[10px] text-slate-400 font-light mt-1.5 leading-relaxed">{b.explanation || "No metric description available."}</p>
                                                                            </td>
                                                                            <td className="px-8 py-6 whitespace-nowrap">
                                                                                <span className="text-slate-800 font-bold text-xl font-[family-name:var(--font-outfit)]">{b.value}</span>
                                                                                <span className="data-label !text-slate-500 ml-2">{b.unit}</span>
                                                                            </td>
                                                                            <td className="px-8 py-6 text-center text-slate-500 text-xs font-light font-[family-name:var(--font-inter)] whitespace-nowrap">
                                                                                {b.referenceRange || "Standard limits"}
                                                                            </td>
                                                                            <td className="px-8 py-6 text-right whitespace-nowrap">
                                                                                <span className={`px-5 py-2 rounded-full data-label !text-[8px] border font-bold ${
                                                                                    b.status?.toLowerCase().includes('high') || b.status?.toLowerCase().includes('low') || b.status?.toLowerCase().includes('abnormal')
                                                                                        ? "text-red-500 border-red-500/20 bg-red-500/[0.02]"
                                                                                        : b.status?.toLowerCase().includes('border')
                                                                                        ? "text-amber-500 border-amber-500/20 bg-amber-500/[0.02]"
                                                                                        : "text-emerald-600 border-emerald-500/20 bg-emerald-500/[0.02]"
                                                                                    }`}>
                                                                                    {b.status || "normal"}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ACTIVE PRESCRIBED MEDS & MANUAL CHECKLIST SYNC SECTION */}
                                            {analysisData.medicines && analysisData.medicines.length > 0 && (
                                                <div className="space-y-6">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <h4 className="data-label !text-slate-600 flex items-center gap-3">
                                                            <Pill size={20} className="text-[#0E5E5A] opacity-60" strokeWidth={1.5} /> Parsed Medications & Pill Schedules
                                                        </h4>
                                                        
                                                        {/* SYNC TRIGGER BUTTON */}
                                                        {!medsToSync && (
                                                            <button 
                                                                onClick={() => {
                                                                    setMedsToSync(analysisData.medicines);
                                                                    const selections: { [key: string]: boolean } = {};
                                                                    const overwrites: { [key: string]: boolean } = {};
                                                                    analysisData.medicines.forEach((med: any) => {
                                                                        selections[med.name] = true;
                                                                        const exists = medications.some(m => m.name.toLowerCase() === med.name.toLowerCase());
                                                                        if (exists) {
                                                                            overwrites[med.name] = false;
                                                                        }
                                                                    });
                                                                    setSyncSelections(selections);
                                                                    setDuplicateOverwrite(overwrites);
                                                                }}
                                                                className="px-6 py-3 bg-[#0E5E5A]/10 border border-[#0E5E5A]/20 hover:bg-[#0E5E5A]/20 text-[#0E5E5A] rounded-xl font-bold uppercase tracking-wider text-[9px] font-[family-name:var(--font-outfit)] flex items-center gap-2 transition-all active:scale-95 cursor-pointer font-semibold"
                                                            >
                                                                <RefreshCw size={12} />
                                                                Review Medication Sync
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* SYNC WORKFLOW PANEL */}
                                                    {medsToSync && (
                                                        <div className="p-6 md:p-8 rounded-[2.5rem] border border-[#0E5E5A]/20 bg-[#0E5E5A]/5 space-y-6 relative overflow-hidden">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h5 className="text-[12px] font-bold text-slate-800 tracking-wider uppercase font-[family-name:var(--font-outfit)]">Medication Care plan Sync</h5>
                                                                    <p className="text-[10px] text-slate-500 font-light mt-1 font-[family-name:var(--font-inter)]">Review and check the prescription records to merge into Daily Pill Checklist.</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => setMedsToSync(null)}
                                                                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-all"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            <div className="space-y-4">
                                                                {medsToSync.map((med, idx) => {
                                                                    const exists = medications.some(m => m.name.toLowerCase() === med.name.toLowerCase());
                                                                    return (
                                                                        <div key={idx} className="flex items-start justify-between p-4 bg-white/10 rounded-2xl border border-white/5 gap-6">
                                                                            <div className="flex items-start gap-4">
                                                                                <input 
                                                                                    type="checkbox" 
                                                                                    checked={!!syncSelections[med.name]} 
                                                                                    onChange={(e) => {
                                                                                        setSyncSelections(prev => ({ ...prev, [med.name]: e.target.checked }));
                                                                                    }}
                                                                                    className="w-4.5 h-4.5 rounded border-slate-300 text-[#0E5E5A] focus:ring-[#0E5E5A] mt-1 shrink-0 accent-[#0E5E5A]"
                                                                                />
                                                                                <div>
                                                                                    <p className="font-bold text-slate-800 text-[13px] font-[family-name:var(--font-outfit)] uppercase tracking-tight flex items-center gap-2">
                                                                                        {med.name} 
                                                                                        <span className="text-[9px] font-light text-slate-500 lowercase bg-white/5 px-2 py-0.5 rounded-full">
                                                                                            {med.strength || "Dosage standard"}
                                                                                        </span>
                                                                                    </p>
                                                                                    <p className="text-[10px] text-slate-500 font-light font-[family-name:var(--font-inter)] mt-1.5">
                                                                                        {med.dosage || "1 pill"} // {med.timing} // {med.frequency}
                                                                                    </p>
                                                                                    {med.instruction && (
                                                                                        <p className="text-[9px] text-slate-400 italic mt-1 font-[family-name:var(--font-inter)]">
                                                                                            Note: {med.instruction}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Conflict duplicate matching check */}
                                                                            {exists && (
                                                                                <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                                                                                    <span className="text-[8px] font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-[family-name:var(--font-outfit)]">
                                                                                        Existing Conflict
                                                                                    </span>
                                                                                    <label className="flex items-center gap-2 text-[9px] text-slate-600 font-light select-none font-[family-name:var(--font-inter)] cursor-pointer">
                                                                                        <input 
                                                                                            type="checkbox" 
                                                                                            checked={!!duplicateOverwrite[med.name]}
                                                                                            onChange={(e) => {
                                                                                                setDuplicateOverwrite(prev => ({ ...prev, [med.name]: e.target.checked }));
                                                                                            }}
                                                                                            className="w-3.5 h-3.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 shrink-0 accent-amber-500"
                                                                                        />
                                                                                        Force Merge
                                                                                    </label>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            {syncMessage && (
                                                                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 font-[family-name:var(--font-inter)] font-semibold text-[11px] uppercase tracking-wide">
                                                                    {syncMessage}
                                                                </div>
                                                            )}

                                                            <button 
                                                                onClick={handleMedicationSync}
                                                                className="w-full py-5 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white rounded-2xl font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-3 shadow-md font-[family-name:var(--font-outfit)] cursor-pointer"
                                                            >
                                                                <Check size={14} strokeWidth={2.5} />
                                                                Confirm & Sync Selected to Daily Care
                                                            </button>

                                                        </div>
                                                    )}

                                                    {/* MEDICINES RENDER GRID */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-[family-name:var(--font-inter)]">
                                                        {analysisData.medicines.map((m: any, idx: number) => (
                                                            <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-slate-950/20 shadow-sm relative space-y-4">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h5 className="font-bold text-slate-800 text-[13px] font-[family-name:var(--font-outfit)] uppercase tracking-tight truncate max-w-[130px]">{m.name}</h5>
                                                                        <p className="data-label !text-slate-600 !text-[8px] mt-1.5 lowercase">{m.duration || "Ongoing chronic"}</p>
                                                                    </div>
                                                                    <span className="text-[8px] font-semibold text-slate-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider font-[family-name:var(--font-outfit)]">
                                                                        {m.strength || "Standard"}
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-1.5 text-xs text-slate-600 font-light font-[family-name:var(--font-inter)]">
                                                                    <div className="flex items-center gap-2">
                                                                        <Activity size={12} className="text-[#0E5E5A] opacity-40" />
                                                                        <span>Schedule: {m.dosage}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock size={12} className="text-[#0E5E5A] opacity-40" />
                                                                        <span className="capitalize">Timing: {m.timing}</span>
                                                                    </div>
                                                                    {m.instruction && (
                                                                        <p className="text-[10px] text-slate-400 italic mt-2 border-t border-white/5 pt-2 leading-relaxed">
                                                                            {m.instruction}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* PREPARATION FOR DOCTOR */}
                                            {analysisData.possibleQuestionsForDoctor && analysisData.possibleQuestionsForDoctor.length > 0 && (
                                                <div className="p-6 md:p-10 rounded-[3rem] border border-white/5 bg-white/[0.01] shadow-inner space-y-6">
                                                    <h4 className="data-label !text-slate-600 flex items-center gap-3">
                                                        <FileSearch size={20} className="text-cyan-500 opacity-60" strokeWidth={1.5} /> Physician Consult Checklist Helper
                                                    </h4>
                                                    <p className="text-slate-500 text-xs font-light font-[family-name:var(--font-inter)] leading-relaxed">
                                                        Use these AI-formulated checklist questions to lead a comprehensive review during your parent's next clinic or general practitioner appointment.
                                                    </p>
                                                    <ul className="space-y-4">
                                                        {analysisData.possibleQuestionsForDoctor.map((q: string, idx: number) => (
                                                            <li key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-white/[0.01] transition-all text-sm text-slate-500 font-light leading-relaxed font-[family-name:var(--font-inter)]">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="w-4 h-4 rounded border-slate-300 text-[#0E5E5A] focus:ring-[#0E5E5A] mt-1 shrink-0 accent-[#0E5E5A] cursor-pointer"
                                                                />
                                                                <span>{q}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* CLINICAL RED FLAGS SAFEGUARDS */}
                                            {analysisData.redFlags && analysisData.redFlags.length > 0 && (
                                                <div className="p-6 md:p-10 rounded-[3rem] border border-amber-500/10 bg-amber-500/[0.01] space-y-4 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 pointer-events-none">
                                                        <AlertCircle size={100} className="text-amber-500" />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <AlertCircle size={20} className="text-amber-500" strokeWidth={2} />
                                                        <h4 className="data-label !text-amber-600 uppercase tracking-widest font-[family-name:var(--font-outfit)]">Urgent Safety Indicators</h4>
                                                    </div>
                                                    <ul className="space-y-3 font-[family-name:var(--font-inter)] text-sm text-slate-500 font-light leading-relaxed">
                                                        {analysisData.redFlags.map((w: string, idx: number) => (
                                                            <li key={idx} className="flex gap-4">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                                                <span>{w}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                        </div>

                                        {/* WATERMARKED DISCLAIMER FOOTER */}
                                        <div className="p-6 md:p-10 bg-white/[0.02] border-t border-white/5 text-center relative z-10 overflow-hidden">
                                           <div className="absolute top-0 right-0 p-6 md:p-12 opacity-[0.03]">
                                               <AlertCircle size={100} className="text-[#0E5E5A]" />
                                           </div>
                                            <p className="data-label !text-[#0E5E5A] !tracking-[0.5em] flex items-center justify-center gap-4">
                                                <AlertCircle size={14} strokeWidth={2} /> Care protocol Disclosures // Verification Required
                                            </p>
                                            <p className="text-slate-500 text-[10px] font-light font-[family-name:var(--font-inter)] mt-3 max-w-2xl mx-auto uppercase tracking-wider leading-relaxed">
                                                {analysisData.disclaimer || "Diagnostics insights are advanced AI-assisted decision aids to support care. Always consult an official licensed physician before executing clinical adjustments."}
                                            </p>
                                        </div>
                                    </>
                                )}
                             </motion.div>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 glass-card rounded-[4rem] border-white/5 bg-slate-950/20 backdrop-blur-3xl p-8 md:p-16 text-center group">
                                <div className="animate-float mb-12">
                                    <div className="h-28 w-28 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-800 group-hover:text-[#0E5E5A] group-hover:border-[#0E5E5A]/20 transition-all duration-1000 shadow-3xl shadow-black">
                                        <Brain size={80} strokeWidth={1} className="opacity-10 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-[#0E5E5A] tracking-tight uppercase mb-5 font-[family-name:var(--font-outfit)]">Digital Health Vault</h3>
                                <p className="text-slate-600 font-light max-w-md leading-relaxed text-lg font-[family-name:var(--font-inter)]">
                                    Establish your health history by uploading laboratory scans. Parents-Health reviews trends across your biological timeline.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
