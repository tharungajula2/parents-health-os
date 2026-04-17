"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, FileText, BookOpen, Users, Lock, ArrowRight, Activity, Bell, MessageCircle, Calendar, AlertTriangle } from "lucide-react";
import { loadDemoData } from "../utils/demoData";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("yukti_auth_v2");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleInitialize = () => {
    localStorage.setItem("yukti_auth_v2", "true");
    setIsAuthenticated(true);
  };

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-10"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="data-label opacity-70">SYST-ID: YUKTI-V2.5 // CONCEPT PROTOTYPE (WIP)</span>
            </motion.div>
            
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-8 font-[family-name:var(--font-outfit)]">
              <span className="text-gradient">Yukti OS</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed font-[family-name:var(--font-inter)]">
              An exploratory interface for <span className="text-white font-medium">Geriatric Care</span>, focusing on longevity tracking concepts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20 px-4 md:px-0">
            <ModuleBrief 
              icon={<Stethoscope className="text-cyan-400 opacity-60" size={20} strokeWidth={1.5} />}
              title="Assessment Hub"
              desc="Health profiling concepts."
            />
            <ModuleBrief 
              icon={<FileText className="text-cyan-400 opacity-60" size={20} strokeWidth={1.5} />}
              title="Health Insights"
              desc="AI-assisted report concepts."
            />
            <ModuleBrief 
              icon={<BookOpen className="text-cyan-400 opacity-60" size={20} strokeWidth={1.5} />}
              title="Routine Tracker"
              desc="Daily habit synchronization."
            />
            <ModuleBrief 
              icon={<MessageCircle className="text-cyan-400 opacity-60" size={20} strokeWidth={1.5} />}
              title="Care Companion"
              desc="Sample messaging interface."
            />
          </div>

          <div className="flex flex-col items-center gap-10">
            <button
              onClick={handleInitialize}
              className="group relative flex items-center gap-6 rounded-2xl bg-white text-slate-950 px-14 py-6 font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-3xl"
            >
              <span className="font-[family-name:var(--font-outfit)] uppercase tracking-[0.2em] text-[10px]">Initialize Interface</span>
              <ArrowRight size={18} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex flex-col items-center gap-2">
              <p className="data-label text-slate-500/80">
                A concept prototype by <span className="text-slate-400">Tharun Gajula</span>
              </p>
              <div className="h-px w-12 bg-white/10" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <DashboardShell />;
}

function ModuleBrief({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card group p-8 rounded-[2rem] transition-all hover:bg-white/[0.03]">
      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-[11px] font-[family-name:var(--font-outfit)] font-bold text-white mb-2 uppercase tracking-wider">{title}</h3>
      <p className="text-[11px] text-slate-500 font-light leading-relaxed font-[family-name:var(--font-inter)]">{desc}</p>
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
  const [activeView, setActiveView] = useState("dashboard");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSystemReset = () => {
    if (confirm("⚠️ DANGER: Wipe Yukti's memory? This is irreversible.")) {
      if (confirm("Final confirmation required.")) {
        localStorage.removeItem("yukti_auth_v2");
        localStorage.removeItem("yukti_assessment_data_v2");
        localStorage.removeItem("yukti_history");
        localStorage.removeItem("yukti_latest_summary");
        localStorage.removeItem("yukti_active_meds");
        localStorage.removeItem("yukti_user_name");
        localStorage.removeItem("yukti_user_gender");
        localStorage.removeItem("yukti_user_age");
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("yukti_med_log_") || key.startsWith("yukti_daily_log_")) {
            localStorage.removeItem(key);
          }
        });
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex min-h-screen relative text-slate-200">
      <ToastProvider>
        {/* MOBILE HEADER */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 hover:bg-white/5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <span className="font-bold tracking-tight text-white">Yukti OS</span>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Sidebar Backdrop (Mobile) */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/5 bg-slate-950/40 backdrop-blur-3xl transform transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto`}>
          <div className="flex h-24 items-center justify-between px-8 mb-6">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setActiveView("dashboard"); setIsMobileMenuOpen(false); }}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/20">
                Y
              </div>
              <div className="flex flex-col">
                <span className="font-[family-name:var(--font-outfit)] font-black text-white text-lg leading-tight tracking-tighter uppercase">YUKTI OS</span>
                <span className="data-label text-cyan-400/60 !text-[8px] !tracking-[0.4em]">PROTOTYPE HUB</span>
              </div>
            </div>
          </div>

          <nav className="p-4 px-6 space-y-2">
            <NavItem icon={<Stethoscope size={18} strokeWidth={1.5} />} label="Health Assessment" active={activeView === "clinical"} onClick={() => { setActiveView("clinical"); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<FileText size={18} strokeWidth={1.5} />} label="Diagnostics & Trends" isNew active={activeView === "smart-reports"} onClick={() => { setActiveView("smart-reports"); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<BookOpen size={18} strokeWidth={1.5} />} label="Wellness Hub" active={activeView === "medicines"} onClick={() => { setActiveView("medicines"); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<Users size={18} strokeWidth={1.5} />} label="Care Team" active={activeView === "care-team"} onClick={() => { setActiveView("care-team"); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<Calendar size={18} strokeWidth={1.5} />} label="Clinic Hub" isNew active={activeView === "clinic-hub"} onClick={() => { setActiveView("clinic-hub"); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<MessageCircle size={18} strokeWidth={1.5} />} label="WhatsApp Bot" isNew active={activeView === "whatsapp"} onClick={() => { setActiveView("whatsapp"); setIsMobileMenuOpen(false); }} />

            <div className="pt-24 px-2">
              <div className="h-px bg-white/5 mb-10" />
              <button onClick={handleSystemReset} className="group flex w-full items-center gap-5 rounded-xl px-5 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500/40 hover:bg-red-500/10 hover:text-red-400 transition-all mt-2 font-[family-name:var(--font-outfit)]">
                <Trash2 size={16} strokeWidth={1.5} className="opacity-40" /> RESET PROTOTYPE
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 pt-20 md:p-10 lg:p-12 overflow-x-hidden relative">
          <header className="mb-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="h-14 w-14 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 shadow-inner group-hover:border-cyan-500/20 transition-all">
                <Users size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)] tracking-tight">
                  {typeof window !== 'undefined' ? (localStorage.getItem('yukti_user_name') || 'Patient Identity') : 'Patient Identity'} <span className="text-slate-800 font-light mx-4">/</span> <span className="text-slate-500 font-medium">PERSONAL DASHBOARD</span>
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                  <p className="data-label opacity-40 !tracking-[0.5em]">LOCAL CONTEXT (WIP) // SAMPLE CONNECTION</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <HeaderIcons />
            </div>
          </header>

          {activeView === "dashboard" && (
            <div className="space-y-10">
              <div className="glass-card p-14 rounded-[4rem] relative overflow-hidden group border-white/5 bg-white/[0.01]">
                <div className="absolute top-0 right-0 p-20 opacity-[0.02] transition-transform duration-1000 group-hover:scale-110">
                   <Activity size={240} strokeWidth={1} className="text-white" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                  <div className="max-w-3xl">
                    <h2 className="text-5xl md:text-6xl font-bold text-white font-[family-name:var(--font-outfit)] tracking-tight mb-6">
                      Routine Active, {typeof window !== 'undefined' ? (localStorage.getItem('yukti_user_name')?.split(' ')[0] || 'Member') : 'Member'}
                    </h2>
                    <p className="text-lg text-slate-500 font-light leading-relaxed font-[family-name:var(--font-inter)]">
                      Care tracking is currently <span className="text-white font-medium">initialized</span> in this prototype. This dashboard demonstrates how health data and daily routines could be synchronized into a single unified view.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
                    <button onClick={() => setActiveView("smart-reports")} className="glass-card px-10 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all active:scale-95 text-center font-[family-name:var(--font-outfit)]">INSIGHTS FEED</button>
                    <button onClick={() => setActiveView("medicines")} className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-3xl active:scale-95 text-center font-[family-name:var(--font-outfit)]">DAILY LOG</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PillarCard type="clinical" activeView={activeView} setActiveView={setActiveView} />
                <PillarCard type="wellness" activeView={activeView} setActiveView={setActiveView} />
                <PillarCard type="reports" activeView={activeView} setActiveView={setActiveView} />
              </div>

              <div onClick={() => setActiveView("whatsapp")} className="cursor-pointer glass-card p-12 rounded-[3.5rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group lg:col-span-2 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex gap-10 items-center">
                    <div className="h-16 w-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 group-hover:scale-105 transition-transform shadow-inner">
                      <MessageCircle size={32} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)] tracking-tight uppercase">Companion Channel</h3>
                      <p className="text-slate-500 text-sm font-light mt-1 font-[family-name:var(--font-inter)] leading-relaxed">Messaging interface demonstration with AI care assistant.</p>
                    </div>
                  </div>
                  <div className="px-8 py-3 rounded-full bg-white/[0.03] border border-white/5 data-label !text-cyan-400 !text-[8px] !tracking-[0.4em]">BRIDGE ACTIVE</div>
                </div>
              </div>
            </div>
          )}

          {activeView === "smart-reports" && <SmartReport onNavigate={() => setActiveView("clinical")} />}
          {activeView === "clinical" && <ClinicalEngine />}
          {activeView === "medicines" && <MedicationTracker onTriggerCall={() => setIsCallActive(true)} />}
          {activeView === "care-team" && <CareTeam />}
          {activeView === "clinic-hub" && <ClinicHub />}
          {activeView === "whatsapp" && <WhatsAppDemo />}

          {/* FOOTER */}
          <footer className="mt-32 py-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="data-label !text-slate-500/50 !tracking-[0.4em]">
              A CONCEPT PROTOTYPE (WIP) BY THARUN GAJULA
            </div>
            <div className="flex items-center gap-12">
              <span className="data-label !text-slate-600/40 !tracking-[0.3em]">AES-X / RSA-4096</span>
              <span className="data-label !text-slate-600/40 !tracking-[0.3em]">PROD-HUD-25</span>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-500/20" />
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
      className="glass-card p-10 rounded-[2.5rem] h-72 flex flex-col justify-between group cursor-pointer hover:bg-white/[0.03] border-white/5"
    >
      <div className="flex items-center justify-between">
        <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400/60 group-hover:scale-110 transition-transform">
          {type === 'clinical' ? <Stethoscope size={22} strokeWidth={1.5} /> : type === 'wellness' ? <BookOpen size={22} strokeWidth={1.5} /> : <FileText size={22} strokeWidth={1.5} />}
        </div>
        <div className="data-label !text-[8px] opacity-40">READY</div>
      </div>
      <div>
        <h4 className="data-label mb-3 !text-slate-500">
          {type === 'clinical' ? 'Health Summary' : type === 'wellness' ? 'Daily Adherence' : 'AI Processing'}
        </h4>
        <h3 className="text-4xl font-bold text-white font-[family-name:var(--font-outfit)] tracking-tighter uppercase">
          {type === 'clinical' ? 'Sync' : type === 'wellness' ? '98.2%' : 'Deep'}
        </h3>
      </div>
      <div className="data-label text-cyan-400 flex items-center gap-3 group-hover:translate-x-1 transition-transform cursor-pointer">
        View Hub <ArrowRight size={12} strokeWidth={3} className="opacity-60" />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, isNew = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; isNew?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-2xl px-8 py-5 text-[11px] font-bold transition-all relative overflow-hidden font-[family-name:var(--font-outfit)] uppercase tracking-widest ${active
        ? "text-white bg-white/[0.04] shadow-3xl border border-white/5"
        : "text-slate-300 hover:text-white hover:bg-white/[0.02]"
        }`}
    >
      {active && (
        <motion.div 
          layoutId="activeNav"
          className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
        />
      )}
      <div className="flex items-center gap-6">
        <span className={`${active ? "text-cyan-400" : "text-slate-500/70 group-hover:text-white"} transition-colors`}>{icon}</span>
        <span className="tracking-tight">{label}</span>
      </div>
      {isNew && !active && (
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] animate-pulse" />
      )}
    </button>
  );
}
