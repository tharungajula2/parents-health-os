"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Phone, Video, ArrowLeft, MoreVertical, Paperclip, Smile, 
  Mic, CheckCheck, Clock, ShieldCheck, AlertTriangle, Info, 
  RefreshCw, Languages, Activity, Check, SendIcon
} from "lucide-react";
import { useParentsAuth } from "../lib/supabase/context";
import { createClient } from "../lib/supabase/client";

interface TemplateItem {
  type: string;
  name: string;
  desc: string;
  category: "routine" | "vitals" | "compliance" | "consent" | "report";
}

const TEMPLATE_TYPES: TemplateItem[] = [
  {
    type: "morning_checkin",
    name: "Morning Check-In",
    desc: "Greet parents in the morning and inquire about warm water + pill compliance.",
    category: "routine"
  },
  {
    type: "bp_reminder",
    name: "BP Measurement Request",
    desc: "Prompt parents to sit comfortably and record their blood pressure readings.",
    category: "vitals"
  },
  {
    type: "med_reminder",
    name: "Medication Checklist",
    desc: "Send reminders listing daily chronic medications and post-meal timing.",
    category: "compliance"
  },
  {
    type: "consent_request",
    name: "DPDP Consent Request",
    desc: "Send formal digital consent request under India DPDP Act 2023.",
    category: "consent"
  },
  {
    type: "weekly_summary_child",
    name: "Weekly Digest Summary",
    desc: "Overview of medication compliance adherence and vitals stability.",
    category: "report"
  }
];

export function WhatsAppDemo() {
  const { 
    whatsappMessages, 
    activeParent, 
    refreshData,
    isSupabaseEnabled,
    profile
  } = useParentsAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [checkingConsent, setCheckingConsent] = useState(false);
  const [consentGranted, setConsentGranted] = useState<boolean>(true);
  const [consentError, setConsentError] = useState<string | null>(null);

  // Oversight state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("morning_checkin");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "te">("en");
  const [customMedication, setCustomMedication] = useState("Metformin 500mg");
  const [customTiming, setCustomTiming] = useState("After breakfast");
  const [adherenceRate, setAdherenceRate] = useState("95");

  // Notification overlays
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages state from Supabase context
  useEffect(() => {
    if (whatsappMessages && whatsappMessages.length > 0) {
      setMessages(whatsappMessages);
    } else {
      // Local fallback standard dialog if no Supabase records exist
      setMessages([
        {
          id: "msg-fallback-1",
          direction: "outgoing",
          body: "Namaste! 🙏\nThis is Anaya from Parents Health OS. Hope you slept well. Have you taken your morning warm water and medicines? Let me know! 🌟",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          status: "read"
        },
        {
          id: "msg-fallback-2",
          direction: "incoming",
          body: "Yes, just completed breakfast and took Metformin.",
          created_at: new Date(Date.now() - 1800000).toISOString(),
          status: "simulated"
        }
      ]);
    }
  }, [whatsappMessages]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Query consent records on active parent change
  useEffect(() => {
    checkParentConsent();
  }, [activeParent]);

  const checkParentConsent = async () => {
    if (!activeParent) return;
    if (!isSupabaseEnabled) {
      setConsentGranted(true);
      setConsentError(null);
      return;
    }

    setCheckingConsent(true);
    try {
      const client = createClient();
      if (client) {
        const { data, error } = await client
          .from("consents")
          .select("is_granted")
          .eq("parent_id", activeParent.id)
          .eq("consent_type", "geriatric_health_data_processing")
          .eq("is_granted", true);

        if (error) throw error;
        setConsentGranted(data && data.length > 0);
        setConsentError(null);
      }
    } catch (err: any) {
      console.error("[Consent Check Error]", err);
      setConsentError(err.message || "Failed to check consent status.");
    } finally {
      setCheckingConsent(false);
    }
  };

  const handleDispatchTemplate = async () => {
    if (!activeParent) return;
    setIsSending(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Build placeholders for injection
    const placeholders: Record<string, string> = {
      childName: profile?.full_name || "your child",
      medicationDetails: customMedication,
      timing: customTiming,
      adherence: adherenceRate
    };

    // Build template key (e.g. morning_checkin_en)
    const templateKey = `${selectedTemplate}_${selectedLanguage}`;

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: activeParent.id,
          templateKey,
          placeholders
        })
      });

      const resData = await response.json();

      if (response.status === 403 && resData.consentRequired) {
        setErrorMessage(resData.error || "Blocked: Consent required.");
        setConsentGranted(false);
      } else if (!response.ok || !resData.success) {
        setErrorMessage(resData.error || "Failed to send template message.");
      } else {
        setSuccessMessage(`Successfully dispatched template! Output preview: "${resData.messageText}"`);
        await refreshData();
        await checkParentConsent();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Failed to dispatch message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSimulateReply = async (customText?: string) => {
    if (!activeParent) return;
    const textToSimulate = customText || inputValue;
    if (!textToSimulate.trim()) return;

    setIsSending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/whatsapp/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: activeParent.id,
          body: textToSimulate
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        setErrorMessage(resData.error || "Failed to simulate incoming message.");
      } else {
        if (!customText) setInputValue("");
        await refreshData();
        await checkParentConsent();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Failed to simulate message.");
    } finally {
      setIsSending(false);
    }
  };

  const currentParentName = activeParent?.name || "Geriatric Parent";
  const currentParentPhone = activeParent?.phone || "+91 98480 22338";
  const currentParentLanguage = activeParent?.language || "English";

  return (
    <div className="space-y-12">
      {/* HEADER SECTION */}
      <div className="glass-card p-8 md:p-10 rounded-[3rem] border-[#e2ded5] relative overflow-hidden bg-white/70 backdrop-blur-md shadow-sm">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Activity size={180} className="text-[#0E5E5A]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="data-label text-[#E05E1B] !text-[9px] !tracking-[0.3em] uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Anaya WhatsApp Gateway</span>
            <h1 className="text-3xl md:text-5xl font-black text-[#0E5E5A] font-[family-name:var(--font-outfit)] tracking-tight mt-4 uppercase leading-none">WhatsApp oversight</h1>
            <p className="text-slate-600 text-sm font-light mt-3 max-w-2xl font-[family-name:var(--font-inter)] leading-relaxed">
              Test and monitor compliance check-ins. Trigger scheduled clinical templates, log vital readings, check Indian DPDP Act 2023 consent records, and simulate parent responses interactively.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-[#E5F5F0] border border-teal-100 rounded-2xl px-5 py-3 self-start md:self-auto shrink-0 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="data-label !text-emerald-700 !text-[8px] !tracking-[0.2em] font-black uppercase">Parents Health OS Sandbox // Simulated Data Only</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC ERROR / SUCCESS TOASTS */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-[family-name:var(--font-inter)] flex items-start gap-4 shadow-sm"
          >
            <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold uppercase tracking-wider block mb-1 text-[10px]">Action Dispatched Successfully</strong>
              <p className="font-light">{successMessage}</p>
            </div>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-[family-name:var(--font-inter)] flex items-start gap-4 shadow-sm"
          >
            <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold uppercase tracking-wider block mb-1 text-[10px]">System Security Guardrail Triggered</strong>
              <p className="font-light">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">
        {/* LEFT COLUMN: OVERSIGHT CONTROL PANEL */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* PARENT & CONSENT CARD */}
          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border-[#e2ded5] space-y-6 bg-white/70 shadow-sm relative overflow-hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>ACTIVE PARENT COGNITION</span>
              <button 
                onClick={checkParentConsent}
                disabled={checkingConsent}
                className="text-teal-600 hover:text-teal-800 flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw size={10} className={checkingConsent ? "animate-spin" : ""} /> Sync Consent
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-1">
                <p className="data-label !text-slate-450 uppercase !text-[9px]">Target Parent</p>
                <p className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] leading-tight">{currentParentName}</p>
                <p className="text-xs text-slate-500 font-light font-[family-name:var(--font-inter)]">{currentParentPhone} ({currentParentLanguage})</p>
              </div>

              {/* CONSENT BADGE */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-center gap-3">
                  {consentGranted ? (
                    <>
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest font-[family-name:var(--font-outfit)]">DPDP OPT-IN VALID</span>
                        <p className="text-[8px] text-slate-450 font-light font-[family-name:var(--font-inter)] mt-0.5">Explicit consent active</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-inner animate-pulse">
                        <AlertTriangle size={12} strokeWidth={2.5} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest font-[family-name:var(--font-outfit)]">CONSENT BLOCKED</span>
                        <p className="text-[8px] text-rose-500 font-light font-[family-name:var(--font-inter)] mt-0.5">Reminders disabled safely</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* SAFE DRI-RUN BRIDGE SETTINGS */}
            <div className="bg-[#FAF9F6] border border-[#e2ded5] rounded-2xl p-4 flex items-center gap-4 text-xs font-[family-name:var(--font-inter)] shadow-inner">
              <Info size={16} strokeWidth={2} className="text-[#0E5E5A] shrink-0" />
              <p className="text-slate-600 font-light leading-relaxed !text-[11px]">
                <strong>Safe Dry-Run Mode is Active.</strong> Messages are logged in the database and shown on this preview screen without charging Meta or blasting your parent's real phone by default.
              </p>
            </div>
          </div>

          {/* TEMPLATE SCHEDULER */}
          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border-[#e2ded5] space-y-6 bg-white/70 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>CLINICAL TEMPLATE REGISTRY</span>
              <span className="data-label !text-teal-600 !text-[8px] !tracking-[0.1em] uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-100">Meta Verified</span>
            </h3>

            {/* Multi-lingual Language Selector */}
            <div className="flex items-center justify-between bg-[#FAF9F6] p-3 rounded-2xl border border-[#e2ded5]">
              <div className="flex items-center gap-2 text-xs font-[family-name:var(--font-inter)] text-slate-600">
                <Languages size={14} className="text-[#0E5E5A]" />
                <span className="font-semibold text-[#0E5E5A]">Select Dispatch Language:</span>
              </div>
              <div className="flex gap-2">
                {(["en", "hi", "te"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                      selectedLanguage === lang 
                        ? "bg-[#0E5E5A] text-white shadow-md scale-105" 
                        : "bg-white border border-[#e2ded5] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {lang === "en" ? "EN" : lang === "hi" ? "HI (हिन्दी)" : "TE (తెలుగు)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEMPLATE_TYPES.map((t) => (
                <div
                  key={t.type}
                  onClick={() => setSelectedTemplate(t.type)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    selectedTemplate === t.type 
                      ? "bg-[#0E5E5A]/5 border-[#0E5E5A] shadow-inner" 
                      : "bg-white border-[#e2ded5] hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#E05E1B] bg-orange-50 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                    {selectedTemplate === t.type && (
                      <div className="h-2 w-2 rounded-full bg-[#E05E1B]" />
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 font-[family-name:var(--font-outfit)] leading-tight">{t.name}</h4>
                  <p className="text-[10px] text-slate-500 font-light mt-1 font-[family-name:var(--font-inter)] leading-normal">{t.desc}</p>
                </div>
              ))}
            </div>

            {/* Dynamic Placeholder Form parameters depending on selected template */}
            {selectedTemplate === "med_reminder" && (
              <div className="bg-[#FAF9F6] border border-[#e2ded5] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="data-label !text-slate-450 uppercase !text-[8px] block">Medication Details</label>
                  <input
                    type="text"
                    value={customMedication}
                    onChange={(e) => setCustomMedication(e.target.value)}
                    placeholder="e.g. Glycomet 500mg, Metformin"
                    className="w-full bg-white border border-[#e2ded5] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-teal-650 text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="data-label !text-slate-450 uppercase !text-[8px] block">Instructions / Timing</label>
                  <input
                    type="text"
                    value={customTiming}
                    onChange={(e) => setCustomTiming(e.target.value)}
                    placeholder="e.g. Post-Meals"
                    className="w-full bg-white border border-[#e2ded5] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-teal-650 text-slate-700"
                  />
                </div>
              </div>
            )}

            {selectedTemplate === "weekly_summary_child" && (
              <div className="bg-[#FAF9F6] border border-[#e2ded5] rounded-2xl p-4">
                <div className="space-y-1.5 max-w-sm">
                  <label className="data-label !text-slate-450 uppercase !text-[8px] block">Weekly Medication Adherence Rate (%)</label>
                  <input
                    type="number"
                    value={adherenceRate}
                    onChange={(e) => setAdherenceRate(e.target.value)}
                    placeholder="95"
                    min="0"
                    max="100"
                    className="w-24 bg-white border border-[#e2ded5] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-teal-650 text-slate-700"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleDispatchTemplate}
              disabled={isSending || !activeParent}
              className="w-full py-4.5 bg-[#0E5E5A] hover:bg-[#0A4B48] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center justify-center gap-3 disabled:opacity-50 font-[family-name:var(--font-outfit)]"
            >
              {isSending ? (
                <span>DISPATCHING Reminders...</span>
              ) : (
                <>
                  <span>Dispatch WhatsApp Template ({selectedLanguage.toUpperCase()})</span>
                  <SendIcon size={12} strokeWidth={2} />
                </>
              )}
            </button>
          </div>

          {/* PARENT REPLY SIMULATOR */}
          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border-[#e2ded5] space-y-6 bg-white/70 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">
              SIMULATE PARENT KEYWORD INTAKE
            </h3>

            <p className="text-[11px] text-slate-500 font-light font-[family-name:var(--font-inter)] leading-normal mt-1">
              Select one of the pre-configured compliance logs triggers to see how Anaya logs daily compliance parameters dynamically inside the database, or write a custom dialogue response.
            </p>

            {/* Quick-reply Pill simulation shortcuts */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleSimulateReply("YES")}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                Simulate DPDP Opt-In ("YES")
              </button>
              <button 
                onClick={() => handleSimulateReply("Taken")}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-250 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                Simulate Pill Taken ("Taken")
              </button>
              <button 
                onClick={() => handleSimulateReply("120/80")}
                className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-250 text-orange-750 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                Simulate Vitals BP ("120/80")
              </button>
              <button 
                onClick={() => handleSimulateReply("STOP")}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-700 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                Simulate Opt-Out ("STOP")
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SMARTPHONE INTERACTIVE EMULATOR */}
        <div className="lg:col-span-5 flex justify-center">
          
          {/* PHONE BODY */}
          <div className="w-full max-w-[370px] h-[720px] bg-slate-900 rounded-[3.5rem] p-3 shadow-2xl relative border border-slate-800 ring-[6px] ring-slate-950/20 flex flex-col">
            
            {/* Dynamic island / Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-30 shadow-inner"></div>

            {/* SCREEN */}
            <div className="w-full h-full bg-[#E5DDD5] rounded-[2.8rem] overflow-hidden flex flex-col relative border border-slate-700/50">
              
              {/* WHATSAPP DOT BACKDROP */}
              <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none z-0"></div>

              {/* ACTIVE PREVIEW BRIDGE BADGE */}
              <div className="absolute top-22 left-0 right-0 z-20 flex justify-center pointer-events-none">
                <span className="text-[7px] font-black uppercase tracking-[0.3em] bg-orange-500 text-white px-3 py-1 rounded-full shadow-[0_2px_10px_rgba(224,94,27,0.3)]">
                  SIMULATOR // PARENT DEVICE PERSPECTIVE
                </span>
              </div>

              {/* TELEPHONE STATUS HEADER */}
              <div className="bg-[#0E5E5A] text-white p-5 pt-11 flex items-center justify-between shadow-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <ArrowLeft size={16} strokeWidth={2} className="cursor-pointer text-teal-100 hover:text-white" />
                  <div className="relative">
                    <div className="h-10 w-10 bg-teal-50 text-[#0E5E5A] rounded-full flex items-center justify-center font-black font-[family-name:var(--font-outfit)] shadow-md text-sm border border-teal-100">
                      AN
                    </div>
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-[#0E5E5A] shadow-inner"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[12px] tracking-tight leading-tight font-[family-name:var(--font-outfit)]">Anaya (Care Bot)</h3>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-300 animate-pulse"></span>
                      <p className="text-[7px] text-teal-100 font-light tracking-wide font-mono uppercase">Online</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-teal-100">
                  <Video size={15} className="hover:text-white cursor-pointer" />
                  <Phone size={15} className="hover:text-white cursor-pointer" />
                  <MoreVertical size={15} className="hover:text-white cursor-pointer" />
                </div>
              </div>

              {/* MESSAGES FEED AREA */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scrollbar-hide z-0">
                {messages.map((msg) => {
                  const isIncoming = msg.direction === "incoming";
                  const formattedTime = msg.created_at 
                    ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Now";
                    
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      key={msg.id}
                      className={`flex flex-col ${isIncoming ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm relative border font-[family-name:var(--font-inter)] ${
                          isIncoming
                            ? "bg-[#D9FDD3] border-[#c0eeb6] text-slate-800 rounded-tr-none text-[12px] font-normal leading-relaxed"
                            : "bg-white border-[#e2ded5] text-slate-800 rounded-tl-none text-[12px] font-normal leading-relaxed"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-2 opacity-50 text-[8px] font-mono select-none">
                          <span>{formattedTime}</span>
                          {isIncoming ? (
                            <CheckCheck size={11} strokeWidth={2.5} className="text-emerald-600" />
                          ) : (
                            <Clock size={10} className="text-slate-400" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {isSending && (
                  <div className="flex items-center gap-1.5 p-3 rounded-full bg-white border border-[#e2ded5] w-fit ml-2 z-10 shadow-sm">
                    <div className="h-1.5 w-1.5 bg-[#0E5E5A]/60 rounded-full animate-bounce delay-75"></div>
                    <div className="h-1.5 w-1.5 bg-[#0E5E5A]/85 rounded-full animate-bounce delay-150"></div>
                    <div className="h-1.5 w-1.5 bg-[#0E5E5A] rounded-full animate-bounce delay-300"></div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* COMPOSER FIELD */}
              <div className="absolute bottom-5 w-[92%] left-[4%] bg-white p-2 flex items-center gap-3 z-10 rounded-[2rem] border border-[#d1cdc1] shadow-md">
                <div className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
                  <Smile size={18} strokeWidth={1.5} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSimulateReply()}
                    placeholder="Type simulated reply as Parent..."
                    disabled={isSending}
                    className="w-full bg-transparent text-xs outline-none text-slate-800 placeholder:text-slate-400 font-normal font-[family-name:var(--font-inter)]"
                  />
                </div>

                <div className="flex gap-1.5 shrink-0 items-center">
                  <div className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                    <Paperclip size={16} strokeWidth={1.5} />
                  </div>
                  
                  {inputValue.trim() ? (
                    <button 
                      onClick={() => handleSimulateReply()} 
                      disabled={isSending}
                      className="p-2.5 bg-[#0E5E5A] text-white rounded-full shadow hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send size={12} strokeWidth={2.5} className="translate-x-0.5" />
                    </button>
                  ) : (
                    <div className="p-2.5 bg-slate-50 text-slate-405 rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
                      <Mic size={12} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>

              {/* Screen gloss effect */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-15" />
            </div>

            {/* INDICATOR */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-white/25 rounded-full"></div>
          </div>

        </div>
      </div>
    </div>
  );
}
