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
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase font-[family-name:var(--font-outfit)]">Care Team</h2>
                <p className="text-sm text-slate-500 font-light font-[family-name:var(--font-inter)] tracking-wide mt-2">Personal health support team and automated assistant.</p>
            </div>

            {/* 6-MEMBER GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* 1. YUKTI AI */}
                <TeamCard
                    icon={<Sparkles size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    name="Nani-Bot"
                    role="AI Care Assistant"
                    status={
                        <span className="flex items-center gap-3 text-cyan-400 font-black text-[9px] uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Active
                        </span>
                    }
                    bio="Demonstration of automated health record synthesis and daily routine check-ins."
                    actionLabel="View Insights"
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
                    bio="Senior medical advisor with 20+ years of geriatric specialization. Oversees health routine reviews."
                    actionLabel="Request Consultation"
                    onAction={() => showToast("Request sent to Dr. Aruna for a call slot.", "success")}
                />

                {/* 3. MS. SANYA KAPOOR */}
                <TeamCard
                    icon={<Utensils size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-white/5 text-slate-400"
                    name="Ms. Sanya Kapoor"
                    role="Clinical Nutritionist"
                    status={<span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Nutrition Support</span>}
                    bio="Specialist focused on diet synchronization, diabetic-sensitive meals, and digestive wellness."
                    actionLabel="Reconfigure Diet"
                    onAction={() => showToast("Diet review request logged for Sanya Kapoor.", "success")}
                />

                {/* 4. COACH VIKRAM SINGH */}
                <TeamCard
                    icon={<Activity size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-white/5 text-slate-400"
                    name="Coach Vikram Singh"
                    role="Mobility Specialist"
                    status={<span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Movement Support</span>}
                    bio="Assists with daily movement routine, strength checks, and fall-prevention through safe mobility demos."
                    actionLabel="Audit Exercises"
                    onAction={() => showToast("Accessing Kinetic Module... [Awaiting Deployment]", "info")}
                />

                {/* 5. AMIT VERMA */}
                <TeamCard
                    icon={<Phone size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-white/5 text-slate-400"
                    name="Amit Verma"
                    role="Care Operations"
                    status={<span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Support Operations</span>}
                    bio="Primary contact for laboratory scheduling, medicine delivery support, and general assistance."
                    actionLabel="Establish Audio Link"
                    onAction={() => showToast("Connecting to Amit Verma's office...", "info")}
                />

                {/* 6. DR. ESHA SETHI */}
                <TeamCard
                    icon={<Moon size={28} strokeWidth={2.5} />}
                    iconColor="bg-slate-950 border-white/5 text-slate-400"
                    name="Dr. Esha Sethi"
                    role="Sleep Architect"
                    status={<span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Sleep Wellness</span>}
                    bio="Specialist in sleep habits, daily routine timing, and cognitive stress management for seniors."
                    actionLabel="Book Therapy"
                    onAction={() => showToast("Requesting a wellness slot with Dr. Esha.", "success")}
                />

            </div>

            {/* DISCLAIMER FOOTER */}
            <div className="text-center pt-16 border-t border-white/5">
                <p className="data-label !text-slate-800 !tracking-[0.3em] leading-relaxed">
                    * Team configurations are representative of the Yukti OS prototype. Specialist allocation is determined by user health requirements.
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
            <div className={`absolute top-0 right-0 w-40 h-40 blur-3xl rounded-full -mr-20 -mt-20 transition-colors ${
                isAI ? 'bg-cyan-500/10 group-hover:bg-cyan-400/20' : 'bg-white/[0.02]'
            }`} />

            <div className="flex justify-between items-start mb-12 relative z-10">
                <div className={`h-16 w-16 rounded-3xl flex items-center justify-center border shadow-3xl ${iconColor}`}>
                    {/* Standardize icon stroke width */}
                    {Object.assign({}, icon, { props: { ...icon.props, strokeWidth: 1.5 } })}
                </div>
                <div className="bg-white/[0.03] px-6 py-2.5 rounded-full border border-white/5 backdrop-blur-3xl shadow-inner">
                    {status}
                </div>
            </div>

            <div className="mb-6 relative z-10">
                <h3 className={`text-2xl font-bold tracking-tight mb-2 uppercase transition-all font-[family-name:var(--font-outfit)] ${isAI ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'}`}>{name}</h3>
                <p className="data-label !text-slate-600 !tracking-[0.2em]">{role}</p>
            </div>

            <p className="text-slate-500 text-sm font-light leading-relaxed mb-12 flex-1 relative z-10 font-[family-name:var(--font-inter)]">
                {bio}
            </p>

            <button
                onClick={onAction}
                className={`w-full py-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 transition-all active:scale-[0.98] relative z-10 font-[family-name:var(--font-outfit)] ${
                    isAI
                        ? "bg-white text-slate-950 hover:bg-cyan-400 shadow-3xl"
                        : "bg-white/[0.03] text-slate-500 hover:text-white border border-white/5 hover:border-white/20"
                }`}
            >
                {actionLabel}
                {!isAI && <ArrowRight size={14} strokeWidth={1.5} className="text-slate-700" />}
            </button>
        </motion.div>
    )
}
