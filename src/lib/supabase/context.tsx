"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "./client";
import { Database } from "./types";

type TableRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

interface OnboardData {
  familyName: string;
  parentName: string;
  relationship: string;
  parentPhone: string;
  language: string;
}

interface ParentsAuthContextType {
  isSupabaseEnabled: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  profile: TableRow<"profiles"> | null;
  family: TableRow<"families"> | null;
  parents: TableRow<"parents">[];
  activeParent: TableRow<"parents"> | null;
  vitals: TableRow<"vitals">[];
  medications: TableRow<"medications">[];
  medicationLogs: TableRow<"medication_logs">[];
  labReports: TableRow<"lab_reports">[];
  aiConversations: TableRow<"ai_conversations">[];
  whatsappMessages: TableRow<"whatsapp_messages">[];
  
  // Legacy telemetry stubs for UI stability
  lastSaved: string;
  pendingChanges: number;
  resetLocalPendingChanges: () => void;
  pendingSyncCount: number;
  lastSyncEvent: any | null;
  simulateCloudSyncAction: () => void;
  dismissSyncQueueAction: () => void;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  onboard: (data: OnboardData) => Promise<{ error: any }>;
  
  // Data Mutators
  addVital: (data: { bp_sys: number; bp_dia: number; sugar: number; weight: number; source?: string }) => Promise<{ success: boolean; data?: any; error?: any }>;
  addMedication: (data: { name: string; dosage: string; timing: string; instructions: string }) => Promise<{ success: boolean; data?: any; error?: any }>;
  toggleMedicationLog: (medicationId: string, taken: boolean, logDate: string) => Promise<{ success: boolean; error?: any }>;
  addLabReport: (data: { report_date: string; report_type: string; summary: string; biomarkers: any; full_analysis_markdown: string }) => Promise<{ success: boolean; data?: any; error?: any }>;
  deleteLabReport: (reportId: string) => Promise<{ success: boolean; error?: any }>;
  addAiConversation: (userMessage: string, aiResponse: string) => Promise<{ success: boolean; error?: any }>;
  addWhatsappMessage: (direction: "incoming" | "outgoing", body: string, mediaUrl?: string) => Promise<{ success: boolean; error?: any }>;
  updateScorecard: (answers: any, scores: any) => Promise<{ success: boolean; error?: any }>;
  resetScorecard: () => Promise<{ success: boolean; error?: any }>;
  updateParentProfile: (parentId: string, updatedFields: Partial<TableRow<"parents">>) => Promise<{ success: boolean; error?: any }>;
  
  // UI Helpers
  selectActiveParent: (parentId: string) => void;
  refreshData: () => Promise<void>;
}

const ParentsAuthContext = createContext<ParentsAuthContextType | undefined>(undefined);

export function ParentsAuthProvider({ children }: { children: React.ReactNode }) {
  const [isSupabaseEnabled, setIsSupabaseEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  
  // Core Domain State
  const [profile, setProfile] = useState<TableRow<"profiles"> | null>(null);
  const [family, setFamily] = useState<TableRow<"families"> | null>(null);
  const [parents, setParents] = useState<TableRow<"parents">[]>([]);
  const [activeParent, setActiveParent] = useState<TableRow<"parents"> | null>(null);
  
  // Health & Care Logs State
  const [vitals, setVitals] = useState<TableRow<"vitals">[]>([]);
  const [medications, setMedications] = useState<TableRow<"medications">[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<TableRow<"medication_logs">[]>([]);
  const [labReports, setLabReports] = useState<TableRow<"lab_reports">[]>([]);
  const [aiConversations, setAiConversations] = useState<TableRow<"ai_conversations">[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<TableRow<"whatsapp_messages">[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (url && key && supabase) {
      setIsSupabaseEnabled(true);
      
      supabase.auth.getSession().then((res: any) => {
        const session = res?.data?.session;
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          fetchSupabaseData(session.user.id);
        } else {
          setIsLoading(false);
        }
      });

      const { data } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          fetchSupabaseData(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setProfile(null);
          setFamily(null);
          setParents([]);
          setActiveParent(null);
          setVitals([]);
          setMedications([]);
          setMedicationLogs([]);
          setLabReports([]);
          setAiConversations([]);
          setWhatsappMessages([]);
          setIsLoading(false);
        }
      });

      return () => {
        if (data?.subscription) {
          data.subscription.unsubscribe();
        }
      };
    } else {
      setIsSupabaseEnabled(false);
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // --- SUPABASE DATA HANDLERS ---
  const fetchSupabaseData = async (userId: string) => {
    if (!supabase) return;
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (profileErr && profileErr.code !== "PGRST116") {
        console.error("Error reading profile:", profileErr);
      }
      
      if (profileData) {
        setProfile(profileData);
      } else {
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({ id: userId, role: "child" })
          .select()
          .single();
        if (newProfile) setProfile(newProfile);
      }

      // 2. Fetch Family Membership
      const { data: memberData } = await supabase
        .from("family_members")
        .select("*, families(*)")
        .eq("profile_id", userId);

      if (memberData && memberData.length > 0) {
        const primaryMember = memberData[0];
        setFamily(primaryMember.families as any);

        // 3. Fetch Family Parents
        const { data: parentList } = await supabase
          .from("parents")
          .select("*")
          .eq("family_id", primaryMember.family_id);

        if (parentList && parentList.length > 0) {
          setParents(parentList);
          const active = parentList[0];
          setActiveParent(active);
          fetchParentRecords(active.id);
        }
      }
    } catch (e) {
      console.error("Failed to populate dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParentRecords = async (parentId: string) => {
    if (!supabase) return;
    try {
      const { data: vitalsList } = await supabase
        .from("vitals")
        .select("*")
        .eq("parent_id", parentId)
        .order("measured_at", { ascending: false });
      if (vitalsList) setVitals(vitalsList);

      const { data: meds } = await supabase
        .from("medications")
        .select("*")
        .eq("parent_id", parentId)
        .eq("is_active", true);
      if (meds) setMedications(meds);

      const { data: medLogs } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("parent_id", parentId);
      if (medLogs) setMedicationLogs(medLogs);

      const { data: reports } = await supabase
        .from("lab_reports")
        .select("*")
        .eq("parent_id", parentId)
        .order("report_date", { ascending: false });
      if (reports) setLabReports(reports);

      const { data: aiConvs } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });
      if (aiConvs) setAiConversations(aiConvs);

      const { data: whatsappMsgs } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });
      if (whatsappMsgs) setWhatsappMessages(whatsappMsgs);

    } catch (e) {
      console.error("Failed to load parent metrics:", e);
    }
  };

  const refreshData = async () => {
    if (isSupabaseEnabled && user && supabase) {
      await fetchSupabaseData(user.id);
    }
  };

  // --- ACTIONS ---
  const signIn = async (email: string, password: string) => {
    if (isSupabaseEnabled && supabase) {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);
      return { error };
    } else {
      return { error: { message: "Backend configuration unavailable. Please configure Supabase environment variables." } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    if (isSupabaseEnabled && supabase) {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });
      if (data.user) {
        await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            full_name: fullName,
            phone: phone,
            role: "child"
          });
      }
      setIsLoading(false);
      return { error };
    } else {
      return { error: { message: "Backend configuration unavailable. Please configure Supabase environment variables." } };
    }
  };

  const signOut = async () => {
    if (isSupabaseEnabled && supabase) {
      setIsLoading(true);
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setUser(null);
    setProfile(null);
    setFamily(null);
    setParents([]);
    setActiveParent(null);
    setVitals([]);
    setMedications([]);
    setMedicationLogs([]);
    setLabReports([]);
    setAiConversations([]);
    setWhatsappMessages([]);
    setIsLoading(false);
  };

  const onboard = async (data: OnboardData) => {
    if (isSupabaseEnabled && supabase && user) {
      setIsLoading(true);
      try {
        const { data: familyObj, error: famErr } = await supabase
          .from("families")
          .insert({ name: data.familyName })
          .select()
          .single();

        if (famErr) throw famErr;

        await supabase
          .from("family_members")
          .insert({
            family_id: familyObj.id,
            profile_id: user.id,
            role: "owner"
          });

        const { data: parentObj, error: parentErr } = await supabase
          .from("parents")
          .insert({
            family_id: familyObj.id,
            name: data.parentName,
            relationship: data.relationship,
            phone: data.parentPhone,
            language: data.language,
            risk_level: "Healthy Baseline",
            health_index: 90
          })
          .select()
          .single();

        if (parentErr) throw parentErr;

        await supabase
          .from("consents")
          .insert({
            parent_id: parentObj.id,
            granted_by_profile_id: user.id,
            consent_type: "geriatric_health_data_processing",
            consent_version: "PHOS_v1.0",
            ip_address: "127.0.0.1",
            is_granted: true
          });

        await fetchSupabaseData(user.id);
        return { error: null };
      } catch (err) {
        console.error("Onboarding failed:", err);
        setIsLoading(false);
        return { error: err };
      }
    } else {
      return { error: { message: "Backend configuration unavailable. Please configure Supabase environment variables." } };
    }
  };

  // --- MUTATORS ---
  const addVital = async (data: { bp_sys: number; bp_dia: number; sugar: number; weight: number; source?: string }) => {
    if (isSupabaseEnabled && supabase && activeParent && user) {
      const { data: vital, error } = await supabase
        .from("vitals")
        .insert({
          parent_id: activeParent.id,
          bp_sys: data.bp_sys,
          bp_dia: data.bp_dia,
          sugar: data.sugar,
          weight: data.weight,
          logged_by: user.id,
          source: data.source || "manual"
        })
        .select()
        .single();
      
      if (vital) {
        setVitals(prev => [vital, ...prev]);
        return { success: true, data: vital };
      }
      return { success: false, error };
    }
    return { success: false, error: "Backend configuration unavailable." };
  };

  const addMedication = async (data: { name: string; dosage: string; timing: string; instructions: string }) => {
    if (isSupabaseEnabled && supabase && activeParent) {
      const { data: med, error } = await supabase
        .from("medications")
        .insert({
          parent_id: activeParent.id,
          name: data.name,
          dosage: data.dosage,
          timing: data.timing,
          instructions: data.instructions,
          is_active: true
        })
        .select()
        .single();

      if (med) {
        setMedications(prev => [...prev, med]);
        return { success: true, data: med };
      }
      return { success: false, error };
    }
    return { success: false, error: "Backend configuration unavailable." };
  };

  const toggleMedicationLog = async (medicationId: string, taken: boolean, logDate: string) => {
    if (isSupabaseEnabled && supabase && activeParent) {
      const { error } = await supabase
        .from("medication_logs")
        .upsert({
          parent_id: activeParent.id,
          medication_id: medicationId,
          log_date: logDate,
          taken,
          taken_at: taken ? new Date().toISOString() : null,
          source: "web_dashboard"
        });
      
      if (!error) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error };
    }
    return { success: false, error: "Backend configuration unavailable." };
  };

  const addLabReport = async (data: { report_date: string; report_type: string; summary: string; biomarkers: any; full_analysis_markdown: string }) => {
    if (isSupabaseEnabled && supabase && activeParent && user) {
      const { data: report, error } = await supabase
        .from("lab_reports")
        .insert({
          parent_id: activeParent.id,
          report_date: data.report_date,
          report_type: data.report_type,
          storage_path: "lab-reports-bucket/uploaded-report.pdf",
          summary: data.summary,
          biomarkers: data.biomarkers,
          full_analysis_markdown: data.full_analysis_markdown,
          uploaded_by: user.id
        })
        .select()
        .single();
      
      if (report) {
        setLabReports(prev => [report, ...prev]);
        return { success: true, data: report };
      }
      return { success: false, error };
    }
    return { success: false, error: "Backend configuration unavailable." };
  };

  const deleteLabReport = async (reportId: string) => {
    if (isSupabaseEnabled && supabase && user) {
      const { error } = await supabase
        .from("lab_reports")
        .delete()
        .eq("id", reportId);
      
      if (!error) {
        setLabReports(prev => prev.filter(r => r.id !== reportId));
        return { success: true };
      }
      return { success: false, error };
    }
    return { success: false, error: "Backend configuration unavailable." };
  };

  const addAiConversation = async (userMessage: string, aiResponse: string) => {
    if (isSupabaseEnabled && supabase && activeParent) {
      const { error } = await supabase
        .from("ai_conversations")
        .insert({
          parent_id: activeParent.id,
          user_message: userMessage,
          ai_response: aiResponse,
          source: "dashboard"
        });
      if (!error) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error };
    }
    return { success: false, error: "Backend configuration unavailable." };
  };

  const updateScorecard = async (answers: any, scores: any) => {
    if (isSupabaseEnabled && supabase && activeParent && user) {
      try {
        const scorecard_answers = { answers, scores };
        const risk_level = scores.riskLevel || "Healthy Baseline";
        const health_index = Math.max(0, 100 - (scores.total || 0));

        const { data: updatedParent, error } = await supabase
          .from("parents")
          .update({
            scorecard_answers,
            risk_level,
            health_index
          })
          .eq("id", activeParent.id)
          .select()
          .single();

        if (error) throw error;

        if (updatedParent) {
          setParents(prev => prev.map(p => p.id === activeParent.id ? updatedParent : p));
          setActiveParent(updatedParent);
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err };
      }
    }
    return { success: false, error: "Backend configuration unavailable." };
  };

  const resetScorecard = async () => {
    if (isSupabaseEnabled && supabase && activeParent && user) {
      try {
        const { data: updatedParent, error } = await supabase
          .from("parents")
          .update({
            scorecard_answers: null,
            risk_level: "Healthy Baseline",
            health_index: 90
          })
          .eq("id", activeParent.id)
          .select()
          .single();

        if (error) throw error;

        if (updatedParent) {
          setParents(prev => prev.map(p => p.id === activeParent.id ? updatedParent : p));
          setActiveParent(updatedParent);
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err };
      }
    }
    return { success: false, error: "Backend configuration unavailable." };
  };

  const updateParentProfile = async (parentId: string, updatedFields: Partial<TableRow<"parents">>) => {
    if (isSupabaseEnabled && supabase && user) {
      try {
        const { data: updatedParent, error } = await supabase
          .from("parents")
          .update(updatedFields)
          .eq("id", parentId)
          .select()
          .single();

        if (error) throw error;

        if (updatedParent) {
          setParents(prev => prev.map(p => p.id === parentId ? updatedParent : p));
          if (activeParent?.id === parentId) {
            setActiveParent(updatedParent);
          }
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err };
      }
    }
    return { success: false, error: "Backend configuration unavailable." };
  };

  const addWhatsappMessage = async (direction: "incoming" | "outgoing", body: string, mediaUrl?: string) => {
    if (isSupabaseEnabled && supabase && activeParent) {
      const { error } = await supabase
        .from("whatsapp_messages")
        .insert({
          parent_id: activeParent.id,
          direction,
          body,
          media_url: mediaUrl || null,
          message_type: mediaUrl ? "media" : "text",
          status: "sent"
        });
      if (!error) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error };
    }
    return { success: false, error: "Backend configuration unavailable." };
  };

  const selectActiveParent = (parentId: string) => {
    const parent = parents.find(p => p.id === parentId);
    if (parent) {
      setActiveParent(parent);
      if (isSupabaseEnabled) {
        fetchParentRecords(parentId);
      }
    }
  };

  return (
    <ParentsAuthContext.Provider
      value={{
        isSupabaseEnabled,
        isAuthenticated,
        isLoading,
        user,
        profile,
        family,
        parents,
        activeParent,
        vitals,
        medications,
        medicationLogs,
        labReports,
        aiConversations,
        whatsappMessages,
        
        lastSaved: "Cloud Storage Only",
        pendingChanges: 0,
        resetLocalPendingChanges: () => {},
        pendingSyncCount: 0,
        lastSyncEvent: null,
        simulateCloudSyncAction: () => {},
        dismissSyncQueueAction: () => {},

        signIn,
        signUp,
        signOut,
        onboard,
        
        addVital,
        addMedication,
        toggleMedicationLog,
        addLabReport,
        deleteLabReport,
        addAiConversation,
        addWhatsappMessage,
        updateScorecard,
        resetScorecard,
        updateParentProfile,
        
        selectActiveParent,
        refreshData
      }}
    >
      {children}
    </ParentsAuthContext.Provider>
  );
}

export function useParentsAuth() {
  const context = useContext(ParentsAuthContext);
  if (context === undefined) {
    throw new Error("useParentsAuth must be used within a ParentsAuthProvider");
  }
  return context;
}
