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
        {/* Deep Glow Effects */}
        <div className="absolute top-1/4 -left-20 h-96 w-96 bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 h-96 w-96 bg-blue-600/10 blur-[120px] rounded-full" />

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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/80">Concept Prototype v2.1</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
              <span className="text-white">Yukti</span>
              <span className="text-gradient"> Health</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Building the future of <span className="text-white">Geriatric Care</span> through context-aware longevity systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
            <ModuleBrief 
              icon={<Stethoscope className="text-cyan-400" size={20} />}
              title="Clinical Engine"
              desc="Deep geriatric assessment."
            />
            <ModuleBrief 
              icon={<FileText className="text-blue-400" size={20} />}
              title="Smart Reports"
              desc="Gemini-powered analysis."
            />
            <ModuleBrief 
              icon={<BookOpen className="text-cyan-400" size={20} />}
              title="Daily Wellness"
              desc="IoT & Med tracking."
            />
            <ModuleBrief 
              icon={<MessageCircle className="text-blue-400" size={20} />}
              title="WhatsApp AI"
              desc="Nani-Bot companion."
            />
          </div>

          <div className="flex flex-col items-center gap-8">
            <button
              onClick={handleInitialize}
              className="group relative flex items-center gap-4 rounded-full bg-white text-slate-950 px-10 py-5 font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
            >
              Initialize System
              <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />
            </button>

            <p className="text-xs text-slate-500 uppercase tracking-[0.3em] font-bold">
              Designed by <span className="text-slate-300">Tharun Gajula</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <DashboardShell />;
}

function ModuleBrief({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card group p-6 rounded-3xl transition-all hover:border-cyan-500/30 hover:bg-white/5">
      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
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
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-slate-950/50 backdrop-blur-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto`}>
          <div className="flex h-20 items-center justify-between px-6 mb-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveView("dashboard"); setIsMobileMenuOpen(false); }}>
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
                Y
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white leading-tight tracking-tight">YUKTI OS</span>
                <span className="text-[9px] font-bold text-cyan-400/60 uppercase tracking-widest">Concept</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 text-slate-500 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <nav className="p-4 space-y-1">
            <NavItem icon={<Stethoscope size={18} />} label="Health Assessment" active={activeView === "clinical"} onClick={() => { setActiveView("clinical"); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<FileText size={18} />} label="Diagnostics & Trends" isNew active={activeView === "smart-reports"} onClick={() => { setActiveView("smart-reports"); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<BookOpen size={18} />} label="Wellness Hub" active={activeView === "medicines"} onClick={() => { setActiveView("medicines"); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<Users size={18} />} label="Care Team" active={activeView === "care-team"} onClick={() => { setActiveView("care-team"); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<Calendar size={18} />} label="Clinic Hub" isNew active={activeView === "clinic-hub"} onClick={() => { setActiveView("clinic-hub"); setIsMobileMenuOpen(false); }} />
            <NavItem icon={<MessageCircle size={18} />} label="WhatsApp Bot" isNew active={activeView === "whatsapp"} onClick={() => { setActiveView("whatsapp"); setIsMobileMenuOpen(false); }} />

            <div className="pt-12 px-2">
              <div className="h-px bg-white/5 mb-6" />
              <button onClick={loadDemoData} className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-cyan-400 transition-all border border-transparent hover:border-white/5">
                <Activity size={14} className="group-hover:animate-pulse" /> LOAD DEMO DATA
              </button>
              <button onClick={handleSystemReset} className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all mt-2">
                <Trash2 size={14} /> RESET CONTEXT
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 pt-20 md:p-10 lg:p-12 overflow-x-hidden relative">
          <header className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-cyan-400">
                <Users size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {typeof window !== 'undefined' ? (localStorage.getItem('yukti_user_name') || 'Guest') : 'Guest'} / <span className="text-slate-500">Dashboard</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Active // Secure Context</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <HeaderIcons />
            </div>
          </header>

          {activeView === "dashboard" && (
            <div className="space-y-10">
              <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-6 transition-transform duration-700">
                   <Activity size={120} className="text-cyan-400" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-xl">
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                      Good {(() => {
                        const h = new Date().getHours();
                        if (h < 12) return "Morning";
                        if (h < 18) return "Afternoon";
                        return "Evening";
                      })()}, {typeof window !== 'undefined' ? (localStorage.getItem('yukti_user_name')?.split(' ')[0] || 'Sir') : 'Sir'}
                    </h2>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                      Your clinical twin is synchronized. We&apos;ve identified no critical anomalies in the last 24 hours. Adherence is at optimal levels.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setActiveView("smart-reports")} className="glass-card px-6 py-4 rounded-2xl font-bold text-sm text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95">Process Document</button>
                    <button onClick={() => setActiveView("medicines")} className="bg-cyan-500 text-slate-950 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95">Update Health Log</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PillarCard type="clinical" activeView={activeView} setActiveView={setActiveView} />
                <PillarCard type="wellness" activeView={activeView} setActiveView={setActiveView} />
                <PillarCard type="reports" activeView={activeView} setActiveView={setActiveView} />
              </div>

              <div onClick={() => setActiveView("whatsapp")} className="cursor-pointer glass-card p-8 rounded-[2rem] border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent hover:border-cyan-500/40 transition-all group lg:col-span-2">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex gap-6 items-center">
                    <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <MessageCircle size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">AI Companion Link Active</h3>
                      <p className="text-slate-400 text-sm mt-1">Nani-Bot is ready to assist your care team via WhatsApp secure channel.</p>
                    </div>
                  </div>
                  <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Connection Secure</div>
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
          <footer className="mt-20 py-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
              © Tharun Gajula
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Privacy Secure</span>
              <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Client Side Logic</span>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
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
      className="glass-card p-8 rounded-3xl h-64 flex flex-col justify-between group cursor-pointer hover:border-white/20 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-inner">
          {type === 'clinical' ? <Stethoscope size={20} /> : type === 'wellness' ? <BookOpen size={20} /> : <FileText size={20} />}
        </div>
        <div className="h-2 w-2 rounded-full bg-cyan-400" />
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
          {type === 'clinical' ? 'Clinical Risk' : type === 'wellness' ? 'Medication Adherence' : 'Intelligence'}
        </h4>
        <h3 className="text-3xl font-black text-white tracking-tighter">
          {type === 'clinical' ? 'Analyzed' : type === 'wellness' ? '98%' : 'Deep Scan'}
        </h3>
      </div>
      <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
        Details <ArrowRight size={12} />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, isNew = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; isNew?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-2xl px-5 py-4 text-xs font-bold transition-all relative overflow-hidden ${active
        ? "text-cyan-400 bg-white/5 shadow-inner border border-white/5"
        : "text-slate-500 hover:text-white hover:bg-white/5"
        }`}
    >
      {active && (
        <motion.div 
          layoutId="activeNav"
          className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
        />
      )}
      <div className="flex items-center gap-3">
        <span className={`${active ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}>{icon}</span>
        <span className="tracking-tight">{label}</span>
      </div>
      {isNew && !active && (
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse" />
      )}
    </button>
  );
}
