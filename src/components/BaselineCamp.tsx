"use client";

import { useState, useEffect } from "react";
import { useParentsAuth } from "../lib/supabase/context";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, UserPlus, Heart, Database, RefreshCw, Send, CheckCircle, Play } from "lucide-react";

interface ScreenedPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bp_sys: number;
  bp_dia: number;
  sugar: number;
  weight: number;
  synced: boolean;
  timestamp: string;
}

export function BaselineCamp() {
  const { refreshData } = useParentsAuth();
  
  // Camp configuration
  const [campName, setCampName] = useState("Vasanth Vihar Baseline Camp");
  const [campLocation, setCampLocation] = useState("Community Hall, Sector 4");
  const [campLead, setCampLead] = useState("Dr. Amit Verma");

  // Roster listing
  const [screenedPatients, setScreenedPatients] = useState<ScreenedPatient[]>([]);
  
  // New entry fields
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Female");
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [sugar, setSugar] = useState("");
  const [weight, setWeight] = useState("");

  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fillDemoScreeningData = () => {
    setPatientName("Ramesh Kumar");
    setPatientAge("71");
    setPatientGender("Male");
    setBpSys("138");
    setBpDia("86");
    setSugar("145");
    setWeight("68");
  };

  const saveRosterToState = (newRoster: ScreenedPatient[]) => {
    setScreenedPatients(newRoster);
  };

  const handleAddScreening = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !bpSys || !sugar) {
      setNotification("Please fill in patient name, BP, and blood sugar.");
      return;
    }

    const newPatient: ScreenedPatient = {
      id: `camp-patient-${Date.now()}`,
      name: patientName,
      age: parseInt(patientAge) || 68,
      gender: patientGender,
      bp_sys: parseInt(bpSys) || 120,
      bp_dia: parseInt(bpDia) || 80,
      sugar: parseInt(sugar) || 100,
      weight: parseFloat(weight) || 60,
      synced: false,
      timestamp: new Date().toISOString()
    };

    const updated = [...screenedPatients, newPatient];
    saveRosterToState(updated);

    // Clear fields
    setPatientName("");
    setPatientAge("");
    setBpSys("");
    setBpDia("");
    setSugar("");
    setWeight("");

    setNotification("Screening log successfully recorded to active session list.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSyncBatch = () => {
    const unsyncedCount = screenedPatients.filter(p => !p.synced).length;
    if (unsyncedCount === 0) {
      setNotification("All screening records are already marked registered.");
      return;
    }

    setIsSyncing(true);

    setTimeout(() => {
      const updatedScreened = screenedPatients.map(p => ({ ...p, synced: true }));
      saveRosterToState(updatedScreened);
      setIsSyncing(false);
      setNotification(`Registered ${unsyncedCount} screenings into active health camp roster.`);
      setTimeout(() => setNotification(null), 4000);
    }, 800);
  };

  const unsyncedCount = screenedPatients.filter(p => !p.synced).length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-2xl md:text-5xl font-bold text-[#0E5E5A] font-[family-name:var(--font-outfit)] tracking-tight uppercase">Baseline Health Camp</h2>
          <p className="text-xs md:text-sm text-slate-500 font-light font-[family-name:var(--font-inter)] tracking-wide mt-2">
            Offline-first field screening portal for community health camps. Capture vitals snapshot into the screening queue.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSyncBatch}
            disabled={isSyncing || unsyncedCount === 0}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border font-bold uppercase tracking-wider text-xs shadow-md transition-all font-[family-name:var(--font-outfit)] ${
              unsyncedCount > 0 
                ? "bg-[#E05E1B] text-white border-[#E05E1B] hover:bg-[#c94e14] cursor-pointer" 
                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
          >
            {isSyncing ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Marking Synced...
              </>
            ) : (
              <>
                <Database size={16} />
                Register {unsyncedCount} Field Screenings to Local Roster
              </>
            )}
          </button>
        </div>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-3"
        >
          <CheckCircle size={18} className="text-emerald-600" />
          {notification}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Camp Setup & Logging Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-[#e2ded5] space-y-4">
            <h3 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-outfit)] uppercase tracking-wider">Camp Configuration</h3>
            <div className="grid grid-cols-1 gap-3 text-xs font-[family-name:var(--font-inter)]">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Camp Identifier</label>
                <input
                  type="text"
                  value={campName}
                  onChange={e => setCampName(e.target.value)}
                  className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A]"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Location</label>
                <input
                  type="text"
                  value={campLocation}
                  onChange={e => setCampLocation(e.target.value)}
                  className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A]"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Lead Clinician</label>
                <input
                  type="text"
                  value={campLead}
                  onChange={e => setCampLead(e.target.value)}
                  className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A]"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-[#e2ded5] space-y-4">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-outfit)] uppercase tracking-wider">Add Patient Screening</h3>
              <button
                type="button"
                onClick={fillDemoScreeningData}
                className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0E5E5A] font-bold text-[8px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Play size={8} className="fill-[#0E5E5A] text-[#0E5E5A]" /> Autofill Demo
              </button>
            </div>
            <form onSubmit={handleAddScreening} className="space-y-3 text-xs font-[family-name:var(--font-inter)]">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Chandra"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full mt-0.5 px-3 py-2.5 rounded-lg border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Age</label>
                  <input
                    type="number"
                    placeholder="65"
                    value={patientAge}
                    onChange={e => setPatientAge(e.target.value)}
                    className="w-full mt-0.5 px-3 py-2.5 rounded-lg border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Systolic (BP)</label>
                  <input
                    type="number"
                    placeholder="e.g. 130"
                    value={bpSys}
                    onChange={e => setBpSys(e.target.value)}
                    className="w-full mt-0.5 px-3 py-2.5 rounded-lg border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Diastolic (BP)</label>
                  <input
                    type="number"
                    placeholder="e.g. 85"
                    value={bpDia}
                    onChange={e => setBpDia(e.target.value)}
                    className="w-full mt-0.5 px-3 py-2.5 rounded-lg border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    placeholder="e.g. 110"
                    value={sugar}
                    onChange={e => setSugar(e.target.value)}
                    className="w-full mt-0.5 px-3 py-2.5 rounded-lg border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 62.5"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full mt-0.5 px-3 py-2.5 rounded-lg border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#0E5E5A] hover:bg-[#0b4845] text-white font-bold rounded-xl uppercase tracking-wider text-[10px] transition-all shadow-md active:scale-95"
                >
                  Log Vitals Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Screening Diagnostics Queue List */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-[#e2ded5] space-y-6">
            <div className="flex items-center justify-between border-b border-[#e2ded5] pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] uppercase tracking-wide">Camp Screening Registry</h3>
                <p className="text-[10px] text-slate-500 font-light">Attendees screened in the queue waiting for local sync.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                  Queue: {screenedPatients.length}
                </span>
              </div>
            </div>

            {screenedPatients.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-light text-sm font-[family-name:var(--font-inter)]">
                No camp attendee screenings logged yet. Fill out the screening entry details to begin the offline queue.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {screenedPatients.map((p, index) => {
                  const hasAnomaly = p.bp_sys > 140 || p.sugar > 140;
                  return (
                    <div 
                      key={p.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        p.synced 
                          ? "bg-slate-50/50 border-slate-200" 
                          : hasAnomaly 
                            ? "bg-red-50/30 border-red-200/60" 
                            : "bg-teal-50/20 border-teal-100"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm font-[family-name:var(--font-outfit)]">{p.name}</span>
                          <span className="text-[9px] font-medium text-slate-500 uppercase">Age {p.age} • {p.gender}</span>
                          {hasAnomaly && (
                            <span className="text-[8px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Follow-up Required
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-600 font-[family-name:var(--font-inter)]">
                          <span>BP: <strong className={p.bp_sys > 140 ? "text-red-600" : ""}>{p.bp_sys}/{p.bp_dia}</strong> mmHg</span>
                          <span>Sugar: <strong className={p.sugar > 140 ? "text-red-600" : ""}>{p.sugar}</strong> mg/dL</span>
                          <span>Weight: {p.weight} kg</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        {p.synced ? (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            Simulated Synced
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse">
                            Pending Local Sync
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
