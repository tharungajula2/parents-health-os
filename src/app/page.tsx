"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, FileText, BookOpen, Users, Lock, ArrowRight, Activity, Bell, MessageCircle, Calendar, AlertTriangle, ShieldCheck, Heart, UserPlus, LogIn, Loader2 } from "lucide-react";
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
      alert("⚠️ You must certify that you have obtained explicit consent under DPDP Act 2023 to proceed.");
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
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#FAF9F6] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E05E1B]/5 blur-[120px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0E5E5A]/5 blur-[120px] rounded-full -ml-32 -mb-32" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl relative z-10"
          >
            <div className="text-center mb-16">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#e2ded5] shadow-sm mb-10"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#E05E1B] animate-pulse" />
                <span className="data-label text-[#0E5E5A]/80 uppercase tracking-widest text-[9px]">PARENTS-HEALTH // LIVE FAMILY CARE CONNECTED</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 font-[family-name:var(--font-outfit)]">
                <span className="text-gradient">Parents Health OS</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed font-[family-name:var(--font-inter)]">
                A warm, family-first dashboard for <span className="text-[#0E5E5A] font-semibold">Indian Elder-Care</span>, linking parents on WhatsApp with remote care oversight for adult children.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20 px-4 md:px-0">
              <ModuleBrief 
                icon={<Stethoscope className="text-[#0E5E5A]" size={20} strokeWidth={1.5} />}
                title="Health Profile"
                desc="Comprehensive geriatric health scorecard and risk assessment."
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

            <div className="flex flex-col items-center gap-6 md:gap-10">
              <button
                onClick={() => setMode("login")}
                className="group relative flex items-center gap-6 rounded-2xl bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white px-14 py-6 font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-900/10 animate-bounce-subtle"
              >
                <span className="font-[family-name:var(--font-outfit)] uppercase tracking-[0.2em] text-[10px]">Establish Care Link</span>
                <ArrowRight size={18} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex flex-col items-center gap-2">
                <p className="data-label text-slate-400">
                  A premium family care platform by <span className="text-slate-500">Tharun Gajula</span>
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

              {/* DPDPA 2023 LEGAL CONSENT BOX */}
              <div className="p-6 bg-teal-50/50 border border-teal-100/60 rounded-[2rem] space-y-4">
                <div className="flex gap-3 items-start">
                  <ShieldCheck className="text-[#0E5E5A] shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase font-[family-name:var(--font-outfit)] tracking-wider">DPDPA 2023 Digital Consent Declaration</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-light mt-1 font-[family-name:var(--font-inter)]">
                      Parents Health OS strictly complies with India's Digital Personal Data Protection Act, 2023 (DPDPA 2023). Personal health data is stored securely under AP-SOUTH-1 regional servers and is never processed without unambiguous consent.
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
                    I certify that <span className="font-semibold text-slate-800">I have obtained explicit, verifiable consent</span> from my parent to share their clinical indicators, receive automated WhatsApp check-ins through Anaya, and grant Parents Health OS permission to process diagnostics.
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
    <div className="glass-card group p-8 rounded-[2rem] transition-all hover:bg-white hover:border-[#0E5E5A]/20">
      <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xs font-[family-name:var(--font-outfit)] font-bold text-slate-800 mb-2 uppercase tracking-wider">{title}</h3>
      <p className="text-[11px] text-slate-500 font-normal leading-relaxed font-[family-name:var(--font-inter)]">{desc}</p>
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
import { Trash2 } from "lucide-react";
import { ClinicHub } from "../components/ClinicHub";
import { CallOverlay } from "../components/CallOverlay";

function DashboardShell() {
  const { parents, profile, user, signOut, activeParent, selectActiveParent } = useParentsAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);

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
            <div className="space-y-10">
              <div className="p-8 md:p-14 rounded-[3.5rem] relative overflow-hidden group bg-gradient-to-br from-[#0E5E5A] to-[#0A4B48] text-white shadow-xl">
                <div className="absolute top-0 right-0 p-10 md:p-20 opacity-[0.05] transition-transform duration-1000 group-hover:scale-110">
                   <Activity size={240} strokeWidth={1} className="text-white" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-16">
                  <div className="max-w-3xl">
                    <h2 className="text-2xl md:text-5xl lg:text-5xl font-bold text-white font-[family-name:var(--font-outfit)] tracking-tight mb-4 md:mb-6 leading-tight">
                      Routine Active for {activeParent?.name?.split(' ')[0] || primaryParentName?.split(' ')[0] || 'Parent'}
                    </h2>
                    <p className="text-lg text-teal-100/90 font-light leading-relaxed font-[family-name:var(--font-inter)]">
                      Care tracking is currently <span className="text-[#E05E1B] font-bold">active</span>. This dashboard synchronizes WhatsApp check-ins, medication logs, and clinical diagnostics into a single unified workspace.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto shrink-0">
                    <button onClick={() => setActiveView("smart-reports")} className="px-10 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-teal-100 bg-white/10 hover:bg-white/20 border border-white/20 transition-all active:scale-95 text-center font-[family-name:var(--font-outfit)]">INSIGHTS FEED</button>
                    <button onClick={() => setActiveView("medicines")} className="bg-[#E05E1B] text-white px-12 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#c94e14] transition-all shadow-md active:scale-95 text-center font-[family-name:var(--font-outfit)]">DAILY LOGS</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PillarCard type="clinical" activeView={activeView} setActiveView={setActiveView} />
                <PillarCard type="wellness" activeView={activeView} setActiveView={setActiveView} />
                <PillarCard type="reports" activeView={activeView} setActiveView={setActiveView} />
              </div>

              <div onClick={() => setActiveView("whatsapp")} className="cursor-pointer glass-card p-6 md:p-12 rounded-[3.5rem] border-[#e2ded5] hover:border-[#0E5E5A]/30 transition-all group lg:col-span-2 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                  <div className="flex gap-6 md:gap-10 items-center">
                    <div className="h-16 w-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shadow-inner shrink-0">
                      <MessageCircle size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">WhatsApp Companion Channel</h3>
                      <p className="text-slate-600 text-sm font-light mt-1 font-[family-name:var(--font-inter)] leading-relaxed">Interactive check-ins and real-time alerts simulated via the Anaya care companion.</p>
                    </div>
                  </div>
                  <div className="px-8 py-3 rounded-full bg-emerald-50 border border-emerald-100 data-label !text-emerald-700 !text-[8px] !tracking-[0.4em] shrink-0">BRIDGE ACTIVE</div>
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
