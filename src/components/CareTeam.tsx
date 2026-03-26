"use client";

import { motion } from "framer-motion";
import { Sparkles, Stethoscope, Phone, ArrowRight, Activity, Utensils, Moon } from "lucide-react";
import { useState } from "react";

import { useToast } from "./ui/Toast";

export function CareTeam() {
    const { showToast } = useToast();

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 px-2">
            {/* HEADER */}
            <div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-1">Care Team</h2>
                <p className="text-sm text-slate-400 font-medium tracking-tight">Your dedicated clinical support network and autonomous monitoring units.</p>
            </div>

            {/* 6-MEMBER GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* 1. YUKTI AI */}
                <TeamCard
                    icon={<Sparkles size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    name="Yukti AI"
                    role="Autonomous Core Monitor"
                    status={
                        <span className="flex items-center gap-3 text-cyan-400 font-black text-[9px] uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Active Link
                        </span>
                    }
                    bio="Continuously auditing biometric streams and telemetry reports to preemptively identify clinical risk vectors."
                    actionLabel="Access Neural Reports"
                    onAction={() => document.getElementById("nav-smart-reports")?.click()}
                    isAI
                />

                {/* 2. DR. ARUNA DESAI */}
                <TeamCard
                    icon={<Stethoscope size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-white/5 text-slate-400"
                    name="Dr. Aruna Desai"
                    role="Senior Geriatrician"
                    status={<span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Medical Oversight</span>}
                    bio="Clinical director with 20+ years of geriatric specialization. Orchestrates monthly physiological optimization reviews."
                    actionLabel="Request Consultation"
                    onAction={() => showToast("Synchronization request transmitted to Dr. Aruna. Await temporal confirmation.", "success")}
                />

                {/* 3. MS. SANYA KAPOOR */}
                <TeamCard
                    icon={<Utensils size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-white/5 text-slate-400"
                    name="Ms. Sanya Kapoor"
                    role="Clinical Nutritionist"
                    status={<span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Metabolic Logistics</span>}
                    bio="Metabolic specialist focused on nutrient synchronization, diabetic-sensitive formulations, and gut-axis optimization."
                    actionLabel="Reconfigure Diet"
                    onAction={() => showToast("Metabolic reconfiguration request logged for Sanya Kapoor.", "success")}
                />

                {/* 4. COACH VIKRAM SINGH */}
                <TeamCard
                    icon={<Activity size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-white/5 text-slate-400"
                    name="Coach Vikram Singh"
                    role="Mobility Specialist"
                    status={<span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Kinetic Stability</span>}
                    bio="Directs kinetic stability protocols, strength calibration, and fall-prevention synchronization through safe movement."
                    actionLabel="Audit Exercises"
                    onAction={() => showToast("Accessing Kinetic Module... [Awaiting Deployment]", "info")}
                />

                {/* 5. AMIT VERMA */}
                <TeamCard
                    icon={<Phone size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-white/5 text-slate-400"
                    name="Amit Verma"
                    role="Care Operations"
                    status={<span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Logistics Engine</span>}
                    bio="Primary operational node for laboratory synchronization, pharmaceutical logistics, and infrastructure support."
                    actionLabel="Establish Audio Link"
                    onAction={() => showToast("Initiating secure audio channel with Amit Verma...", "info")}
                />

                {/* 6. DR. ESHA SETHI */}
                <TeamCard
                    icon={<Moon size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-white/5 text-slate-400"
                    name="Dr. Esha Sethi"
                    role="Sleep Architect"
                    status={<span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Neurological Hygiene</span>}
                    bio="Specialist in sleep-cycle architecture, circadian synchronization, and geriatric cognitive stress management."
                    actionLabel="Book Therapy"
                    onAction={() => showToast("Requesting neurological hygiene slot with Dr. Esha.", "success")}
                />

            </div>

            {/* DISCLAIMER FOOTER */}
            <div className="text-center pt-12 border-t border-white/5">
                <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed">
                    * Care Team configurations are representative of the Yukti Neural Network. Final specialist allocation occurs post-onboarding synchronization.
                </p>
            </div>
        </div>
    );
}

function TeamCard({ icon, iconColor, name, role, status, bio, actionLabel, onAction, isAI = false }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`glass-card p-10 rounded-[3rem] border transition-all flex flex-col h-full relative overflow-hidden group ${
                isAI 
                    ? 'border-cyan-500/20 bg-slate-950/60' 
                    : 'border-white/5 bg-slate-950/40 hover:border-white/10'
            }`}
        >
            {/* Accent Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-colors ${
                isAI ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20' : 'bg-white/5'
            }`} />

            <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border ${iconColor}`}>
                    {icon}
                </div>
                <div className="bg-slate-950/80 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md shadow-inner">
                    {status}
                </div>
            </div>

            <div className="mb-6 relative z-10">
                <h3 className={`text-xl font-black tracking-tight mb-2 uppercase transition-colors ${isAI ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'}`}>{name}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{role}</p>
            </div>

            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-10 flex-1 relative z-10">
                {bio}
            </p>

            <button
                onClick={onAction}
                className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] relative z-10 ${
                    isAI
                        ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-white/5 hover:border-white/10"
                }`}
            >
                {actionLabel}
                {!isAI && <ArrowRight size={14} strokeWidth={3} className="text-slate-600" />}
            </button>
        </motion.div>
    )
}
