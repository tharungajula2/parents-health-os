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
            <div className="w-full h-full flex flex-col items-center justify-center min-h-[400px] text-center p-12 glass-card rounded-[3rem] border-white/5 relative overflow-hidden bg-slate-950/40 backdrop-blur-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 scale-150 rotate-12">
                   <Lock size={120} className="text-cyan-400" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-8 h-20 w-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-cyan-400 shadow-inner">
                        <Lock size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Clinical Context Required</h3>
                    <p className="text-slate-400 max-w-md mb-10 text-lg font-medium leading-relaxed">
                        To ensure safe and accurate AI analysis, Yukti requires your baseline profile. Complete the assessment to unlock full diagnostics.
                    </p>
                    <button
                        onClick={onNavigate}
                        className="flex items-center gap-3 bg-cyan-500 text-slate-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                        Initialize Engine <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-10 pb-20">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">Diagnostics & Trends</h2>
                    <p className="text-sm text-slate-400 font-medium tracking-tight mt-1">Holistic clinical analysis of medical documents and lab reports.</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-white/5 px-5 py-3 rounded-2xl border border-white/5">
                    <ShieldCheck size={18} className="text-cyan-400" />
                    <span>Cross-Document Context: {history.length} Files</span>
                </div>
            </div>

            <HealthTrendChart />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: Upload Section */}
                <div className="lg:col-span-4 space-y-6">
                    <div
                        {...getRootProps()}
                        className={`glass-card rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[16rem] relative overflow-hidden border-dashed ${isDragActive
                            ? "border-cyan-500 bg-cyan-500/5"
                            : "border-white/10 hover:border-cyan-500/30 hover:bg-white/5"
                            }`}
                    >
                        <input {...getInputProps()} />
                        {preview ? (
                            <div className="relative w-full h-full flex flex-col items-center justify-center z-10 group">
                                <img src={preview} alt="Preview" className="max-h-48 rounded-2xl object-contain shadow-2xl group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                     <UploadCloud className="text-white" size={32} />
                                </div>
                            </div>
                        ) : file ? (
                            <div className="flex flex-col items-center z-10">
                                <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/20">
                                    <FileText size={32} />
                                </div>
                                <p className="text-white font-bold tracking-tight px-4 truncate w-full">{file.name}</p>
                                <p className="text-[10px] text-slate-500 font-black uppercase mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB // READY</p>
                            </div>
                        ) : (
                            <>
                                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center mb-6 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-all">
                                    <UploadCloud size={32} />
                                </div>
                                <p className="text-white font-bold tracking-tight mb-1">Select Document</p>
                                <p className="text-xs text-slate-500 font-medium tracking-tight">PDFs, Reports, Scans</p>
                            </>
                        )}
                    </div>

                    {file && status !== "analyzing" && status !== "done" && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={analyzeReport}
                            className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/20 hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-95 transition-all"
                        >
                            <Brain size={18} />
                            Launch Yukon AI
                        </motion.button>
                    )}

                    {status === "analyzing" && (
                        <div className="w-full p-8 glass-card rounded-2xl border-white/10 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="relative h-12 w-12">
                                <Loader2 size={48} className="animate-spin text-cyan-500" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity size={16} className="text-cyan-400/50" />
                                </div>
                            </div>
                            <div>
                                <p className="text-white font-bold tracking-tight">Syncing Clinical Context...</p>
                                <p className="text-[10px] text-slate-500 font-black uppercase mt-1">Comparing {history.length} Records</p>
                            </div>
                        </div>
                    )}

                    {/* HISTORY LIST */}
                    {history.length > 0 && (
                        <div className="glass-card rounded-[2rem] p-6 border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Clock size={12} /> Archival Memory</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/50" />
                            </h4>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {history.map((h, i) => (
                                    <div
                                        key={i}
                                        className={`group relative p-4 rounded-xl border cursor-pointer transition-all ${analysisData === h 
                                            ? "bg-white/5 border-cyan-500/40 shadow-inner" 
                                            : "glass-card border-white/5 hover:border-white/10 hover:bg-white/5"
                                            }`}
                                        onClick={() => {
                                            setAnalysisData(h);
                                            setStatus("done");
                                            setActiveTab("current");
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-white text-sm tracking-tight">{h.meta?.reportDate || "Recent Scan"}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{h.meta?.reportType || h.docType || "Medical Data"}</p>
                                            </div>
                                            <button
                                                onClick={(e) => deleteHistoryItem(i, e)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={12} />
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
                        className="w-full py-4 bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/20 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <Brain size={16} className="text-cyan-400" />
                        Generate Holistic Summary
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
                                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
                                        <div className="flex items-center gap-6 mb-12">
                                            <div className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                                                <Brain size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{analysisData.title || "Holistic Profile"}</h3>
                                                <div className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                                     <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                     Deep Phenotype Synthesis
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                            <div className="glass-card p-8 rounded-[2rem] bg-white/5 border-white/10">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                    <Activity size={16} className="text-cyan-400" /> Physiological Trajectory
                                                </h4>
                                                <div className="text-slate-300 text-lg leading-relaxed font-medium prose prose-invert max-w-none">
                                                    <ReactMarkdown>{analysisData.trendAnalysis}</ReactMarkdown>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="glass-card p-8 rounded-[2rem] bg-slate-900/40 border-white/10">
                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                        <FileSearch size={16} className="text-amber-400" /> Priority Identified
                                                    </h4>
                                                    <ul className="space-y-4">
                                                        {analysisData.keyFindings?.map((f: string, i: number) => (
                                                            <li key={i} className="flex gap-4 text-sm text-slate-400 font-bold leading-snug">
                                                                <div className="h-2 w-2 rounded-full bg-amber-400/60 mt-1.5 shrink-0" />
                                                                <ReactMarkdown>{f}</ReactMarkdown>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="glass-card p-8 rounded-[2rem] bg-cyan-500/10 border-cyan-500/20 shadow-2xl shadow-cyan-500/5">
                                                    <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                        <ShieldCheck size={16} /> Clinical Recommendation
                                                    </h4>
                                                    <div className="text-white text-xl font-black tracking-tight leading-tight uppercase">
                                                       {analysisData.recommendation}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* SINGLE REPORT VIEW */}
                                        <div className="p-10 border-b border-white/5 relative bg-white/5 z-10">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border border-white/10 uppercase tracking-widest ${analysisData.meta?.reportType?.includes('Rx') ? 'bg-blue-500/10 text-blue-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                                        {analysisData.meta?.reportType || analysisData.docType || "Medical Document"}
                                                    </span>
                                                    <h3 className="text-4xl font-black text-white tracking-tighter mt-4 uppercase">AI Diagnostic Audit</h3>
                                                </div>
                                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-black text-cyan-400 shadow-xl">Y</div>
                                            </div>
                                            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-3xl">{analysisData.summary}</p>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12 z-10">
                                            {/* Biomarker Table */}
                                            {analysisData.biomarkers && analysisData.biomarkers.length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                        <Activity size={16} className="text-cyan-400" /> Extracted Bio-Signatures
                                                    </h4>
                                                    <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="bg-white/5 border-b border-white/5">
                                                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Parameter</th>
                                                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Value</th>
                                                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Reference</th>
                                                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Trend</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5">
                                                                {analysisData.biomarkers.map((b: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                                        <td className="px-6 py-5 font-black text-white text-sm tracking-tight">{b.name}</td>
                                                                        <td className="px-6 py-5">
                                                                            <span className="text-white font-black text-lg">{b.value}</span>
                                                                            <span className="text-[10px] text-slate-500 font-black uppercase ml-1.5">{b.unit}</span>
                                                                        </td>
                                                                        <td className="px-6 py-5 text-center">
                                                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status?.toLowerCase().includes('high') || b.status?.toLowerCase().includes('low') || b.status?.toLowerCase().includes('abnormal')
                                                                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                                                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                                                                }`}>
                                                                                {b.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-5 text-right">
                                                                            {b.trend?.toLowerCase().includes('ris') || b.trend?.toLowerCase().includes('fall') ? (
                                                                                <span className="inline-flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase">
                                                                                    <Milestone size={12} className={b.trend.includes('ris') ? 'rotate-[-45deg]' : 'rotate-[45deg]'} /> {b.trend}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-slate-500 font-bold text-xs uppercase">{b.trend || "-"}</span>
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
                                            <div className="glass-card p-10 rounded-[2.5rem] bg-white/5 border-white/5">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Detailed Clinical Insight</h4>
                                                <div className="prose prose-invert prose-lg max-w-none text-slate-300 font-medium leading-relaxed">
                                                    <ReactMarkdown>{analysisData.analysis}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-slate-900/60 border-t border-white/5 text-center relative z-10 overflow-hidden">
                                           <div className="absolute top-0 right-0 p-10 opacity-5">
                                               <AlertCircle size={80} className="text-amber-500" />
                                           </div>
                                            <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                                                <AlertCircle size={14} /> Critical Disclaimer // AI Verification Required
                                            </p>
                                            <p className="text-slate-500 text-[11px] font-bold mt-2 max-w-2xl mx-auto">
                                                {analysisData.disclaimer || "Diagnostics are computational and intended for clinical decision support. Consult your primary geriatrician."}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 glass-card rounded-[3rem] border-white/5 bg-slate-900/20 backdrop-blur-3xl p-16 text-center group">
                                <div className="animate-float mb-8">
                                    <div className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-600 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-all duration-700 shadow-2xl">
                                        <Brain size={64} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-4">Central Intelligence Vault</h3>
                                <p className="text-slate-500 font-medium max-w-sm leading-relaxed text-lg">
                                    Upload reports to build your clinical lineage. Yukti analyzes longitudinal shifts across your full medical history.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
