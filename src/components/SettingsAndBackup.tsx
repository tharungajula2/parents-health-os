"use client";

import React, { useState, useEffect } from "react";
import { useParentsAuth } from "../lib/supabase/context";
import { useToast } from "./ui/Toast";
import { 
  ShieldCheck, 
  Activity, 
  User, 
  Phone, 
  Database, 
  Download, 
  Upload, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Heart,
  ChevronRight,
  RefreshCw,
  Users,
  Compass,
  FileText
} from "lucide-react";

export function SettingsAndBackup() {
  const { 
    parents, 
    activeParent, 
    selectActiveParent, 
    updateParentProfile,
    isSupabaseEnabled,
    lastSaved,
    pendingChanges,
    resetLocalPendingChanges
  } = useParentsAuth();
  
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"profiles" | "sandbox" | "backup" | "migration" | "dpdpa">("profiles");
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  
  // App Mode State (Demo vs Personal)
  const [appMode, setAppMode] = useState<"demo" | "personal">("demo");
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    relationship: "Mother",
    phone: "",
    language: "English",
    primary_conditions: "",
    // Extra fields inside scorecard_answers.personal_profile
    age: "",
    gender: "Female",
    city: "",
    health_concerns: "",
    allergies: "",
    mobility_notes: "",
    diet: "",
    sleep: "",
    cognitive: "",
    care_preferences: "",
    emergency_notes: "",
    gp_name: "",
    gp_specialty: "",
    gp_clinic: "",
    gp_phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    preferred_hospital: "",
    preferred_hospital_phone: ""
  });

  useEffect(() => {
    const savedMode = localStorage.getItem("parents_health_mode") as "demo" | "personal";
    if (savedMode) {
      setAppMode(savedMode);
    }
  }, []);

  useEffect(() => {
    if (activeParent) {
      setSelectedParentId(activeParent.id);
    } else if (parents.length > 0) {
      setSelectedParentId(parents[0].id);
    }
  }, [activeParent, parents]);

  useEffect(() => {
    const parent = parents.find(p => p.id === selectedParentId);
    if (parent) {
      const extra = (parent.scorecard_answers as any)?.personal_profile || {};
      setFormData({
        name: parent.name || "",
        relationship: parent.relationship || "Mother",
        phone: parent.phone || "",
        language: parent.language || "English",
        primary_conditions: Array.isArray(parent.primary_conditions) ? parent.primary_conditions.join(", ") : (parent.primary_conditions || ""),
        age: extra.age || "",
        gender: extra.gender || "Female",
        city: extra.city || "",
        health_concerns: extra.health_concerns || "",
        allergies: extra.allergies || "",
        mobility_notes: extra.mobility_notes || "",
        diet: extra.diet || "",
        sleep: extra.sleep || "",
        cognitive: extra.cognitive || "",
        care_preferences: extra.care_preferences || "",
        emergency_notes: extra.emergency_notes || "",
        gp_name: extra.gp_name || "",
        gp_specialty: extra.gp_specialty || "",
        gp_clinic: extra.gp_clinic || "",
        gp_phone: extra.gp_phone || "",
        emergency_contact_name: extra.emergency_contact_name || "",
        emergency_contact_phone: extra.emergency_contact_phone || "",
        emergency_contact_relationship: extra.emergency_contact_relationship || "",
        preferred_hospital: extra.preferred_hospital || "",
        preferred_hospital_phone: extra.preferred_hospital_phone || ""
      });
    }
  }, [selectedParentId, parents]);

  // Handle Mode Change
  const handleModeChange = (mode: "demo" | "personal") => {
    localStorage.setItem("parents_health_mode", mode);
    setAppMode(mode);
    showToast(`Switched to ${mode === "personal" ? "Personal Sandbox Mode" : "Standard Demo Mode"}. Reloading application...`, "success");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) return;

    const conditionsArray = formData.primary_conditions
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);

    const personal_profile = {
      age: formData.age,
      gender: formData.gender,
      city: formData.city,
      health_concerns: formData.health_concerns,
      allergies: formData.allergies,
      mobility_notes: formData.mobility_notes,
      diet: formData.diet,
      sleep: formData.sleep,
      cognitive: formData.cognitive,
      care_preferences: formData.care_preferences,
      emergency_notes: formData.emergency_notes,
      gp_name: formData.gp_name,
      gp_specialty: formData.gp_specialty,
      gp_clinic: formData.gp_clinic,
      gp_phone: formData.gp_phone,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      emergency_contact_relationship: formData.emergency_contact_relationship,
      preferred_hospital: formData.preferred_hospital,
      preferred_hospital_phone: formData.preferred_hospital_phone
    };

    const parent = parents.find(p => p.id === selectedParentId);
    const existingAnswers = (parent?.scorecard_answers as any)?.answers || {};
    const existingScores = (parent?.scorecard_answers as any)?.scores || {};

    const updatedFields = {
      name: formData.name,
      relationship: formData.relationship,
      phone: formData.phone,
      language: formData.language,
      primary_conditions: conditionsArray,
      scorecard_answers: {
        answers: existingAnswers,
        scores: existingScores,
        personal_profile
      } as any
    };

    const res = await updateParentProfile(selectedParentId, updatedFields);
    if (res.success) {
      // Force change mode to personal sandbox so they see their changes
      localStorage.setItem("parents_health_mode", "personal");
      setAppMode("personal");
      
      showToast(`Successfully updated health parameters for ${formData.name}.`, "success");
    } else {
      showToast("Failed to persist profile configuration.", "error");
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    try {
      const backup: Record<string, string | null> = {};
      
      // Select keys to include
      const backupKeys = [
        "parents_health_auth_v2",
        "parents_health_mode",
        "parents_health_active_parent_id",
        "parents_health_personal_parents",
        "parents_health_user_name",
        "parents_health_user_age",
        "parents_health_assessment_data_v2",
        "parents_health_latest_summary",
        "parents_health_history"
      ];

      // Add parent-specific logs
      parents.forEach(p => {
        backupKeys.push(`parents_health_assessment_data_v2_${p.id}`);
        backupKeys.push(`parents_health_latest_summary_${p.id}`);
        backupKeys.push(`parents_health_history_${p.id}`);
        backupKeys.push(`parents_health_vitals_${p.id}`);
        backupKeys.push(`parents_health_active_meds_${p.id}`);
        backupKeys.push(`parents_health_lab_reports_${p.id}`);
        backupKeys.push(`parents_health_whatsapp_messages_${p.id}`);
        backupKeys.push(`parents_health_ai_conversations_${p.id}`);
        
        // Care Team Engine keys
        backupKeys.push(`phos_care_team_${p.id}`);
        backupKeys.push(`phos_consult_requests_${p.id}`);
        backupKeys.push(`phos_consult_notes_${p.id}`);
        backupKeys.push(`phos_followup_tasks_${p.id}`);
        backupKeys.push(`phos_doctor_brief_${p.id}`);
      });

      // Wildcard check for daily and medicine logs
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("parents_health_med_log_") || key.startsWith("parents_health_daily_log_")) {
          backupKeys.push(key);
        }
      });

      // Copy values
      backupKeys.forEach(k => {
        backup[k] = localStorage.getItem(k);
      });

      // Save as JSON file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `parents-health-os-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`${Object.keys(backup).filter(k => backup[k]).length} cache entries safely serialized as backup JSON.`, "success");
    } catch (e) {
      showToast("Failed to serialize browser health parameters.", "error");
    }
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data !== "object" || data === null) {
          throw new Error("Invalid payload format");
        }

        // Apply backup values to localStorage
        Object.keys(data).forEach(key => {
          if (data[key] !== null) {
            localStorage.setItem(key, data[key]);
          }
        });

        showToast("Backup Package Restored! Re-indexing and refreshing...", "success");

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        showToast("Selected backup package contains corrupted or malformed parameters.", "error");
      }
    };
    reader.readAsText(file);
  };

  // Revoke DPDP Consent (Wipe Data)
  const handleRevokeConsent = () => {
    if (confirm("⚠️ CAUTION: Revoking parental consent is a legally binding erase request under Section 12 of the DPDP Act 2023. All local records, logs, vital trends, and personalized profiles will be permanently erased. Do you wish to proceed?")) {
      if (confirm("FINAL ACTION REQUIRED: Are you absolutely certain you want to wipe all records? This cannot be undone.")) {
        localStorage.removeItem("parents_health_auth_v2");
        localStorage.removeItem("parents_health_mode");
        localStorage.removeItem("parents_health_active_parent_id");
        localStorage.removeItem("parents_health_personal_parents");
        localStorage.removeItem("parents_health_user_name");
        localStorage.removeItem("parents_health_user_age");
        localStorage.removeItem("parents_health_assessment_data_v2");
        localStorage.removeItem("parents_health_latest_summary");
        localStorage.removeItem("parents_health_history");
        
        Object.keys(localStorage).forEach(key => {
          if (
            key.startsWith("parents_health_") || 
            key.startsWith("phos_")
          ) {
            localStorage.removeItem(key);
          }
        });
        
        showToast("All digital care link indicators have been purged. Redirecting...", "success");
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e2ded5] pb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Settings & Data Integrity</h2>
          <p className="text-slate-600 text-xs font-light mt-1 font-[family-name:var(--font-inter)] leading-relaxed">
            Manage physical device sandbox modes, backup JSON packages, audit cloud migration steps, and verify DPDP Act 2023 consent statuses.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-800 font-bold text-[9px] uppercase tracking-wider">
          <ShieldCheck size={14} className="text-emerald-600 animate-pulse" /> Local Sandbox Safe
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${
            activeTab === "profiles"
              ? "bg-[#0E5E5A] text-white shadow-sm"
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <User size={14} /> Personal Profiles
        </button>
        <button
          onClick={() => setActiveTab("sandbox")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${
            activeTab === "sandbox"
              ? "bg-[#0E5E5A] text-white shadow-sm"
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <Database size={14} /> Sandbox Environment
        </button>
        <button
          onClick={() => setActiveTab("backup")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${
            activeTab === "backup"
              ? "bg-[#0E5E5A] text-white shadow-sm"
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <Download size={14} /> Backup & Restore
        </button>
        <button
          onClick={() => setActiveTab("migration")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${
            activeTab === "migration"
              ? "bg-[#0E5E5A] text-white shadow-sm"
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <Compass size={14} /> Cloud Sync Blueprint
        </button>
        <button
          onClick={() => setActiveTab("dpdpa")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${
            activeTab === "dpdpa"
              ? "bg-[#0E5E5A] text-white shadow-sm"
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          <ShieldCheck size={14} /> DPDP Readiness
        </button>
      </div>

      {/* Profile Setup Tab */}
      {activeTab === "profiles" && (
        <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-[#e2ded5] shadow-sm bg-white/40 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Customizable Parent Profile Setup</h3>
              <p className="text-xs text-slate-600 font-light mt-1">Configure active health dimensions and contact registries locally.</p>
              <p className="text-[10px] text-slate-500 font-medium mt-2 max-w-xl leading-relaxed italic">
                ⚠️ Parents Health OS and Anaya do not provide diagnosis, prescriptions, emergency medical care, or doctor replacement. They help organize, summarize, and coordinate family care information.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Parent:</span>
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="px-3.5 py-2 border border-[#e2ded5] bg-white rounded-xl text-xs focus:outline-none focus:border-[#0E5E5A] font-semibold text-slate-700 shadow-sm"
              >
                {parents.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* 1. Identity */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2 text-[#0E5E5A]">
                <User size={14} /> 1. Identity & Demographics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Parent Display Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3.5 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                    placeholder="e.g. Amma"
                  />
                </div>
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Relationship</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-4 py-3.5 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs text-slate-650"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Primary Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3.5 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs text-slate-650"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Bengali">Bengali</option>
                  </select>
                </div>
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Age (Years)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-4 py-3.5 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                    placeholder="e.g. 65"
                  />
                </div>
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-3.5 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs text-slate-650"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">City / Location</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3.5 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                    placeholder="e.g. Hyderabad, Telangana"
                  />
                </div>
              </div>
            </div>

            {/* 2. Medical Baseline */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2 text-[#0E5E5A]">
                <Heart size={14} /> 2. Clinical History & Allergies
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Known Conditions (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.primary_conditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_conditions: e.target.value }))}
                    className="w-full px-4 py-3.5 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                    placeholder="e.g. Diabetes Type 2, Chronic Hypertension, Osteoarthritis"
                  />
                </div>
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Allergies</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                    className="w-full px-4 py-3.5 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs"
                    placeholder="e.g. Penicillin, Peanuts, None"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Main Health & Symptoms Concerns</label>
                  <textarea
                    value={formData.health_concerns}
                    onChange={(e) => setFormData(prev => ({ ...prev, health_concerns: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs h-20"
                    placeholder="Describe any frequent health issues or details you want Anaya/doctors to monitor specifically..."
                  />
                </div>
              </div>
            </div>

            {/* 3. Elderly Comfort & Safety Notes */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2 text-[#0E5E5A]">
                <Activity size={14} /> 3. Elderly Vitals & Comfort Notes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Mobility & Balance Notes</label>
                  <textarea
                    value={formData.mobility_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobility_notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs h-20"
                    placeholder="e.g. Walks slowly, uses a cane outdoors, complains of knee stiffness"
                  />
                </div>
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Diet & Hydration Habits</label>
                  <textarea
                    value={formData.diet}
                    onChange={(e) => setFormData(prev => ({ ...prev, diet: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs h-20"
                    placeholder="e.g. Vegetarian, needs low sodium, drinks about 1.5L water daily"
                  />
                </div>
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Sleep Patterns</label>
                  <textarea
                    value={formData.sleep}
                    onChange={(e) => setFormData(prev => ({ ...prev, sleep: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs h-20"
                    placeholder="e.g. Disrupted sleep, sleeps around 6 hours, wakes up early"
                  />
                </div>
                <div>
                  <label className="data-label text-[9px] text-slate-500 mb-1.5 block uppercase tracking-wider">Emotional & Cognitive Notes</label>
                  <textarea
                    value={formData.cognitive}
                    onChange={(e) => setFormData(prev => ({ ...prev, cognitive: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#e2ded5] bg-white/70 rounded-xl focus:border-[#0E5E5A] focus:outline-none transition-all text-xs h-20"
                    placeholder="e.g. Occasional mild forgetfulness with medicines, generally cheerful"
                  />
                </div>
              </div>
            </div>

            {/* 4. Care Team & Emergency Registries */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2 text-[#0E5E5A]">
                <Phone size={14} /> 4. Medical Registries & Contacts
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Doctor (GP) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                  <div className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Family Doctor (GP)</div>
                  <div>
                    <input
                      type="text"
                      value={formData.gp_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, gp_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#e2ded5] bg-white rounded-lg focus:outline-none text-xs mb-2"
                      placeholder="Doctor Full Name"
                    />
                    <input
                      type="text"
                      value={formData.gp_specialty}
                      onChange={(e) => setFormData(prev => ({ ...prev, gp_specialty: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#e2ded5] bg-white rounded-lg focus:outline-none text-xs mb-2"
                      placeholder="Specialty (e.g. Cardiologist)"
                    />
                    <input
                      type="text"
                      value={formData.gp_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, gp_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#e2ded5] bg-white rounded-lg focus:outline-none text-xs"
                      placeholder="Doctor Phone Number"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                  <div className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Emergency Contact</div>
                  <div>
                    <input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#e2ded5] bg-white rounded-lg focus:outline-none text-xs mb-2"
                      placeholder="Contact Name"
                    />
                    <input
                      type="text"
                      value={formData.emergency_contact_relationship}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_relationship: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#e2ded5] bg-white rounded-lg focus:outline-none text-xs mb-2"
                      placeholder="Relationship (e.g. Son)"
                    />
                    <input
                      type="text"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#e2ded5] bg-white rounded-lg focus:outline-none text-xs"
                      placeholder="Emergency Phone Number"
                    />
                  </div>
                </div>

                {/* Preferred Hospital */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                  <div className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Preferred Hospital</div>
                  <div>
                    <input
                      type="text"
                      value={formData.preferred_hospital}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferred_hospital: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#e2ded5] bg-white rounded-lg focus:outline-none text-xs mb-2"
                      placeholder="Hospital Name"
                    />
                    <input
                      type="text"
                      value={formData.preferred_hospital_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferred_hospital_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#e2ded5] bg-white rounded-lg focus:outline-none text-xs"
                      placeholder="Hospital Helpline Phone"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-4 border-t border-[#e2ded5] pt-6">
              <button
                type="submit"
                className="px-10 py-4 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 size={14} /> Synchronize Profile parameters
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sandbox Toggle Tab */}
      {activeTab === "sandbox" && (
        <div className="space-y-6">
          {/* Awareness Banner */}
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-[2rem] flex gap-4 text-xs text-amber-800 leading-relaxed">
            <AlertTriangle size={24} className="shrink-0 text-amber-600 mt-1" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-[10px] text-amber-900 mb-1">Local Physical Sandbox Active</span>
              Sandbox profile, medication, vitals, and backup data are stored locally in this browser by default. No live Supabase database sync is active. Optional AI report analysis may send uploaded report content to the configured Gemini API for processing.
            </div>
          </div>

          {/* Sandbox Vault Persistence Metrics (Phase 2B.1) */}
          <div className="p-6 md:p-8 rounded-[2.5rem] bg-white border border-[#e2ded5] shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0E5E5A]">
                <Database size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)]">
                  Sandbox Vault Persistence Stats
                </h4>
                <p className="text-xs text-slate-500 font-light mt-0.5 leading-none">
                  Real-time status of your client-side SQLite/LocalStorage buffer
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 font-[family-name:var(--font-inter)]">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Last Secure Save</span>
                <span className="text-xs font-semibold text-slate-700">
                  {(() => {
                    if (lastSaved === "Never") return "Never";
                    try {
                      const d = new Date(lastSaved);
                      if (isNaN(d.getTime())) return lastSaved;
                      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " " + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    } catch (e) {
                      return lastSaved;
                    }
                  })()}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Unsaved Local Changes</span>
                <span className="text-xs font-semibold text-slate-700">
                  {pendingChanges === 0 ? "0 (All changes flushed)" : `${pendingChanges} unsaved edit${pendingChanges > 1 ? "s" : ""}`}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Sync Server Status</span>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Offline (Sandbox)
                </span>
              </div>
            </div>

            {pendingChanges > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => {
                    resetLocalPendingChanges();
                    showToast("🔄 Simulated backup sync complete. Local pending changes updated!", "success");
                  }}
                  className="px-5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-white bg-[#0E5E5A] hover:bg-[#0c4e4b] transition-all flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} /> Simulate Sync & Commit
                </button>
                <button
                  onClick={() => {
                    resetLocalPendingChanges();
                    showToast("🧹 Local pending changes buffer cleared.", "info");
                  }}
                  className="px-5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Dismiss Changes Log
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={() => handleModeChange("demo")}
              className={`p-6 md:p-10 rounded-[2.5rem] border cursor-pointer transition-all flex flex-col justify-between min-h-[16rem] group ${
                appMode === "demo"
                  ? "bg-[#0E5E5A]/5 border-[#0E5E5A] shadow-md"
                  : "bg-white border-[#e2ded5] hover:border-slate-350"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-colors ${
                  appMode === "demo" ? "bg-[#0E5E5A] text-white" : "bg-teal-50 text-[#0E5E5A]"
                }`}>
                  <Users size={20} />
                </div>
                {appMode === "demo" && (
                  <span className="px-2.5 py-1 bg-[#0E5E5A]/10 text-[#0E5E5A] font-bold text-[9px] uppercase tracking-wider rounded-md">Currently Active</span>
                )}
              </div>
              <div className="mt-8">
                <h4 className="text-base font-bold text-slate-800 uppercase font-[family-name:var(--font-outfit)] tracking-tight mb-2">Standard Demo Mode</h4>
                <p className="text-slate-600 text-xs font-light leading-relaxed">
                  Populates the workspace with standard, pre-seeded metrics for <strong>Amma Demo</strong> & <strong>Papa Demo</strong>. Perfect for evaluating Anaya's analysis, WhatsApp interactions, and doctor briefs.
                </p>
              </div>
            </div>

            <div 
              onClick={() => handleModeChange("personal")}
              className={`p-6 md:p-10 rounded-[2.5rem] border cursor-pointer transition-all flex flex-col justify-between min-h-[16rem] group ${
                appMode === "personal"
                  ? "bg-[#0E5E5A]/5 border-[#0E5E5A] shadow-md"
                  : "bg-white border-[#e2ded5] hover:border-slate-350"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-colors ${
                  appMode === "personal" ? "bg-[#0E5E5A] text-white" : "bg-teal-50 text-[#0E5E5A]"
                }`}>
                  <User size={20} />
                </div>
                {appMode === "personal" && (
                  <span className="px-2.5 py-1 bg-[#0E5E5A]/10 text-[#0E5E5A] font-bold text-[9px] uppercase tracking-wider rounded-md">Currently Active</span>
                )}
              </div>
              <div className="mt-8">
                <h4 className="text-base font-bold text-slate-800 uppercase font-[family-name:var(--font-outfit)] tracking-tight mb-2">Personal Sandbox Mode</h4>
                <p className="text-slate-600 text-xs font-light leading-relaxed">
                  Switches the workspace to load and save your custom parent profiles. Perfect for entering your parents' actual medication regimens, vitals logs, and report summaries safely and privately.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup & Restore Tab */}
      {activeTab === "backup" && (
        <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-[#e2ded5] shadow-sm bg-white/40 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Browser Cache Backup & Restoration</h3>
            <p className="text-xs text-slate-600 font-light mt-1">Export your structured configurations and local clinical logs, or restore a previous JSON backup package.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Export */}
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200/50 flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-[#0E5E5A]">
                  <Download size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)]">Export Backup (JSON Package)</h4>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Serializes all parent profile parameters, vitals histories, lab analyses, WhatsApp logs, and scheduled medicines. The output is a single portable, human-readable JSON text file.
                </p>
              </div>
              <button
                onClick={handleExportBackup}
                className="w-full py-4 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download backup (.json)
              </button>
            </div>

            {/* Import */}
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200/50 flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-[#0E5E5A]">
                  <Upload size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight font-[family-name:var(--font-outfit)]">Restore from Backup Package</h4>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Select a previous <code>parents-health-os-backup.json</code> file to restore. All local parameters, charts, and metrics in this browser will be overwritten instantly with the restored state.
                </p>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <button
                  type="button"
                  className="w-full py-4 bg-white border border-[#e2ded5] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Upload size={14} /> Upload Backup JSON File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Cloud Migration Checklist Tab */}
      {activeTab === "migration" && (
        <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-[#e2ded5] shadow-sm bg-white/40 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Planned Live Backend Migration Blueprint (Not Active Yet)</h3>
            <p className="text-xs text-slate-600 font-light mt-1">No live backend is currently connected. Requires a dedicated Parents Health OS Supabase project. DO NOT use trelis-life or unauthorized database configurations. Read the regional cloud migration strategy below.</p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4 items-start bg-slate-50 p-6 rounded-2xl border border-slate-200/40">
              <div className="h-8 w-8 rounded-full bg-[#0E5E5A] text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Initialize regional database</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Establish a regional project on Supabase. Recommended region is <code>ap-south-1</code> (Mumbai) to minimize latency for Indian parent care networks.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start bg-slate-50 p-6 rounded-2xl border border-slate-200/40">
              <div className="h-8 w-8 rounded-full bg-[#0E5E5A] text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Deploy relational tables schema</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Execute the established database DDL schema structure. This comprises creating core tables (<code>profiles</code>, <code>families</code>, <code>parents</code>, <code>vitals</code>, <code>medications</code>, <code>lab_reports</code>, <code>whatsapp_messages</code>) in Postgres.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start bg-slate-50 p-6 rounded-2xl border border-slate-200/40">
              <div className="h-8 w-8 rounded-full bg-[#0E5E5A] text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Enable Row Level Security (RLS) policies</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Implement tight authentication policies. Enable RLS on every table so that children and caregivers can only view or modify records belonging to their shared <code>family_id</code> network.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start bg-slate-50 p-6 rounded-2xl border border-slate-200/40">
              <div className="h-8 w-8 rounded-full bg-[#0E5E5A] text-white flex items-center justify-center text-xs font-bold shrink-0">4</div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Inject cloud environment endpoints</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Add the connection endpoints into your local <code>.env.local</code> file:<br />
                  <code>NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_REF_ID].supabase.co</code><br />
                  <code>NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_PUBLIC_ANON_KEY]</code>
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4 items-start bg-slate-50 p-6 rounded-2xl border border-slate-200/40">
              <div className="h-8 w-8 rounded-full bg-[#0E5E5A] text-white flex items-center justify-center text-xs font-bold shrink-0">5</div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Run regional table migration seeding</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  A custom script reads your compiled local JSON backup, runs authentication check, and maps each local log array into Postgres <code>INSERT</code> parameters to populate your cloud data instantly!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DPDPA 2023 Readiness Center Tab */}
      {activeTab === "dpdpa" && (
        <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-[#e2ded5] shadow-sm bg-white/40 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase flex items-center gap-2">
              <ShieldCheck className="text-[#0E5E5A]" size={22} /> DPDP Act 2023 Readiness & Consent Center
            </h3>
            <p className="text-xs text-slate-600 font-light mt-1">
              Verify educational readiness parameters under India's Digital Personal Data Protection Act, 2023 (DPDP Act 2023). This is a design framework demonstration; not legal advice, and requires certified legal review before production deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 font-light leading-relaxed">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">DPDPA 2023 Readiness Checklist</h4>
              <ul className="space-y-3 list-disc pl-4">
                <li>
                  <strong className="text-slate-800">Section 6 (Consent-Driven Processing):</strong> Processing only happens after receiving explicit, unambiguous consent from the child on behalf of the senior parent.
                </li>
                <li>
                  <strong className="text-slate-800">Section 11 (Right to Correct / Complete):</strong> Parents or child caregivers have full right to edit display names, relationships, age, and health history parameters (active in <strong>Personal Profiles</strong> tab).
                </li>
                <li>
                  <strong className="text-slate-800">Section 12 (Right to Erase / Revoke):</strong> You have the absolute right to revoke consent and erase all care log data instantly.
                </li>
                <li>
                  <strong className="text-slate-800">AP-SOUTH-1 Localization Blueprint:</strong> Data storage meets strict regional constraints by defaulting to Mumbai servers for ultimate physical sovereignty in the future migration roadmap.
                </li>
              </ul>
            </div>

            <div className="p-6 bg-red-50/50 border border-red-100 rounded-3xl space-y-6 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-red-800 tracking-wider flex items-center gap-2">
                  <AlertTriangle size={16} /> Erasure / Revoke Consent Center Simulation
                </h4>
                <p className="text-slate-600 text-xs font-light leading-relaxed">
                  If you choose to revoke consent, all records associated with this local elder-care network will be immediately and permanently erased from browser localStorage. This simulates a statutory erase mandate under Indian privacy guidelines.
                </p>
              </div>
              <button
                onClick={handleRevokeConsent}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <AlertTriangle size={14} /> Revoke parental consent & Wipe Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
