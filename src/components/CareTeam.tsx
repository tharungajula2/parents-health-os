"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Stethoscope,
  Phone,
  ArrowRight,
  Activity,
  Utensils,
  Moon,
  Clock,
  Video,
  MapPin,
  MessageCircle,
  FileText,
  AlertTriangle,
  CheckCircle,
  Plus,
  ChevronRight,
  ClipboardList,
  Heart,
  Send,
  Users,
  CheckSquare,
  Square,
  Calendar,
  X
} from "lucide-react";
import { useToast } from "./ui/Toast";
import { useParentsAuth } from "../lib/supabase/context";
import {
  CareTeamMember,
  ConsultRequest,
  FollowUpTask,
  DoctorBrief,
  getCareTeam,
  getConsultRequests,
  saveConsultRequest,
  updateConsultStatus,
  getFollowUpTasks,
  saveFollowUpTask,
  toggleFollowUpTask,
  generateDoctorBrief,
  getLastDoctorBrief,
  FOLLOW_UP_TASK_TEMPLATES,
  ConsultMode,
  ConsultUrgency
} from "../utils/careTeamEngine";

export function CareTeam() {
  const { showToast } = useToast();
  const { activeParent, vitals, medications, labReports } = useParentsAuth();
  
  // Parent ID fallback for sandbox mode
  const parentId = activeParent?.id || "sandbox-parent-id";
  const parentName = activeParent?.name || "Parent";

  // Tab State
  const [activeTab, setActiveTab] = useState<"roster" | "consults" | "brief">("roster");

  // Domain States
  const [team, setTeam] = useState<CareTeamMember[]>([]);
  const [consults, setConsults] = useState<ConsultRequest[]>([]);
  const [followups, setFollowups] = useState<FollowUpTask[]>([]);
  const [doctorBrief, setDoctorBrief] = useState<DoctorBrief | null>(null);

  // Consult Form States
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CareTeamMember | null>(null);
  const [consultReason, setConsultReason] = useState("");
  const [urgency, setUrgency] = useState<ConsultUrgency>("routine");
  const [prefMode, setPrefMode] = useState<ConsultMode>("video");
  const [prefLang, setPrefLang] = useState("English");
  const [caregiverNotes, setCaregiverNotes] = useState("");
  const [attachments, setAttachments] = useState({
    latestVitals: true,
    activeMedications: true,
    latestReportSummary: true,
    carePlanSummary: true,
    doctorQuestions: true,
    recentMisses: false,
  });

  // Follow-up custom input
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [customTaskLabel, setCustomTaskLabel] = useState("");
  const [customTaskCategory, setCustomTaskCategory] = useState<FollowUpTask["category"]>("review");
  const [customTaskDue, setCustomTaskDue] = useState("Within 3 days");

  // Load parent specific data when active parent changes
  useEffect(() => {
    if (parentId) {
      setTeam(getCareTeam(parentId));
      setConsults(getConsultRequests(parentId));
      setFollowups(getFollowUpTasks(parentId));
      setDoctorBrief(getLastDoctorBrief(parentId));
    }
  }, [parentId]);

  // Handle Consult Submission
  const handleRequestConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    if (!consultReason.trim()) {
      showToast("Please specify a reason for the consultation.", "error");
      return;
    }

    const newRequest: ConsultRequest = {
      id: `req-${Date.now()}`,
      parentId,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      memberRole: selectedMember.role,
      reason: consultReason,
      urgency,
      preferredMode: prefMode,
      preferredLanguage: prefLang,
      attachments,
      caregiverNotes,
      status: "requested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveConsultRequest(parentId, newRequest);
    setConsults(getConsultRequests(parentId));
    setShowRequestModal(false);
    
    // Reset Form
    setConsultReason("");
    setUrgency("routine");
    setPrefMode("video");
    setCaregiverNotes("");
    
    showToast(`Simulation Request created for ${selectedMember.name}. Status: Requested.`, "success");
  };

  // Trigger brief generation
  const handleGenerateBrief = () => {
    const answers = activeParent?.scorecard_answers || {};
    const brief = generateDoctorBrief(
      parentId,
      parentName,
      answers,
      medications,
      vitals,
      labReports
    );
    setDoctorBrief(brief);
    showToast("Structured Doctor Discussion Brief generated successfully!", "success");
  };

  // Add custom follow-up
  const handleAddFollowup = (label: string, category: FollowUpTask["category"], dueLabel: string) => {
    const newTask: FollowUpTask = {
      id: `task-${Date.now()}`,
      parentId,
      label,
      category,
      dueLabel,
      isDone: false,
      createdAt: new Date().toISOString()
    };
    saveFollowUpTask(parentId, newTask);
    setFollowups(getFollowUpTasks(parentId));
    showToast("Follow-up task added to care coordination schedule.", "success");
  };

  const handleToggleTask = (taskId: string) => {
    toggleFollowUpTask(parentId, taskId);
    setFollowups(getFollowUpTasks(parentId));
  };

  // Helper mapping category colors/icons
  const getCategoryIcon = (category: FollowUpTask["category"]) => {
    switch (category) {
      case "lab": return <ClipboardList size={14} className="text-cyan-600" />;
      case "medicine": return <Activity size={14} className="text-[#E05E1B]" />;
      case "vitals": return <Heart size={14} className="text-[#E05E1B]" />;
      case "physio": return <Activity size={14} className="text-emerald-600" />;
      case "upload": return <FileText size={14} className="text-teal-600" />;
      case "review": return <Stethoscope size={14} className="text-[#0E5E5A]" />;
      default: return <CheckCircle size={14} className="text-slate-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-2">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0E5E5A] tracking-tight uppercase font-[family-name:var(--font-outfit)]">
            Care & Clinic
          </h2>
          <p className="text-sm text-slate-600 font-normal mt-2 font-[family-name:var(--font-inter)] tracking-wide">
            Coordinate with {parentName}&apos;s assigned Indian care specialists, generate consultation briefs, and track follow-ups.
          </p>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-[#e2ded5] self-start md:self-center shadow-inner">
          <button
            onClick={() => setActiveTab("roster")}
            className={`px-5 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${
              activeTab === "roster"
                ? "bg-white text-[#0E5E5A] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Assigned Team
          </button>
          <button
            onClick={() => setActiveTab("consults")}
            className={`px-5 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${
              activeTab === "consults"
                ? "bg-white text-[#0E5E5A] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Consult Hub ({consults.length})
          </button>
          <button
            onClick={() => setActiveTab("brief")}
            className={`px-5 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all ${
              activeTab === "brief"
                ? "bg-white text-[#0E5E5A] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Doctor Brief
          </button>
        </div>
      </div>

      {/* DISCLAIMER BAR */}
      <div className="bg-[#E05E1B]/5 border border-[#E05E1B]/15 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 items-start sm:items-center">
          <div className="p-3 bg-[#E05E1B]/10 rounded-2xl text-[#E05E1B]">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-[#E05E1B] tracking-wider">Sandbox Operations Override</h4>
            <p className="text-xs text-slate-700 font-[family-name:var(--font-inter)] leading-relaxed mt-0.5">
              Profiles and workflows are simulated. All clinical and scheduling responses are local dry-runs for development testing.
            </p>
          </div>
        </div>
        <span className="bg-[#E05E1B]/15 text-[#E05E1B] px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase">
          LOCAL-FIRST
        </span>
      </div>

      {/* ACTIVE PARENT SWITCHER DETAILS */}
      <div className="bg-slate-50 border border-[#e2ded5] rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Care Profile</span>
          <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)] mt-1">
            {parentName}&apos;s Care Circle
          </h3>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conditions Sync</p>
            <p className="text-xs font-semibold text-[#0E5E5A] mt-0.5">
              {activeParent?.primary_conditions?.join(", ") || "Baseline Care Plan"}
            </p>
          </div>
          <div className="h-10 w-px bg-[#e2ded5] hidden sm:block" />
          <button 
            onClick={() => setActiveTab("brief")}
            className="px-6 py-3 bg-[#0E5E5A]/5 hover:bg-[#0E5E5A]/10 text-[#0E5E5A] text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Review Clinical Brief
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      <AnimatePresence mode="wait">
        {activeTab === "roster" && (
          <motion.div
            key="roster"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12"
          >
            {/* GRID OF SPECIALISTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member) => (
                <div
                  key={member.id}
                  className={`glass-card p-6 md:p-8 rounded-[2.5rem] border transition-all flex flex-col justify-between h-full relative overflow-hidden group ${
                    member.isAI
                      ? "border-[#0E5E5A]/35 bg-[#0E5E5A]/5"
                      : "border-[#e2ded5] bg-white hover:border-[#0E5E5A]/25"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-36 h-36 blur-3xl bg-[#0E5E5A]/5 rounded-full" />
                  
                  <div>
                    {/* Role Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3.5 rounded-2xl ${member.isAI ? "bg-[#0E5E5A] text-white" : "bg-[#0E5E5A]/5 text-[#0E5E5A]"} border border-[#0E5E5A]/15`}>
                        {member.isAI ? <Sparkles size={20} /> : <Stethoscope size={20} />}
                      </div>
                      <span className="bg-slate-100 border border-[#e2ded5] text-slate-600 px-3.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                        {member.availabilityLabel}
                      </span>
                    </div>

                    {/* Member Details */}
                    <div>
                      <h4 className="text-xl font-bold text-slate-800 group-hover:text-[#0E5E5A] transition-all uppercase font-[family-name:var(--font-outfit)]">
                        {member.name}
                      </h4>
                      <p className="data-label !text-[#E05E1B] !text-[9px] !tracking-[0.25em] mt-1">{member.role}</p>
                      <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-wide">
                        Specialty: {member.specialty}
                      </p>
                      <p className="text-slate-600 text-xs font-light leading-relaxed mt-4 mb-6">
                        {member.bio}
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="pt-6 border-t border-[#e2ded5] space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-tight">
                      <span>Langs: {member.languages.join(", ")}</span>
                      <span className="text-slate-400">Reg: {member.registrationNumber}</span>
                    </div>

                    {member.isAI ? (
                      <button
                        onClick={() => showToast("Navigating to AI Dialogue Insights...", "info")}
                        className="w-full py-5 rounded-2xl bg-[#0E5E5A] text-white font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#0c4e4b] transition-all shadow-md"
                      >
                        Launch AI Assistant
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRequestModal(true);
                        }}
                        className="w-full py-5 rounded-2xl border border-[#0E5E5A]/20 hover:border-transparent bg-teal-50/40 hover:bg-[#0E5E5A] hover:text-white text-[#0E5E5A] font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                      >
                        Request Review <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* PRE-CONFIGURED FOLLOW-UPS HUB IN ROSTER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10 border-t border-[#e2ded5]">
              {/* Follow-up tasks panel */}
              <div className="lg:col-span-2 glass-card bg-white p-6 md:p-8 border border-[#e2ded5] rounded-[2.5rem] space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#0E5E5A] uppercase tracking-tight flex items-center gap-3 font-[family-name:var(--font-outfit)]">
                    <ClipboardList size={18} /> Follow-Up Care Schedule
                  </h3>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="flex items-center gap-2 text-[#E05E1B] hover:text-[#0E5E5A] text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    <Plus size={12} strokeWidth={3} /> Add Schedule Task
                  </button>
                </div>

                {followups.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                    <p className="text-xs text-slate-500">No scheduled follow-up tasks yet.</p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center px-4">
                      {FOLLOW_UP_TASK_TEMPLATES.slice(0, 4).map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAddFollowup(t.label, t.category, t.dueLabel)}
                          className="px-3.5 py-2 bg-white border border-[#e2ded5] hover:border-[#0E5E5A]/20 rounded-xl text-[9px] font-semibold text-slate-600 hover:text-[#0E5E5A] transition-all"
                        >
                          + {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
                    {followups.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`flex items-center justify-between p-4 border rounded-2xl transition-all cursor-pointer ${
                          task.isDone
                            ? "bg-slate-50/70 border-slate-200 opacity-60 line-through"
                            : "bg-white border-[#e2ded5] hover:border-[#0E5E5A]/20 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${task.isDone ? "bg-slate-100" : "bg-slate-50"} border`}>
                            {getCategoryIcon(task.category)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{task.label}</p>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              Category: {task.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[9px] font-black text-[#E05E1B] uppercase bg-[#E05E1B]/5 border border-[#E05E1B]/15 px-3 py-1 rounded-full tracking-tighter">
                            {task.dueLabel}
                          </span>
                          <div className="text-slate-400">
                            {task.isDone ? (
                              <CheckCircle size={18} className="text-emerald-600" />
                            ) : (
                              <div className="w-[18px] h-[18px] border-2 border-slate-300 rounded-md" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Action Suggestion Sidepanel */}
              <div className="lg:col-span-1 glass-card bg-[#0E5E5A]/5 border border-[#0E5E5A]/15 p-6 md:p-8 rounded-[2.5rem] flex flex-col justify-between">
                <div>
                  <h4 className="text-[9px] font-black text-[#E05E1B] uppercase tracking-[0.25em]">Quick Seeding Actions</h4>
                  <h3 className="text-lg font-bold text-[#0E5E5A] uppercase tracking-tight font-[family-name:var(--font-outfit)] mt-1">
                    Predefined Lab & Care Tests
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 font-light leading-relaxed">
                    Instantly queue standard clinical review protocols into {parentName}&apos;s local coordination calendar.
                  </p>
                  
                  <div className="mt-6 space-y-2">
                    {FOLLOW_UP_TASK_TEMPLATES.slice(0, 4).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddFollowup(item.label, item.category, item.dueLabel)}
                        className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-[#e2ded5] rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-[#0E5E5A] transition-all group"
                      >
                        <span className="truncate pr-3">{item.label}</span>
                        <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-[#e2ded5] mt-6">
                  <p className="text-[9px] text-slate-400 italic">
                    * Tasks will appear on {parentName}&apos;s Daily Care list and Care coordination views.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "consults" && (
          <motion.div
            key="consults"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left side: Consult Requests list */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-[#0E5E5A] uppercase tracking-tight flex items-center gap-3 font-[family-name:var(--font-outfit)] px-2">
                <Calendar size={20} /> Active Consult Simulation Logs
              </h3>

              {consults.length === 0 ? (
                <div className="glass-card bg-white p-12 text-center border border-[#e2ded5] rounded-[2.5rem]">
                  <ClipboardList size={40} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 text-sm">No consultations logged for this parent yet.</p>
                  <p className="text-xs text-slate-400 mt-2">Use the &apos;Assigned Team&apos; tab to request a simulated consult.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consults.map((req) => (
                    <div
                      key={req.id}
                      className="glass-card bg-white border border-[#e2ded5] rounded-[2.5rem] p-6 md:p-8 space-y-6 transition-all hover:border-[#0E5E5A]/20"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="text-lg font-bold text-slate-800 uppercase font-[family-name:var(--font-outfit)]">
                              {req.memberName}
                            </h4>
                            <span className="bg-teal-50 border border-teal-150 text-[#0E5E5A] px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                              {req.memberRole}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            Reason: &quot;{req.reason}&quot;
                          </p>
                        </div>

                        {/* Status sync indicators */}
                        <div className="flex gap-2 items-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                            req.urgency === "urgent"
                              ? "bg-[#E05E1B]/5 border-[#E05E1B]/20 text-[#E05E1B]"
                              : "bg-slate-100 border-slate-200 text-slate-600"
                          }`}>
                            {req.urgency}
                          </span>
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                            req.status === "completed"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                              : "bg-cyan-50 border-cyan-200 text-cyan-600 animate-pulse"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>

                      {/* Attachments & Context Meta */}
                      <div className="bg-slate-50 border rounded-2xl p-4 flex flex-wrap gap-4 text-[10px] font-black text-slate-500 uppercase tracking-tight">
                        <span className="text-slate-400">Context Attached:</span>
                        {req.attachments.latestVitals && <span className="text-[#0E5E5A]">✓ Vitals</span>}
                        {req.attachments.activeMedications && <span className="text-[#0E5E5A]">✓ Medications</span>}
                        {req.attachments.latestReportSummary && <span className="text-[#0E5E5A]">✓ Reports</span>}
                        {req.attachments.carePlanSummary && <span className="text-[#0E5E5A]">✓ Care Plan</span>}
                      </div>

                      {/* Caregiver note */}
                      {req.caregiverNotes && (
                        <p className="text-xs text-slate-600 font-light italic leading-relaxed border-l-2 border-[#0E5E5A]/20 pl-4">
                          Caregiver note: &quot;{req.caregiverNotes}&quot;
                        </p>
                      )}

                      {/* Sim action triggers */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          Logged: {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex gap-2">
                          {req.status === "requested" && (
                            <button
                              onClick={() => {
                                updateConsultStatus(parentId, req.id, "scheduled");
                                setConsults(getConsultRequests(parentId));
                                showToast("Simulation: Consultation Scheduled with doctor.", "success");
                              }}
                              className="px-5 py-2.5 bg-[#0E5E5A]/5 hover:bg-[#0E5E5A]/10 text-[#0E5E5A] text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                              Schedule Consult
                            </button>
                          )}
                          {req.status === "scheduled" && (
                            <button
                              onClick={() => {
                                updateConsultStatus(parentId, req.id, "completed");
                                setConsults(getConsultRequests(parentId));
                                // Auto add followups upon simulation completion
                                handleAddFollowup("Update medicine list based on consultation review", "medicine", "Within 2 days");
                                handleAddFollowup("Track daily BP for 7 days post review", "vitals", "Next 7 days");
                                showToast("Consult Completed! Added automated care plan follow-up tasks.", "success");
                              }}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                              Complete Consult
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              updateConsultStatus(parentId, req.id, "cancelled");
                              setConsults(getConsultRequests(parentId));
                              showToast("Consult simulation cancelled.", "info");
                            }}
                            className="px-5 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Instructions / Guide */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card bg-[#0E5E5A] border border-white/10 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 blur-2xl rounded-full" />
                <h4 className="text-[9px] font-black text-[#E05E1B] uppercase tracking-[0.25em] mb-2">Simulated Review Path</h4>
                <h3 className="text-xl font-bold tracking-tight uppercase font-[family-name:var(--font-outfit)]">
                  Consult Workflow Logic
                </h3>
                <p className="text-xs text-teal-100/80 font-light leading-relaxed mt-4">
                  1. **Draft/Requested**: Child initiates the request with structured context attachments from vital logs, meds, and report analytics.
                </p>
                <p className="text-xs text-teal-100/80 font-light leading-relaxed mt-3">
                  2. **Scheduled**: Care Coordinator synchronises slots (Simulated).
                </p>
                <p className="text-xs text-teal-100/80 font-light leading-relaxed mt-3">
                  3. **Completed**: Creates follow-up guidelines, logs clinical notes, and updates medication schedules.
                </p>
              </div>

              {/* Safety lock check info box */}
              <div className="glass-card bg-slate-50 border border-slate-200 p-6 rounded-[2.5rem]">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preflight Integrity</span>
                <h4 className="font-semibold text-slate-700 mt-1 uppercase text-xs">Sandbox Mode Confirmed</h4>
                <p className="text-[11px] text-slate-500 mt-2 font-light leading-relaxed">
                  No database writes are triggered. All requests persist solely in your local browser sandbox context matching standard security parameters.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "brief" && (
          <motion.div
            key="brief"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Generate Trigger */}
            <div className="glass-card bg-white border border-[#e2ded5] rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="bg-[#0E5E5A]/10 text-[#0E5E5A] border border-[#0E5E5A]/15 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  Rule-Based Engine
                </span>
                <h3 className="text-2xl font-bold text-[#0E5E5A] uppercase tracking-tight font-[family-name:var(--font-outfit)]">
                  Doctor Discussion Summary Generator
                </h3>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  Instantly structure {parentName}&apos;s current conditions, vital metrics, active medications, and recent red-flag metrics to bring to your next real clinic consult.
                </p>
              </div>
              <button
                onClick={handleGenerateBrief}
                className="px-8 py-5 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shrink-0 cursor-pointer"
              >
                <Sparkles size={14} /> Generate Clinical Brief
              </button>
            </div>

            {/* Generated Brief Sheet */}
            {doctorBrief ? (
              <div className="glass-card bg-white border border-[#e2ded5] rounded-[3rem] p-8 md:p-12 space-y-10 relative overflow-hidden shadow-sm">
                {/* Visual Stamp */}
                <div className="absolute top-8 right-8 border border-[#E05E1B]/30 rounded-3xl p-3 bg-[#E05E1B]/5 text-[#E05E1B] transform rotate-3 flex items-center gap-2 max-w-xs">
                  <Stethoscope size={16} />
                  <span className="text-[8px] font-black uppercase tracking-widest">For Clinical Discussion Only</span>
                </div>

                {/* Brief Title */}
                <div>
                  <h4 className="text-[10px] font-black text-[#E05E1B] uppercase tracking-[0.3em]">Structured Clinician Overview</h4>
                  <h3 className="text-3xl font-bold text-slate-800 uppercase tracking-tighter mt-1 font-[family-name:var(--font-outfit)]">
                    Discussion Summary: {doctorBrief.parentName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Generated on {new Date(doctorBrief.generatedAt).toLocaleString()} • {doctorBrief.ageLanguage}
                  </p>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                  {/* Conditions & Vitals */}
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-[10px] font-black text-[#0E5E5A] uppercase tracking-widest mb-3">Primary Conditions Sync</h5>
                      <div className="flex flex-wrap gap-2">
                        {doctorBrief.knownConditions.map((c, i) => (
                          <span key={i} className="px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-700">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-[10px] font-black text-[#0E5E5A] uppercase tracking-widest mb-2">Latest Synced Vitals Check</h5>
                      <p className="text-sm font-bold text-slate-800 bg-teal-50/30 border border-[#0E5E5A]/10 p-4 rounded-2xl">
                        {doctorBrief.latestVitals}
                      </p>
                    </div>
                  </div>

                  {/* Active Meds */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-[#0E5E5A] uppercase tracking-widest">Active Medications Logged</h5>
                    <div className="bg-slate-50/50 border rounded-[2rem] p-6 space-y-3 max-h-[160px] overflow-y-auto">
                      {doctorBrief.activeMedications.map((m, i) => (
                        <div key={i} className="text-xs text-slate-700 flex items-center gap-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#E05E1B]" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Red Flags & Report Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                  {/* Red flags */}
                  <div>
                    <h5 className="text-[10px] font-black text-[#E05E1B] uppercase tracking-widest mb-3">Recent Risk Signals / Red Flags</h5>
                    {doctorBrief.recentRedFlags.length === 0 ? (
                      <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl">No physiological risk warnings registered this cycle.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {doctorBrief.recentRedFlags.map((flag, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-red-50 border border-red-150 p-3.5 rounded-2xl text-xs font-semibold text-red-700">
                            <AlertTriangle size={14} className="shrink-0" />
                            <span>{flag}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Report summaries */}
                  <div>
                    <h5 className="text-[10px] font-black text-[#0E5E5A] uppercase tracking-widest mb-3">Biomarker & Lab Report Insights</h5>
                    <div className="bg-slate-50 border p-5 rounded-2xl text-xs font-light text-slate-600 leading-relaxed">
                      {doctorBrief.latestReportSummary}
                    </div>
                  </div>
                </div>

                {/* Core agendas & checkups */}
                <div className="pt-8 border-t border-slate-100 space-y-4">
                  <h5 className="text-[10px] font-black text-[#0E5E5A] uppercase tracking-widest">Recommended Clinician Discussion Points</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctorBrief.questionsToAsk.map((q, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border">
                        <span className="text-[#0E5E5A] font-bold text-xs shrink-0">Q{i+1}.</span>
                        <p className="text-xs text-slate-700 leading-relaxed font-light">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety disclaimers */}
                <div className="bg-slate-50 border border-[#e2ded5] rounded-3xl p-6 text-center space-y-2">
                  <p className="text-xs text-slate-700 font-semibold">{doctorBrief.disclaimer}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Parents Health OS Sandbox Platform Sync // Local-First Integrity Protocol
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-card bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-12 text-center">
                <ClipboardList size={48} className="mx-auto text-slate-350 mb-4" />
                <h4 className="text-base font-bold text-slate-700 uppercase tracking-tight">Brief Not Yet Generated</h4>
                <p className="text-xs text-slate-500 mt-2">
                  Click the button above to compile {parentName}&apos;s physiological reports and metrics into a beautiful review sheet.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* REQUEST CONSULT MODAL */}
      <AnimatePresence>
        {showRequestModal && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 15 }}
              className="glass-card bg-white border border-[#e2ded5] w-full max-w-xl rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-6 right-6 p-2 bg-slate-50 border hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-bold text-[#0E5E5A] uppercase tracking-tight font-[family-name:var(--font-outfit)]">
                Simulate Review Request
              </h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">
                Target specialist: {selectedMember.name} ({selectedMember.role})
              </p>

              <form onSubmit={handleRequestConsultSubmit} className="space-y-6 relative z-10">
                {/* Reason */}
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                    Primary Reason for Review
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daily sugar fluctuations, polypharmacy audit, exercise adjustment"
                    className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#0E5E5A] outline-none transition-all"
                    value={consultReason}
                    onChange={(e) => setConsultReason(e.target.value)}
                  />
                </div>

                {/* Urgency & Preferred Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                      Urgency Priority
                    </label>
                    <select
                      className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#0E5E5A] outline-none"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as ConsultUrgency)}
                    >
                      <option value="routine">Routine Check</option>
                      <option value="soon">Soon (Next 3 days)</option>
                      <option value="urgent">Urgent Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                      Review Channel Mode
                    </label>
                    <select
                      className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#0E5E5A] outline-none"
                      value={prefMode}
                      onChange={(e) => setPrefMode(e.target.value as ConsultMode)}
                    >
                      <option value="video">Secure Video</option>
                      <option value="phone">Audio Slot Call</option>
                      <option value="whatsapp">WhatsApp Companion Sim</option>
                      <option value="in-person">In-Clinic Visit</option>
                    </select>
                  </div>
                </div>

                {/* Language selection */}
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                    Consultation Language Preference
                  </label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#0E5E5A] outline-none"
                    value={prefLang}
                    onChange={(e) => setPrefLang(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                  </select>
                </div>

                {/* Context Attachments */}
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-3">
                    Sync Context & Diagnostic Records
                  </label>
                  <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border">
                    <label className="flex items-center gap-3.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={attachments.latestVitals}
                        onChange={(e) => setAttachments({ ...attachments, latestVitals: e.target.checked })}
                        className="rounded accent-[#0E5E5A]"
                      />
                      Latest Vital Sync
                    </label>
                    <label className="flex items-center gap-3.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={attachments.activeMedications}
                        onChange={(e) => setAttachments({ ...attachments, activeMedications: e.target.checked })}
                        className="rounded accent-[#0E5E5A]"
                      />
                      Active Medications
                    </label>
                    <label className="flex items-center gap-3.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={attachments.latestReportSummary}
                        onChange={(e) => setAttachments({ ...attachments, latestReportSummary: e.target.checked })}
                        className="rounded accent-[#0E5E5A]"
                      />
                      Biomarker Report Summary
                    </label>
                    <label className="flex items-center gap-3.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={attachments.carePlanSummary}
                        onChange={(e) => setAttachments({ ...attachments, carePlanSummary: e.target.checked })}
                        className="rounded accent-[#0E5E5A]"
                      />
                      Care Plan Target Points
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                    Additional Caregiver Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific questions or symptoms to highlight..."
                    className="w-full p-4 bg-slate-50 border border-[#e2ded5] rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#0E5E5A] outline-none transition-all resize-none"
                    value={caregiverNotes}
                    onChange={(e) => setCaregiverNotes(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-5 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-black rounded-2xl text-[9px] uppercase tracking-widest transition-all"
                  >
                    Confirm Review Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD SCHEDULE TASK MODAL */}
      <AnimatePresence>
        {showAddTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setShowAddTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 15 }}
              className="glass-card bg-white border border-[#e2ded5] w-full max-w-md rounded-[3rem] p-6 md:p-8 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="absolute top-6 right-6 p-2 bg-slate-50 border hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={16} />
              </button>

              <h3 className="text-xl font-bold text-[#0E5E5A] uppercase tracking-tight font-[family-name:var(--font-outfit)] mb-6">
                Add Coordination Task
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                    Task Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule cardiologist followup review"
                    className="w-full p-3.5 bg-slate-50 border border-[#e2ded5] rounded-xl text-xs font-semibold outline-none focus:border-[#0E5E5A] focus:bg-white"
                    value={customTaskLabel}
                    onChange={(e) => setCustomTaskLabel(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                      Category
                    </label>
                    <select
                      className="w-full p-3.5 bg-slate-50 border border-[#e2ded5] rounded-xl text-xs font-semibold outline-none"
                      value={customTaskCategory}
                      onChange={(e) => setCustomTaskCategory(e.target.value as FollowUpTask["category"])}
                    >
                      <option value="review">Clinical Review</option>
                      <option value="medicine">Medications</option>
                      <option value="vitals">Vitals Tracking</option>
                      <option value="lab">Lab Investigations</option>
                      <option value="physio">Physiotherapy</option>
                      <option value="upload">Record Upload</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                      Due / Target Window
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Next 3 days"
                      className="w-full p-3.5 bg-slate-50 border border-[#e2ded5] rounded-xl text-xs font-semibold outline-none focus:border-[#0E5E5A] focus:bg-white"
                      value={customTaskDue}
                      onChange={(e) => setCustomTaskDue(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!customTaskLabel.trim()) {
                      showToast("Please enter a task title.", "error");
                      return;
                    }
                    handleAddFollowup(customTaskLabel, customTaskCategory, customTaskDue);
                    setCustomTaskLabel("");
                    setShowAddTaskModal(false);
                  }}
                  className="w-full py-4 bg-[#0E5E5A] text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all mt-4"
                >
                  Create Schedule Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
