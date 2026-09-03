// ============================================================
// careTeamEngine.ts — Care Team Domain Engine
// Parents Health OS
// ============================================================

// ------- TYPES -------

export type ConsultMode = "phone" | "whatsapp" | "video" | "in-person";
export type MemberStatus = "assigned" | "available" | "unavailable";
export type ConsultStatus = "draft" | "requested" | "scheduled" | "completed" | "cancelled";
export type ConsultUrgency = "routine" | "soon" | "urgent";

export interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  languages: string[];
  availabilityLabel: string;
  consultModes: ConsultMode[];
  status: MemberStatus;
  registrationNumber: string;
  bio: string;
  isAI?: boolean;
}

export interface ConsultContextAttachments {
  latestVitals: boolean;
  activeMedications: boolean;
  latestReportSummary: boolean;
  carePlanSummary: boolean;
  doctorQuestions: boolean;
  recentMisses: boolean;
}

export interface ConsultRequest {
  id: string;
  parentId: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  reason: string;
  urgency: ConsultUrgency;
  preferredMode: ConsultMode;
  preferredLanguage: string;
  attachments: ConsultContextAttachments;
  caregiverNotes: string;
  status: ConsultStatus;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  completedAt?: string;
}

export interface ConsultNote {
  id: string;
  consultId: string;
  parentId: string;
  summary: string;
  keyPoints: string[];
  createdAt: string;
}

export interface FollowUpTask {
  id: string;
  parentId: string;
  consultId?: string;
  label: string;
  category: "lab" | "medicine" | "vitals" | "physio" | "upload" | "review" | "other";
  dueLabel: string;
  isDone: boolean;
  createdAt: string;
}

export interface DoctorBrief {
  id: string;
  parentId: string;
  generatedAt: string;
  parentName: string;
  ageLanguage: string;
  knownConditions: string[];
  activeMedications: string[];
  latestVitals: string;
  recentRedFlags: string[];
  latestReportSummary: string;
  carePlanStatus: string;
  missedTasks: string[];
  questionsToAsk: string[];
  caregiverNotes: string;
  disclaimer: string;
}

// ------- DEFAULT SAMPLE CARE TEAM -------

export const DEFAULT_CARE_TEAM: CareTeamMember[] = [
  {
    id: "ct-anaya",
    name: "Care Automation Module (Anaya)",
    role: "Checklists & Alerts Coordinator",
    specialty: "Routine Check-ins & Care Automation",
    languages: ["English", "Hindi", "Telugu"],
    availabilityLabel: "Always active",
    consultModes: ["whatsapp"],
    status: "assigned",
    registrationNumber: "N/A — Care Automation System",
    bio: "Coordinates daily check-ins, runs automated medication alerts, and logs coordinator follow-up checklists for the care team.",
    isAI: true,
  },
  {
    id: "ct-family-physician",
    name: "Dr. Aruna Desai",
    role: "Family Physician",
    specialty: "General Medicine & Chronic Disease Management",
    languages: ["English", "Hindi"],
    availabilityLabel: "Mon–Sat, 10 AM–1 PM",
    consultModes: ["phone", "video"],
    status: "assigned",
    registrationNumber: "Pending Registration",
    bio: "20+ years in family medicine with focus on geriatric chronic care, polypharmacy review, and preventive health for Indian families.",
  },
  {
    id: "ct-cardiologist",
    name: "Dr. Rajan Mehta",
    role: "Cardiologist",
    specialty: "Cardiovascular Health & Hypertension",
    languages: ["English", "Hindi", "Gujarati"],
    availabilityLabel: "Tue & Thu, 2–5 PM",
    consultModes: ["video", "in-person"],
    status: "assigned",
    registrationNumber: "Pending Registration",
    bio: "Cardiac specialist focused on BP management, ECG reviews, and heart health for elderly patients. Monitors medication interactions.",
  },
  {
    id: "ct-nutritionist",
    name: "Ms. Sanya Kapoor",
    role: "Clinical Nutritionist",
    specialty: "Diabetic & Geriatric Nutrition",
    languages: ["English", "Hindi"],
    availabilityLabel: "Mon, Wed, Fri — 11 AM–1 PM",
    consultModes: ["phone", "whatsapp"],
    status: "assigned",
    registrationNumber: "Pending Registration",
    bio: "Diet specialist for diabetic seniors, digestive wellness, hydration tracking, and meal timing aligned with medication schedules.",
  },
  {
    id: "ct-physiotherapist",
    name: "Coach Vikram Singh",
    role: "Physiotherapist",
    specialty: "Mobility, Fall Prevention & Strength",
    languages: ["English", "Hindi", "Punjabi"],
    availabilityLabel: "Mon–Fri, 7–9 AM",
    consultModes: ["video", "in-person"],
    status: "assigned",
    registrationNumber: "Pending Registration",
    bio: "Specialist in geriatric mobility restoration, fall-prevention programs, chair exercises, and post-hospitalisation recovery.",
  },
  {
    id: "ct-mental-wellness",
    name: "Dr. Esha Sethi",
    role: "Mental Wellness Therapist",
    specialty: "Senior Emotional & Sleep Wellness",
    languages: ["English", "Hindi"],
    availabilityLabel: "Wed & Sat, 4–6 PM",
    consultModes: ["phone", "video"],
    status: "assigned",
    registrationNumber: "Pending Registration",
    bio: "Specialises in elderly anxiety, sleep disorders, cognitive engagement, and family-senior communication coaching.",
  },
  {
    id: "ct-coordinator",
    name: "Amit Verma",
    role: "Care Coordinator",
    specialty: "Operations, Lab Scheduling & Logistics",
    languages: ["English", "Hindi"],
    availabilityLabel: "Mon–Sat, 9 AM–6 PM",
    consultModes: ["phone", "whatsapp"],
    status: "assigned",
    registrationNumber: "N/A — Operations Role",
    bio: "Primary coordination contact for lab test scheduling, medicine delivery follow-ups, prescription uploads, and consult logistics.",
  },
];

// ------- DEFAULT FOLLOW-UP TASK TEMPLATES -------
export const FOLLOW_UP_TASK_TEMPLATES = [
  { label: "Book lab test for follow-up", category: "lab" as const, dueLabel: "Within 7 days" },
  { label: "Update medication list after doctor review", category: "medicine" as const, dueLabel: "Within 3 days" },
  { label: "Track blood pressure daily for 7 days", category: "vitals" as const, dueLabel: "Next 7 days" },
  { label: "Start physiotherapy exercise routine", category: "physio" as const, dueLabel: "From tomorrow" },
  { label: "Ask parent about sleep quality", category: "review" as const, dueLabel: "Tonight" },
  { label: "Upload new prescription to records", category: "upload" as const, dueLabel: "Within 2 days" },
  { label: "Schedule next review consult", category: "review" as const, dueLabel: "Within 1 month" },
  { label: "Check fasting glucose for 3 days", category: "vitals" as const, dueLabel: "Next 3 days" },
  { label: "Review diet plan with nutritionist notes", category: "medicine" as const, dueLabel: "This week" },
];

// ------- CARE TEAM STATE READERS (Pure Data) -------
export function getCareTeam(_parentId: string): CareTeamMember[] {
  return DEFAULT_CARE_TEAM;
}

export function saveCareTeam(_parentId: string, _team: CareTeamMember[]): void {
  // Persistence will be managed via Supabase in Phase 1
}

export function getConsultRequests(_parentId: string): ConsultRequest[] {
  return [];
}

export function saveConsultRequest(_parentId: string, _req: ConsultRequest): void {
  // Persistence will be managed via Supabase in Phase 1
}

export function updateConsultStatus(_parentId: string, _consultId: string, _status: ConsultStatus): void {
  // Persistence will be managed via Supabase in Phase 1
}

export function getConsultNotes(_parentId: string): ConsultNote[] {
  return [];
}

export function saveConsultNote(_parentId: string, _note: ConsultNote): void {
  // Persistence will be managed via Supabase in Phase 1
}

export function getFollowUpTasks(_parentId: string): FollowUpTask[] {
  return [];
}

export function saveFollowUpTask(_parentId: string, _task: FollowUpTask): void {
  // Persistence will be managed via Supabase in Phase 1
}

export function toggleFollowUpTask(_parentId: string, _taskId: string): void {
  // Persistence will be managed via Supabase in Phase 1
}

// ------- DOCTOR BRIEF GENERATOR (Deterministic Rule Engine) -------
export function generateDoctorBrief(
  parentId: string,
  parentName: string,
  scorecardAnswers: any,
  medications: any[],
  vitals: any[],
  labReports: any[]
): DoctorBrief {
  const age = scorecardAnswers?.age || "Unknown";
  const language = scorecardAnswers?.language || "English";
  const conditions: string[] = scorecardAnswers?.conditions || [];
  const redFlags: string[] = [];

  if (scorecardAnswers?.falls_12m === "Yes") redFlags.push("History of falls in the last 12 months");
  if (scorecardAnswers?.dizziness === "Yes") redFlags.push("Reported dizziness or vertigo");
  if (scorecardAnswers?.breathlessness === "Yes") redFlags.push("Breathlessness on mild exertion");
  if (scorecardAnswers?.forgetfulness === "Yes") redFlags.push("Frequent forgetfulness reported");
  if (scorecardAnswers?.severe_pain === "Yes") redFlags.push("Severe or persistent pain reported");
  if (scorecardAnswers?.low_mood === "Yes") redFlags.push("Low mood or emotional distress reported");
  if (scorecardAnswers?.poor_sleep === "Yes") redFlags.push("Disrupted sleep patterns");

  const activeMedNames = medications
    .filter((m) => m && (m.name || m.med_name))
    .map((m) => `${m.name || m.med_name}${m.dosage ? ` — ${m.dosage}` : ""}${m.timing ? ` (${m.timing})` : ""}`);

  let vitalsStr = "No recent vitals recorded.";
  if (vitals && vitals.length > 0) {
    const last = vitals[0];
    const parts = [];
    if (last.bp_sys && last.bp_dia) parts.push(`BP: ${last.bp_sys}/${last.bp_dia} mmHg`);
    if (last.sugar) parts.push(`Blood Sugar: ${last.sugar} mg/dL`);
    if (last.weight) parts.push(`Weight: ${last.weight} kg`);
    vitalsStr = parts.length > 0 ? parts.join(", ") : "Vitals recorded but values unavailable.";
  }

  let reportSummary = "No lab report uploaded yet.";
  if (labReports && labReports.length > 0) {
    reportSummary = labReports[0].summary || labReports[0].summaryForChild || "Latest report uploaded — review with doctor.";
    if (reportSummary.length > 220) reportSummary = reportSummary.slice(0, 220) + "...";
  }

  const carePlanStatus = scorecardAnswers?.stageA_completed
    ? `Care baseline established (Stage A${scorecardAnswers?.stageB_completed ? ", B" : ""}${scorecardAnswers?.stageC_completed ? ", C" : ""}${scorecardAnswers?.stageD_completed ? ", D" : ""} completed).`
    : "Care baseline not yet established. Stage A assessment incomplete.";

  const missedTasks: string[] = [];

  const abnormalBiomarkers: string[] = [];
  if (labReports && labReports.length > 0) {
    labReports.forEach(report => {
      if (report && report.biomarkers && Array.isArray(report.biomarkers)) {
        report.biomarkers.forEach((bm: any) => {
          if (bm && (bm.status === "Warning" || bm.status === "Critical" || bm.status === "High" || bm.status === "Low" || bm.status === "Abnormal")) {
            abnormalBiomarkers.push(`${bm.name}: ${bm.value || bm.result || "Abnormal"} (${bm.status})`);
          }
        });
      }
    });
  }

  const questionsToAsk = [
    ...abnormalBiomarkers.map(bm => `Discuss abnormal biomarker: ${bm}`),
    ...(conditions.includes("Diabetes") ? ["Is current fasting glucose target (< 125 mg/dL) appropriate for age?"] : []),
    ...(conditions.includes("Hypertension") ? ["Is BP target of 120–135 mmHg appropriate? Any medication adjustments needed?"] : []),
    ...(conditions.includes("Heart Issues") ? ["Any cardiac event warning signs to watch for?"] : []),
    ...(redFlags.includes("History of falls in the last 12 months") ? ["What fall prevention measures should we take at home?"] : []),
    ...(redFlags.includes("Frequent forgetfulness reported") ? ["Should we screen for mild cognitive impairment?"] : []),
    activeMedNames.length > 2 ? "Polypharmacy check — any medications that can be consolidated?" : "",
    "Is the current monitoring frequency (BP daily, glucose daily) appropriate?",
    "Are there any upcoming preventive screenings recommended for this age?",
  ].filter(Boolean);

  const brief: DoctorBrief = {
    id: `brief-${Date.now()}`,
    parentId,
    generatedAt: new Date().toISOString(),
    parentName: parentName || "Parent",
    ageLanguage: `${age} years, prefers ${language}`,
    knownConditions: conditions.length > 0 ? conditions : ["None specified"],
    activeMedications: activeMedNames.length > 0 ? activeMedNames : ["No medications recorded yet"],
    latestVitals: vitalsStr,
    recentRedFlags: redFlags,
    latestReportSummary: reportSummary,
    carePlanStatus,
    missedTasks,
    questionsToAsk: questionsToAsk as string[],
    caregiverNotes: "",
    disclaimer:
      "⚠️ This brief is prepared for discussion with a registered medical practitioner and is NOT medical advice. It is generated for care coordination purposes only.",
  };

  return brief;
}

export function getLastDoctorBrief(_parentId: string): DoctorBrief | null {
  return null;
}
