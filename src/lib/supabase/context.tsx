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

export type EnrichedMedicationEvent = TableRow<"medication_events"> & {
  medication_name?: string;
  dosage?: string;
  instructions?: string;
  local_time?: string;
};

export type EnrichedCareRoutineEvent = TableRow<"care_routine_events"> & {
  routine_name?: string;
  category?: string;
  description?: string;
  local_time?: string;
};

interface ParentsAuthContextType {
  isSupabaseEnabled: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  profile: TableRow<"profiles"> | null;
  family: TableRow<"families"> | null;
  careRecipients: TableRow<"care_recipients">[];
  activeCareRecipient: TableRow<"care_recipients"> | null;
  parents: TableRow<"parents">[];
  activeParent: TableRow<"parents"> | null;
  vitals: TableRow<"vitals">[];
  medications: TableRow<"medications">[];
  medicationSchedules: TableRow<"medication_schedules">[];
  medicationEvents: EnrichedMedicationEvent[];
  careRoutines: TableRow<"care_routines">[];
  careRoutineSchedules: TableRow<"care_routine_schedules">[];
  careRoutineEvents: EnrichedCareRoutineEvent[];
  healthObservations: TableRow<"health_observations">[];
  healthDocuments: TableRow<"health_documents">[];
  documentExtractions: TableRow<"document_extractions">[];
  healthConditions: TableRow<"health_conditions">[];
  medicationLogs: TableRow<"medication_logs">[];
  labReports: TableRow<"lab_reports">[];
  aiConversations: TableRow<"ai_conversations">[];
  whatsappMessages: TableRow<"whatsapp_messages">[];
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  onboard: (data: OnboardData) => Promise<{ error: any }>;
  addCareRecipient: (data: { display_name: string; relationship: string; primary_language: string; phone?: string; timezone?: string }) => Promise<{ error: any; data?: any }>;

  // V1 Document Intelligence Workflows
  uploadHealthDocument: (file: File, documentType: string) => Promise<{ success: boolean; document?: any; extraction?: any; error?: any }>;
  analyzeDocument: (documentId: string) => Promise<{ success: boolean; extraction?: any; error?: any }>;
  reviewDocumentExtraction: (extractionId: string, status: "approved" | "rejected", reviewNotes?: string) => Promise<{ success: boolean; error?: any }>;

  // V1 Medication & Routine Workflows
  addRealMedication: (data: {
    name: string;
    dosage: string;
    instructions?: string;
    local_time: string;
    applicable_days?: string[];
    start_date?: string;
    end_date?: string;
  }) => Promise<{ success: boolean; data?: any; error?: any }>;
  deactivateMedication: (medicationId: string) => Promise<{ success: boolean; error?: any }>;
  
  addRealCareRoutine: (data: {
    name: string;
    category: string;
    description?: string;
    local_time: string;
    applicable_days?: string[];
    start_date?: string;
    end_date?: string;
  }) => Promise<{ success: boolean; data?: any; error?: any }>;
  deactivateCareRoutine: (routineId: string) => Promise<{ success: boolean; error?: any }>;

  respondToMedicationEvent: (eventId: string, status: "taken" | "skipped" | "snoozed") => Promise<{ success: boolean; error?: any }>;
  respondToCareRoutineEvent: (eventId: string, status: "completed" | "partial" | "skipped" | "snoozed") => Promise<{ success: boolean; error?: any }>;

  // V1 Health Observation Workflows
  addHealthObservation: (data: {
    category: "blood_pressure" | "blood_glucose" | "weight" | "body_temperature" | "pulse_oximetry" | "heart_rate" | "symptom_notes" | "other";
    observed_at?: string;
    value_numeric?: number | null;
    value_sys?: number | null;
    value_dia?: number | null;
    value_text?: string | null;
    unit?: string | null;
    notes?: string | null;
  }) => Promise<{ success: boolean; data?: any; error?: any }>;

  // Legacy Mutators
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
  const [careRecipients, setCareRecipients] = useState<TableRow<"care_recipients">[]>([]);
  const [activeCareRecipient, setActiveCareRecipient] = useState<TableRow<"care_recipients"> | null>(null);
  const [parents, setParents] = useState<TableRow<"parents">[]>([]);
  const [activeParent, setActiveParent] = useState<TableRow<"parents"> | null>(null);
  
  // Health & Care Logs State
  const [vitals, setVitals] = useState<TableRow<"vitals">[]>([]);
  const [medications, setMedications] = useState<TableRow<"medications">[]>([]);
  const [medicationSchedules, setMedicationSchedules] = useState<TableRow<"medication_schedules">[]>([]);
  const [medicationEvents, setMedicationEvents] = useState<EnrichedMedicationEvent[]>([]);
  const [careRoutines, setCareRoutines] = useState<TableRow<"care_routines">[]>([]);
  const [careRoutineSchedules, setCareRoutineSchedules] = useState<TableRow<"care_routine_schedules">[]>([]);
  const [careRoutineEvents, setCareRoutineEvents] = useState<EnrichedCareRoutineEvent[]>([]);

  const [healthObservations, setHealthObservations] = useState<TableRow<"health_observations">[]>([]);
  const [healthDocuments, setHealthDocuments] = useState<TableRow<"health_documents">[]>([]);
  const [documentExtractions, setDocumentExtractions] = useState<TableRow<"document_extractions">[]>([]);
  const [healthConditions, setHealthConditions] = useState<TableRow<"health_conditions">[]>([]);
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
          setCareRecipients([]);
          setActiveCareRecipient(null);
          setParents([]);
          setActiveParent(null);
          setVitals([]);
          setMedications([]);
          setMedicationSchedules([]);
          setMedicationEvents([]);
          setCareRoutines([]);
          setCareRoutineSchedules([]);
          setCareRoutineEvents([]);
          setHealthObservations([]);
          setHealthDocuments([]);
          setHealthConditions([]);
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
        setProfile(profileData as any);
      }

      // 2. Fetch Family Membership
      const { data: memberData, error: memberErr } = await supabase
        .from("family_members")
        .select("*, families(*)")
        .eq("user_id", userId)
        .eq("status", "active");

      if (memberErr) {
        console.error("Error fetching family membership:", memberErr);
      }

      if (memberData && memberData.length > 0) {
        const primaryMember = memberData[0];
        setFamily(primaryMember.families as any);

        // 3. Fetch Care Recipients
        const { data: recipientList, error: recipientErr } = await supabase
          .from("care_recipients")
          .select("*")
          .eq("family_id", primaryMember.family_id)
          .order("created_at", { ascending: true });

        if (recipientErr) {
          console.error("Error fetching care recipients:", recipientErr);
        }

        if (recipientList && recipientList.length > 0) {
          setCareRecipients(recipientList as any);
          const mappedParents = recipientList.map((r: any) => ({
            id: r.id,
            family_id: r.family_id,
            name: r.display_name,
            relationship: r.relationship,
            phone: r.phone,
            language: r.primary_language,
            primary_conditions: [],
            risk_level: "Healthy Baseline",
            health_index: 90,
            scorecard_answers: null,
            created_at: r.created_at,
            updated_at: r.updated_at
          }));
          setParents(mappedParents as any);

          let activeRec = activeCareRecipient;
          if (!activeRec || !recipientList.some((r: any) => r.id === activeRec?.id)) {
            activeRec = recipientList[0] as any;
          }
          setActiveCareRecipient(activeRec);
          setActiveParent(mappedParents.find((p: any) => p.id === activeRec?.id) as any || mappedParents[0] as any);

          if (activeRec) {
            await fetchParentRecords(activeRec.id);
          }
        } else {
          setCareRecipients([]);
          setParents([]);
          setActiveCareRecipient(null);
          setActiveParent(null);
        }
      }
    } catch (e) {
      console.error("Failed to populate dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const ensureTodayEvents = async (
    recipientId: string,
    activeMeds: TableRow<"medications">[],
    medScheds: TableRow<"medication_schedules">[],
    activeRoutines: TableRow<"care_routines">[],
    routineScheds: TableRow<"care_routine_schedules">[]
  ) => {
    if (!supabase) return;

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = daysOfWeek[new Date().getDay()];

    // A. Ensure Medication Events for Today
    for (const sched of medScheds) {
      if (!sched.is_active) continue;
      if (sched.start_date > todayStr) continue;
      if (sched.end_date && sched.end_date < todayStr) continue;
      if (!sched.applicable_days.includes(dayName)) continue;

      const timePart = sched.local_time.length === 5 ? `${sched.local_time}:00` : sched.local_time;
      const dueAt = `${todayStr}T${timePart}+05:30`;

      const { data: existing } = await supabase
        .from("medication_events")
        .select("id")
        .eq("schedule_id", sched.id)
        .eq("due_at", dueAt);

      if (!existing || existing.length === 0) {
        await supabase.from("medication_events").insert({
          schedule_id: sched.id,
          due_at: dueAt,
          status: "pending"
        });
      }
    }

    // B. Ensure Care Routine Events for Today
    for (const sched of routineScheds) {
      if (!sched.is_active) continue;
      if (sched.start_date > todayStr) continue;
      if (sched.end_date && sched.end_date < todayStr) continue;
      if (!sched.applicable_days.includes(dayName)) continue;

      const timePart = sched.local_time.length === 5 ? `${sched.local_time}:00` : sched.local_time;
      const dueAt = `${todayStr}T${timePart}+05:30`;

      const { data: existing } = await supabase
        .from("care_routine_events")
        .select("id")
        .eq("schedule_id", sched.id)
        .eq("due_at", dueAt);

      if (!existing || existing.length === 0) {
        await supabase.from("care_routine_events").insert({
          schedule_id: sched.id,
          due_at: dueAt,
          status: "pending"
        });
      }
    }
  };

  const fetchParentRecords = async (parentId: string) => {
    if (!supabase) return;
    try {
      // 1. Fetch Medications & Care Routines for active parent
      const [medsRes, routinesRes, obsRes, docsRes, condsRes] = await Promise.all([
        supabase.from("medications").select("*").eq("care_recipient_id", parentId).eq("is_active", true),
        supabase.from("care_routines").select("*").eq("care_recipient_id", parentId).eq("is_active", true),
        supabase.from("health_observations").select("*").eq("care_recipient_id", parentId).order("observed_at", { ascending: false }),
        supabase.from("health_documents").select("*").eq("care_recipient_id", parentId).order("uploaded_at", { ascending: false }),
        supabase.from("health_conditions").select("*").eq("care_recipient_id", parentId)
      ]);

      const activeMeds = (medsRes.data || []) as TableRow<"medications">[];
      const activeRoutines = (routinesRes.data || []) as TableRow<"care_routines">[];

      setMedications(activeMeds);
      setCareRoutines(activeRoutines);
      if (obsRes.data) setHealthObservations(obsRes.data as any);
      const loadedDocs = (docsRes.data || []) as TableRow<"health_documents">[];
      setHealthDocuments(loadedDocs);
      if (condsRes.data) setHealthConditions(condsRes.data as any);

      if (loadedDocs.length > 0) {
        const docIds = loadedDocs.map((d) => d.id);
        const { data: extractionsData } = await supabase
          .from("document_extractions")
          .select("*")
          .in("health_document_id", docIds)
          .order("extracted_at", { ascending: false });
        if (extractionsData) setDocumentExtractions(extractionsData as any);
        else setDocumentExtractions([]);
      } else {
        setDocumentExtractions([]);
      }

      // 2. Fetch Medication Schedules
      let medScheds: TableRow<"medication_schedules">[] = [];
      if (activeMeds.length > 0) {
        const medIds = activeMeds.map((m) => m.id);
        const { data: sData } = await supabase
          .from("medication_schedules")
          .select("*")
          .in("medication_id", medIds)
          .eq("is_active", true);
        if (sData) medScheds = sData as any;
      }
      setMedicationSchedules(medScheds);

      // 3. Fetch Care Routine Schedules
      let routineScheds: TableRow<"care_routine_schedules">[] = [];
      if (activeRoutines.length > 0) {
        const routineIds = activeRoutines.map((r) => r.id);
        const { data: rData } = await supabase
          .from("care_routine_schedules")
          .select("*")
          .in("routine_id", routineIds)
          .eq("is_active", true);
        if (rData) routineScheds = rData as any;
      }
      setCareRoutineSchedules(routineScheds);

      // 4. Generate Today's Events
      await ensureTodayEvents(parentId, activeMeds, medScheds, activeRoutines, routineScheds);

      // 5. Fetch Today's Medication Events
      if (medScheds.length > 0) {
        const schedIds = medScheds.map((s) => s.id);
        const { data: mEvents } = await supabase
          .from("medication_events")
          .select("*")
          .in("schedule_id", schedIds)
          .order("due_at", { ascending: true });

        if (mEvents) {
          const enriched = mEvents.map((ev: any) => {
            const sched = medScheds.find((s) => s.id === ev.schedule_id);
            const med = activeMeds.find((m) => m.id === sched?.medication_id);
            return {
              ...ev,
              medication_name: med?.name || "Medication",
              dosage: med?.dosage || "",
              instructions: med?.instructions || "",
              local_time: sched?.local_time || ""
            };
          });
          setMedicationEvents(enriched);
        } else {
          setMedicationEvents([]);
        }
      } else {
        setMedicationEvents([]);
      }

      // 6. Fetch Today's Routine Events
      if (routineScheds.length > 0) {
        const rSchedIds = routineScheds.map((s) => s.id);
        const { data: rEvents } = await supabase
          .from("care_routine_events")
          .select("*")
          .in("schedule_id", rSchedIds)
          .order("due_at", { ascending: true });

        if (rEvents) {
          const enrichedR = rEvents.map((ev: any) => {
            const sched = routineScheds.find((s) => s.id === ev.schedule_id);
            const routine = activeRoutines.find((r) => r.id === sched?.routine_id);
            return {
              ...ev,
              routine_name: routine?.name || "Care Routine",
              category: routine?.category || "other",
              description: routine?.description || "",
              local_time: sched?.local_time || ""
            };
          });
          setCareRoutineEvents(enrichedR);
        } else {
          setCareRoutineEvents([]);
        }
      } else {
        setCareRoutineEvents([]);
      }
    } catch (e) {
      console.error("Failed to load parent metrics:", e);
    }
  };

  const refreshData = async () => {
    if (isSupabaseEnabled && user && supabase) {
      await fetchSupabaseData(user.id);
    }
  };

  // --- V1 MEDICATION WORKFLOWS ---
  const addRealMedication = async (data: {
    name: string;
    dosage: string;
    instructions?: string;
    local_time: string;
    applicable_days?: string[];
    start_date?: string;
    end_date?: string;
  }) => {
    if (!supabase || !activeCareRecipient) {
      return { success: false, error: { message: "No active care recipient selected." } };
    }

    try {
      const { data: medData, error: medErr } = await supabase
        .from("medications")
        .insert({
          care_recipient_id: activeCareRecipient.id,
          name: data.name.trim(),
          dosage: data.dosage.trim(),
          instructions: data.instructions?.trim() || null,
          provenance: "manual_entry",
          is_active: true
        })
        .select()
        .single();

      if (medErr || !medData) {
        console.error("Error creating medication:", medErr);
        return { success: false, error: medErr || { message: "Failed to create medication." } };
      }

      const days = data.applicable_days || ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const startDate = data.start_date || new Date().toISOString().split("T")[0];

      const { error: schedErr } = await supabase
        .from("medication_schedules")
        .insert({
          medication_id: medData.id,
          local_time: data.local_time,
          timezone: "Asia/Kolkata",
          applicable_days: days,
          start_date: startDate,
          end_date: data.end_date || null,
          is_active: true
        });

      if (schedErr) {
        console.error("Error creating medication schedule:", schedErr);
        return { success: false, error: schedErr };
      }

      await fetchParentRecords(activeCareRecipient.id);
      return { success: true, data: medData };
    } catch (err: any) {
      console.error("Exception creating medication:", err);
      return { success: false, error: err };
    }
  };

  const deactivateMedication = async (medicationId: string) => {
    if (!supabase || !activeCareRecipient) {
      return { success: false, error: { message: "No active care recipient selected." } };
    }
    try {
      const { error } = await supabase
        .from("medications")
        .update({ is_active: false })
        .eq("id", medicationId);

      if (error) {
        console.error("Error deactivating medication:", error);
        return { success: false, error };
      }

      await fetchParentRecords(activeCareRecipient.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  // --- V1 CARE ROUTINE WORKFLOWS ---
  const addRealCareRoutine = async (data: {
    name: string;
    category: string;
    description?: string;
    local_time: string;
    applicable_days?: string[];
    start_date?: string;
    end_date?: string;
  }) => {
    if (!supabase || !activeCareRecipient) {
      return { success: false, error: { message: "No active care recipient selected." } };
    }

    try {
      const { data: routineData, error: routineErr } = await supabase
        .from("care_routines")
        .insert({
          care_recipient_id: activeCareRecipient.id,
          name: data.name.trim(),
          category: data.category,
          description: data.description?.trim() || null,
          is_active: true
        })
        .select()
        .single();

      if (routineErr || !routineData) {
        console.error("Error creating care routine:", routineErr);
        return { success: false, error: routineErr || { message: "Failed to create care routine." } };
      }

      const days = data.applicable_days || ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const startDate = data.start_date || new Date().toISOString().split("T")[0];

      const { error: schedErr } = await supabase
        .from("care_routine_schedules")
        .insert({
          routine_id: routineData.id,
          local_time: data.local_time,
          timezone: "Asia/Kolkata",
          applicable_days: days,
          start_date: startDate,
          end_date: data.end_date || null,
          is_active: true
        });

      if (schedErr) {
        console.error("Error creating care routine schedule:", schedErr);
        return { success: false, error: schedErr };
      }

      await fetchParentRecords(activeCareRecipient.id);
      return { success: true, data: routineData };
    } catch (err: any) {
      console.error("Exception creating care routine:", err);
      return { success: false, error: err };
    }
  };

  const deactivateCareRoutine = async (routineId: string) => {
    if (!supabase || !activeCareRecipient) {
      return { success: false, error: { message: "No active care recipient selected." } };
    }
    try {
      const { error } = await supabase
        .from("care_routines")
        .update({ is_active: false })
        .eq("id", routineId);

      if (error) {
        console.error("Error deactivating care routine:", error);
        return { success: false, error };
      }

      await fetchParentRecords(activeCareRecipient.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  // --- EVENT RESPONSE WORKFLOWS ---
  const respondToMedicationEvent = async (eventId: string, status: "taken" | "skipped" | "snoozed") => {
    if (!supabase || !activeCareRecipient) {
      return { success: false, error: { message: "No active care recipient selected." } };
    }
    try {
      const { error } = await supabase
        .from("medication_events")
        .update({
          status,
          responded_at: new Date().toISOString(),
          response_source: "caregiver"
        })
        .eq("id", eventId);

      if (error) {
        console.error("Error responding to medication event:", error);
        return { success: false, error };
      }

      await fetchParentRecords(activeCareRecipient.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  const respondToCareRoutineEvent = async (eventId: string, status: "completed" | "partial" | "skipped" | "snoozed") => {
    if (!supabase || !activeCareRecipient) {
      return { success: false, error: { message: "No active care recipient selected." } };
    }
    try {
      const { error } = await supabase
        .from("care_routine_events")
        .update({
          status,
          responded_at: new Date().toISOString(),
          response_source: "caregiver"
        })
        .eq("id", eventId);

      if (error) {
        console.error("Error responding to care routine event:", error);
        return { success: false, error };
      }

      await fetchParentRecords(activeCareRecipient.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  const addHealthObservation = async (data: {
    category: "blood_pressure" | "blood_glucose" | "weight" | "body_temperature" | "pulse_oximetry" | "heart_rate" | "symptom_notes" | "other";
    observed_at?: string;
    value_numeric?: number | null;
    value_sys?: number | null;
    value_dia?: number | null;
    value_text?: string | null;
    unit?: string | null;
    notes?: string | null;
  }) => {
    if (!supabase || !activeCareRecipient || !user) {
      return { success: false, error: { message: "No active care recipient selected." } };
    }

    try {
      const payload: any = {
        care_recipient_id: activeCareRecipient.id,
        category: data.category,
        observed_at: data.observed_at || new Date().toISOString(),
        source: "caregiver",
        recorded_by: user.id,
        notes: data.notes || null
      };

      if (data.category === "blood_pressure") {
        payload.value_sys = data.value_sys;
        payload.value_dia = data.value_dia;
        payload.unit = "mmHg";
      } else if (data.category === "symptom_notes") {
        payload.value_text = data.value_text;
      } else {
        payload.value_numeric = data.value_numeric;
        payload.unit = data.unit || null;
        if (data.value_text) payload.value_text = data.value_text;
      }

      const { data: obsData, error } = await supabase
        .from("health_observations")
        .insert(payload)
        .select()
        .single();

      if (error || !obsData) {
        console.error("Error creating health observation:", error);
        return { success: false, error: error || { message: "Failed to record health observation." } };
      }

      await fetchParentRecords(activeCareRecipient.id);
      return { success: true, data: obsData };
    } catch (err: any) {
      console.error("Exception creating health observation:", err);
      return { success: false, error: err };
    }
  };

  // --- V1 DOCUMENT INTELLIGENCE WORKFLOWS ---
  const uploadHealthDocument = async (file: File, documentType: string) => {
    if (!supabase || !activeCareRecipient || !user) {
      return { success: false, error: { message: "No active care recipient selected." } };
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${activeCareRecipient.id}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      // Upload file to private storage bucket
      const { data: storageData, error: uploadErr } = await supabase.storage
        .from("health-documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadErr || !storageData) {
        console.error("Storage upload error:", uploadErr);
        return { success: false, error: uploadErr || { message: "Failed to upload document to private storage." } };
      }

      const normalizeDocumentType = (typeStr: string) => {
        const lower = (typeStr || "").toLowerCase().replace(/\s+/g, "_");
        if (["lab_report", "prescription", "discharge_summary", "other"].includes(lower)) {
          return lower;
        }
        return "other";
      };

      // Insert record into public.health_documents
      const { data: docData, error: docErr } = await supabase
        .from("health_documents")
        .insert({
          care_recipient_id: activeCareRecipient.id,
          storage_path: storageData.path,
          filename: file.name,
          mime_type: file.type || "application/pdf",
          document_type: normalizeDocumentType(documentType),
          uploaded_by: user.id
        })
        .select()
        .single();

      if (docErr || !docData) {
        console.error("Error creating health_documents record:", docErr);
        return { success: false, error: docErr };
      }

      // Trigger Gemini 3.5 Flash-Lite extraction via /api/analyze
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docData.id })
      });

      const analyzeResult = await analyzeRes.json();
      await fetchParentRecords(activeCareRecipient.id);

      return {
        success: true,
        document: docData,
        extraction: analyzeResult?.extraction
      };
    } catch (err: any) {
      console.error("Exception uploading health document:", err);
      return { success: false, error: err };
    }
  };

  const analyzeDocument = async (documentId: string) => {
    if (!supabase || !activeCareRecipient) {
      return { success: false, error: { message: "No active care recipient selected." } };
    }
    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId })
      });

      const analyzeResult = await analyzeRes.json();
      if (!analyzeRes.ok || analyzeResult.error) {
        return { success: false, error: { message: analyzeResult.error || "Analysis failed." } };
      }

      await fetchParentRecords(activeCareRecipient.id);
      return { success: true, extraction: analyzeResult.extraction };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  const reviewDocumentExtraction = async (extractionId: string, status: "approved" | "rejected", reviewNotes?: string) => {
    if (!supabase || !activeCareRecipient || !user) {
      return { success: false, error: { message: "No active user or care recipient selected." } };
    }
    try {
      const { error } = await supabase
        .from("document_extractions")
        .update({
          review_status: status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null
        })
        .eq("id", extractionId);

      if (error) {
        console.error("Error reviewing document extraction:", error);
        return { success: false, error };
      }

      await fetchParentRecords(activeCareRecipient.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err };
    }
  };

  // --- AUTH ACTIONS ---
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
    setMedicationSchedules([]);
    setMedicationEvents([]);
    setCareRoutines([]);
    setCareRoutineSchedules([]);
    setCareRoutineEvents([]);
    setHealthObservations([]);
    setHealthDocuments([]);
    setHealthConditions([]);
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
        let familyId: string;

        const { data: existingMembers } = await supabase
          .from("family_members")
          .select("family_id")
          .eq("user_id", user.id)
          .eq("status", "active");

        if (existingMembers && existingMembers.length > 0) {
          familyId = existingMembers[0].family_id;
        } else {
          const { data: familyObj, error: famErr } = await supabase
            .from("families")
            .insert({ name: data.familyName, created_by: user.id })
            .select()
            .single();

          if (famErr || !familyObj) {
            setIsLoading(false);
            return { error: famErr || { message: "Failed to create family network." } };
          }

          familyId = familyObj.id;

          await supabase.from("family_members").insert({
            family_id: familyId,
            user_id: user.id,
            role: "owner",
            status: "active"
          });
        }

        const { data: recipient, error: recErr } = await supabase
          .from("care_recipients")
          .insert({
            family_id: familyId,
            display_name: data.parentName.trim(),
            relationship: data.relationship,
            primary_language: data.language,
            phone: data.parentPhone ? data.parentPhone.trim() : null,
            timezone: "Asia/Kolkata"
          })
          .select()
          .single();

        if (recErr || !recipient) {
          setIsLoading(false);
          return { error: recErr || { message: "Failed to create care recipient record." } };
        }

        await supabase.from("consents").insert({
          care_recipient_id: recipient.id,
          consent_type: "family_care_coordination",
          status: "granted",
          recorded_by: user.id,
          recorded_at: new Date().toISOString()
        });

        await fetchSupabaseData(user.id);
        return { error: null };
      } catch (err: any) {
        setIsLoading(false);
        return { error: err };
      }
    } else {
      return { error: { message: "Backend configuration unavailable." } };
    }
  };

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
    return addRealMedication({
      name: data.name,
      dosage: data.dosage,
      instructions: data.instructions,
      local_time: "08:00"
    });
  };

  const toggleMedicationLog = async (medicationId: string, taken: boolean, logDate: string) => {
    if (isSupabaseEnabled && supabase && activeParent) {
      const { error } = await supabase
        .from("medication_logs")
        .upsert({
          parent_id: activeParent.id,
          medication_id: medicationId,
          log_date: logDate,
          taken
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
    if (isSupabaseEnabled && supabase && activeParent) {
      const { data: report, error } = await supabase
        .from("lab_reports")
        .insert({
          parent_id: activeParent.id,
          report_date: data.report_date,
          report_type: data.report_type,
          summary: data.summary,
          biomarkers: data.biomarkers,
          full_analysis_markdown: data.full_analysis_markdown
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
    if (isSupabaseEnabled && supabase) {
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
          ai_response: aiResponse
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
    if (isSupabaseEnabled && supabase && activeParent) {
      try {
        const { data: updatedParent, error } = await supabase
          .from("parents")
          .update({
            scorecard_answers: answers,
            risk_level: scores.riskLevel,
            health_index: scores.healthIndex
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
    if (isSupabaseEnabled && supabase && activeParent) {
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

  const addCareRecipient = async (data: {
    display_name: string;
    relationship: string;
    primary_language: string;
    phone?: string;
    timezone?: string;
  }) => {
    if (isSupabaseEnabled && supabase && user && family) {
      try {
        const { data: recipient, error } = await supabase
          .from("care_recipients")
          .insert({
            family_id: family.id,
            display_name: data.display_name.trim(),
            relationship: data.relationship.trim(),
            primary_language: data.primary_language || "English",
            phone: data.phone?.trim() || null,
            timezone: data.timezone || "Asia/Kolkata",
          })
          .select()
          .single();

        if (error) {
          console.error("Error inserting care recipient:", error);
          return { error };
        }

        if (recipient) {
          await supabase.from("consents").insert({
            care_recipient_id: recipient.id,
            consent_type: "family_care_coordination",
            status: "granted",
            recorded_by: user.id,
            recorded_at: new Date().toISOString(),
          });

          await fetchSupabaseData(user.id);
          selectActiveParent(recipient.id);
        }

        return { error: null, data: recipient };
      } catch (err: any) {
        console.error("Failed to add care recipient:", err);
        return { error: err };
      }
    } else {
      return { error: { message: "Backend or active family connection unavailable." } };
    }
  };

  const selectActiveParent = (parentId: string) => {
    const parent = parents.find(p => p.id === parentId);
    if (parent) {
      setActiveParent(parent);
    }
    const recipient = careRecipients.find(r => r.id === parentId);
    if (recipient) {
      setActiveCareRecipient(recipient);
    }
    if (isSupabaseEnabled) {
      fetchParentRecords(parentId);
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
        careRecipients,
        activeCareRecipient,
        parents,
        activeParent,
        vitals,
        medications,
        medicationSchedules,
        medicationEvents,
        careRoutines,
        careRoutineSchedules,
        careRoutineEvents,
        healthObservations,
        healthDocuments,
        documentExtractions,
        healthConditions,
        medicationLogs,
        labReports,
        aiConversations,
        whatsappMessages,

        signIn,
        signOut,
        onboard,
        addCareRecipient,
        
        uploadHealthDocument,
        analyzeDocument,
        reviewDocumentExtraction,

        addRealMedication,
        deactivateMedication,
        addRealCareRoutine,
        deactivateCareRoutine,
        respondToMedicationEvent,
        respondToCareRoutineEvent,
        addHealthObservation,

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
