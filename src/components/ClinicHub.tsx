"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Video,
  MapPin,
  CheckCircle,
  CreditCard,
  Wallet,
  FileText,
  Plus,
  ShieldCheck,
  ChevronRight,
  X,
  User,
  Clock,
  AlertTriangle,
  Sparkles,
  Stethoscope,
  Heart,
  Activity
} from "lucide-react";
import { useToast } from "./ui/Toast";
import { useParentsAuth } from "../lib/supabase/context";
import {
  ConsultRequest,
  FollowUpTask,
  DoctorBrief,
  getConsultRequests,
  saveConsultRequest,
  updateConsultStatus,
  getFollowUpTasks,
  toggleFollowUpTask,
  getLastDoctorBrief,
  getCareTeam
} from "../utils/careTeamEngine";

export function ClinicHub() {
  const { showToast } = useToast();
  const { activeParent } = useParentsAuth();
  
  const parentId = activeParent?.id || "sandbox-parent-id";
  const parentName = activeParent?.name || "Parent";

  // Parent-specific Finance State (stored in localStorage)
  const [balance, setBalance] = useState(1250);
  
  // Appts state synced with our engine consults
  const [consults, setConsults] = useState<ConsultRequest[]>([]);
  const [followups, setFollowups] = useState<FollowUpTask[]>([]);
  const [doctorBrief, setDoctorBrief] = useState<DoctorBrief | null>(null);
  
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Form State
  const [bookForm, setBookForm] = useState({
    specialistId: "",
    specialistName: "Dr. Aruna Desai",
    specialistRole: "Geriatrician",
    date: "",
    time: "",
    mode: "video" as "video" | "phone" | "in-person"
  });

  // Sync data whenever parent switcher triggers
  useEffect(() => {
    if (parentId) {
      // Sync balance
      const cachedBal = localStorage.getItem(`parents_health_bal_${parentId}`);
      if (cachedBal) {
        setBalance(Number(cachedBal));
      } else {
        const initialBal = 1250 + Math.floor(Math.random() * 500) * 10;
        setBalance(initialBal);
        localStorage.setItem(`parents_health_bal_${parentId}`, String(initialBal));
      }

      setConsults(getConsultRequests(parentId));
      setFollowups(getFollowUpTasks(parentId));
      setDoctorBrief(getLastDoctorBrief(parentId));

      // Prefill first team member from team list
      const team = getCareTeam(parentId);
      if (team.length > 0) {
        const firstDoc = team.find(m => !m.isAI) || team[0];
        setBookForm(prev => ({
          ...prev,
          specialistId: firstDoc.id,
          specialistName: firstDoc.name,
          specialistRole: firstDoc.role
        }));
      }
    }
  }, [parentId]);

  const handleTopUp = () => {
    showToast("Opening Secure Gateway...", "info");
    setTimeout(() => {
      const nextBal = balance + 1000;
      setBalance(nextBal);
      localStorage.setItem(`parents_health_bal_${parentId}`, String(nextBal));
      showToast("₹1,000 added to Praan Family Wallet successfully!", "success");
    }, 1200);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookForm.date || !bookForm.time) {
      showToast("Please select a valid date and time.", "error");
      return;
    }

    const consult: ConsultRequest = {
      id: `req-${Date.now()}`,
      parentId,
      memberId: bookForm.specialistId || "sp-1",
      memberName: bookForm.specialistName,
      memberRole: bookForm.specialistRole,
      reason: "Routine Wellness Assessment Sync",
      urgency: "routine",
      preferredMode: bookForm.mode,
      preferredLanguage: "English",
      attachments: {
        latestVitals: true,
        activeMedications: true,
        latestReportSummary: true,
        carePlanSummary: true,
        doctorQuestions: true,
        recentMisses: false
      },
      caregiverNotes: `Auto-booked appointment slot at ${bookForm.time} on ${bookForm.date}.`,
      status: "scheduled", // Pre-scheduled for easy demo
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveConsultRequest(parentId, consult);
    setConsults(getConsultRequests(parentId));
    setShowBookingModal(false);
    showToast(`Appointment scheduled successfully for ${bookForm.specialistName}!`, "success");
  };

  const handleToggleTask = (taskId: string) => {
    toggleFollowUpTask(parentId, taskId);
    setFollowups(getFollowUpTasks(parentId));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 relative px-2">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl md:text-5xl font-bold text-[#0E5E5A] tracking-tight uppercase font-[family-name:var(--font-outfit)]">
          Care Hub
        </h2>
        <p className="text-sm text-slate-600 font-normal mt-2 font-[family-name:var(--font-inter)] tracking-wide">
          Manage {parentName}&apos;s medical appointments, clinic coordination logs, and safety briefs.
        </p>
      </div>

      {/* THREE COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1 & 2: CONSULTATION TIMELINE */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-[#0E5E5A] uppercase tracking-tight flex items-center gap-3 font-[family-name:var(--font-outfit)]">
              <Calendar size={18} /> Schedule & Booked Consults
            </h3>
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center gap-2 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white px-6 py-3.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Plus size={12} strokeWidth={3} /> Book Appointment
            </button>
          </div>

          {/* List of Simulated / Booked Appointments */}
          {consults.length === 0 ? (
            <div className="glass-card bg-white p-12 text-center border border-[#e2ded5] rounded-[2.5rem]">
              <Calendar size={36} className="mx-auto text-slate-350 mb-3" />
              <p className="text-slate-500 text-xs font-semibold">No appointments scheduled for {parentName}.</p>
              <p className="text-[10px] text-slate-400 mt-1">Book a custom slot above to build a sandbox timeline.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {consults.map((appt) => {
                const isPast = appt.status === "completed" || appt.status === "cancelled";
                return (
                  <div
                    key={appt.id}
                    className={`glass-card p-6 md:p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group ${
                      isPast ? "bg-slate-50 border-slate-200 opacity-75" : "bg-white border-[#e2ded5] shadow-sm hover:border-[#0E5E5A]/25"
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-6 right-6">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        appt.status === "completed"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : appt.status === "scheduled"
                          ? "bg-cyan-50 border-cyan-200 text-cyan-600"
                          : "bg-slate-100 border-slate-200 text-slate-600"
                      }`}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      {/* Date Indicator Box */}
                      <div className={`rounded-xl p-4 flex flex-col items-center justify-center text-center w-24 shrink-0 border ${
                        isPast ? "bg-slate-100/70 text-slate-500 border-slate-200" : "bg-[#0E5E5A]/5 text-[#0E5E5A] border-[#0E5E5A]/15"
                      }`}>
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          {appt.preferredMode}
                        </span>
                        <span className="text-xl font-bold tracking-tight mt-1 font-[family-name:var(--font-outfit)]">
                          SYNCED
                        </span>
                      </div>

                      {/* Specialist Info */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-lg font-bold text-slate-800 uppercase font-[family-name:var(--font-outfit)]">
                            {appt.memberName}
                          </h4>
                          <p className="text-[9px] font-black text-[#E05E1B] uppercase tracking-widest mt-0.5">
                            {appt.memberRole}
                          </p>
                          <p className="text-xs text-slate-500 font-light leading-relaxed mt-2">
                            Reason: &quot;{appt.reason}&quot;
                          </p>
                        </div>

                        {!isPast && (
                          <div className="flex gap-2 flex-wrap pt-2">
                            <button
                              onClick={() => {
                                updateConsultStatus(parentId, appt.id, "completed");
                                setConsults(getConsultRequests(parentId));
                                showToast(`Simulation: Consult with ${appt.memberName} completed.`, "success");
                              }}
                              className="bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white px-5 py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all"
                            >
                              <Video size={12} /> Start Simulated Call
                            </button>
                            <button
                              onClick={() => {
                                updateConsultStatus(parentId, appt.id, "cancelled");
                                setConsults(getConsultRequests(parentId));
                                showToast("Appointment cancelled in sandbox.", "info");
                              }}
                              className="bg-white hover:bg-slate-50 border border-[#e2ded5] text-slate-600 px-5 py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTIVE FOLLOW-UP CARE TASKS SUMMARY */}
          <div className="bg-slate-50 border border-[#e2ded5] rounded-[2.5rem] p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-[#0E5E5A] uppercase tracking-tight flex items-center gap-3 font-[family-name:var(--font-outfit)]">
              <CheckCircle size={16} /> Attention Checklist
            </h3>

            {followups.filter(f => !f.isDone).length === 0 ? (
              <p className="text-xs text-slate-500 bg-white p-4 rounded-xl text-center border">
                ✓ All follow-up tasks completed! {parentName}&apos;s care sync is stable.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followups.filter(f => !f.isDone).slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="p-4 bg-white border border-[#e2ded5] hover:border-[#0E5E5A]/20 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#E05E1B]" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{task.label}</p>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Due: {task.dueLabel}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: CLINIC FINANCE & SAFETY BRIEFS */}
        <div className="space-y-8">
          {/* INSURANCE COVERAGE CARD */}
          <div className="glass-card bg-[#0E5E5A] border border-[#0E5E5A]/20 rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-teal-200 text-[8px] font-black uppercase tracking-widest">Insurance Cover</p>
                <h4 className="text-lg font-bold uppercase font-[family-name:var(--font-outfit)] mt-1 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#E05E1B]" /> Parents Shield
                </h4>
              </div>
              <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase">
                ACTIVE
              </span>
            </div>

            <p className="font-mono text-sm tracking-widest text-teal-100">POL-99388-PH</p>
            
            <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-teal-200 text-[8px] font-black uppercase tracking-widest">Wallet Balance</p>
                <p className="text-2xl font-black font-[family-name:var(--font-outfit)] mt-0.5">
                  ₹{balance.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleTopUp}
                className="bg-white hover:bg-slate-100 text-[#0E5E5A] px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Top Up
              </button>
            </div>
          </div>

          {/* LATEST CLINICAL DISCUSSION BRIEF SNAPSHOT */}
          <div className="glass-card bg-white border border-[#e2ded5] rounded-[2.5rem] p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)]">
                Latest Clinician Brief
              </h4>
              <span className="text-[8px] font-black text-[#E05E1B] bg-[#E05E1B]/5 border border-[#E05E1B]/15 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                Review Ready
              </span>
            </div>

            {doctorBrief ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-light leading-relaxed italic border-l-2 border-[#0E5E5A]/20 pl-3">
                  &quot;{doctorBrief.latestVitals}&quot;
                </p>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Top Questions to ask</p>
                  <p className="text-xs text-slate-700 font-medium">
                    1. {doctorBrief.questionsToAsk[0]}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                No active clinician discussion summary generated for {parentName}. Head to the &apos;Care Team&apos; tab to review and compile one.
              </p>
            )}
          </div>

          {/* SIMULATION SUMMARY STATS */}
          <div className="glass-card bg-slate-50 border p-6 rounded-[2rem] space-y-3">
            <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Care Hub Diagnostics</h5>
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Completed Consults:</span>
              <span className="font-bold text-[#0E5E5A]">{consults.filter(c => c.status === "completed").length}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Scheduled Active:</span>
              <span className="font-bold text-cyan-600">{consults.filter(c => c.status === "scheduled").length}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Pending Tasks:</span>
              <span className="font-bold text-[#E05E1B]">{followups.filter(f => !f.isDone).length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOOK APPOINTMENT MODAL */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 15 }}
              className="glass-card bg-white border border-[#e2ded5] w-full max-w-md rounded-[3rem] p-6 md:p-8 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-6 right-6 p-2 bg-slate-50 border hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={16} />
              </button>

              <h3 className="text-xl font-bold text-[#0E5E5A] uppercase tracking-tight font-[family-name:var(--font-outfit)] mb-6">
                Book Consultation
              </h3>

              <form onSubmit={handleBookAppointment} className="space-y-5">
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                    Select Care Specialist
                  </label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-xl text-xs font-semibold outline-none"
                    value={`${bookForm.specialistName}|${bookForm.specialistRole}`}
                    onChange={(e) => {
                      const [name, role] = e.target.value.split("|");
                      setBookForm(prev => ({ ...prev, specialistName: name, specialistRole: role }));
                    }}
                  >
                    <option value="Dr. Aruna Desai|Geriatrician">Dr. Aruna Desai (Geriatrician)</option>
                    <option value="Dr. Esha Sethi|Cardiologist">Dr. Esha Sethi (Cardiologist)</option>
                    <option value="Ms. Sanya Kapoor|Nutritionist">Ms. Sanya Kapoor (Nutritionist)</option>
                    <option value="Coach Vikram Singh|Physiotherapist">Coach Vikram Singh (Physiotherapist)</option>
                    <option value="Dr. Amit Verma|Family Physician">Dr. Amit Verma (Family Physician)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                      Target Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-xl text-xs font-semibold outline-none"
                      value={bookForm.date}
                      onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                      Target Time
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-xl text-xs font-semibold outline-none"
                      value={bookForm.time}
                      onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                    Consultation Format
                  </label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-xl text-xs font-semibold outline-none"
                    value={bookForm.mode}
                    onChange={(e) => setBookForm({ ...bookForm, mode: e.target.value as any })}
                  >
                    <option value="video">Secure Video Consultation</option>
                    <option value="phone">Audio Tele-call</option>
                    <option value="in-person">Physical Clinic Visit</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#0E5E5A] text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all mt-4"
                >
                  Schedule Appointment
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
