"use client";

import React, { useState, useEffect } from "react";
import { useParentsAuth } from "../lib/supabase/context";
import { useToast } from "./ui/Toast";
import { 
  ShieldCheck, 
  User, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  FileText
} from "lucide-react";

export function SettingsAndBackup() {
  const { 
    parents, 
    activeParent, 
    updateParentProfile,
    isSupabaseEnabled
  } = useParentsAuth();
  
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"profiles" | "backend" | "dpdpa">("profiles");
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  
  // Service Worker Cache Status Check
  const [swStatus, setSwStatus] = useState<"Active" | "Bypassed (Dev)" | "Unsupported">("Unsupported");

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") {
        setSwStatus("Bypassed (Dev)");
      } else {
        navigator.serviceWorker.ready.then((reg) => {
          if (reg.active) {
            setSwStatus("Active");
          } else {
            setSwStatus("Unsupported");
          }
        }).catch(() => {
          setSwStatus("Unsupported");
        });
      }
    }
  }, []);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    relationship: "Mother",
    phone: "",
    language: "English",
    primary_conditions: "",
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
      primary_conditions: conditionsArray as any,
      scorecard_answers: {
        answers: existingAnswers,
        scores: existingScores,
        personal_profile
      } as any
    };

    const { success, error } = await updateParentProfile(selectedParentId, updatedFields);
    if (success) {
      showToast(`Updated profile for ${formData.name}!`, "success");
    } else {
      showToast(`Failed to update profile: ${error?.message || "Error"}`, "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-[#e2ded5] shadow-sm bg-white/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[#0E5E5A] font-bold text-[9px] uppercase tracking-widest mb-3">
              <Lock size={12} /> System Settings & Compliance
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight font-[family-name:var(--font-outfit)] uppercase">
              Care Control & Platform Configuration
            </h2>
            <p className="text-xs text-slate-600 font-light mt-1 font-[family-name:var(--font-inter)]">
              Manage parent health profiles, backend connectivity, and privacy compliance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 font-mono">
              <span className="text-slate-400 font-bold uppercase text-[8px]">Backend:</span>
              <span className={isSupabaseEnabled ? "text-teal-600 font-bold" : "text-amber-600 font-bold"}>
                {isSupabaseEnabled ? "Supabase Configured" : "Unconfigured"}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 font-mono">
              <span className="text-slate-400 font-bold uppercase text-[8px]">Service Worker:</span>
              <span className="font-bold">{swStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#e2ded5] gap-2 md:gap-4 overflow-x-auto pb-1">
        {[
          { id: "profiles", label: "Parent Profiles", icon: User },
          { id: "backend", label: "Backend Connection", icon: Database },
          { id: "dpdpa", label: "DPDP Readiness", icon: ShieldCheck }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap font-[family-name:var(--font-outfit)] ${
              activeTab === tab.id
                ? "bg-[#0E5E5A] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100/60"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Parent Profiles Tab */}
      {activeTab === "profiles" && (
        <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-[#e2ded5] shadow-sm bg-white/40 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Parent Profile Parameters</h3>
              <p className="text-xs text-slate-600 font-light mt-1 font-[family-name:var(--font-inter)]">Configure chronic conditions, emergency details, and clinical preferences.</p>
            </div>

            {parents.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">Select Parent:</label>
                <select
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0E5E5A]"
                >
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {parents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/50">
              <p className="text-xs text-slate-500">No parent profiles currently registered in the database.</p>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs text-slate-700 font-[family-name:var(--font-inter)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Full Display Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0E5E5A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Relationship</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0E5E5A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0E5E5A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Chronic Health Conditions (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Diabetes, Hypertension, Asthma"
                  value={formData.primary_conditions}
                  onChange={(e) => setFormData({ ...formData, primary_conditions: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0E5E5A]"
                />
              </div>

              <div className="pt-4 border-t border-slate-150 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#0E5E5A] hover:bg-[#0c4e4b] text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-md"
                >
                  Save Profile Updates
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Backend Connection Status Tab */}
      {activeTab === "backend" && (
        <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-[#e2ded5] shadow-sm bg-white/40 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase">Supabase Backend Configuration Status</h3>
            <p className="text-xs text-slate-600 font-light mt-1">Status of live database connectivity for remote health record persistence.</p>
          </div>

          <div className="p-6 rounded-2xl border bg-slate-50/50 space-y-4">
            <div className="flex items-center gap-3">
              {isSupabaseEnabled ? (
                <div className="h-10 w-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase">
                  {isSupabaseEnabled ? "Supabase Integration Active" : "Backend Configuration Unavailable"}
                </h4>
                <p className="text-xs text-slate-500 font-light">
                  {isSupabaseEnabled
                    ? "The application is connected to the configured Supabase backend."
                    : "No live Supabase project environment variables detected."}
                </p>
              </div>
            </div>

            {!isSupabaseEnabled && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 space-y-2">
                <p className="font-bold text-slate-800 font-sans uppercase text-[10px]">Required Environment Variables (.env.local):</p>
                <div className="p-3 bg-slate-50 rounded-lg overflow-x-auto text-[11px]">
                  NEXT_PUBLIC_SUPABASE_URL=https://your-parents-health-os-project.supabase.co<br />
                  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here<br />
                  SUPABASE_SECRET_KEY=your_supabase_secret_key_here
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DPDPA 2023 Readiness Center Tab */}
      {activeTab === "dpdpa" && (
        <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-[#e2ded5] shadow-sm bg-white/40 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] tracking-tight uppercase flex items-center gap-2">
              <ShieldCheck className="text-[#0E5E5A]" size={22} /> DPDP Act 2023 Readiness Center
            </h3>
            <p className="text-xs text-slate-600 font-light mt-1">
              India's Digital Personal Data Protection Act, 2023 (DPDP Act 2023) privacy framework.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-600 font-light leading-relaxed">
            <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Privacy & Consent Mandates</h4>
            <ul className="space-y-3 list-disc pl-4">
              <li>
                <strong className="text-slate-800">Section 6 (Consent-Driven Processing):</strong> Processing happens after explicit consent registration from the caregiver/child.
              </li>
              <li>
                <strong className="text-slate-800">Section 11 (Right to Correct / Complete):</strong> Right to edit health metrics and profiles.
              </li>
              <li>
                <strong className="text-slate-800">Section 12 (Right to Erase / Revoke):</strong> Absolute right to request revocation of consent and erasure of registered records.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
