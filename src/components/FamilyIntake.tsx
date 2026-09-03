"use client";

import { useState, useEffect } from "react";
import { useParentsAuth } from "../lib/supabase/context";
import { motion } from "framer-motion";
import { UserPlus, ShieldCheck, Heart, User, Calendar, Activity, CheckCircle, Smartphone, Play, Sparkles } from "lucide-react";

export function FamilyIntake() {
  const { isSupabaseEnabled, parents, updateParentProfile, refreshData, onboard } = useParentsAuth();
  
  // State for Buyer Demographics
  const [buyerName, setBuyerName] = useState("");
  const [buyerRelation, setBuyerRelation] = useState("son");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerLocation, setBuyerLocation] = useState("");

  // State for Parent Clinical Parameters
  const [parentName, setParentName] = useState("");
  const [parentAge, setParentAge] = useState("");
  const [parentGender, setParentGender] = useState("Female");
  const [primaryNeeds, setPrimaryNeeds] = useState("Hypertension & Diabetes Management");
  const [mobilityStatus, setMobilityStatus] = useState("Independent");
  const [existingDiagnoses, setExistingDiagnoses] = useState("");
  const [allergies, setAllergies] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");

  // Engagement Metrics Status
  const [engagementStatus, setEngagementStatus] = useState("Pending Assessment");
  const [notes, setNotes] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  const fillDemoSponsorData = () => {
    setBuyerName("Amit Sharma");
    setBuyerRelation("son");
    setBuyerPhone("+91 98765 43210");
    setBuyerEmail("amit.sharma@gmail.com");
    setBuyerLocation("Bengaluru, Karnataka");
  };

  const fillDemoParentData = () => {
    setParentName("Savitri Sharma");
    setParentAge("68");
    setParentGender("Female");
    setPrimaryNeeds("Geriatric Hypertension, Joint Pain, Daily Medicine Compliance Tracking");
    setMobilityStatus("Mildly Restricted (Uses Cane)");
    setExistingDiagnoses("Hypertension (diagnosed 2018), Osteoarthritis, Early-stage Type 2 Diabetes");
    setAllergies("Sulfa drugs");
    setBloodGroup("B+");
    setEngagementStatus("Active Coordinator Monitoring");
    setNotes("Lives independently in Pune. Son lives in Bengaluru. Needs daily reminder check-ins for morning/evening blood pressure meds.");
  };



  const handleSaveIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !parentName) {
      setNotification("Please fill in both Buyer Name and Parent Name.");
      return;
    }

    const intakeData = {
      buyerName,
      buyerRelation,
      buyerPhone,
      buyerEmail,
      buyerLocation,
      parentName,
      parentAge,
      parentGender,
      primaryNeeds,
      mobilityStatus,
      existingDiagnoses,
      allergies,
      bloodGroup,
      engagementStatus,
      notes,
      timestamp: new Date().toISOString()
    };

    if (onboard) {
      await onboard({
        familyName: `${buyerName}'s Family`,
        parentName,
        relationship: buyerRelation,
        parentPhone: buyerPhone,
        language: "English"
      });
    }

    setNotification(`✅ First Family Care Link established for ${parentName}! Record saved to Care Operations System.`);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="text-2xl md:text-5xl font-bold text-[#0E5E5A] font-[family-name:var(--font-outfit)] tracking-tight uppercase">First Family Intake</h2>
          <p className="text-xs md:text-sm text-slate-500 font-light font-[family-name:var(--font-inter)] tracking-wide mt-2">
            Establish baseline family structure, operational diagnostics, and sponsor coordination details.
          </p>
        </div>
        <div className="flex items-center gap-4 data-label !text-[#0E5E5A] bg-[#0E5E5A]/5 px-6 py-4 rounded-2xl border border-[#0E5E5A]/10 shadow-sm font-[family-name:var(--font-outfit)]">
          <ShieldCheck size={20} className="text-[#0E5E5A]" />
          <span>Family Care Security Active</span>
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

      <form onSubmit={handleSaveIntake} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Buyer Demographics Card */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-[#e2ded5] space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#e2ded5] w-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-[#0E5E5A]">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] uppercase tracking-wide">1. Sponsor / Primary Contact</h3>
                <p className="text-[10px] text-slate-500 font-light">Details of the family manager / care sponsor funding and coordinating care.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemoSponsorData}
              className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0E5E5A] font-bold text-[8px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play size={8} className="fill-[#0E5E5A] text-[#0E5E5A]" /> Autofill Demo
            </button>
          </div>

          <div className="space-y-4 font-[family-name:var(--font-inter)] text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sponsor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Dev"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Relationship to Parent</label>
                <select
                  value={buyerRelation}
                  onChange={e => setBuyerRelation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
                >
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="spouse">Spouse</option>
                  <option value="grandchild">Grandchild</option>
                  <option value="guardian">Other Guardian</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">WhatsApp Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Email</label>
                <input
                  type="email"
                  placeholder="e.g. sponsor@domain.com"
                  value={buyerEmail}
                  onChange={e => setBuyerEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sponsor Geographic Location</label>
              <input
                type="text"
                placeholder="e.g. San Francisco (Remote Care Sponsor)"
                value={buyerLocation}
                onChange={e => setBuyerLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
              />
            </div>

            <div className="pt-2 border-t border-[#e2ded5] mt-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Engagement & Coordinator Follow-up Status</label>
              <select
                value={engagementStatus}
                onChange={e => setEngagementStatus(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50 font-medium"
              >
                <option value="Pending Assessment">Pending Assessment Checklist</option>
                <option value="Scorecard Complete">Scorecard Complete</option>
                <option value="Escalation Setup Done">Escalation Setup Completed</option>
                <option value="Care Plan Active">Care Plan Signed & Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Parent Clinical Parameters Card */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-[#e2ded5] space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#e2ded5] w-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-[#E05E1B]">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-[family-name:var(--font-outfit)] uppercase tracking-wide">2. Care Recipient & Family Context</h3>
                <p className="text-[10px] text-slate-500 font-light">Critical baseline parameters, care needs, and family context.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemoParentData}
              className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#E05E1B] font-bold text-[8px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play size={8} className="fill-[#E05E1B] text-[#E05E1B]" /> Autofill Demo
            </button>
          </div>

          <div className="space-y-4 font-[family-name:var(--font-inter)] text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Care Recipient Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kamala Dev"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 72"
                  value={parentAge}
                  onChange={e => setParentAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gender</label>
                <select
                  value={parentGender}
                  onChange={e => setParentGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Primary Care Needs / Demands</label>
              <input
                type="text"
                placeholder="e.g. Routine vitals log, compliance tracking"
                value={primaryNeeds}
                onChange={e => setPrimaryNeeds(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mobility Status</label>
                <select
                  value={mobilityStatus}
                  onChange={e => setMobilityStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
                >
                  <option value="Independent">Independent walking</option>
                  <option value="Needs Assistance">Needs Cane / Walker</option>
                  <option value="Wheelchair Bound">Wheelchair / Bed Bound</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Drug/Food Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, None"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Existing Diagnoses (comma separated)</label>
              <textarea
                placeholder="e.g. Hypertension, Type 2 Diabetes, Arthritis"
                rows={2}
                value={existingDiagnoses}
                onChange={e => setExistingDiagnoses(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50 resize-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Intake Interview / Coordinator Notes</label>
              <textarea
                placeholder="Details of initial conversation, escalation preferences, preferred contact timings, etc."
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e2ded5] focus:outline-none focus:border-[#0E5E5A] text-slate-800 bg-slate-50/50 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            className="w-full py-5 bg-[#0E5E5A] hover:bg-[#0b4845] text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] font-[family-name:var(--font-outfit)]"
          >
            Save & Sync to Local Operations Console
          </button>
        </div>
      </form>
    </div>
  );
}
