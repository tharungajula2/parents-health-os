"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import { UploadCloud, Loader2, FileText, AlertCircle, Lock, ArrowRight, ShieldCheck, Pill, Brain, Activity, Clock, FileSearch, Trash2, Milestone } from "lucide-react";
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
    const [isLocked, setIsLocked] = useState(true);
    const [context, setContext] = useState("");
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"current" | "history">("current");

    // Load Context & History on Mount
    useEffect(() => {
        // 1. Clinical Context (Gate)
        const savedData = localStorage.getItem("yukti_assessment_data_v2");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // STRICT GATE: Only unlock if user has answers ALL 15 questions
                // (Checking for >= 14 just in case they skipped one non-mandatory, but ideally 15)
                // Let's enforce 15 for "Complete Profile"
                if (parsed.answers && Object.keys(parsed.answers).length >= 15) {
                    setIsLocked(false);
                    const contextSummary = `
                Scores: ${JSON.stringify(parsed.scores?.categories)}
                Total Risk: ${parsed.scores?.riskLevel} (${parsed.scores?.total}/175)
                User Answers: ${JSON.stringify(parsed.answers)}
              `;
                    setContext(contextSummary);
                } else {
                    // Data exists but is incomplete
                    setIsLocked(true);
                }
            } catch (e) {
                setContext("Assessment data corrupted.");
                setIsLocked(false);
            }
        } else {
            setIsLocked(true);
        }

        // 2. Report History (Memory)
        const savedHistory = localStorage.getItem("yukti_history");
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) { console.error("History parse error", e); }
        }

        // 3. Holistic Summary Persistence (New)
        const savedSummary = localStorage.getItem("yukti_latest_summary");
        if (savedSummary) {
            try {
                const summaryData = JSON.parse(savedSummary);
                // Only show if no file is currently selected (to avoid confusion)
                setAnalysisData(summaryData);
                setStatus("done");
            } catch (e) { console.error("Summary parse error", e); }
        }
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(selectedFile.type.startsWith('image') ? objectUrl : null);
            setAnalysisData(null);
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
        if (!file) return;

        setStatus("analyzing");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("clinicalContext", context);
            // Send simplified history for context (last 3 summaries to save tokens)
            const historyContext = history.slice(0, 3).map(h => ({ date: h.meta?.reportDate, summary: h.summary, biomarkers: h.biomarkers }));
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
                const updatedHistory = [newHistoryItem, ...history];
                setHistory(updatedHistory);
                localStorage.setItem("yukti_history", JSON.stringify(updatedHistory));

                // AUTO-SYNC WORKFLOW: Update Active Meds
                if (result.medicines && result.medicines.length > 0) {
                    // Get existing meds
                    const existingMedsRaw = localStorage.getItem("yukti_active_meds");
                    const existingMeds = existingMedsRaw ? JSON.parse(existingMedsRaw) : [];

                    // Merge new meds (prevent duplicates by name)
                    // Merge new meds (prevent duplicates by name, update details instead)
                    const mergedMeds = [...existingMeds];

                    result.medicines.forEach((newMed: any) => {
                        const existingIndex = mergedMeds.findIndex(m => m.name.toLowerCase() === newMed.name.toLowerCase());

                        // Construct the full med object
                        const medEntry = {
                            ...newMed,
                            status: "Active",
                            startDate: new Date().toISOString().split('T')[0], // Today
                            type: newMed.type || "Chronic" // Default to Chronic if unsure
                        };

                        if (existingIndex !== -1) {
                            // Update existing (Effective "Smart Merge")
                            mergedMeds[existingIndex] = { ...mergedMeds[existingIndex], ...medEntry };
                        } else {
                            // Add new
                            mergedMeds.push(medEntry);
                        }
                    });

                    localStorage.setItem("yukti_active_meds", JSON.stringify(mergedMeds));
                    // Optional: You could trigger a toast here "Meds Updated"
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

    const deleteHistoryItem = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Remove this report from history?")) {
            const updated = history.filter((_, i) => i !== index);
            setHistory(updated);
            localStorage.setItem("yukti_history", JSON.stringify(updated));
            // If deleting the currently viewed report, clear the view
            if (activeTab === "current" && analysisData === history[index]) {
                setAnalysisData(null);
                setStatus("idle");
            }
        }
    };

    if (isLocked) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center min-h-[500px] text-center p-12 glass-card rounded-[3.5rem] border-white/5 relative overflow-hidden bg-slate-950/40 backdrop-blur-3xl">
                <div className="absolute top-0 right-0 p-24 opacity-[0.03] scale-150 rotate-12">
                   <Lock size={150} className="text-cyan-400" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-10 h-20 w-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-cyan-400/60 shadow-inner">
                        <Lock size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-5 font-[family-name:var(--font-outfit)] uppercase tracking-tight">Profile Setup Required</h3>
                    <p className="text-slate-500 font-light max-w-md mb-12 text-lg font-[family-name:var(--font-inter)] leading-relaxed">
                        To unlock automated insights, Yukti requires your baseline profile. Complete the 15-point assessment to view the demo analysis.
                    </p>
                    <button
                        onClick={onNavigate}
                        className="flex items-center gap-4 bg-white text-slate-950 px-12 py-6 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all shadow-xl active:scale-95"
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-2">
                <div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white font-[family-name:var(--font-outfit)] tracking-tight uppercase">Health View</h2>
                    <p className="text-sm text-slate-500 font-light font-[family-name:var(--font-inter)] tracking-wide mt-2">AI-assisted synthesis of longitudinal health records and laboratory scans.</p>
                </div>
                <div className="flex items-center gap-4 data-label !text-cyan-400 bg-white/[0.03] px-6 py-4 rounded-2xl border border-white/5">
                    <ShieldCheck size={20} className="text-cyan-400/60" strokeWidth={1.5} />
                    <span>Cross-Sync: {history.length} Records</span>
                </div>
            </div>

            <HealthTrendChart />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: Upload Section */}
                <div className="lg:col-span-4 space-y-8">
                    <div
                        {...getRootProps()}
                        className={`glass-card rounded-[3rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[18rem] relative overflow-hidden border-dashed ${isDragActive
                            ? "border-cyan-500 bg-cyan-500/5"
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
                                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400/60 mb-5 border border-white/5 shadow-inner">
                                    <FileText size={28} strokeWidth={1.5} />
                                </div>
                                <p className="text-white font-bold tracking-tight px-4 truncate w-full font-[family-name:var(--font-outfit)]">{file.name}</p>
                                <p className="data-label !text-slate-500 mt-3">{(file.size / 1024 / 1024).toFixed(2)} MB // STATUS: READY</p>
                            </div>
                        ) : (
                            <>
                                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 text-slate-600 flex items-center justify-center mb-6 group-hover:text-cyan-400/60 transition-all">
                                    <UploadCloud size={32} strokeWidth={1.5} />
                                </div>
                                <p className="text-white font-bold tracking-tight mb-2 uppercase text-sm font-[family-name:var(--font-outfit)]">Select Source</p>
                                <p className="text-[10px] text-slate-500 data-label">Labs / Scans / Records</p>
                            </>
                        )}
                    </div>

                    {file && status !== "analyzing" && status !== "done" && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={analyzeReport}
                            className="w-full py-6 bg-white text-slate-950 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] flex items-center justify-center gap-4 active:scale-95 shadow-xl hover:bg-cyan-400 font-[family-name:var(--font-outfit)]"
                        >
                            <Brain size={18} strokeWidth={2.5} />
                            View Summary Insights
                        </motion.button>
                    )}

                    {status === "analyzing" && (
                        <div className="w-full p-10 glass-card rounded-[2rem] border-white/5 flex flex-col items-center justify-center gap-6 text-center">
                            <div className="relative h-14 w-14">
                                <Loader2 size={56} className="animate-spin text-cyan-500/40" strokeWidth={1.5} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity size={20} className="text-cyan-400" strokeWidth={1.5} />
                                </div>
                            </div>
                            <div>
                                <p className="text-white font-bold tracking-wider font-[family-name:var(--font-outfit)] uppercase text-xs">Syncing AI Context...</p>
                                <p className="data-label !text-slate-600 mt-2">Comparing {history.length} Datasets</p>
                            </div>
                        </div>
                    )}

                    {/* HISTORY LIST */}
                    {history.length > 0 && (
                        <div className="glass-card rounded-[2.5rem] p-8 border-white/5">
                            <h4 className="data-label !text-slate-600 mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-3"><Clock size={14} strokeWidth={1.5} /> Archival Memory</span>
                                <div className="h-1 w-1 rounded-full bg-cyan-400/40" />
                            </h4>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                                {history.map((h, i) => (
                                    <div
                                        key={i}
                                        className={`group relative p-5 rounded-2xl border transition-all ${analysisData === h 
                                            ? "bg-white/[0.03] border-cyan-500/30" 
                                            : "glass-card border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                                            }`}
                                        onClick={() => {
                                            setAnalysisData(h);
                                            setStatus("done");
                                            setActiveTab("current");
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-white text-[13px] font-[family-name:var(--font-outfit)] uppercase tracking-tight">{h.meta?.reportDate || "Recent Sync"}</p>
                                                <p className="data-label !text-slate-600 !text-[8px] mt-1.5">{h.meta?.reportType || h.docType || "Medical Node"}</p>
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
                                const historyContext = history.map(h => ({ date: h.meta?.reportDate, summary: h.summary, biomarkers: h.biomarkers }));
                                formData.append("historyContext", JSON.stringify(historyContext));
                                const response = await fetch("/api/analyze", { method: "POST", body: formData });
                                const data = await response.json();
                                if (response.ok) {
                                    setAnalysisData({ ...data.result, isSummary: true });
                                    setStatus("done");
                                    localStorage.setItem("yukti_latest_summary", JSON.stringify({ ...data.result, isSummary: true }));
                                } else {
                                    setAnalysisData({ error: "Holistic sync failed." });
                                    setStatus("error");
                                }
                            } catch (e) { setStatus("error"); }
                        }}
                        className="w-full py-5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] text-slate-400 hover:text-white rounded-2xl data-label !text-[9px] transition-all flex items-center justify-center gap-4 active:scale-95"
                    >
                        <Brain size={18} className="text-cyan-400 opacity-60" strokeWidth={1.5} />
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
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                    <ShieldCheck size={180} className="text-cyan-400" />
                                </div>

                                  {analysisData.isSummary ? (
                                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar relative z-10">
                                        <div className="flex items-center gap-8 mb-14">
                                            <div className="h-20 w-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400/60 shadow-inner">
                                                <Brain size={40} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <h3 className="text-4xl font-bold text-white tracking-tight uppercase font-[family-name:var(--font-outfit)]">{analysisData.title || "Health Summary"}</h3>
                                                <div className="data-label !text-cyan-400 mt-3 flex items-center gap-3">
                                                     <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                     Health Trajectory Sync Active
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            <div className="glass-card p-10 rounded-[3rem] bg-white/[0.02] border-white/5">
                                                <h4 className="data-label !text-slate-600 mb-6 flex items-center gap-3">
                                                    <Activity size={20} className="text-cyan-400 opacity-60" strokeWidth={1.5} /> Physiological Trajectory
                                                </h4>
                                                <div className="text-slate-400 text-lg leading-relaxed font-light font-[family-name:var(--font-inter)] prose prose-invert max-w-none">
                                                    <ReactMarkdown>{analysisData.trendAnalysis}</ReactMarkdown>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="glass-card p-10 rounded-[3rem] bg-white/[0.01] border-white/5">
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

                                                <div className="glass-card p-10 rounded-[3rem] bg-cyan-500/[0.03] border-cyan-500/10 shadow-3xl shadow-cyan-500/5">
                                                    <h4 className="data-label !text-cyan-400 mb-6 flex items-center gap-3">
                                                        <ShieldCheck size={20} strokeWidth={1.5} /> Care Focus
                                                    </h4>
                                                    <div className="text-white text-xl font-semibold tracking-tight leading-relaxed font-[family-name:var(--font-outfit)]">
                                                       {analysisData.recommendation}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* SINGLE REPORT VIEW */}
                                        <div className="p-12 border-b border-white/5 relative bg-white/[0.02] z-10">
                                            <div className="flex items-start justify-between mb-8">
                                                <div>
                                                    <span className={`data-label !text-[8px] px-5 py-2 rounded-full border border-white/10 bg-white/5 ${analysisData.meta?.reportType?.includes('Rx') ? 'text-blue-400' : 'text-cyan-400'}`}>
                                                        NODE ID: {analysisData.meta?.reportType || analysisData.docType || "DATA_STREAM"}
                                                    </span>
                                                    <h3 className="text-5xl font-bold text-white tracking-tight mt-6 uppercase font-[family-name:var(--font-outfit)]">Report Summary</h3>
                                                </div>
                                                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center data-label !text-cyan-400 shadow-inner">Y</div>
                                            </div>
                                            <p className="text-xl text-slate-400 font-light font-[family-name:var(--font-inter)] leading-relaxed max-w-4xl">{analysisData.summary}</p>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-14 z-10">
                                            {/* Biomarker Table */}
                                            {analysisData.biomarkers && analysisData.biomarkers.length > 0 && (
                                                <div>
                                                    <h4 className="data-label !text-slate-600 mb-8 flex items-center gap-3">
                                                        <Activity size={20} className="text-cyan-400 opacity-60" strokeWidth={1.5} /> Extracted Bio-Signatures
                                                    </h4>
                                                    <div className="overflow-hidden rounded-[3rem] border border-white/5 bg-slate-950/40">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="bg-white/5 border-b border-white/5 font-[family-name:var(--font-outfit)]">
                                                                    <th className="px-8 py-6 data-label !text-slate-500">Parameter</th>
                                                                    <th className="px-8 py-6 data-label !text-slate-500">Metric</th>
                                                                    <th className="px-8 py-6 data-label !text-slate-500 text-center">Reference</th>
                                                                    <th className="px-8 py-6 data-label !text-slate-500 text-right">Trajectory</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5">
                                                                {analysisData.biomarkers.map((b: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                                                        <td className="px-8 py-6 font-bold text-white text-[13px] font-[family-name:var(--font-outfit)] uppercase tracking-tight">{b.name}</td>
                                                                        <td className="px-8 py-6">
                                                                            <span className="text-white font-bold text-xl font-[family-name:var(--font-outfit)]">{b.value}</span>
                                                                            <span className="data-label !text-slate-600 ml-2">{b.unit}</span>
                                                                        </td>
                                                                        <td className="px-8 py-6 text-center">
                                                                            <span className={`px-5 py-2 rounded-full data-label !text-[8px] border ${b.status?.toLowerCase().includes('high') || b.status?.toLowerCase().includes('low') || b.status?.toLowerCase().includes('abnormal')
                                                                                ? "text-red-400 border-red-500/20 bg-red-500/[0.02]"
                                                                                : "text-cyan-400 border-cyan-500/20 bg-cyan-500/[0.02]"
                                                                                }`}>
                                                                                {b.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-8 py-6 text-right">
                                                                            {b.trend?.toLowerCase().includes('ris') || b.trend?.toLowerCase().includes('fall') ? (
                                                                                <span className="inline-flex items-center gap-3 text-amber-500 data-label !text-[8px] opacity-80">
                                                                                    <Milestone size={14} className={b.trend.includes('ris') ? 'rotate-[-45deg]' : 'rotate-[45deg]'} strokeWidth={1.5} /> {b.trend}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="data-label !text-slate-700 !text-[8px]">{b.trend || "-"}</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Analysis Markdown */}
                                            <div className="glass-card p-12 rounded-[3.5rem] bg-white/[0.02] border-white/5">
                                                <h4 className="data-label !text-slate-600 mb-8 uppercase tracking-[0.3em]">AI Insight Stream</h4>
                                                <div className="prose prose-invert prose-lg max-w-none text-slate-400 font-light font-[family-name:var(--font-inter)] leading-relaxed">
                                                    <ReactMarkdown>{analysisData.analysis}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-10 bg-white/[0.02] border-t border-white/5 text-center relative z-10 overflow-hidden">
                                           <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                                               <AlertCircle size={100} className="text-amber-600" />
                                           </div>
                                            <p className="data-label !text-amber-600 !tracking-[0.5em] flex items-center justify-center gap-4">
                                                <AlertCircle size={14} strokeWidth={2} /> Protocol Disclaimer // Professional Review Required
                                            </p>
                                            <p className="text-slate-600 text-[11px] font-light font-[family-name:var(--font-inter)] mt-3 max-w-2xl mx-auto uppercase tracking-tighter">
                                                {analysisData.disclaimer || "Health insights are computational decision support tools for demonstration. Consult your doctor."}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 glass-card rounded-[4rem] border-white/5 bg-slate-950/20 backdrop-blur-3xl p-16 text-center group">
                                <div className="animate-float mb-12">
                                    <div className="h-28 w-28 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-800 group-hover:text-cyan-400/60 group-hover:border-cyan-500/20 transition-all duration-1000 shadow-3xl shadow-black">
                                        <Brain size={80} strokeWidth={1} className="opacity-10 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-tight uppercase mb-5 font-[family-name:var(--font-outfit)]">Digital Health Vault</h3>
                                <p className="text-slate-600 font-light max-w-md leading-relaxed text-lg font-[family-name:var(--font-inter)]">
                                    Establish your health history by uploading laboratory scans. Yukti reviews trends across your biological timeline.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
