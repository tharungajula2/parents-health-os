"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, FileText, BookOpen, Users, Lock, ArrowRight, Activity, Bell, MessageCircle, Calendar, AlertTriangle, ShieldCheck, Heart, UserPlus, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import { loadDemoData } from "../utils/demoData";
import { useParentsAuth } from "../lib/supabase/context";

export default function Home() {
  const { 
    isSupabaseEnabled, 
    isAuthenticated, 
    isLoading, 
    parents, 
    onboard,
    signIn,
    signUp,
    signOut
  } = useParentsAuth();

  const [mode, setMode] = useState<"landing" | "login" | "signup" | "onboarding">("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) setAuthError(error.message || "Invalid credentials. Please try again.");
      } else {
        if (!fullName || !phone) {
          setAuthError("All fields are required.");
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, fullName, phone);
        if (error) setAuthError(error.message || "Failed to create account. Try another email.");
      }
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      alert("⚠️ You must certify that you have obtained parental consent to proceed.");
      return;
    }
    if (!onboardForm.familyName || !onboardForm.parentName || !onboardForm.parentPhone) {
      alert("Please fill out all onboarding details.");
      return;
    }
    setAuthError("");
    setIsSubmitting(true);
    try {
      const { error } = await onboard(onboardForm);
      if (error) {
        setAuthError(error.message || "Failed to establish digital care link. Please try again.");
      }
    } catch (err) {
      setAuthError("An unexpected error occurred during onboarding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0E5E5A]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#E05E1B]/5 blur-[120px]" />
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="h-16 w-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A] mb-4 shadow-inner"
        >
          <Activity size={32} className="animate-pulse" />
        </motion.div>
        <p className="data-label text-[#0E5E5A] animate-pulse !tracking-[0.25em] text-xs">Parents Health OS // Loading</p>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    if (mode === "landing") {
      return (
        <div className="flex min-h-screen items-center justify-center p-6 md:p-12 bg-[#FAF9F6] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E05E1B]/5 blur-[140px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#0E5E5A]/5 blur-[140px] rounded-full -ml-32 -mb-32" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl relative z-10 py-6"
          >
            <div className="text-center mb-12">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#e2ded5] shadow-sm mb-8"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#E05E1B] animate-pulse" />
                <span className="data-label text-[#0E5E5A]/80 uppercase tracking-widest text-[9px]">PARENTS HEALTH OS // ACTIVE INTERACTIVE PROTOTYPE</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 font-[family-name:var(--font-outfit)]">
                <span className="text-gradient">Parents Health OS</span>
              </h1>
              
              <p className="text-base md:text-lg text-slate-600 font-light max-w-2xl mx-auto leading-relaxed mb-10 font-[family-name:var(--font-inter)]">
                A warm, family-first dashboard for <span className="text-[#0E5E5A] font-semibold">Indian Elder-Care</span>, linking parents on WhatsApp with remote care oversight for adult children.
              </p>
            </div>

            {/* Core App Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 px-4 md:px-0 max-w-4xl mx-auto">
              <ModuleBrief 
                icon={<Stethoscope className="text-[#0E5E5A]" size={20} strokeWidth={1.5} />}
                title="Health Profile"
                desc="Comprehensive geriatric health scorecard & risk assessment."
              />
              <ModuleBrief 
                icon={<FileText className="text-[#0E5E5A]" size={20} strokeWidth={1.5} />}
                title="Smart Reports"
                desc="Clinical records synthesized into actionable insights."
              />
              <ModuleBrief 
                icon={<BookOpen className="text-[#0E5E5A]" size={20} strokeWidth={1.5} />}
                title="Daily Care"
                desc="Adherence logging and automated vitals checking."
              />
              <ModuleBrief 
                icon={<MessageCircle className="text-[#0E5E5A]" size={20} strokeWidth={1.5} />}
                title="WhatsApp Bridge"
                desc="Simulated dialogue interface with Anaya AI Care companion."
              />
            </div>

            <div className="flex flex-col items-center gap-8">
              <button
                onClick={() => setMode("login")}
                className="group relative flex items-center gap-6 rounded-2xl bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white px-12 py-5 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-900/10 active:scale-95 animate-bounce-subtle mb-4"
              >
                <span className="font-[family-name:var(--font-outfit)] uppercase tracking-[0.2em] text-[11px]">Establish Care Link</span>
                <ArrowRight size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
              </button>

              {/* Public Knowledge Base Banner (Placed Below Login Button) */}
              <div className="w-full bg-white border border-[#e2ded5] rounded-3xl p-5 mb-4 shadow-sm max-w-2xl mx-auto text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#0E5E5A]/20">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0E5E5A]/10 text-[#0E5E5A] text-[9px] font-bold uppercase tracking-wide font-mono">
                    <BookOpen className="w-3 h-3" />
                    Family Health Curriculum
                  </span>
                  <h3 className="text-sm md:text-base font-bold font-outfit text-[#122321]">Body & Mind OS — A Health Curriculum for Indian Families</h3>
                  <p className="text-xs text-slate-500 font-normal">A founder-built health education curriculum covering prevention, nutrition, and screening.</p>
                </div>
                
                <Link 
                  href="/resources/body-mind-os"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#0E5E5A] hover:bg-[#E05E1B] text-white text-[10px] font-bold uppercase tracking-wider font-outfit transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] text-white-only"
                >
                  Read Curriculum
                  <ArrowRight size={12} className="ml-1.5" />
                </Link>
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="data-label text-slate-400 text-[10px] uppercase tracking-widest font-bold text-center">
                  An interactive elder-care prototype designed & built by <span className="text-slate-500">Tharun Gajula</span>
                </p>
                <div className="h-px w-12 bg-[#e2ded5]" />
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    // Login/Signup Form
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#FAF9F6] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E05E1B]/5 blur-[120px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0E5E5A]/5 blur-[120px] rounded-full -ml-32 -mb-32" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-[family-name:var(--font-outfit)] uppercase">
              {mode === "login" ? "Welcome Back" : "Register Account"}
            </h2>
            <p className="text-slate-500 text-xs mt-1.5">PARENTS HEALTH OS // SANDBOX / SIMULATED DATA ONLY</p>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border-[#e2ded5] shadow-xl bg-white/70 backdrop-blur-md">
            {!isSupabaseEnabled && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-[11px] text-amber-800 font-light leading-relaxed">
                <AlertTriangle size={18} className="shrink-0 text-amber-600" />
                <div>
                  <span className="font-bold">Sandbox Environment Active:</span> Any login details will bypass auth and load standalone demo state immediately.
                </div>
              </div>
            )}

            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-[11px] text-red-800 font-light">
                <AlertTriangle size={18} className="shrink-0 text-red-500" />
                <div>{authError}</div>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amit Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#e2ded5] bg-[#FAF9F6]/40 focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                    />
                  </div>
                  <div>
                    <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Your Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 99999 99999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#e2ded5] bg-[#FAF9F6]/40 focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. child@parentshealth.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#e2ded5] bg-[#FAF9F6]/40 focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                />
              </div>

              <div>
                <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Security Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#e2ded5] bg-[#FAF9F6]/40 focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#0E5E5A] text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#0c4e4b] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : mode === "login" ? (
                  <>
                    <LogIn size={16} /> Enter Dashboard
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Create Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-[#e2ded5] pt-6 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                {mode === "login" ? "Need an account?" : "Already registered?"}
              </span>
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-[#0E5E5A] font-bold hover:underline"
              >
                {mode === "login" ? "Register Here" : "Log In"}
              </button>
            </div>
          </div>

          <button
            onClick={() => setMode("landing")}
            className="w-full text-center text-xs text-slate-400 mt-6 hover:text-slate-600 transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // Logged in but needs onboarding (first family member creation)
  if (parents.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#FAF9F6] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E05E1B]/5 blur-[120px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0E5E5A]/5 blur-[120px] rounded-full -ml-32 -mb-32" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-[family-name:var(--font-outfit)] uppercase">
              Configure Parents Health OS
            </h2>
            <p className="text-slate-550 text-[10px] mt-1.5 tracking-wider uppercase">Setup Family circle & DPDP Consent Logging</p>
          </div>

          <div className="glass-card p-8 md:p-10 rounded-[3rem] border-[#e2ded5] shadow-xl bg-white/70 backdrop-blur-md">
            <form onSubmit={handleOnboardSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Family Network Circle Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma Family Care"
                    value={onboardForm.familyName}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, familyName: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e2ded5] bg-[#FAF9F6]/40 focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Elder Parent's Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={onboardForm.parentName}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, parentName: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e2ded5] bg-[#FAF9F6]/40 focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Parent Relationship</label>
                  <select
                    value={onboardForm.relationship}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e2ded5] bg-[#FAF9F6]/40 focus:border-[#0E5E5A] focus:outline-none transition-all text-xs text-slate-650"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Grandmother">Grandmother</option>
                  </select>
                </div>

                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Parent WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98480 22338"
                    value={onboardForm.parentPhone}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e2ded5] bg-[#FAF9F6]/40 focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Preferred Check-In Language</label>
                  <select
                    value={onboardForm.language}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e2ded5] bg-[#FAF9F6]/40 focus:border-[#0E5E5A] focus:outline-none transition-all text-xs text-slate-650"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                  </select>
                </div>
              </div>

              {/* DPDPA 2023 DIGITAL CONSENT BOX */}
              <div className="p-6 bg-teal-50/50 border border-teal-100/60 rounded-[2rem] space-y-4">
                <div className="flex gap-3 items-start">
                  <ShieldCheck className="text-[#0E5E5A] shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase font-[family-name:var(--font-outfit)] tracking-wider">DPDP Act 2023 Readiness & Consent Simulation</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-light mt-1 font-[family-name:var(--font-inter)]">
                      This sandbox runs in educational readiness mode. Your data is stored locally in this browser. Optional AI report analysis may send uploaded report content to the configured Gemini API for processing. Under live production sync, data residency is planned for Mumbai (AP-SOUTH-1) regional servers.
                    </p>
                  </div>
                </div>
                
                <label className="flex items-start gap-3.5 cursor-pointer pt-2 group select-none">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-[#e2ded5] bg-white accent-[#0E5E5A] focus:ring-0 cursor-pointer mt-0.5 shrink-0"
                  />
                  <span className="text-[10px] text-slate-600 leading-relaxed font-normal group-hover:text-slate-800 transition-colors">
                    I certify that <span className="font-semibold text-slate-800">I have obtained consent</span> from my parent to simulate clinical checks, receive mock/optional WhatsApp check-ins through Anaya, and allow Parents Health OS to parse diagnostic insights.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between gap-6 border-t border-[#e2ded5] pt-6">
                <button
                  type="button"
                  onClick={signOut}
                  className="px-6 py-4 border border-[#e2ded5] hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel & Log Out
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Establish Care Link <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return <DashboardShell />;
}


function ModuleBrief({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card group p-6 md:p-8 rounded-[2rem] transition-all hover:bg-white hover:border-[#0E5E5A]/20 text-left flex flex-col justify-between h-full min-h-[140px]">
      <div>
        <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-[#0E5E5A]">
          {icon}
        </div>
        <h3 className="text-xs md:text-sm font-[family-name:var(--font-outfit)] font-bold text-slate-800 mb-2 uppercase tracking-wider">{title}</h3>
        <p className="text-[11px] md:text-xs text-slate-500 font-normal leading-relaxed font-[family-name:var(--font-inter)]">{desc}</p>
      </div>
    </div>
  );
}

import { SmartReport } from "../components/SmartReport";
import { ClinicalEngine } from "../components/ClinicalEngine";
import { MedicationTracker } from "../components/MedicationTracker";
import { CareTeam } from "../components/CareTeam";
import { WhatsAppDemo } from "../components/WhatsAppDemo";
import { HeaderIcons } from "../components/HeaderIcons";
import { ActivityFeed } from "../components/ActivityFeed";
import { ToastProvider, useToast } from "../components/ui/Toast";
import { 
  Trash2, 
  Plus, 
  Clock, 
  TrendingUp, 
  PlusCircle, 
  Check, 
  CheckSquare,
  Pill, 
  Footprints, 
  Smile, 
  Printer, 
  X, 
  Download, 
  Upload, 
  Play, 
  Briefcase 
} from "lucide-react";
import { ClinicHub } from "../components/ClinicHub";
import { CallOverlay } from "../components/CallOverlay";
import { SettingsAndBackup } from "../components/SettingsAndBackup";
import { generateCarePlan } from "../utils/carePlanEngine";
import { 
  getConsultRequests, 
  saveConsultRequest, 
  updateConsultStatus, 
  generateDoctorBrief 
} from "../utils/careTeamEngine";


function DashboardShell() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}

function DashboardContent() {
  const { 
    parents, 
    profile, 
    user, 
    signOut, 
    activeParent, 
    selectActiveParent,
    vitals,
    medications,
    medicationLogs,
    labReports,
    addVital,
    addMedication,
    toggleMedicationLog,
    isSupabaseEnabled
  } = useParentsAuth();
  
  const [activeView, setActiveView] = useState("dashboard");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);

  // App Mode State (Demo vs Personal)
  const [appMode, setAppMode] = useState<"demo" | "personal">("demo");
  
  // Modals / Quick Actions State
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showDoctorBriefModal, setShowDoctorBriefModal] = useState(false);
  
  // Form Inputs
  const [vitalInput, setVitalInput] = useState({
    bpSys: "",
    bpDia: "",
    sugar: "",
    weight: "",
    notes: ""
  });
  
  const [observationInput, setObservationInput] = useState({
    type: "General",
    severity: "Low" as "Low" | "Medium" | "High",
    note: ""
  });
  
  const [appointmentInput, setAppointmentInput] = useState({
    doctorName: "",
    specialty: "",
    date: "",
    time: "",
    reason: "",
    mode: "in-person" as "in-person" | "video" | "phone" | "whatsapp"
  });
  
  const [medicationInput, setMedicationInput] = useState({
    name: "",
    dosage: "",
    timing: "Morning",
    instructions: ""
  });

  const [generatedBrief, setGeneratedBrief] = useState<any>(null);
  
  // Dynamic Lists (Observations, Appointments)
  const [observations, setObservations] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Onboarding & Routine checklist manual overrides
  const [setupChecklistManual, setSetupChecklistManual] = useState<Record<string, boolean>>({});
  const [routineChecklist, setRoutineChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeParent) {
      const savedSetup = localStorage.getItem(`parents_health_setup_chk_${activeParent.id}`);
      if (savedSetup) {
        try { setSetupChecklistManual(JSON.parse(savedSetup)); } catch (e) {}
      } else {
        setSetupChecklistManual({});
      }
      
      const savedRoutine = localStorage.getItem(`parents_health_routine_chk_${activeParent.id}`);
      if (savedRoutine) {
        try { setRoutineChecklist(JSON.parse(savedRoutine)); } catch (e) {}
      } else {
        setRoutineChecklist({});
      }
    }
  }, [activeParent?.id]);

  const toggleSetupChecklist = (key: string) => {
    if (!activeParent) return;
    const next = { ...setupChecklistManual, [key]: !setupChecklistManual[key] };
    setSetupChecklistManual(next);
    localStorage.setItem(`parents_health_setup_chk_${activeParent.id}`, JSON.stringify(next));
    showToast("✅ Onboarding checklist status updated.", "success");
  };

  const toggleRoutineChecklist = (key: string) => {
    if (!activeParent) return;
    const next = { ...routineChecklist, [key]: !routineChecklist[key] };
    setRoutineChecklist(next);
    localStorage.setItem(`parents_health_routine_chk_${activeParent.id}`, JSON.stringify(next));
    showToast("📝 Care routine checklist updated.", "success");
  };

  useEffect(() => {
    const saved = localStorage.getItem("parents_health_mode") as "demo" | "personal";
    if (saved) {
      setAppMode(saved);
    }
  }, []);

  const loadObservations = (pId: string) => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(`parents_health_observations_${pId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    if (activeParent) {
      setObservations(loadObservations(activeParent.id));
      setAppointments(getConsultRequests(activeParent.id));
    }
  }, [activeParent?.id]);
  const { showToast } = useToast();

  const checkVitalThresholds = (bpSys?: number, bpDia?: number, sugar?: number) => {
    const alerts: string[] = [];
    if (bpSys && bpDia && bpSys > 0 && bpDia > 0) {
      if (bpSys >= 140 || bpDia >= 90 || bpSys < 90) {
        alerts.push("⚠️ Blood pressure: This value is outside the usual reference range used by this app. Please review with a qualified doctor if this is unexpected, repeated, or accompanied by symptoms. This app does not diagnose.");
      }
    }
    if (sugar && sugar > 0) {
      if (sugar > 125 || sugar < 70) {
        alerts.push("⚠️ Blood glucose: This value is outside the usual reference range used by this app. Please review with a qualified doctor if this is unexpected, repeated, or accompanied by symptoms. This app does not diagnose.");
      }
    }
    return alerts;
  };

  const handleSaveVital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParent) return;
    
    const sys = Number(vitalInput.bpSys) || 0;
    const dia = Number(vitalInput.bpDia) || 0;
    const sugar = Number(vitalInput.sugar) || 0;
    const weight = Number(vitalInput.weight) || 0;
    
    if (!sys && !dia && !sugar && !weight) {
      showToast("Please enter at least one measurement.", "error");
      return;
    }
    
    const result = await addVital({
      bp_sys: sys,
      bp_dia: dia,
      sugar: sugar,
      weight: weight,
      source: "manual"
    });
    
    if (result.success) {
      if (vitalInput.notes.trim() && result.data?.id) {
        localStorage.setItem(`parents_health_vital_notes_${result.data.id}`, vitalInput.notes.trim());
      }
      
      setVitalInput({
        bpSys: "",
        bpDia: "",
        sugar: "",
        weight: "",
        notes: ""
      });
      setShowVitalsModal(false);
      showToast("Vitals logged successfully!", "success");
    } else {
      showToast("Failed to save vitals.", "error");
    }
  };

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParent || !observationInput.note.trim()) return;
    
    const pId = activeParent.id;
    const current = loadObservations(pId);
    const newObs = {
      id: `obs-${Date.now()}`,
      type: observationInput.type,
      severity: observationInput.severity,
      note: observationInput.note.trim(),
      timestamp: new Date().toISOString()
    };
    
    const updated = [newObs, ...current];
    localStorage.setItem(`parents_health_observations_${pId}`, JSON.stringify(updated));
    setObservations(updated);
    setObservationInput({ type: "General", severity: "Low", note: "" });
    setShowObservationModal(false);
    showToast("Daily observation logged successfully!", "success");
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParent || !appointmentInput.doctorName.trim()) return;
    
    const pId = activeParent.id;
    const newReq: any = {
      id: `req-${Date.now()}`,
      parentId: pId,
      doctorName: appointmentInput.doctorName.trim(),
      specialty: appointmentInput.specialty.trim(),
      status: "confirmed",
      mode: appointmentInput.mode,
      scheduledAt: `${appointmentInput.date}T${appointmentInput.time || "12:00"}:00`,
      reason: appointmentInput.reason.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    saveConsultRequest(pId, newReq);
    setAppointments(getConsultRequests(pId));
    setAppointmentInput({
      doctorName: "",
      specialty: "",
      date: "",
      time: "",
      reason: "",
      mode: "in-person"
    });
    setShowAppointmentModal(false);
    showToast("Doctor consultation scheduled successfully!", "success");
  };

  const handleUpdateAppointment = (reqId: string, status: any) => {
    if (!activeParent) return;
    updateConsultStatus(activeParent.id, reqId, status);
    setAppointments(getConsultRequests(activeParent.id));
    showToast(`Appointment status updated to ${status}.`, "success");
  };

  const handleSaveMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParent || !medicationInput.name.trim()) return;
    
    const result = await addMedication({
      name: medicationInput.name.trim(),
      dosage: medicationInput.dosage.trim(),
      timing: medicationInput.timing,
      instructions: medicationInput.instructions.trim()
    });
    
    if (result.success) {
      setMedicationInput({
        name: "",
        dosage: "",
        timing: "Morning",
        instructions: ""
      });
      setShowMedicationModal(false);
      showToast("Medication added to active routine!", "success");
    } else {
      showToast("Failed to add medication. Please try again.", "error");
    }
  };

  const handleGenerateDashboardBrief = () => {
    if (!activeParent) return;
    
    const pId = activeParent.id;
    const savedAssessment = localStorage.getItem(`parents_health_assessment_data_v2_${pId}`) || localStorage.getItem("parents_health_assessment_data_v2");
    let scAnswers: any = {};
    if (savedAssessment) {
      try {
        scAnswers = JSON.parse(savedAssessment).answers || {};
      } catch (e) {}
    }
    
    const brief = generateDoctorBrief(
      pId,
      activeParent.name,
      scAnswers,
      medications,
      vitals,
      labReports
    );
    
    setGeneratedBrief(brief);
    setShowDoctorBriefModal(true);
  };

  const handleExportBackup = () => {
    if (!activeParent) return;
    const pId = activeParent.id;
    
    const backupData: any = {
      parentId: pId,
      parentName: activeParent.name,
      exportTimestamp: new Date().toISOString(),
      observations: loadObservations(pId),
      appointments: getConsultRequests(pId),
      medications: medications,
      vitals: vitals,
      medicationLogs: medicationLogs
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parents_health_backup_${activeParent.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast("Care records backup JSON exported successfully!", "success");
  };


  const handleSystemReset = () => {
    if (confirm("⚠️ DANGER: Wipe Parents-Health's memory? This is irreversible.")) {
      if (confirm("Final confirmation required.")) {
        localStorage.removeItem("parents_health_auth_v2");
        localStorage.removeItem("parents_health_assessment_data_v2");
        localStorage.removeItem("parents_health_history");
        localStorage.removeItem("parents_health_latest_summary");
        localStorage.removeItem("parents_health_active_meds");
        localStorage.removeItem("parents_health_user_name");
        localStorage.removeItem("parents_health_user_gender");
        localStorage.removeItem("parents_health_user_age");
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("parents_health_med_log_") || key.startsWith("parents_health_daily_log_")) {
            localStorage.removeItem(key);
          }
        });
        window.location.reload();
      }
    }
  };

  const primaryParentName = activeParent?.name || parents[0]?.name || "Geriatric Profile";

  // Helper calculations for Today Care Dashboard
  const todayStr = new Date().toISOString().split("T")[0];
  const activeMeds = medications.filter(m => m.is_active !== false);
  const todayMedsStatus = activeMeds.map(med => {
    const isTaken = medicationLogs.some(
      log => log.medication_id === med.id && log.log_date === todayStr && log.taken
    );
    return {
      ...med,
      taken: isTaken
    };
  });
  
  const totalMeds = todayMedsStatus.length;
  const takenMeds = todayMedsStatus.filter(m => m.taken).length;
  const adherencePct = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;
  
  const sortedVitals = [...vitals].sort((a, b) => {
    return new Date(b.measured_at || b.created_at || 0).getTime() - new Date(a.measured_at || a.created_at || 0).getTime();
  });
  const latestVital = sortedVitals[0];
  const vitalAlerts = latestVital ? checkVitalThresholds(latestVital.bp_sys ?? undefined, latestVital.bp_dia ?? undefined, latestVital.sugar ?? undefined) : [];

  const getMedTimingGroup = (med: any) => {
    const t = (med.timing || "").toLowerCase();
    if (t.includes("morning") || t.includes("breakfast") || t.includes("am")) return "Morning";
    if (t.includes("noon") || t.includes("lunch") || t.includes("pm")) return "Noon";
    if (t.includes("evening") || t.includes("after 6") || t.includes("tea")) return "Evening";
    if (t.includes("night") || t.includes("sleep") || t.includes("bedtime")) return "Night";
    return "Morning"; // fallback
  };

  const groupedMeds = {
    Morning: todayMedsStatus.filter(m => getMedTimingGroup(m) === "Morning"),
    Noon: todayMedsStatus.filter(m => getMedTimingGroup(m) === "Noon"),
    Evening: todayMedsStatus.filter(m => getMedTimingGroup(m) === "Evening"),
    Night: todayMedsStatus.filter(m => getMedTimingGroup(m) === "Night")
  };

  const getAnayaSummary = () => {
    const pName = activeParent?.name?.split(' ')[0] || 'Parent';
    let summary = `Hello! I am Anaya, your daily elder-care companion. Today's care routine is active for ${pName}. `;
    
    if (totalMeds === 0) {
      summary += "No medications are scheduled in the routine yet. ";
    } else if (takenMeds === totalMeds) {
      summary += `Fabulous job! All ${totalMeds} scheduled medications for today have been completed (${adherencePct}% adherence). `;
    } else {
      summary += `${pName} has completed ${takenMeds} of ${totalMeds} medications scheduled for today (${adherencePct}% adherence). `;
      const pendingMeds = todayMedsStatus.filter(m => !m.taken);
      if (pendingMeds.length > 0) {
        summary += `⚠️ Please remember to take scheduled medications: ${pendingMeds.map(m => m.name).join(", ")}. `;
      }
    }
    
    if (latestVital) {
      const bpStr = (latestVital.bp_sys && latestVital.bp_dia) ? `Blood Pressure is ${latestVital.bp_sys}/${latestVital.bp_dia} mmHg` : "";
      const sugarStr = latestVital.sugar ? `Blood Sugar is ${latestVital.sugar} mg/dL` : "";
      const weightStr = latestVital.weight ? `Weight is ${latestVital.weight} kg` : "";
      const vitalsParts = [bpStr, sugarStr, weightStr].filter(Boolean);
      
      if (vitalsParts.length > 0) {
        summary += `Latest physiological vitals: ${vitalsParts.join(", ")}. `;
      }
      
      if (vitalAlerts.length > 0) {
        summary += "Notice: Some physiological readings are outside target thresholds. Please check the clinical warnings below. ";
      }
    } else {
      summary += `No vitals have been logged today. I highly recommend recording ${pName}'s physical vitals to establish a stable wellness baseline. `;
    }
    
    if (observations.length > 0) {
      const todayObs = observations.filter(o => o.timestamp?.split("T")[0] === todayStr);
      if (todayObs.length > 0) {
        summary += `We have logged ${todayObs.length} subjective observations today. `;
      }
    }
    
    if (appointments.length > 0) {
      const upcoming = appointments.filter(a => a.status === "confirmed" || a.status === "pending" || a.status === "requested");
      if (upcoming.length > 0) {
        summary += `There is 1 upcoming doctor consultation scheduled for ${pName}: Dr. ${upcoming[0].doctorName} (${upcoming[0].specialty}) at ${new Date(upcoming[0].scheduledAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}. `;
      }
    }
    
    return summary;
  };


  return (
    <div className="flex min-h-screen relative text-slate-800 bg-[#FAF9F6]">
      <ToastProvider>
        {/* MOBILE HEADER */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0E5E5A] text-white z-40 flex items-center justify-between px-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-teal-100 hover:bg-white/5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#E05E1B] shadow-[0_0_8px_rgba(224,94,27,0.6)]" />
            <span className="font-bold tracking-tight text-white">Parents Health OS</span>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Sidebar Backdrop (Mobile) */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-[#122321]/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A4B48] text-white transform transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto flex flex-col justify-between`}>
          <div>
            <div className="flex h-20 md:h-24 items-center justify-between px-6 md:px-8 mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => { setActiveView("dashboard"); setIsMobileMenuOpen(false); }}>
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-[#E05E1B] to-[#D97706] flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20 text-sm md:text-base">
                  P
                </div>
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-outfit)] font-black text-white text-base md:text-lg leading-tight tracking-tight uppercase">Parents Health</span>
                  <span className="data-label text-teal-200 !text-[7px] md:!text-[8px] uppercase !tracking-[0.2em]">Oversight Dashboard</span>
                </div>
              </div>
            </div>

            <nav className="p-4 px-6 space-y-2">
              <NavItem icon={<Stethoscope size={18} strokeWidth={1.5} />} label="Parent Profile" active={activeView === "clinical"} onClick={() => { setActiveView("clinical"); setIsMobileMenuOpen(false); }} />
              <NavItem icon={<FileText size={18} strokeWidth={1.5} />} label="Reports & Insights" isNew active={activeView === "smart-reports"} onClick={() => { setActiveView("smart-reports"); setIsMobileMenuOpen(false); }} />
              <NavItem icon={<BookOpen size={18} strokeWidth={1.5} />} label="Daily Care Logs" active={activeView === "medicines"} onClick={() => { setActiveView("medicines"); setIsMobileMenuOpen(false); }} />
              <NavItem icon={<Users size={18} strokeWidth={1.5} />} label="Care Team" active={activeView === "care-team"} onClick={() => { setActiveView("care-team"); setIsMobileMenuOpen(false); }} />
              <NavItem icon={<Calendar size={18} strokeWidth={1.5} />} label="Clinic Hub" isNew active={activeView === "clinic-hub"} onClick={() => { setActiveView("clinic-hub"); setIsMobileMenuOpen(false); }} />
              <NavItem icon={<MessageCircle size={18} strokeWidth={1.5} />} label="WhatsApp Demo" isNew active={activeView === "whatsapp"} onClick={() => { setActiveView("whatsapp"); setIsMobileMenuOpen(false); }} />
              <NavItem icon={<ShieldCheck size={18} strokeWidth={1.5} />} label="Settings & Backup" isNew active={activeView === "settings"} onClick={() => { setActiveView("settings"); setIsMobileMenuOpen(false); }} />
            </nav>
          </div>

          <div className="p-6 border-t border-white/5 space-y-6">
            {/* User Profile Summary Card */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-teal-900 border border-teal-850 flex items-center justify-center font-bold text-xs uppercase text-teal-150 shadow-inner">
                  {profile?.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold truncate text-white uppercase font-[family-name:var(--font-outfit)] tracking-wider">
                    {profile?.full_name || "Family Monitor"}
                  </span>
                  <span className="text-[8px] text-teal-200/50 truncate font-light font-[family-name:var(--font-inter)]">
                    {user?.email || "active-caregiver"}
                  </span>
                </div>
              </div>
              <button 
                onClick={signOut} 
                className="w-full text-center py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-300 rounded-xl text-[8px] font-black uppercase tracking-wider text-teal-100 transition-colors"
              >
                Log Out
              </button>
            </div>

            <button onClick={handleSystemReset} className="group flex w-full items-center gap-5 rounded-xl px-5 py-3 text-[9px] font-bold uppercase tracking-[0.3em] text-teal-200/40 hover:bg-red-500/10 hover:text-red-300 transition-all font-[family-name:var(--font-outfit)]">
              <Trash2 size={14} strokeWidth={1.5} className="opacity-80" /> RESET SYSTEM
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 pt-20 md:p-6 md:p-10 lg:p-6 md:p-12 overflow-x-hidden relative">
          <header className="mb-10 md:mb-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-8">
            <div className="flex items-center gap-4 md:gap-6">
               <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl md:rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A] shadow-inner">
                <Users size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight flex flex-col md:flex-row md:items-center relative">
                  {parents.length > 1 ? (
                    <div className="relative inline-block">
                      <button
                        onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                        className="flex items-center gap-2 text-[#0E5E5A] hover:opacity-90 bg-white/40 border border-[#e2ded5] px-4 py-2 rounded-2xl transition-all shadow-sm font-semibold text-xs md:text-sm"
                      >
                        <span className="truncate max-w-[150px] md:max-w-none">{primaryParentName}</span>
                        <svg className={`h-4 w-4 transition-transform duration-350 ${isParentDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {isParentDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsParentDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute left-0 mt-2 w-64 glass-card p-3 rounded-2xl border-[#e2ded5] shadow-2xl bg-white/90 backdrop-blur-md z-20 space-y-1"
                            >
                              <div className="px-3 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-2">Switch Parent Context</div>
                              {parents.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    selectActiveParent(p.id);
                                    setIsParentDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                                    (activeParent?.id || parents[0]?.id) === p.id
                                      ? 'bg-[#0E5E5A]/10 text-[#0E5E5A] font-bold'
                                      : 'hover:bg-slate-50 text-slate-600 font-normal'
                                  }`}
                                >
                                  <span>{p.name}</span>
                                  {(activeParent?.id || parents[0]?.id) === p.id && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#E05E1B]" />
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <span className="truncate max-w-[150px] md:max-w-none text-[#0E5E5A]">{primaryParentName}</span>
                  )}
                  <span className="hidden md:inline text-slate-350 font-light mx-4">/</span>
                  <span className="text-slate-500 font-medium text-sm md:text-base md:mt-0 mt-1 uppercase md:normal-case">FAMILY MEMBER OVERVIEW</span>
                </h1>
                <div className="flex items-center gap-3 mt-1.5 md:mt-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#E05E1B] animate-pulse shadow-[0_0_10px_rgba(224,94,27,0.5)]" />
                  <p className="data-label text-slate-555 text-[8px] md:text-[10px] !tracking-[0.2em] uppercase">FAMILY NETWORK STATUS // CONNECTED</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 md:gap-8 self-end sm:self-auto">
              <HeaderIcons />
            </div>
          </header>


          {activeView === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* TOP STATUS AND ANAYA AI CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CARE STATUS WIDGET */}
                <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-white border border-[#e2ded5] shadow-sm flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-transform duration-1000 group-hover:scale-110">
                    <Heart size={180} className="text-[#0E5E5A]" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="data-label !text-[#E05E1B] !text-[8px] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                        {appMode === "personal" ? "Personal Mode" : "Demo Mode"}
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono tracking-wider">{todayStr}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl font-extrabold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">
                        Today's Care Status
                      </h3>
                      <p className="text-sm text-slate-500 font-light mt-1 font-[family-name:var(--font-inter)] leading-relaxed">
                        Continuous active monitoring for <span className="font-semibold text-slate-700">{activeParent?.name || primaryParentName}</span>.
                      </p>
                    </div>

                    {/* Progress Circle & Metrics */}
                    <div className="flex items-center gap-6 py-2">
                      <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                        {/* SVG Progress Circle */}
                        <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#0E5E5A] transition-all duration-1000 ease-out"
                            strokeWidth="3.5"
                            strokeDasharray={`${adherencePct}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)]">{adherencePct}%</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">Medication Adherence</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-light">{takenMeds} of {totalMeds} pills recorded today</div>
                        {totalMeds > 0 && takenMeds === totalMeds && (
                          <div className="text-[10px] text-teal-600 font-semibold mt-1 flex items-center gap-1">
                            <Check size={10} className="stroke-[3]" /> Perfect adherence!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-light relative z-10">
                    <span>Vitals Logged: <strong className="text-slate-700 font-semibold">{latestVital ? "Logged Today" : "Pending Today"}</strong></span>
                    <span>Observations: <strong className="text-slate-700 font-semibold">{observations.filter(o => o.timestamp?.split("T")[0] === todayStr).length}</strong></span>
                  </div>
                </div>

                {/* DYNAMIC LOCAL ANAYA CARE COMPANION SUMMARY CARD */}
                <div className="lg:col-span-2 p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-[#0E5E5A] to-[#0A4B48] text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] transition-transform duration-1000 group-hover:scale-110">
                    <Activity size={200} className="text-white" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                      {/* Anaya Avatar with animated aura */}
                      <div className="relative h-12 w-12 rounded-2xl bg-teal-100/10 border border-white/20 flex items-center justify-center text-teal-300 shadow-inner group-hover:rotate-6 transition-transform">
                        <div className="absolute inset-0 rounded-2xl bg-teal-400/20 animate-ping opacity-60" />
                        <MessageCircle size={22} className="relative z-10" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)] uppercase tracking-wide">Anaya AI Assistant</h4>
                        <p className="text-[9px] text-teal-200/70 tracking-widest font-mono uppercase">REAL-TIME DETERMINISTIC CARE BRIEF</p>
                      </div>
                    </div>

                    <div className="p-5 md:p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-md">
                      <p className="text-white-only opacity-90 font-light leading-relaxed text-sm font-[family-name:var(--font-inter)]">
                        "{getAnayaSummary()}"
                      </p>
                    </div>
                  </div>

                  {/* PROMINENT SAFETY DISCLAIMER */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-start gap-3 relative z-10">
                    <div className="h-5 w-5 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#E05E1B] shrink-0 mt-0.5">
                      <AlertTriangle size={12} className="stroke-[2.5]" />
                    </div>
                    <p className="text-[10px] text-white-only opacity-75 leading-relaxed font-light">
                      <strong className="text-white-only font-semibold">Clinical Safety Lock Notice:</strong> Anaya acts as a wellness tracker and context brief builder. She does not diagnose or replace a medical professional. For any persistent physiological variations, sudden pain, or chest discomfort, please contact your emergency care physician or primary doctor immediately.
                    </p>
                  </div>
                </div>

              </div>

              {/* QUICK ACTIONS TOOLBAR */}
              <div className="glass-card p-6 rounded-[2rem] border-[#e2ded5] shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#E05E1B]" />
                    <h4 className="text-xs font-bold text-slate-500 font-[family-name:var(--font-outfit)] tracking-wider uppercase">Caregiver Actions</h4>
                  </div>
                  
                  {/* Grid of Action Buttons */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">
                    
                    <button 
                      onClick={() => setShowVitalsModal(true)}
                      className="px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[#0E5E5A]/5 hover:bg-[#0E5E5A]/10 text-[#0E5E5A] border border-[#0E5E5A]/10 hover:border-[#0E5E5A]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Activity size={12} />
                      Log Vitals
                    </button>
                    
                    <button 
                      onClick={() => setShowObservationModal(true)}
                      className="px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[#0E5E5A]/5 hover:bg-[#0E5E5A]/10 text-[#0E5E5A] border border-[#0E5E5A]/10 hover:border-[#0E5E5A]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Smile size={12} />
                      Log Observation
                    </button>
                    
                    <button 
                      onClick={() => setShowAppointmentModal(true)}
                      className="px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[#0E5E5A]/5 hover:bg-[#0E5E5A]/10 text-[#0E5E5A] border border-[#0E5E5A]/10 hover:border-[#0E5E5A]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar size={12} />
                      Book Consult
                    </button>
                    
                    <button 
                      onClick={() => setShowMedicationModal(true)}
                      className="px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[#0E5E5A]/5 hover:bg-[#0E5E5A]/10 text-[#0E5E5A] border border-[#0E5E5A]/10 hover:border-[#0E5E5A]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Pill size={12} />
                      Add Medication
                    </button>
                    
                    <button 
                      onClick={handleGenerateDashboardBrief}
                      className="px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[#E05E1B]/10 hover:bg-[#E05E1B]/20 text-[#E05E1B] border border-[#E05E1B]/20 transition-all flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
                    >
                      <Printer size={12} />
                      Doctor Brief
                    </button>
                    
                    <button 
                      onClick={handleExportBackup}
                      className="px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 transition-all flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
                    >
                      <Download size={12} />
                      Export Backup
                    </button>
                    
                  </div>
                </div>
              </div>

              {/* STABILIZATION ONBOARDING & DAILY CARE CHECKS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* FIRST SETUP CHECKLIST CARD */}
                <div className="glass-card p-8 rounded-[2.5rem] border-[#e2ded5] shadow-sm flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E05E1B]">
                        <CheckSquare size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">First-Time Setup Status</h3>
                        <p className="text-[10px] text-slate-500 font-light mt-0.5 tracking-wider">PREPARE THE APP FOR GENUINE PERSONAL FAMILY USE</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { id: "profile", label: `Configure Parent Profile (${activeParent?.name || 'Amma/Papa'})`, checked: !!activeParent },
                        { id: "emergency", label: "Add Emergency Care Contacts", checked: true }, // Default emergency config setup
                        { id: "doctor", label: "Link Primary Consultation Doctor", checked: appointments.length > 0 || setupChecklistManual["doctor"] },
                        { id: "medications", label: `Input Active Medications List (${medications.length} Added)`, checked: medications.length > 0 },
                        { id: "vitals", label: "Log Initial Vitals baseline measurements", checked: vitals.length > 0 },
                        { id: "appointment", label: "Schedule upcoming care consults", checked: appointments.length > 0 },
                        { id: "backup", label: "Trigger first portable data backup", checked: setupChecklistManual["backup"] }
                      ].map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => toggleSetupChecklist(item.id)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100/50 cursor-pointer transition-all group"
                        >
                          <div className={`h-5 w-5 rounded-md flex items-center justify-center transition-all ${item.checked ? 'bg-[#0E5E5A] text-white border-transparent' : 'border border-slate-300 bg-white group-hover:border-slate-400'}`}>
                            {item.checked && <Check size={12} className="stroke-[3]" />}
                          </div>
                          <span className={`text-[11px] font-medium leading-none transition-all ${item.checked ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DATA RESIDENCY BANNER */}
                  <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex items-start gap-2.5 text-[10px] text-slate-600 font-light leading-relaxed">
                    <AlertTriangle size={14} className="text-[#E05E1B] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-slate-800">Secure Offline Sandbox:</strong> Data is saved 100% locally in this browser. To protect your records from loss, please export a backup regularly.
                    </div>
                  </div>
                </div>

                {/* DAILY CAREGIVER ROUTINE CHECKLIST CARD */}
                <div className="glass-card p-8 rounded-[2.5rem] border-[#e2ded5] shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A]">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Daily Caregiver Routine</h3>
                      <p className="text-[10px] text-slate-500 font-light mt-0.5 tracking-wider">DAILY CHECKLIST STRATEGIES FOR CONTINUOUS TRACKING</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Morning bucket */}
                    <div className="space-y-4">
                      <div className="text-[10px] font-extrabold text-[#E05E1B] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100 inline-block">
                        ☀️ Morning Routine
                      </div>
                      <div className="space-y-2.5">
                        {[
                          { id: "morning_meds", label: "Check morning pills intake" },
                          { id: "morning_vitals", label: "Log baseline vitals if needed" },
                          { id: "morning_observations", label: "Note qualitative symptoms/behavior" }
                        ].map((item, idx) => {
                          const isChecked = !!routineChecklist[item.id];
                          return (
                            <div 
                              key={idx}
                              onClick={() => toggleRoutineChecklist(item.id)}
                              className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100/50 cursor-pointer transition-all group"
                            >
                              <div className={`h-4.5 w-4.5 rounded flex items-center justify-center transition-all ${isChecked ? 'bg-[#0E5E5A] text-white border-transparent' : 'border border-slate-350 bg-white group-hover:border-slate-400'}`}>
                                {isChecked && <Check size={10} className="stroke-[3]" />}
                              </div>
                              <span className={`text-[10px] font-medium leading-none transition-all ${isChecked ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Evening bucket */}
                    <div className="space-y-4">
                      <div className="text-[10px] font-extrabold text-[#0E5E5A] uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100 inline-block">
                        🌙 Evening Routine
                      </div>
                      <div className="space-y-2.5">
                        {[
                          { id: "evening_meds", label: "Review afternoon/evening meds" },
                          { id: "evening_obs", label: "Add sleep, mood, or food intake logs" },
                          { id: "evening_appointments", label: "Verify upcoming consultations" },
                          { id: "evening_backup", label: "Export and download daily backup" }
                        ].map((item, idx) => {
                          const isChecked = !!routineChecklist[item.id];
                          return (
                            <div 
                              key={idx}
                              onClick={() => toggleRoutineChecklist(item.id)}
                              className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100/50 cursor-pointer transition-all group"
                            >
                              <div className={`h-4.5 w-4.5 rounded flex items-center justify-center transition-all ${isChecked ? 'bg-[#0E5E5A] text-white border-transparent' : 'border border-slate-350 bg-white group-hover:border-slate-400'}`}>
                                {isChecked && <Check size={10} className="stroke-[3]" />}
                              </div>
                              <span className={`text-[10px] font-medium leading-none transition-all ${isChecked ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* MEDICATION TIMELINE & ACTIVE INTAKE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* DAILY MEDICATIONS TIMELINE CHECKLIST */}
                <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border-[#e2ded5] shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A]">
                        <Pill size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Daily Medications</h3>
                        <p className="text-[10px] text-slate-500 font-light mt-0.5 tracking-wider">TAP MEDICINE TO TOGGLE TODAY'S COMPLIANCE STATUS</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowMedicationModal(true)}
                      className="px-4 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-widest text-[#0E5E5A] bg-[#0E5E5A]/5 hover:bg-[#0E5E5A]/10 border border-[#0E5E5A]/10 transition-all flex items-center gap-1.5"
                    >
                      <Plus size={11} className="stroke-[3]" /> Add New
                    </button>
                  </div>

                  {totalMeds === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-light">
                      No active medications added to routine. Use the quick actions toolbar or add buttons to create daily trackers.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {(["Morning", "Noon", "Evening", "Night"] as const).map(slot => {
                        const meds = groupedMeds[slot];
                        if (meds.length === 0) return null;
                        
                        return (
                          <div key={slot} className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 font-[family-name:var(--font-outfit)] uppercase tracking-wider flex items-center gap-2">
                              <Clock size={12} className="text-[#E05E1B]" /> {slot} Scheduled
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {meds.map(med => (
                                <div 
                                  key={med.id}
                                  onClick={() => toggleMedicationLog(med.id, !med.taken, todayStr)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                                    med.taken 
                                      ? "bg-teal-50/50 border-teal-200/80" 
                                      : "bg-white border-[#e2ded5] hover:border-teal-200 hover:bg-slate-50/30"
                                  }`}
                                >
                                  <div className="space-y-1 pr-3">
                                    <div className={`font-semibold text-sm transition-colors ${med.taken ? "text-teal-800 line-through opacity-70" : "text-slate-800"}`}>
                                      {med.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-light flex items-center gap-1.5">
                                      <span>Dosage: {med.dosage}</span>
                                      {med.instructions && (
                                        <>
                                          <span className="text-slate-300">•</span>
                                          <span className="truncate max-w-[120px]">{med.instructions}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Compliance Toggle Box */}
                                  <div className={`h-6 w-6 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
                                    med.taken 
                                      ? "bg-teal-600 border-teal-600 text-white" 
                                      : "border-slate-300 text-transparent group-hover:border-teal-500"
                                  }`}>
                                    <Check size={14} className="stroke-[3]" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* TODAY'S PHYSIOLOGICAL VITALS PANEL */}
                <div className="lg:col-span-1 glass-card p-8 rounded-[2.5rem] border-[#e2ded5] shadow-sm flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E05E1B]">
                          <Activity size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Physiological Vitals</h3>
                          <p className="text-[10px] text-slate-500 font-light mt-0.5 tracking-wider">LATEST LOGGED METRICS & CLINICAL WARNS</p>
                        </div>
                      </div>
                    </div>

                    {/* VITAL CARDS GRID */}
                    <div className="grid grid-cols-2 gap-3">
                      
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Blood Pressure</span>
                        <span className="text-lg font-bold text-slate-800 block mt-1">
                          {latestVital?.bp_sys && latestVital?.bp_dia ? `${latestVital.bp_sys}/${latestVital.bp_dia}` : "-- / --"}
                        </span>
                        <span className="text-[9px] text-slate-500 font-light">mmHg</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Blood Sugar</span>
                        <span className="text-lg font-bold text-slate-800 block mt-1">
                          {latestVital?.sugar ? `${latestVital.sugar}` : "--"}
                        </span>
                        <span className="text-[9px] text-slate-500 font-light">mg/dL</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Body Weight</span>
                        <span className="text-lg font-bold text-slate-800 block mt-1">
                          {latestVital?.weight ? `${latestVital.weight}` : "--"}
                        </span>
                        <span className="text-[9px] text-slate-500 font-light">kg</span>
                      </div>

                      <button 
                        onClick={() => setShowVitalsModal(true)}
                        className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-center hover:bg-teal-100/50 transition-all flex flex-col items-center justify-center text-[#0E5E5A] group animate-pulse"
                      >
                        <PlusCircle size={22} className="group-hover:scale-115 transition-transform text-[#E05E1B]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-2">Log New Vitals</span>
                      </button>

                    </div>

                    {/* PHYSIOLOGICAL REFERENCE RANGE NOTIFICATION */}
                    {vitalAlerts.length > 0 ? (
                      <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#E05E1B]">
                          <AlertTriangle size={14} className="stroke-[2.5]" /> REFERENCE RANGE NOTIFICATION
                        </div>
                        <ul className="space-y-1.5">
                          {vitalAlerts.map((alert, i) => (
                            <li key={i} className="text-[10px] text-slate-700 leading-relaxed font-light list-disc list-inside">
                              {alert.replace("⚠️ ", "")}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : latestVital ? (
                      <div className="p-4 rounded-2xl bg-teal-50/30 border border-teal-100 flex items-center gap-2 text-[10px] text-[#0E5E5A] font-light leading-relaxed">
                        <Check size={14} className="stroke-[3]" /> All recorded physiological metrics are currently within the usual reference range.
                      </div>
                    ) : null}

                  </div>

                  {/* Quick Vitals Log info */}
                  <div className="pt-4 border-t border-slate-150 mt-4 text-[10px] text-slate-400 font-light flex items-center justify-between">
                    <span>Source: {latestVital?.source || "None"}</span>
                    <span>Logged: {latestVital?.measured_at ? new Date(latestVital.measured_at).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }) : "Never"}</span>
                  </div>
                </div>

              </div>

              {/* TIMELINE OF OBSERVATIONS & SCHEDULED APPOINTMENTS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CARE TIMELINE & OBSERVATIONS LOG */}
                <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border-[#e2ded5] shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A]">
                        <Smile size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Caregiver Observations</h3>
                        <p className="text-[10px] text-slate-500 font-light mt-0.5 tracking-wider">TIMELINE OF DAILY SYMPTOMATIC & GENERAL BEHAVIORAL LOGS</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowObservationModal(true)}
                      className="px-4 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-widest text-[#0E5E5A] bg-[#0E5E5A]/5 hover:bg-[#0E5E5A]/10 border border-[#0E5E5A]/10 transition-all flex items-center gap-1.5"
                    >
                      <Plus size={11} className="stroke-[3]" /> Add Observation
                    </button>
                  </div>

                  {observations.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-light">
                      No observational logs entered for this parent profile yet. Log behavioral patterns or clinical warnings.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[22rem] overflow-y-auto pr-2">
                      {observations.slice(0, 5).map(obs => (
                        <div key={obs.id} className="p-5 rounded-2xl bg-white border border-[#e2ded5] hover:border-teal-100 transition-all relative overflow-hidden group">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                obs.severity === "High" 
                                  ? "bg-red-50 text-red-700 border border-red-100" 
                                  : obs.severity === "Medium"
                                  ? "bg-orange-50 text-orange-700 border border-orange-100"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}>
                                {obs.severity} Severity
                              </span>
                              <span className="text-[10px] text-[#0E5E5A] font-bold bg-[#0E5E5A]/5 px-2.5 py-0.5 rounded-md uppercase tracking-wider">{obs.type}</span>
                            </div>
                            <span className="text-[9px] text-slate-450 font-light font-mono">
                              {new Date(obs.timestamp).toLocaleDateString()} at {new Date(obs.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          
                          <p className="text-slate-700 text-sm font-light leading-relaxed mt-3 font-[family-name:var(--font-inter)]">
                            {obs.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CLINICAL DOCTOR CONSULTATIONS PANEL */}
                <div className="lg:col-span-1 glass-card p-8 rounded-[2.5rem] border-[#e2ded5] shadow-sm flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A]">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Appointments</h3>
                          <p className="text-[10px] text-slate-500 font-light mt-0.5 tracking-wider">UPCOMING CLINICAL VISITS & STATS</p>
                        </div>
                      </div>
                    </div>

                    {appointments.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-light flex flex-col items-center justify-center">
                        <Calendar size={24} strokeWidth={1} className="text-slate-300 mb-2" />
                        No consultations scheduled. Use the Action Button to record upcoming doctor appointments.
                      </div>
                    ) : (
                      <div className="space-y-3.5 max-h-[22rem] overflow-y-auto pr-1">
                        {appointments.slice(0, 3).map(app => (
                          <div key={app.id} className="p-4 rounded-2xl bg-white border border-[#e2ded5] hover:border-teal-50 transition-all space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-bold text-sm text-slate-800 font-[family-name:var(--font-outfit)] uppercase tracking-tight">
                                  Dr. {app.doctorName}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-semibold uppercase">{app.specialty}</p>
                              </div>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                                app.status === "completed" 
                                  ? "bg-slate-100 text-slate-600 border border-slate-200" 
                                  : "bg-teal-50 text-[#0E5E5A] border border-teal-100"
                              }`}>
                                {app.status}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-600 font-light space-y-1">
                              <div className="flex justify-between">
                                <span>Date:</span>
                                <strong className="font-semibold text-slate-800">{new Date(app.scheduledAt).toLocaleDateString()}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Time:</span>
                                <strong className="font-semibold text-slate-800">{new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Mode:</span>
                                <strong className="font-semibold text-slate-800 uppercase">{app.mode}</strong>
                              </div>
                              {app.reason && (
                                <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex justify-between gap-2">
                                  <span>Reason:</span>
                                  <strong className="font-semibold text-slate-800 truncate max-w-[120px]">{app.reason}</strong>
                                </div>
                              )}
                            </div>

                            {app.status === "confirmed" && (
                              <button 
                                onClick={() => handleUpdateAppointment(app.id, "completed")}
                                className="w-full py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all text-center flex items-center justify-center gap-1 border border-teal-100"
                              >
                                <Check size={11} className="stroke-[3]" /> Mark Completed
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setShowAppointmentModal(true)}
                    className="w-full mt-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[#0E5E5A]/5 hover:bg-[#0E5E5A]/10 text-[#0E5E5A] border border-[#0E5E5A]/10 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={13} />
                    Schedule New Consult
                  </button>
                </div>

              </div>

            </div>
          )}

          {activeView === "smart-reports" && <SmartReport onNavigate={() => setActiveView("clinical")} />}
          {activeView === "clinical" && <ClinicalEngine />}
          {activeView === "medicines" && <MedicationTracker onTriggerCall={() => setIsCallActive(true)} onNavigate={setActiveView} />}
          {activeView === "care-team" && <CareTeam />}
          {activeView === "clinic-hub" && <ClinicHub />}
          {activeView === "whatsapp" && <WhatsAppDemo />}
          {activeView === "settings" && <SettingsAndBackup />}

          {/* FOOTER */}
          <footer className="mt-20 md:mt-32 py-12 md:py-16 border-t border-[#e2ded5] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 text-center md:text-left">
            <div className="data-label !text-slate-400 text-[9px] md:text-[10px] !tracking-[0.2em]">
              PARENTS HEALTH OS // REMOTE ELDER-CARE SYSTEM
            </div>
            <div className="flex items-center gap-6 md:gap-12">
              <span className="data-label !text-slate-400 text-[9px] !tracking-[0.1em]">SECURE CHANNEL</span>
              <span className="data-label !text-slate-400 text-[9px] !tracking-[0.1em]">PARENTS-HEALTH-2026</span>
              <div className="h-1.5 w-1.5 rounded-full bg-[#e2ded5] hidden md:block" />
            </div>
          </footer>
        </main>

        {showVitalsModal && (
          <div className="fixed inset-0 z-50 bg-[#122321]/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] border border-[#e2ded5] p-8 md:p-10 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setShowVitalsModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E05E1B]">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)]">Log Physiological Vitals</h3>
                  <p className="text-[10px] text-slate-500 font-light mt-0.5 uppercase tracking-wider">Active Parent Profile: {activeParent?.name || primaryParentName}</p>
                </div>
              </div>

              <form onSubmit={handleSaveVital} className="space-y-4 font-[family-name:var(--font-inter)]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Systolic BP (mmHg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 120"
                      value={vitalInput.bpSys}
                      onChange={e => setVitalInput({...vitalInput, bpSys: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Diastolic BP (mmHg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 80"
                      value={vitalInput.bpDia}
                      onChange={e => setVitalInput({...vitalInput, bpDia: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Blood Glucose (mg/dL)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 95"
                      value={vitalInput.sugar}
                      onChange={e => setVitalInput({...vitalInput, sugar: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Weight (kg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 68"
                      value={vitalInput.weight}
                      onChange={e => setVitalInput({...vitalInput, weight: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contextual / Notes</label>
                  <textarea 
                    placeholder="Describe context (e.g. post-breakfast, felt slightly dizzy, etc.)"
                    rows={2}
                    value={vitalInput.notes}
                    onChange={e => setVitalInput({...vitalInput, notes: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowVitalsModal(false)}
                    className="w-1/2 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-1/2 py-3.5 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider shadow-lg transition-all"
                  >
                    Save Measurements
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showObservationModal && (
          <div className="fixed inset-0 z-50 bg-[#122321]/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] border border-[#e2ded5] p-8 md:p-10 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setShowObservationModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A]">
                  <Smile size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)]">Log Caregiver Observation</h3>
                  <p className="text-[10px] text-slate-500 font-light mt-0.5 uppercase tracking-wider">Active Parent Profile: {activeParent?.name || primaryParentName}</p>
                </div>
              </div>

              <form onSubmit={handleSaveObservation} className="space-y-4 font-[family-name:var(--font-inter)]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Observation Type</label>
                    <select 
                      value={observationInput.type}
                      onChange={e => setObservationInput({...observationInput, type: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                    >
                      <option value="General">General Behavior</option>
                      <option value="Symptom">Symptom Watch</option>
                      <option value="Cognitive">Cognitive State</option>
                      <option value="Nutrition">Dietary Intake</option>
                      <option value="Mobility">Mobility & Exercise</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Severity Indicator</label>
                    <select 
                      value={observationInput.severity}
                      onChange={e => setObservationInput({...observationInput, severity: e.target.value as any})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                    >
                      <option value="Low">Low (Informational)</option>
                      <option value="Medium">Medium (Keep Watch)</option>
                      <option value="High">High (Immediate Action)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Observational Journal Entry</label>
                  <textarea 
                    placeholder="Enter detailed observation log. Be specific about behavior, energy levels, complaints, or cognitive response..."
                    rows={4}
                    value={observationInput.note}
                    onChange={e => setObservationInput({...observationInput, note: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50 resize-none"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowObservationModal(false)}
                    className="w-1/2 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-1/2 py-3.5 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider shadow-lg transition-all"
                  >
                    Log Daily Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAppointmentModal && (
          <div className="fixed inset-0 z-50 bg-[#122321]/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] border border-[#e2ded5] p-8 md:p-10 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAppointmentModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A]">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)]">Schedule Doctor Consult</h3>
                  <p className="text-[10px] text-slate-500 font-light mt-0.5 uppercase tracking-wider">Active Parent Profile: {activeParent?.name || primaryParentName}</p>
                </div>
              </div>

              <form onSubmit={handleSaveAppointment} className="space-y-4 font-[family-name:var(--font-inter)]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Doctor Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. K. Sharma"
                      value={appointmentInput.doctorName}
                      onChange={e => setAppointmentInput({...appointmentInput, doctorName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Specialty</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cardiologist"
                      value={appointmentInput.specialty}
                      onChange={e => setAppointmentInput({...appointmentInput, specialty: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date</label>
                    <input 
                      type="date" 
                      value={appointmentInput.date}
                      onChange={e => setAppointmentInput({...appointmentInput, date: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Time</label>
                    <input 
                      type="time" 
                      value={appointmentInput.time}
                      onChange={e => setAppointmentInput({...appointmentInput, time: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mode of Consultation</label>
                    <select 
                      value={appointmentInput.mode}
                      onChange={e => setAppointmentInput({...appointmentInput, mode: e.target.value as any})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                    >
                      <option value="in-person">In-Person Clinical Visit</option>
                      <option value="video">Telehealth / Video Call</option>
                      <option value="phone">Telehealth / Voice Call</option>
                      <option value="whatsapp">WhatsApp / Messaging</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reason / Target Symptoms</label>
                  <textarea 
                    placeholder="Enter reason for scheduling (e.g. chronic hypertension review, cardiac follow-up, general diabetic blood work discussion...)"
                    rows={2}
                    value={appointmentInput.reason}
                    onChange={e => setAppointmentInput({...appointmentInput, reason: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAppointmentModal(false)}
                    className="w-1/2 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-1/2 py-3.5 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider shadow-lg transition-all"
                  >
                    Schedule Consult
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showMedicationModal && (
          <div className="fixed inset-0 z-50 bg-[#122321]/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] border border-[#e2ded5] p-8 md:p-10 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setShowMedicationModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A]">
                  <Pill size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)]">Add Routine Medication</h3>
                  <p className="text-[10px] text-slate-500 font-light mt-0.5 uppercase tracking-wider">Active Parent Profile: {activeParent?.name || primaryParentName}</p>
                </div>
              </div>

              <form onSubmit={handleSaveMedication} className="space-y-4 font-[family-name:var(--font-inter)]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Medication Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Telmisartan 40mg"
                      value={medicationInput.name}
                      onChange={e => setMedicationInput({...medicationInput, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dosage Structure</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1 Tablet"
                      value={medicationInput.dosage}
                      onChange={e => setMedicationInput({...medicationInput, dosage: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Default Slot Scheduled</label>
                  <select 
                    value={medicationInput.timing}
                    onChange={e => setMedicationInput({...medicationInput, timing: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                  >
                    <option value="Morning">Morning (Breakfast Slot)</option>
                    <option value="Noon">Noon (Lunch Slot)</option>
                    <option value="Evening">Evening (Tea/Sunset Slot)</option>
                    <option value="Night">Night (Dinner/Bedtime Slot)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Intake Instructions</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Take post breakfast with warm water"
                    value={medicationInput.instructions}
                    onChange={e => setMedicationInput({...medicationInput, instructions: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-sm text-slate-800 bg-slate-50/50"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowMedicationModal(false)}
                    className="w-1/2 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-1/2 py-3.5 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider shadow-lg transition-all"
                  >
                    Add Active Routine
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showDoctorBriefModal && (
          <div className="fixed inset-0 z-50 bg-[#122321]/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] border border-[#e2ded5] p-8 md:p-10 w-full max-w-2xl shadow-2xl relative max-h-[85vh] flex flex-col justify-between"
            >
              <button 
                onClick={() => setShowDoctorBriefModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-4 shrink-0">
                <div className="h-10 w-10 rounded-2xl bg-[#E05E1B]/10 border border-[#E05E1B]/20 flex items-center justify-center text-[#E05E1B]">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)]">Clinical Consultation Brief</h3>
                  <p className="text-[10px] text-slate-500 font-light mt-0.5 uppercase tracking-wider">PREVIEW Doctor Brief — ready to print or share</p>
                </div>
              </div>

              {/* Doctor Brief Content Container */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50 rounded-2xl border border-slate-200 my-4 text-xs font-[family-name:var(--font-inter)] leading-relaxed space-y-4 select-text">
                <div className="text-slate-700 whitespace-pre-wrap font-mono select-all">
                  {generatedBrief}
                </div>
              </div>

              <div className="flex gap-3 pt-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowDoctorBriefModal(false)}
                  className="w-1/2 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                >
                  Close Preview
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Parents Health OS - Clinical Doctor Brief</title>
                            <style>
                              body { font-family: monospace; padding: 40px; color: #333; line-height: 1.5; white-space: pre-wrap; font-size: 13px; }
                              hr { border: 0; border-top: 1px dashed #ccc; margin: 20px 0; }
                            </style>
                          </head>
                          <body>
                            <h2>Parents Health OS — Clinical Brief</h2>
                            <hr />
                            \${generatedBrief ? generatedBrief.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : ""}
                            <hr />
                            <script>window.print();<\/script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}
                  className="w-1/2 py-3.5 bg-[#E05E1B] hover:bg-[#c94e14] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={13} />
                  Print / Save PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <CallOverlay
          isOpen={isCallActive}
          onAccept={() => { setIsCallActive(false); setActiveView("medicines"); }}
          onDecline={() => setIsCallActive(false)}
        />
      </ToastProvider >
    </div >
  );
}

function PillarCard({ type, activeView, setActiveView }: { type: string, activeView: string, setActiveView: (v: string) => void }) {
  return (
    <div 
      onClick={() => setActiveView(type === 'clinical' ? 'clinical' : type === 'wellness' ? 'medicines' : 'smart-reports')}
      className="glass-card p-6 md:p-10 rounded-[2.5rem] min-h-[14rem] md:h-72 flex flex-col justify-between group cursor-pointer hover:bg-white border-[#e2ded5] hover:border-[#0E5E5A]/20"
    >
      <div className="flex items-center justify-between">
        <div className="h-11 w-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A] group-hover:scale-110 transition-transform">
          {type === 'clinical' ? <Stethoscope size={22} strokeWidth={1.5} /> : type === 'wellness' ? <BookOpen size={22} strokeWidth={1.5} /> : <FileText size={22} strokeWidth={1.5} />}
        </div>
        <div className="data-label !text-[8px] text-[#0E5E5A]/70 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded">READY</div>
      </div>
      <div>
        <h4 className="data-label mb-3 !text-slate-500 uppercase tracking-wider text-[9px]">
          {type === 'clinical' ? 'Care Scorecard' : type === 'wellness' ? 'Adherence Rate' : 'Health Analytics'}
        </h4>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tighter uppercase">
          {type === 'clinical' ? 'Profile' : type === 'wellness' ? '98.2%' : 'Reports'}
        </h3>
      </div>
      <div className="data-label text-[#0E5E5A] flex items-center gap-3 group-hover:translate-x-1 transition-transform cursor-pointer">
        View Hub <ArrowRight size={12} strokeWidth={3} className="opacity-70 text-[#E05E1B]" />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, isNew = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; isNew?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-2xl px-8 py-5 text-[11px] font-bold transition-all relative overflow-hidden font-[family-name:var(--font-outfit)] uppercase tracking-widest ${active
        ? "text-white bg-white/10 shadow-inner border border-white/10"
        : "text-teal-150 hover:text-white hover:bg-white/[0.04]"
        }`}
    >
      {active && (
        <motion.div 
          layoutId="activeNav"
          className="absolute left-0 top-0 bottom-0 w-1 bg-[#E05E1B] shadow-[0_0_15px_rgba(224,94,27,0.8)]"
        />
      )}
      <div className="flex items-center gap-6">
        <span className={`${active ? "text-[#E05E1B]" : "text-teal-200/70 group-hover:text-white"} transition-colors`}>{icon}</span>
        <span className="tracking-tight">{label}</span>
      </div>
      {isNew && !active && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#E05E1B] shadow-[0_0_10px_rgba(224,94,27,0.8)] animate-pulse" />
      )}
    </button>
  );
}
