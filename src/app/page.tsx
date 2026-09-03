"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Users,
  Home as HomeIcon,
  Activity,
  FileText,
  User,
  Plus,
  ChevronDown,
  Check,
  X,
  ShieldCheck,
  LogOut,
  ArrowRight,
  LogIn,
  Loader2,
  AlertTriangle,
  Pill,
  Calendar,
  Sparkles,
  CheckCircle2,
  Globe,
  PhoneCall,
  Clock,
  FileUp,
  BrainCircuit,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from "lucide-react";
import { useParentsAuth } from "../lib/supabase/context";
import { ToastProvider, useToast } from "../components/ui/Toast";

// Helper: Title case formatting for display names
function formatName(name?: string | null): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Format 24-hr time string
function formatTime12(timeStr?: string | null): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

// Document Type Label Formatter
function formatDocumentTypeLabel(docType?: string | null): string {
  switch (docType) {
    case "lab_report": return "Lab Report";
    case "prescription": return "Prescription";
    case "discharge_summary": return "Discharge Summary";
    case "other": return "Other";
    default: return docType || "Document";
  }
}

// Observation Category Labels
function formatObservationCategoryLabel(cat?: string | null): string {
  switch (cat) {
    case "blood_pressure": return "Blood Pressure";
    case "blood_glucose": return "Blood Glucose";
    case "weight": return "Weight";
    case "body_temperature": return "Body Temperature";
    case "pulse_oximetry": return "SpO2 (Pulse Oximetry)";
    case "heart_rate": return "Heart Rate";
    case "symptom_notes": return "Symptom / Health Note";
    default: return "Health Observation";
  }
}

// Observation Value Formatter
function formatObservationValue(obs?: any): string {
  if (!obs) return "";
  if (obs.category === "blood_pressure") {
    return `${obs.value_sys} / ${obs.value_dia} ${obs.unit || "mmHg"}`;
  }
  if (obs.category === "symptom_notes") {
    return obs.value_text || obs.notes || "Note logged";
  }
  if (obs.value_numeric !== null && obs.value_numeric !== undefined) {
    return `${obs.value_numeric} ${obs.unit || ""}`.trim();
  }
  return obs.value_text || obs.notes || "Observation recorded";
}

// Human-readable timestamp formatter
function formatObservedTime(dateIso?: string | null): string {
  if (!dateIso) return "";
  const obsDate = new Date(dateIso);
  const now = new Date();
  const isToday = obsDate.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = obsDate.toDateString() === yesterday.toDateString();

  const timeStr = obsDate.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;
  return `${obsDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}, ${timeStr}`;
}

export default function AppHome() {
  const {
    isSupabaseEnabled,
    isAuthenticated,
    isLoading,
    parents,
    onboard,
    signIn,
    signOut
  } = useParentsAuth();

  const [mode, setMode] = useState<"landing" | "login">("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Onboarding Form
  const [onboardForm, setOnboardForm] = useState({
    familyName: "",
    parentName: "",
    relationship: "Father",
    parentPhone: "",
    language: "English"
  });
  const [consentChecked, setConsentChecked] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) setAuthError(error.message || "Invalid credentials. Please try again.");
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      alert("⚠️ You must certify permission and consent to proceed.");
      return;
    }
    if (!onboardForm.familyName || !onboardForm.parentName) {
      alert("Please fill out required onboarding details.");
      return;
    }
    setAuthError("");
    setIsSubmitting(true);
    try {
      const { error } = await onboard(onboardForm);
      if (error) {
        setAuthError(error.message || "Failed to establish family care link.");
      }
    } catch (err) {
      setAuthError("An unexpected error occurred during setup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F5] relative">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="h-16 w-16 rounded-2xl bg-white border border-[#EFECE6] flex items-center justify-center text-[#0E5E5A] mb-4 shadow-sm"
        >
          <Heart size={28} className="fill-[#0E5E5A]/10 text-[#0E5E5A]" />
        </motion.div>
        <p className="text-[#0E5E5A] uppercase tracking-[0.25em] text-[10px] font-semibold">
          Parents Health OS
        </p>
      </div>
    );
  }

  // 1. Landing & Auth
  if (!isAuthenticated) {
    if (mode === "landing") {
      return (
        <div className="flex min-h-screen flex-col items-center justify-between p-6 md:p-12 bg-[#FAF8F5] relative overflow-hidden">
          <div className="w-full max-w-xl mx-auto my-auto text-center space-y-8 py-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#EFECE6] shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-[#D95D28] animate-pulse" />
              <span className="text-[#0E5E5A] uppercase tracking-widest text-[9px] font-bold">
                FAMILY CARE OS // V1 REAL
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-[family-name:var(--font-outfit)] text-[#1C2826] leading-tight">
                Quiet family care for your parents.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-light max-w-md mx-auto leading-relaxed">
                A warm, calm operating console for adult children coordinating care for Amma and Papa.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="pt-4"
            >
              <button
                onClick={() => setMode("login")}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-[#0E5E5A] hover:bg-[#0C4E4B] text-white px-8 py-4 font-semibold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95"
              >
                <span>Enter Family Console</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          <footer className="text-center text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            Parents Health OS // Real Supabase Persistence
          </footer>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#FAF8F5] relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-[#1C2826] font-[family-name:var(--font-outfit)] uppercase">
              PARENTS HEALTH OS
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-light">Private family care access</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-sm space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex gap-2 text-xs text-red-800">
                <AlertTriangle size={16} className="shrink-0 text-red-500 mt-0.5" />
                <div>{authError}</div>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Enter authorized email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-3 quiet-input text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-3 quiet-input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#0E5E5A] text-white font-semibold rounded-2xl text-xs uppercase tracking-widest hover:bg-[#0C4E4B] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} /> SIGN IN
                  </>
                )}
              </button>
            </form>
          </div>

          <button
            onClick={() => setMode("landing")}
            className="w-full text-center text-xs text-slate-400 mt-4 hover:text-slate-600"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // 2. Initial Setup for First Care Recipient
  if (parents.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#FAF8F5] relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-[#1C2826] font-[family-name:var(--font-outfit)]">
              Welcome to Parents Health OS
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-light">Set up your family circle & first parent recipient</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFECE6] shadow-sm">
            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Family Network Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma Family Circle"
                  value={onboardForm.familyName}
                  onChange={(e) => setOnboardForm(prev => ({ ...prev, familyName: e.target.value }))}
                  className="w-full px-3.5 py-3 quiet-input text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Elder Parent's Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satyanarayana"
                  value={onboardForm.parentName}
                  onChange={(e) => setOnboardForm(prev => ({ ...prev, parentName: e.target.value }))}
                  className="w-full px-3.5 py-3 quiet-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Relationship *</label>
                  <select
                    value={onboardForm.relationship}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Grandmother">Grandmother</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Primary Language *</label>
                  <select
                    value={onboardForm.language}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Parent Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98480 22338"
                  value={onboardForm.parentPhone}
                  onChange={(e) => setOnboardForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                  className="w-full px-3.5 py-3 quiet-input text-xs"
                />
              </div>

              <div className="p-4 bg-teal-50/60 border border-teal-100 rounded-2xl space-y-2">
                <div className="flex gap-2 items-start">
                  <ShieldCheck className="text-[#0E5E5A] shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    I confirm permission to store and manage health records for this family member securely.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0E5E5A] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">I certify permission</span>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={signOut}
                  className="px-4 py-3 border border-[#EFECE6] text-slate-500 font-semibold rounded-2xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#0E5E5A] hover:bg-[#0C4E4B] text-white font-semibold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Save & Continue <ArrowRight size={14} /></>}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Real Mobile-First Dashboard Console
  return <DashboardShell />;
}

function DashboardShell() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}

function DashboardContent() {
  const {
    profile,
    user,
    family,
    careRecipients,
    activeCareRecipient,
    parents,
    activeParent,
    selectActiveParent,
    addCareRecipient,
    medications,
    medicationEvents,
    careRoutines,
    careRoutineEvents,
    healthObservations,
    healthDocuments,
    documentExtractions,
    healthConditions,
    addRealMedication,
    deactivateMedication,
    addRealCareRoutine,
    deactivateCareRoutine,
    respondToMedicationEvent,
    respondToCareRoutineEvent,
    addHealthObservation,
    uploadHealthDocument,
    analyzeDocument,
    reviewDocumentExtraction,
    signOut
  } = useParentsAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"home" | "family" | "care" | "records" | "profile">("home");
  const [isRecipientMenuOpen, setIsRecipientMenuOpen] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [showAddObsModal, setShowAddObsModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);

  // Forms
  const [familyForm, setFamilyForm] = useState({
    display_name: "",
    relationship: "Mother",
    primary_language: "English",
    phone: "",
    timezone: "Asia/Kolkata"
  });
  const [isSubmittingFamily, setIsSubmittingFamily] = useState(false);
  const [familyError, setFamilyError] = useState("");

  const [medForm, setMedForm] = useState({
    name: "",
    dosage: "",
    instructions: "",
    local_time: "08:00",
    start_date: new Date().toISOString().split("T")[0]
  });
  const [isSubmittingMed, setIsSubmittingMed] = useState(false);
  const [medError, setMedError] = useState("");

  const [routineForm, setRoutineForm] = useState({
    name: "",
    category: "exercise",
    description: "",
    local_time: "07:00",
    start_date: new Date().toISOString().split("T")[0]
  });
  const [isSubmittingRoutine, setIsSubmittingRoutine] = useState(false);
  const [routineError, setRoutineError] = useState("");

  const [obsForm, setObsForm] = useState({
    category: "blood_pressure" as "blood_pressure" | "blood_glucose" | "weight" | "body_temperature" | "pulse_oximetry" | "heart_rate" | "symptom_notes" | "other",
    value_sys: "128",
    value_dia: "82",
    value_numeric: "",
    value_text: "",
    notes: ""
  });
  const [isSubmittingObs, setIsSubmittingObs] = useState(false);
  const [obsError, setObsError] = useState("");

  // Document Upload Form
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("Lab Report");
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [docError, setDocError] = useState("");

  const currentRecipient = activeCareRecipient || (careRecipients.length > 0 ? careRecipients[0] : null);

  const handleAddFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyForm.display_name.trim()) {
      setFamilyError("Display name is required.");
      return;
    }
    setFamilyError("");
    setIsSubmittingFamily(true);
    try {
      const formattedDisplayName = formatName(familyForm.display_name);
      const { error } = await addCareRecipient({
        display_name: formattedDisplayName,
        relationship: familyForm.relationship,
        primary_language: familyForm.primary_language,
        phone: familyForm.phone,
        timezone: "Asia/Kolkata"
      });
      if (error) {
        setFamilyError(error.message || "Failed to add family member.");
      } else {
        showToast(`✅ ${formattedDisplayName} added to family circle.`, "success");
        setFamilyForm({
          display_name: "",
          relationship: "Mother",
          primary_language: "English",
          phone: "",
          timezone: "Asia/Kolkata"
        });
        setShowAddFamilyModal(false);
      }
    } catch (err) {
      setFamilyError("An error occurred while adding family member.");
    } finally {
      setIsSubmittingFamily(false);
    }
  };

  const handleAddMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.name.trim() || !medForm.dosage.trim() || !medForm.local_time) {
      setMedError("Medication name, dosage, and time are required.");
      return;
    }
    setMedError("");
    setIsSubmittingMed(true);
    try {
      const { success, error } = await addRealMedication({
        name: medForm.name,
        dosage: medForm.dosage,
        instructions: medForm.instructions,
        local_time: medForm.local_time,
        start_date: medForm.start_date
      });

      if (!success) {
        setMedError(error?.message || "Failed to record medication in database.");
      } else {
        showToast(`✅ Medication ${medForm.name} saved.`, "success");
        setMedForm({
          name: "",
          dosage: "",
          instructions: "",
          local_time: "08:00",
          start_date: new Date().toISOString().split("T")[0]
        });
        setShowAddMedModal(false);
      }
    } catch (err) {
      setMedError("An error occurred while saving medication.");
    } finally {
      setIsSubmittingMed(false);
    }
  };

  const handleAddRoutineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineForm.name.trim() || !routineForm.local_time) {
      setRoutineError("Routine name and time are required.");
      return;
    }
    setRoutineError("");
    setIsSubmittingRoutine(true);
    try {
      const { success, error } = await addRealCareRoutine({
        name: routineForm.name,
        category: routineForm.category,
        description: routineForm.description,
        local_time: routineForm.local_time,
        start_date: routineForm.start_date
      });

      if (!success) {
        setRoutineError(error?.message || "Failed to record care routine in database.");
      } else {
        showToast(`✅ Care routine ${routineForm.name} saved.`, "success");
        setRoutineForm({
          name: "",
          category: "exercise",
          description: "",
          local_time: "07:00",
          start_date: new Date().toISOString().split("T")[0]
        });
        setShowAddRoutineModal(false);
      }
    } catch (err) {
      setRoutineError("An error occurred while saving routine.");
    } finally {
      setIsSubmittingRoutine(false);
    }
  };

  const handleAddObsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setObsError("");
    setIsSubmittingObs(true);
    try {
      let payload: any = {
        category: obsForm.category,
        notes: obsForm.notes
      };

      if (obsForm.category === "blood_pressure") {
        const sys = parseFloat(obsForm.value_sys);
        const dia = parseFloat(obsForm.value_dia);
        if (isNaN(sys) || isNaN(dia)) {
          setObsError("Please enter valid Systolic and Diastolic numbers.");
          setIsSubmittingObs(false);
          return;
        }
        payload.value_sys = sys;
        payload.value_dia = dia;
      } else if (obsForm.category === "symptom_notes") {
        if (!obsForm.value_text.trim()) {
          setObsError("Please enter a symptom description or note.");
          setIsSubmittingObs(false);
          return;
        }
        payload.value_text = obsForm.value_text.trim();
      } else {
        const val = parseFloat(obsForm.value_numeric);
        if (isNaN(val)) {
          setObsError("Please enter a valid numeric observation value.");
          setIsSubmittingObs(false);
          return;
        }
        payload.value_numeric = val;

        let unit = "";
        if (obsForm.category === "blood_glucose") unit = "mg/dL";
        else if (obsForm.category === "weight") unit = "kg";
        else if (obsForm.category === "body_temperature") unit = "°F";
        else if (obsForm.category === "pulse_oximetry") unit = "%";
        else if (obsForm.category === "heart_rate") unit = "bpm";
        payload.unit = unit;

        if (obsForm.value_text) payload.value_text = obsForm.value_text;
      }

      const { success, error } = await addHealthObservation(payload);
      if (!success) {
        setObsError(error?.message || "Failed to record health observation in database.");
      } else {
        showToast(`✅ Health observation saved.`, "success");
        setShowAddObsModal(false);
        setObsForm({
          category: "blood_pressure",
          value_sys: "128",
          value_dia: "82",
          value_numeric: "",
          value_text: "",
          notes: ""
        });
      }
    } catch (err) {
      setObsError("An error occurred while saving health observation.");
    } finally {
      setIsSubmittingObs(false);
    }
  };

  const handleUploadDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setDocError("Please select a document file.");
      return;
    }
    setDocError("");
    setIsSubmittingDoc(true);
    try {
      const res = await uploadHealthDocument(docFile, docType);
      if (!res.success) {
        setDocError(res.error?.message || "Failed to upload health document.");
      } else {
        showToast(`✅ Document uploaded & analyzed with AI.`, "success");
        setDocFile(null);
        setDocType("Lab Report");
        setShowUploadDocModal(false);
      }
    } catch (err) {
      setDocError("An error occurred while uploading document.");
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name ? formatName(profile.full_name.split(" ")[0]) : "Caregiver";
  const familyTitle = family?.name ? `${formatName(family.name)} Family` : "Family Circle";

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C2826] pb-28 font-[family-name:var(--font-inter)] antialiased">
      {/* Quiet Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EFECE6] px-4 py-3">
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-[#0E5E5A] text-white flex items-center justify-center shadow-sm shrink-0">
              <Heart size={18} fill="white" className="text-white" />
            </div>
            <div>
              <h1 className="text-xs font-bold font-[family-name:var(--font-outfit)] tracking-tight text-[#0E5E5A]">
                PARENTS HEALTH OS
              </h1>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                {familyTitle}
              </p>
            </div>
          </div>

          {/* Care Recipient Switcher Popover */}
          {careRecipients.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsRecipientMenuOpen(!isRecipientMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-[#EFECE6] shadow-sm hover:border-[#0E5E5A]/30 transition-all text-xs font-semibold text-slate-700"
              >
                <div className="h-5 w-5 rounded-full bg-teal-50 text-[#0E5E5A] font-bold text-[10px] flex items-center justify-center uppercase shrink-0">
                  {currentRecipient?.display_name ? currentRecipient.display_name.charAt(0) : "P"}
                </div>
                <span className="truncate max-w-[100px] md:max-w-[160px] font-medium text-slate-800">
                  {formatName(currentRecipient?.display_name) || "Select Parent"}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isRecipientMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isRecipientMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-3xl border border-[#EFECE6] shadow-xl p-2 z-50 space-y-1"
                  >
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Switch Care Recipient
                    </div>
                    <div className="py-1 max-h-56 overflow-y-auto space-y-1">
                      {careRecipients.map((rec) => {
                        const isSelected = rec.id === currentRecipient?.id;
                        const formattedRecName = formatName(rec.display_name);
                        return (
                          <button
                            key={rec.id}
                            onClick={() => {
                              selectActiveParent(rec.id);
                              setIsRecipientMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs flex items-center justify-between transition-colors ${
                              isSelected ? "bg-teal-50/80 text-[#0E5E5A] font-bold" : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? "bg-[#0E5E5A] text-white" : "bg-slate-100 text-slate-600"}`}>
                                {formattedRecName.charAt(0)}
                              </div>
                              <div>
                                <span className="block font-semibold">{formattedRecName}</span>
                                <span className="text-[10px] text-slate-400 font-normal">{rec.relationship} • {rec.primary_language}</span>
                              </div>
                            </div>
                            {isSelected && <Check size={14} className="text-[#0E5E5A] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setIsRecipientMenuOpen(false);
                          setShowAddFamilyModal(true);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-2xl text-xs font-semibold text-[#0E5E5A] hover:bg-teal-50 flex items-center gap-2 transition-colors"
                      >
                        <Plus size={14} /> Add family member
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      {/* Surface Router */}
      <main className="max-w-md md:max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === "home" && (
          <HomeView
            firstName={firstName}
            timeGreeting={timeGreeting}
            currentRecipient={currentRecipient}
            medications={medications}
            medicationEvents={medicationEvents}
            careRoutines={careRoutines}
            careRoutineEvents={careRoutineEvents}
            healthObservations={healthObservations}
            onAddFamily={() => setShowAddFamilyModal(true)}
            onNavigate={(tab) => setActiveTab(tab)}
            onAddMedication={() => setShowAddMedModal(true)}
            onAddRoutine={() => setShowAddRoutineModal(true)}
            onAddObservation={() => setShowAddObsModal(true)}
          />
        )}

        {activeTab === "family" && (
          <FamilyView
            careRecipients={careRecipients}
            currentRecipient={currentRecipient}
            onSelectRecipient={(id) => selectActiveParent(id)}
            onAddFamily={() => setShowAddFamilyModal(true)}
          />
        )}

        {activeTab === "care" && (
          <CareView
            careRecipients={careRecipients}
            currentRecipient={currentRecipient}
            onSelectRecipient={(id) => selectActiveParent(id)}
            medications={medications}
            medicationEvents={medicationEvents}
            careRoutines={careRoutines}
            careRoutineEvents={careRoutineEvents}
            onAddMedication={() => setShowAddMedModal(true)}
            onAddRoutine={() => setShowAddRoutineModal(true)}
            onDeactivateMedication={async (id) => {
              const res = await deactivateMedication(id);
              if (res.success) showToast("Medication deactivated.", "success");
              else showToast(res.error?.message || "Failed to deactivate.", "error");
            }}
            onDeactivateRoutine={async (id) => {
              const res = await deactivateCareRoutine(id);
              if (res.success) showToast("Care routine deactivated.", "success");
              else showToast(res.error?.message || "Failed to deactivate.", "error");
            }}
            onRespondMedication={async (eventId, status) => {
              const res = await respondToMedicationEvent(eventId, status);
              if (res.success) showToast(`Medication status recorded: ${status}`, "success");
              else showToast(res.error?.message || "Failed to record response.", "error");
            }}
            onRespondRoutine={async (eventId, status) => {
              const res = await respondToCareRoutineEvent(eventId, status);
              if (res.success) showToast(`Routine status recorded: ${status}`, "success");
              else showToast(res.error?.message || "Failed to record response.", "error");
            }}
          />
        )}

        {activeTab === "records" && (
          <RecordsView
            careRecipients={careRecipients}
            currentRecipient={currentRecipient}
            onSelectRecipient={(id) => selectActiveParent(id)}
            healthObservations={healthObservations}
            healthDocuments={healthDocuments}
            documentExtractions={documentExtractions}
            healthConditions={healthConditions}
            onAddObservation={() => setShowAddObsModal(true)}
            onUploadDocument={() => setShowUploadDocModal(true)}
            onAnalyzeDocument={async (docId) => {
              showToast("⚡ Triggering document analysis...", "info");
              const res = await analyzeDocument(docId);
              if (res.success) showToast("✅ Document analysis complete.", "success");
              else showToast(res.error?.message || "Analysis failed.", "error");
            }}
            onReviewExtraction={async (extractionId, status) => {
              const res = await reviewDocumentExtraction(extractionId, status);
              if (res.success) showToast(`✅ Review status updated to: ${status}`, "success");
              else showToast(res.error?.message || "Failed to update review status.", "error");
            }}
          />
        )}

        {activeTab === "profile" && (
          <ProfileView
            profile={profile}
            user={user}
            family={family}
            careRecipientsCount={careRecipients.length}
            onSignOut={signOut}
          />
        )}
      </main>

      {/* Docked Pixel-Perfect Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#EFECE6] px-2 pt-2 pb-3 shadow-[0_-4px_24px_rgba(14,94,90,0.05)]">
        <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-between">
          <NavItem
            icon={<HomeIcon size={18} />}
            label="Home"
            isActive={activeTab === "home"}
            onClick={() => setActiveTab("home")}
          />
          <NavItem
            icon={<Users size={18} />}
            label="Family"
            isActive={activeTab === "family"}
            onClick={() => setActiveTab("family")}
          />
          <NavItem
            icon={<Activity size={18} />}
            label="Care"
            isActive={activeTab === "care"}
            onClick={() => setActiveTab("care")}
          />
          <NavItem
            icon={<FileText size={18} />}
            label="Records"
            isActive={activeTab === "records"}
            onClick={() => setActiveTab("records")}
          />
          <NavItem
            icon={<User size={18} />}
            label="Profile"
            isActive={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
        </div>
      </nav>

      {/* Modal: Add Family Member */}
      <AnimatePresence>
        {showAddFamilyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-7 shadow-2xl border border-[#EFECE6] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold font-[family-name:var(--font-outfit)] text-[#1C2826]">
                    Add Family Member
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">Register a care recipient for your family</p>
                </div>
                <button
                  onClick={() => setShowAddFamilyModal(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {familyError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                  {familyError}
                </div>
              )}

              <form onSubmit={handleAddFamilySubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amma or Chandrakala"
                    value={familyForm.display_name}
                    onChange={(e) => setFamilyForm({ ...familyForm, display_name: e.target.value })}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Relationship *
                    </label>
                    <select
                      value={familyForm.relationship}
                      onChange={(e) => setFamilyForm({ ...familyForm, relationship: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Grandfather">Grandfather</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Other">Other Recipient</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Primary Language *
                    </label>
                    <select
                      value={familyForm.primary_language}
                      onChange={(e) => setFamilyForm({ ...familyForm, primary_language: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs"
                    >
                      <option value="English">English</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                      <option value="Malayalam">Malayalam (മലയാളം)</option>
                      <option value="Marathi">Marathi (मराठी)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98480 22338"
                    value={familyForm.phone}
                    onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value })}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Asia/Kolkata"
                    className="w-full px-3.5 py-3 quiet-input text-xs text-slate-500 cursor-not-allowed bg-slate-100/60"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddFamilyModal(false)}
                    className="px-4 py-3 rounded-2xl border border-[#EFECE6] text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFamily}
                    className="px-6 py-3 rounded-2xl bg-[#0E5E5A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0C4E4B] flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSubmittingFamily ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={14} /> Add Care Recipient
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Medication */}
      <AnimatePresence>
        {showAddMedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-7 shadow-2xl border border-[#EFECE6] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold font-[family-name:var(--font-outfit)] text-[#1C2826]">
                    Add Medication
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Schedule a medication for {formatName(currentRecipient?.display_name)}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMedModal(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {medError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                  {medError}
                </div>
              )}

              <form onSubmit={handleAddMedSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metformin or Amlodipine"
                    value={medForm.name}
                    onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Dosage / Strength *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500mg or 1 tablet"
                      value={medForm.dosage}
                      onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Scheduled Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={medForm.local_time}
                      onChange={(e) => setMedForm({ ...medForm, local_time: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Take after breakfast with warm water"
                    value={medForm.instructions}
                    onChange={(e) => setMedForm({ ...medForm, instructions: e.target.value })}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={medForm.start_date}
                    onChange={(e) => setMedForm({ ...medForm, start_date: e.target.value })}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMedModal(false)}
                    className="px-4 py-3 rounded-2xl border border-[#EFECE6] text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingMed}
                    className="px-6 py-3 rounded-2xl bg-[#0E5E5A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0C4E4B] flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSubmittingMed ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={14} /> Save Medication
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Care Routine */}
      <AnimatePresence>
        {showAddRoutineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-7 shadow-2xl border border-[#EFECE6] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold font-[family-name:var(--font-outfit)] text-[#1C2826]">
                    Add Care Routine
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Schedule a care activity for {formatName(currentRecipient?.display_name)}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddRoutineModal(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {routineError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                  {routineError}
                </div>
              )}

              <form onSubmit={handleAddRoutineSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Routine Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning Walk or Physiotherapy"
                    value={routineForm.name}
                    onChange={(e) => setRoutineForm({ ...routineForm, name: e.target.value })}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Category *
                    </label>
                    <select
                      value={routineForm.category}
                      onChange={(e) => setRoutineForm({ ...routineForm, category: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs capitalize"
                    >
                      <option value="exercise">Exercise / Walking</option>
                      <option value="physiotherapy">Physiotherapy</option>
                      <option value="hydration">Hydration</option>
                      <option value="dietary">Dietary Check-in</option>
                      <option value="respiratory">Breathing Exercises</option>
                      <option value="sleep">Sleep Routine</option>
                      <option value="hygiene">Hygiene</option>
                      <option value="other">Other Activity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Scheduled Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={routineForm.local_time}
                      onChange={(e) => setRoutineForm({ ...routineForm, local_time: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Description / Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 minutes gentle walking in park"
                    value={routineForm.description}
                    onChange={(e) => setRoutineForm({ ...routineForm, description: e.target.value })}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={routineForm.start_date}
                    onChange={(e) => setRoutineForm({ ...routineForm, start_date: e.target.value })}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddRoutineModal(false)}
                    className="px-4 py-3 rounded-2xl border border-[#EFECE6] text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRoutine}
                    className="px-6 py-3 rounded-2xl bg-[#0E5E5A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0C4E4B] flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSubmittingRoutine ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={14} /> Save Care Routine
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Health Observation */}
      <AnimatePresence>
        {showAddObsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-7 shadow-2xl border border-[#EFECE6] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold font-[family-name:var(--font-outfit)] text-[#1C2826]">
                    Log Health Observation
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Record health observation for {formatName(currentRecipient?.display_name)}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddObsModal(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {obsError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                  {obsError}
                </div>
              )}

              <form onSubmit={handleAddObsSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Observation Type *
                  </label>
                  <select
                    value={obsForm.category}
                    onChange={(e) => setObsForm({ ...obsForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-3 quiet-input text-xs font-semibold text-[#0E5E5A]"
                  >
                    <option value="blood_pressure">Blood Pressure (mmHg)</option>
                    <option value="blood_glucose">Blood Glucose (mg/dL)</option>
                    <option value="weight">Weight (kg)</option>
                    <option value="body_temperature">Body Temperature (°F)</option>
                    <option value="pulse_oximetry">Pulse Oximetry / SpO2 (%)</option>
                    <option value="heart_rate">Heart Rate (bpm)</option>
                    <option value="symptom_notes">Symptom / Health Note</option>
                  </select>
                </div>

                {obsForm.category === "blood_pressure" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Systolic (mmHg) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="128"
                        value={obsForm.value_sys}
                        onChange={(e) => setObsForm({ ...obsForm, value_sys: e.target.value })}
                        className="w-full px-3.5 py-3 quiet-input text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Diastolic (mmHg) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="82"
                        value={obsForm.value_dia}
                        onChange={(e) => setObsForm({ ...obsForm, value_dia: e.target.value })}
                        className="w-full px-3.5 py-3 quiet-input text-xs font-bold"
                      />
                    </div>
                  </div>
                )}

                {obsForm.category === "blood_glucose" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Blood Glucose Value (mg/dL) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 112"
                      value={obsForm.value_numeric}
                      onChange={(e) => setObsForm({ ...obsForm, value_numeric: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs font-bold"
                    />
                  </div>
                )}

                {obsForm.category === "weight" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 71.4"
                      value={obsForm.value_numeric}
                      onChange={(e) => setObsForm({ ...obsForm, value_numeric: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs font-bold"
                    />
                  </div>
                )}

                {obsForm.category === "body_temperature" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Body Temperature (°F) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 98.6"
                      value={obsForm.value_numeric}
                      onChange={(e) => setObsForm({ ...obsForm, value_numeric: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs font-bold"
                    />
                  </div>
                )}

                {obsForm.category === "pulse_oximetry" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      SpO2 (%) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 98"
                      value={obsForm.value_numeric}
                      onChange={(e) => setObsForm({ ...obsForm, value_numeric: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs font-bold"
                    />
                  </div>
                )}

                {obsForm.category === "heart_rate" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Heart Rate (bpm) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 72"
                      value={obsForm.value_numeric}
                      onChange={(e) => setObsForm({ ...obsForm, value_numeric: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs font-bold"
                    />
                  </div>
                )}

                {obsForm.category === "symptom_notes" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      What did you notice? *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Slight dizziness after afternoon walk"
                      value={obsForm.value_text}
                      onChange={(e) => setObsForm({ ...obsForm, value_text: e.target.value })}
                      className="w-full px-3.5 py-3 quiet-input text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Measured before morning breakfast"
                    value={obsForm.notes}
                    onChange={(e) => setObsForm({ ...obsForm, notes: e.target.value })}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddObsModal(false)}
                    className="px-4 py-3 rounded-2xl border border-[#EFECE6] text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingObs}
                    className="px-6 py-3 rounded-2xl bg-[#0E5E5A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0C4E4B] flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSubmittingObs ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={14} /> Save Observation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Upload Document & Gemini 3.5 Flash-Lite Intelligence */}
      <AnimatePresence>
        {showUploadDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-7 shadow-2xl border border-[#EFECE6] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold font-[family-name:var(--font-outfit)] text-[#1C2826]">
                    Upload Health Document
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Privately upload document for {formatName(currentRecipient?.display_name)}
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadDocModal(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {docError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                  {docError}
                </div>
              )}

              <form onSubmit={handleUploadDocSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Select Document File (PDF or Image) *
                  </label>
                  <input
                    type="file"
                    required
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="w-full px-3.5 py-2.5 quiet-input text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#0E5E5A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Document Category *
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3.5 py-3 quiet-input text-xs"
                  >
                    <option value="Lab Report">Lab Report / Blood Test</option>
                    <option value="Prescription">Doctor Prescription</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Scan Report">Scan / Radiology Report</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-[#0E5E5A] font-semibold">
                    <Sparkles size={14} />
                    <span>Gemini 3.5 Flash-Lite Intelligence</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-light">
                    Documents are stored in private encrypted storage. Gemini 3.5 Flash-Lite will extract structured facts for caregiver review.
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadDocModal(false)}
                    className="px-4 py-3 rounded-2xl border border-[#EFECE6] text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDoc}
                    className="px-6 py-3 rounded-2xl bg-[#0E5E5A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0C4E4B] flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSubmittingDoc ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Analyzing with Gemini...
                      </>
                    ) : (
                      <>
                        <FileUp size={14} /> Upload & Extract
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-all group select-none"
    >
      <div
        className={`px-3.5 py-1 rounded-full transition-all duration-200 ${
          isActive
            ? "bg-[#0E5E5A] text-white shadow-sm"
            : "text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100/60"
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-[10px] mt-1 tracking-tight transition-colors font-medium ${
          isActive ? "text-[#0E5E5A] font-bold" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function HomeView({
  firstName,
  timeGreeting,
  currentRecipient,
  medications,
  medicationEvents,
  careRoutines,
  careRoutineEvents,
  healthObservations,
  onAddFamily,
  onNavigate,
  onAddMedication,
  onAddRoutine,
  onAddObservation
}: {
  firstName: string;
  timeGreeting: string;
  currentRecipient: any;
  medications: any[];
  medicationEvents: any[];
  careRoutines: any[];
  careRoutineEvents: any[];
  healthObservations: any[];
  onAddFamily: () => void;
  onNavigate: (tab: "home" | "family" | "care" | "records" | "profile") => void;
  onAddMedication: () => void;
  onAddRoutine: () => void;
  onAddObservation: () => void;
}) {
  const rawName = currentRecipient?.display_name || "Papa";
  const recipientName = formatName(rawName);
  const relationship = currentRecipient?.relationship || "Father";
  const avatarInitial = recipientName.charAt(0);

  const medsTakenCount = medicationEvents.filter((e) => e.status === "taken").length;
  const routinesCompletedCount = careRoutineEvents.filter((e) => e.status === "completed").length;

  const pendingMeds = medicationEvents.filter((e) => e.status === "pending" || e.status === "snoozed");
  const pendingRoutines = careRoutineEvents.filter((e) => e.status === "pending" || e.status === "snoozed");
  const hasAttentionItems = pendingMeds.length > 0 || pendingRoutines.length > 0;

  const latestObservation = healthObservations.length > 0 ? healthObservations[0] : null;

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-[#1C2826]">
          {timeGreeting}, {firstName}
        </h2>
        <p className="text-xs text-slate-500 font-light mt-0.5">
          Quiet family care home
        </p>
      </div>

      {/* Active Parent Hero Card */}
      <div className="quiet-card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-teal-50 border border-teal-100 text-[#0E5E5A] font-bold text-base flex items-center justify-center shrink-0 shadow-inner">
              {avatarInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#1C2826] font-[family-name:var(--font-outfit)]">
                  {recipientName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0E5E5A] font-semibold text-[10px]">
                  {relationship}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light mt-0.5">
                Primary Language: {currentRecipient?.primary_language || "English"}
              </p>
            </div>
          </div>
        </div>

        {/* Status Rows */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F5F0]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white text-[#0E5E5A] flex items-center justify-center shrink-0 border border-[#EAE6DF]">
                <Pill size={16} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Medicines Today</span>
                <span className="text-[11px] text-slate-500 font-light">
                  {medicationEvents.length === 0
                    ? "No medicines scheduled today"
                    : `${medicationEvents.length} scheduled today • ${medsTakenCount} taken`}
                </span>
              </div>
            </div>
            <button
              onClick={onAddMedication}
              className="text-[11px] font-semibold text-[#0E5E5A] hover:underline px-2 py-1"
            >
              + Add
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F5F0]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white text-[#0E5E5A] flex items-center justify-center shrink-0 border border-[#EAE6DF]">
                <Calendar size={16} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Routines Today</span>
                <span className="text-[11px] text-slate-500 font-light">
                  {careRoutineEvents.length === 0
                    ? "No routines scheduled today"
                    : `${careRoutineEvents.length} scheduled today • ${routinesCompletedCount} completed`}
                </span>
              </div>
            </div>
            <button
              onClick={onAddRoutine}
              className="text-[11px] font-semibold text-[#0E5E5A] hover:underline px-2 py-1"
            >
              + Add
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F5F0]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white text-[#0E5E5A] flex items-center justify-center shrink-0 border border-[#EAE6DF]">
                <Activity size={16} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Latest Observation</span>
                <span className="text-[11px] text-slate-500 font-light">
                  {!latestObservation
                    ? "None yet"
                    : `${formatObservationCategoryLabel(latestObservation.category)}: ${formatObservationValue(latestObservation)} • ${formatObservedTime(latestObservation.observed_at)}`}
                </span>
              </div>
            </div>
            <button
              onClick={onAddObservation}
              className="text-[11px] font-semibold text-[#0E5E5A] hover:underline px-2 py-1"
            >
              + Log
            </button>
          </div>
        </div>
      </div>

      {/* Needs your attention card */}
      <div className="quiet-card p-5 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-[family-name:var(--font-outfit)]">
          Needs your attention
        </h3>
        {!hasAttentionItems ? (
          <div className="flex items-center gap-2 text-xs text-slate-600 font-light pt-1">
            <CheckCircle2 size={16} className="text-[#0E5E5A] shrink-0" />
            <span>All clear — No pending items requiring attention.</span>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {pendingMeds.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-xs">
                <div className="flex items-center gap-2">
                  <Pill size={14} className="text-[#D95D28]" />
                  <span className="font-semibold text-slate-800">{ev.medication_name} ({ev.dosage})</span>
                  <span className="text-[10px] text-slate-500">at {formatTime12(ev.local_time)}</span>
                </div>
                <button
                  onClick={() => onNavigate("care")}
                  className="text-[10px] font-bold text-[#0E5E5A] hover:underline"
                >
                  Respond
                </button>
              </div>
            ))}
            {pendingRoutines.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#D95D28]" />
                  <span className="font-semibold text-slate-800">{ev.routine_name}</span>
                  <span className="text-[10px] text-slate-500">at {formatTime12(ev.local_time)}</span>
                </div>
                <button
                  onClick={() => onNavigate("care")}
                  className="text-[10px] font-bold text-[#0E5E5A] hover:underline"
                >
                  Respond
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Care Actions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-[family-name:var(--font-outfit)] px-1">
          Quick actions
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onAddMedication}
            className="quiet-card p-4 text-left flex items-center gap-3 hover:border-[#0E5E5A]/30 transition-all group"
          >
            <div className="h-9 w-9 rounded-2xl bg-teal-50 text-[#0E5E5A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Pill size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-800">Add medicine</span>
          </button>

          <button
            onClick={onAddRoutine}
            className="quiet-card p-4 text-left flex items-center gap-3 hover:border-[#0E5E5A]/30 transition-all group"
          >
            <div className="h-9 w-9 rounded-2xl bg-teal-50 text-[#0E5E5A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-800">Add routine</span>
          </button>

          <button
            onClick={onAddObservation}
            className="quiet-card p-4 text-left flex items-center gap-3 hover:border-[#0E5E5A]/30 transition-all group"
          >
            <div className="h-9 w-9 rounded-2xl bg-teal-50 text-[#0E5E5A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Activity size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-800">Log health</span>
          </button>

          <button
            onClick={onAddFamily}
            className="quiet-card p-4 text-left flex items-center gap-3 hover:border-[#0E5E5A]/30 transition-all group"
          >
            <div className="h-9 w-9 rounded-2xl bg-teal-50 text-[#0E5E5A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Plus size={18} />
            </div>
            <span className="text-xs font-semibold text-slate-800">Add family member</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FamilyView({
  careRecipients,
  currentRecipient,
  onSelectRecipient,
  onAddFamily
}: {
  careRecipients: any[];
  currentRecipient: any;
  onSelectRecipient: (id: string) => void;
  onAddFamily: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-[#1C2826]">
            Family Circle
          </h2>
          <p className="text-xs text-slate-500 font-light mt-0.5">
            Care recipients in your family
          </p>
        </div>
        <button
          onClick={onAddFamily}
          className="px-4 py-2.5 rounded-2xl bg-[#0E5E5A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0C4E4B] flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={14} /> Add Member
        </button>
      </div>

      <div className="space-y-3">
        {careRecipients.length === 0 ? (
          <div className="quiet-card p-8 text-center space-y-3">
            <p className="text-xs text-slate-500 font-light">No family care recipients registered yet.</p>
            <button
              onClick={onAddFamily}
              className="px-4 py-2 rounded-2xl bg-[#0E5E5A] text-white text-xs font-semibold"
            >
              + Add family member
            </button>
          </div>
        ) : (
          careRecipients.map((recipient) => {
            const isSelected = recipient.id === currentRecipient?.id;
            const formattedName = formatName(recipient.display_name);
            return (
              <div
                key={recipient.id}
                className={`quiet-card p-5 transition-all ${
                  isSelected ? "border-[#0E5E5A] ring-1 ring-[#0E5E5A]/20" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className={`h-11 w-11 rounded-2xl font-bold text-base flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-[#0E5E5A] text-white shadow-sm" : "bg-teal-50 text-[#0E5E5A]"
                    }`}>
                      {formattedName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#1C2826] font-[family-name:var(--font-outfit)]">
                          {formattedName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          {recipient.relationship}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500 font-light">
                        <p className="flex items-center gap-1.5">
                          <Globe size={12} className="text-slate-400" />
                          <span>Language: <strong className="font-semibold text-slate-700">{recipient.primary_language}</strong></span>
                        </p>
                        {recipient.phone && (
                          <p className="flex items-center gap-1.5">
                            <PhoneCall size={12} className="text-slate-400" />
                            <span>Phone: <strong className="font-semibold text-slate-700">{recipient.phone}</strong></span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0E5E5A] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <Check size={12} /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectRecipient(recipient.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#EFECE6] text-slate-700 hover:border-[#0E5E5A] text-xs font-semibold transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function CareView({
  careRecipients,
  currentRecipient,
  onSelectRecipient,
  medications,
  medicationEvents,
  careRoutines,
  careRoutineEvents,
  onAddMedication,
  onAddRoutine,
  onDeactivateMedication,
  onDeactivateRoutine,
  onRespondMedication,
  onRespondRoutine
}: {
  careRecipients: any[];
  currentRecipient: any;
  onSelectRecipient: (id: string) => void;
  medications: any[];
  medicationEvents: any[];
  careRoutines: any[];
  careRoutineEvents: any[];
  onAddMedication: () => void;
  onAddRoutine: () => void;
  onDeactivateMedication: (id: string) => void;
  onDeactivateRoutine: (id: string) => void;
  onRespondMedication: (eventId: string, status: "taken" | "skipped" | "snoozed") => void;
  onRespondRoutine: (eventId: string, status: "completed" | "partial" | "skipped" | "snoozed") => void;
}) {
  const name = formatName(currentRecipient?.display_name) || "Care Recipient";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-[#1C2826]">
          Care Plan
        </h2>
        <p className="text-xs text-slate-500 font-light mt-0.5">
          Care activities and medications for <span className="font-semibold text-slate-800">{name}</span>
        </p>
      </div>

      {/* Recipient Context Pills */}
      {careRecipients.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {careRecipients.map((rec) => {
            const isSel = rec.id === currentRecipient?.id;
            return (
              <button
                key={rec.id}
                onClick={() => onSelectRecipient(rec.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSel ? "bg-[#0E5E5A] text-white" : "bg-white border border-[#EFECE6] text-slate-600 hover:bg-slate-50"
                }`}
              >
                {formatName(rec.display_name)} ({rec.relationship})
              </button>
            );
          })}
        </div>
      )}

      {/* Section 1: TODAY'S SCHEDULED ACTIVITIES */}
      <div className="quiet-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#0E5E5A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C2826] font-[family-name:var(--font-outfit)]">
              Today's Schedule
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>

        {medicationEvents.length === 0 && careRoutineEvents.length === 0 ? (
          <p className="text-xs text-slate-500 font-light py-2">
            No care activities scheduled for today. Add a medication or routine below to build {name}'s care schedule.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Today's Medications */}
            {medicationEvents.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Medication Times
                </span>
                {medicationEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-[#F7F5F0] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Pill size={14} className="text-[#0E5E5A]" />
                        <span className="font-semibold text-slate-800">{ev.medication_name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 font-medium text-[10px] border border-[#EAE6DF]">
                          {ev.dosage}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Scheduled at <strong className="font-semibold text-slate-700">{formatTime12(ev.local_time)}</strong>
                        {ev.instructions ? ` • ${ev.instructions}` : ""}
                      </p>
                    </div>

                    {/* Action Buttons / Response Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {ev.status === "pending" ? (
                        <>
                          <button
                            onClick={() => onRespondMedication(ev.id, "taken")}
                            className="px-3 py-1.5 rounded-xl bg-[#0E5E5A] text-white font-semibold text-[11px] hover:bg-[#0C4E4B] transition-colors"
                          >
                            ✓ Taken
                          </button>
                          <button
                            onClick={() => onRespondMedication(ev.id, "skipped")}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#EFECE6] text-slate-600 font-medium text-[11px] hover:bg-slate-50 transition-colors"
                          >
                            Skip
                          </button>
                          <button
                            onClick={() => onRespondMedication(ev.id, "snoozed")}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-[#D95D28] font-medium text-[11px] border border-amber-100 hover:bg-amber-100 transition-colors"
                          >
                            Snooze
                          </button>
                        </>
                      ) : ev.status === "taken" ? (
                        <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0E5E5A] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Check size={12} /> Taken
                        </span>
                      ) : ev.status === "skipped" ? (
                        <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                          Skipped
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-[#D95D28] font-bold text-[10px] uppercase tracking-wider">
                          Snoozed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Today's Routines */}
            {careRoutineEvents.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Routine Activities
                </span>
                {careRoutineEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-[#F7F5F0] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#0E5E5A]" />
                        <span className="font-semibold text-slate-800">{ev.routine_name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 font-medium text-[10px] border border-[#EAE6DF] capitalize">
                          {ev.category}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Scheduled at <strong className="font-semibold text-slate-700">{formatTime12(ev.local_time)}</strong>
                        {ev.description ? ` • ${ev.description}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {ev.status === "pending" ? (
                        <>
                          <button
                            onClick={() => onRespondRoutine(ev.id, "completed")}
                            className="px-3 py-1.5 rounded-xl bg-[#0E5E5A] text-white font-semibold text-[11px] hover:bg-[#0C4E4B] transition-colors"
                          >
                            ✓ Completed
                          </button>
                          <button
                            onClick={() => onRespondRoutine(ev.id, "skipped")}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-[#EFECE6] text-slate-600 font-medium text-[11px] hover:bg-slate-50 transition-colors"
                          >
                            Skip
                          </button>
                          <button
                            onClick={() => onRespondRoutine(ev.id, "snoozed")}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-[#D95D28] font-medium text-[11px] border border-amber-100 hover:bg-amber-100 transition-colors"
                          >
                            Snooze
                          </button>
                        </>
                      ) : ev.status === "completed" ? (
                        <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0E5E5A] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Check size={12} /> Completed
                        </span>
                      ) : ev.status === "skipped" ? (
                        <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                          Skipped
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-[#D95D28] font-bold text-[10px] uppercase tracking-wider">
                          Snoozed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 2: ACTIVE MEDICATIONS LIST */}
      <div className="quiet-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
          <div className="flex items-center gap-2">
            <Pill size={18} className="text-[#0E5E5A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C2826] font-[family-name:var(--font-outfit)]">
              Active Medications
            </h3>
          </div>
          <button
            onClick={onAddMedication}
            className="px-3.5 py-1.5 rounded-2xl bg-[#0E5E5A] text-white font-semibold text-xs hover:bg-[#0C4E4B] transition-colors flex items-center gap-1 shadow-sm"
          >
            <Plus size={14} /> Add medication
          </button>
        </div>

        {medications.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-slate-500 font-light">No medications logged for {name}.</p>
            <button
              onClick={onAddMedication}
              className="text-xs font-semibold text-[#0E5E5A] hover:underline"
            >
              + Add first medication
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {medications.map((m) => (
              <div key={m.id} className="p-4 rounded-2xl bg-[#F7F5F0] text-xs flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{m.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#0E5E5A] font-semibold text-[10px] border border-[#EAE6DF]">
                      {m.dosage}
                    </span>
                  </div>
                  {m.instructions && (
                    <p className="text-slate-500 text-[11px] font-light">{m.instructions}</p>
                  )}
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    Source: <span className="font-semibold capitalize">{m.provenance.replace("_", " ")}</span>
                  </p>
                </div>

                <button
                  onClick={() => onDeactivateMedication(m.id)}
                  className="px-2.5 py-1 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-semibold transition-colors shrink-0"
                >
                  Deactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: ACTIVE ROUTINES LIST */}
      <div className="quiet-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#0E5E5A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C2826] font-[family-name:var(--font-outfit)]">
              Active Care Routines
            </h3>
          </div>
          <button
            onClick={onAddRoutine}
            className="px-3.5 py-1.5 rounded-2xl bg-[#0E5E5A] text-white font-semibold text-xs hover:bg-[#0C4E4B] transition-colors flex items-center gap-1 shadow-sm"
          >
            <Plus size={14} /> Add routine
          </button>
        </div>

        {careRoutines.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-slate-500 font-light">No care routines logged for {name}.</p>
            <button
              onClick={onAddRoutine}
              className="text-xs font-semibold text-[#0E5E5A] hover:underline"
            >
              + Add first care routine
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {careRoutines.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-[#F7F5F0] text-xs flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{r.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#0E5E5A] font-semibold text-[10px] border border-[#EAE6DF] capitalize">
                      {r.category}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-slate-500 text-[11px] font-light">{r.description}</p>
                  )}
                </div>

                <button
                  onClick={() => onDeactivateRoutine(r.id)}
                  className="px-2.5 py-1 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-semibold transition-colors shrink-0"
                >
                  Deactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecordsView({
  careRecipients,
  currentRecipient,
  onSelectRecipient,
  healthObservations,
  healthDocuments,
  documentExtractions,
  healthConditions,
  onAddObservation,
  onUploadDocument,
  onAnalyzeDocument,
  onReviewExtraction
}: {
  careRecipients: any[];
  currentRecipient: any;
  onSelectRecipient: (id: string) => void;
  healthObservations: any[];
  healthDocuments: any[];
  documentExtractions: any[];
  healthConditions: any[];
  onAddObservation: () => void;
  onUploadDocument: () => void;
  onAnalyzeDocument: (docId: string) => void;
  onReviewExtraction: (extractionId: string, status: "approved" | "rejected") => void;
}) {
  const name = formatName(currentRecipient?.display_name) || "Care Recipient";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-[#1C2826]">
          Health Records
        </h2>
        <p className="text-xs text-slate-500 font-light mt-0.5">
          Health history and documents for <span className="font-semibold text-slate-800">{name}</span>
        </p>
      </div>

      {/* Recipient Context Pills */}
      {careRecipients.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {careRecipients.map((rec) => {
            const isSel = rec.id === currentRecipient?.id;
            return (
              <button
                key={rec.id}
                onClick={() => onSelectRecipient(rec.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSel ? "bg-[#0E5E5A] text-white" : "bg-white border border-[#EFECE6] text-slate-600 hover:bg-slate-50"
                }`}
              >
                {formatName(rec.display_name)} ({rec.relationship})
              </button>
            );
          })}
        </div>
      )}

      {/* Health observations Timeline */}
      <div className="quiet-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#0E5E5A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C2826] font-[family-name:var(--font-outfit)]">
              Health Observations Timeline
            </h3>
          </div>
          <button
            onClick={onAddObservation}
            className="px-3.5 py-1.5 rounded-2xl bg-[#0E5E5A] text-white font-semibold text-xs hover:bg-[#0C4E4B] transition-colors flex items-center gap-1 shadow-sm"
          >
            <Plus size={14} /> Log health
          </button>
        </div>

        {healthObservations.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-slate-500 font-light">No health observations recorded for {name}.</p>
            <button
              onClick={onAddObservation}
              className="text-xs font-semibold text-[#0E5E5A] hover:underline"
            >
              + Log first observation
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {healthObservations.map((obs) => (
              <div key={obs.id} className="p-4 rounded-2xl bg-[#F7F5F0] text-xs flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">
                      {formatObservationCategoryLabel(obs.category)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#0E5E5A]">
                    {formatObservationValue(obs)}
                  </p>
                  {obs.notes && (
                    <p className="text-[11px] text-slate-500 font-light pt-0.5">
                      Note: {obs.notes}
                    </p>
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-400 shrink-0">
                  {formatObservedTime(obs.observed_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents & AI Extraction Review */}
      <div className="quiet-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#0E5E5A]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C2826] font-[family-name:var(--font-outfit)]">
              Health Documents & AI Extractions
            </h3>
          </div>
          <button
            onClick={onUploadDocument}
            className="px-3.5 py-1.5 rounded-2xl bg-[#0E5E5A] text-white font-semibold text-xs hover:bg-[#0C4E4B] transition-colors flex items-center gap-1 shadow-sm"
          >
            <Plus size={14} /> Upload document
          </button>
        </div>

        {healthDocuments.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-slate-500 font-light">No documents uploaded for {name}.</p>
            <button
              onClick={onUploadDocument}
              className="text-xs font-semibold text-[#0E5E5A] hover:underline"
            >
              + Upload first document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {healthDocuments.map((doc) => {
              const extraction = documentExtractions.find((e) => e.health_document_id === doc.id);
              const data = extraction?.extracted_data as any;

              return (
                <div key={doc.id} className="p-4 rounded-2xl bg-[#F7F5F0] border border-[#EAE6DF] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#0E5E5A]" />
                        <h4 className="font-bold text-slate-800 text-sm">{doc.filename}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 font-medium text-[10px] border border-[#EAE6DF] capitalize">
                          {formatDocumentTypeLabel(doc.document_type)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Uploaded on {new Date(doc.uploaded_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    {!extraction && (
                      <button
                        onClick={() => onAnalyzeDocument(doc.id)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 text-[#0E5E5A] hover:bg-teal-100 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-teal-200"
                      >
                        <Sparkles size={14} /> Analyze with AI
                      </button>
                    )}
                  </div>

                  {/* AI Extraction Section */}
                  {extraction && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-inner">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <BrainCircuit size={16} className="text-[#0E5E5A]" />
                          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                            AI Extraction
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {extraction.ai_provider} ({extraction.model_version})
                          </span>
                        </div>

                        {/* Review Status Badge */}
                        <div>
                          {extraction.review_status === "pending_review" ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-[#D95D28] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <AlertCircle size={12} /> AI EXTRACTED — REVIEW REQUIRED
                            </span>
                          ) : extraction.review_status === "approved" ? (
                            <span className="px-2.5 py-1 rounded-full bg-teal-50 text-[#0E5E5A] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <Check size={12} /> APPROVED BY CAREGIVER
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <X size={12} /> REJECTED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Extracted Factual Content */}
                      <div className="space-y-2 text-xs text-slate-700">
                        {data?.summary && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Factual Summary</span>
                            <p className="font-medium text-slate-800 leading-relaxed">{data.summary}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          {data?.document_type && (
                            <div>
                              <span className="text-slate-400 block">Doc Type:</span>
                              <strong className="text-slate-800">{data.document_type}</strong>
                            </div>
                          )}
                          {data?.document_date && (
                            <div>
                              <span className="text-slate-400 block">Doc Date:</span>
                              <strong className="text-slate-800">{data.document_date}</strong>
                            </div>
                          )}
                          {data?.provider_or_hospital && (
                            <div className="col-span-2">
                              <span className="text-slate-400 block">Provider / Hospital:</span>
                              <strong className="text-slate-800">{data.provider_or_hospital}</strong>
                            </div>
                          )}
                        </div>

                        {/* Extracted Medications */}
                        {data?.medications?.length > 0 && (
                          <div className="pt-2 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Extracted Medications
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {data.medications.map((m: any, idx: number) => (
                                <span key={idx} className="px-2.5 py-1 rounded-xl bg-teal-50 text-[#0E5E5A] font-semibold text-[11px] border border-teal-100">
                                  {m.name} {m.dosage ? `(${m.dosage})` : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Extracted Measurements / Lab Markers */}
                        {data?.measurements?.length > 0 && (
                          <div className="pt-2 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Extracted Measurements / Markers
                            </span>
                            <div className="space-y-1">
                              {data.measurements.map((m: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 text-[11px]">
                                  <span className="font-semibold text-slate-800">{m.name}</span>
                                  <span className="font-bold text-[#0E5E5A]">{m.value} {m.unit || ""}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Extracted Conditions */}
                        {data?.conditions?.length > 0 && (
                          <div className="pt-2 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Extracted Health Conditions
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {data.conditions.map((c: any, idx: number) => (
                                <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Uncertainties */}
                        {data?.uncertainties?.length > 0 && (
                          <div className="pt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-[11px] text-amber-800 space-y-1">
                            <span className="font-bold block">Uncertainties / Ambiguities:</span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {data.uncertainties.map((u: any, idx: number) => (
                                <li key={idx}>{u}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Human Review Actions */}
                      {extraction.review_status === "pending_review" && (
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                          <button
                            onClick={() => onReviewExtraction(extraction.id, "rejected")}
                            className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <ThumbsDown size={14} /> Reject
                          </button>
                          <button
                            onClick={() => onReviewExtraction(extraction.id, "approved")}
                            className="px-4 py-1.5 rounded-xl bg-[#0E5E5A] text-white hover:bg-[#0C4E4B] text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <ThumbsUp size={14} /> Approve Extraction
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conditions */}
      <div className="quiet-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C2826] font-[family-name:var(--font-outfit)]">
            Health Conditions
          </h3>
        </div>

        {healthConditions.length === 0 ? (
          <p className="text-xs text-slate-500 font-light py-2">
            No conditions recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {healthConditions.map((cond) => (
              <div key={cond.id} className="p-3.5 rounded-2xl bg-[#F7F5F0] text-xs flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">{cond.name}</p>
                  <p className="text-slate-500 text-[11px]">{cond.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileView({
  profile,
  user,
  family,
  careRecipientsCount,
  onSignOut
}: {
  profile: any;
  user: any;
  family: any;
  careRecipientsCount: number;
  onSignOut: () => void;
}) {
  const caregiverName = formatName(profile?.full_name) || "Caregiver";
  const familyNameFormatted = family?.name ? `${formatName(family.name)} Family Circle` : "Family Network";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-[#1C2826]">
          Profile & Settings
        </h2>
        <p className="text-xs text-slate-500 font-light mt-0.5">
          Caregiver account & family settings
        </p>
      </div>

      <div className="quiet-card p-5 space-y-4">
        <div className="flex items-center gap-3 border-b border-[#EFECE6] pb-4">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 text-[#0E5E5A] font-bold text-lg flex items-center justify-center">
            {caregiverName.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1C2826] font-[family-name:var(--font-outfit)]">
              {caregiverName}
            </h3>
            <p className="text-xs text-slate-500 font-light">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs pt-1">
          {profile?.phone && (
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone Number</span>
              <span className="font-medium text-slate-800">{profile.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="quiet-card p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-[family-name:var(--font-outfit)]">
          Family Network
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Family Circle</span>
            <span className="font-semibold text-slate-800">{familyNameFormatted}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Registered Care Recipients</span>
            <span className="font-semibold text-slate-800">{careRecipientsCount} recipient(s) registered</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onSignOut}
          className="w-full py-3.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Sign Out of Account
        </button>
      </div>
    </div>
  );
}
