# Yukti OS: The Definitive Architectural Blueprint
**Version:** 3.4 (Humble Prototype Edition / WIP)
**Status:** Concept Exploration & Demo Blueprint
**Branding:** A concept prototype by Tharun Gajula
**Last Updated:** April 17, 2026

---

## 1. The Core Thesis: Supportive Context & AI Companion
Yukti OS is built on a humble health postulate: **Health data is most helpful when paired with personal routine context.** 

The system operates as an exploratory "Care Companion" interface. It does not provide medical diagnoses; instead, it demonstrates how laboratory results, medication logs, and vital readings can be synthesized through a smart, AI-assisted health profile to support daily well-being.

### The "Care Companion" Hierarchy
1. **The Profile (Assessment Hub)**: Established via an exploratory profiling protocol to generate a sample baseline.
2. **The Dashboard (Interface)**: A glassmorphic personal hub designed for clear, supportive monitoring of daily routines.
3. **The Insights (Health View)**: An AI-assisted synthesis layer (Gemini-integrated) for longitudinal habit and record summaries.
4. **The Assistant (Care Companion / Nani-Bot)**: A sample messaging interface designed to demonstrate daily routine synchronization in a familiar environment (WhatsApp).

---

## 2. Technical Stack & Prototype Infrastructure
To replicate the Yukti OS prototype environment, the following stack is utilized:

- **Core Framework**: `Next.js 16.1+` (App Router).
- **Runtime Environment**: `Node.js 20+`.
- **Language**: `TypeScript 5+`.
- **UI Architecture**: `React 19.2+` with Motion-DOM (`Framer Motion 12.2`).
- **Design System**: `Vanilla CSS` with `Tailwind CSS 4.0` utilities (PostCSS).
- **AI Intelligence**: `Google Gemini 2.0 Flash` (Report synthesis demo).
- **Iconography**: `Lucide React 0.563+` (Standardized `strokeWidth={1.5}`).
- **Typography**: 
  - **Headings**: `Outfit` (Modern, professional).
  - **Body text**: `Inter` (Legible, calm).
  - **Data/Labels**: `JetBrains Mono` (Clear, technical).
- **Data Preservation**: Privacy-focused `localStorage` (Local browser storage only for this prototype).

---

## 3. Module Deep-Dive: Logic & Demo Content

### A. Assessment Hub (Health Profiling)
**Path:** `src/components/ClinicalEngine.tsx`
The entry point for the demo. It collects basic health data to generate a sample user profile.

#### The Assessment Protocol Dictionary
| ID | Dimension | Assessment Question | Weight (Low -> High) |
|:---|:---|:---|:---|
| q1 | Resilience | Age of the member? | <40 (0) to 70+ (15) |
| q2 | Metabolic | High blood sugar/Prediabetes? | No (0) to Diabetes (15) |
| q3 | Cardio | Heart issues (BP/Stent/Cholesterol)? | No (0) to Severe (15) |
| q4 | Resilience | Tired/Breathless during activities? | Never (0) to Often (10) |
| q5 | Cognitive | Stroke/Tremors/Weakness? | No (0) to Diagnosed (10) |
| q6 | Cognitive | Confusion/Forgetfulness? | No (0) to Often (10) |
| q7 | Resilience | Hospitalization/Major Surgery/Cancer? | No (0) to Multiple/Major (10) |
| q8 | Muscular | Joint/Back/Knee pain? | No (0) to Severe (20) |
| q9 | Frailty | Falls/Fractures in last 2 years? | No (0) to Multiple (10) |
| q10| Frailty | Need help with stairs/bathing/dressing?| No (0) to Often (10) |
| q11| Digestive | Bloating/Acidity/Gut issues? | No (0) to Frequently (10) |
| q12| Emotional | Stress/Anxiety/Low mood? | No (0) to Often (10) |
| q13| Sleep | Poor sleep/Snoring/Daytime napping? | Good (0) to Often (10) |
| q14| Lifestyle | Unhealthy eating/Dehydration? | No (0) to Often (10) |
| q15| Lifestyle | Smoking/Alcohol/Zero exercise? | None (0) to 2+ habits (10) |

#### Scoring & Demo Classification
Scores are aggregated into 10 categories (Metabolic, Cardiovascular, Cognitive, etc.).
- **Healthy Baseline (0-20)**: Routine monitoring suggested.
- **Moderate Attention (21-40)**: Bi-weekly habit review recommended.
- **Support Needed (41+ / High Risk)**: Intensive daily routine check-ins suggested for the concept demo.

---

### B. Health View (AI Insights Summary)
**Path:** `src/components/SmartReport.tsx` | **Backend:** `src/app/api/analyze/route.ts`

#### Insight Generation Modes
1. **Document Review**: Ingests Lab Reports/Prescriptions. Gemini logic demo identifies document type and extracts sample biomarkers with a "Supportive Context" filter.
2. **Daily Synthesis**: Correlates recent reports with the Health Profile to generate a trajectory summary.

#### AI Assistant Tone (Care Companion Prototype)
- **Identity**: "Nani-Bot", a warm, respectful health assistant. 
- **Style**: Uses simple language to explain complex findings, prioritizing clarity and encouragement over clinical prescription.
- **Merge Logic**: The analysis logic maps new prescriptions into `yukti_active_meds` to demonstrate seamless routine updates.

---

### C. Health Routine (Daily Habits & Vitals)
**Path:** `src/components/MedicationTracker.tsx`

#### Tracking Demonstration
- **Today's Log**: Compares `yukti_daily_log` entries against the `yukti_active_meds` list.
- **History Matrix**:
    - **Green Dot**: Routine fully completed + Vitals logged.
    - **Amber Dot**: Partial habits or vitals missing.
    - **Red Dot**: No data logged for the day.

#### Prototype IoT Simulation
- **CGM Demo**: Simulates FreeStyle Libre readings (e.g., 110 mg/dL).
- **Activity Demo**: Simulates Apple Watch activity time and weight sync.
- **Reminders**: A sample timer system triggers a "Daily Care Reminder" (`CallOverlay.tsx`) at scheduled times (09:00, 13:00, 21:00) if entries are unlogged.

---

### D. Care Companion (Messaging Interface)
**Path:** `src/components/WhatsAppDemo.tsx`

#### Demo Persona
- **Name**: Yukti Care (Warm and respectful).
- **Communication**: Uses emojis and polite greetings (e.g., "Namaste").
- **Interactive Logic**:
    - Confirms habit completion (Meds taken).
    - Requests pain scale checking for the demo report.
    - Provides supportive feedback for long-term consistency.

---

### E. Care Hub (Connectivity & Team)
**Paths:** `src/components/ClinicHub.tsx` | `CareTeam.tsx`

- **Praan Wallet**: Demonstration of ₹1,250 balance for call slots or health services.
- **Health Shield**: Sample policy node (e.g., YUK-8829-X).
- **The Support Team**: 
    1. **Nani-Bot** (AI Assistant Demo)
    2. **Dr. Aruna Desai** (Medical Advisor)
    3. **Ms. Sanya Kapoor** (Nutrition Support)
    4. **Coach Vikram Singh** (Movement Support)
    5. **Amit Verma** (Support Ops)
    6. **Dr. Esha Sethi** (Sleep Wellness)

---

## 4. Data Registry (Local Persistence Only)

Yukti OS v3.4 uses the following browser `localStorage` keys for the prototype demo:

| Key | Type | Purpose |
|:---|:---|:---|
| `yukti_auth_v2` | Boolean | Initialization flag for the demo. |
| `yukti_user_name` | String | Sample user identity for the dashboard. |
| `yukti_assessment_data_v2` | Object | `{ answers: Record<id, label>, scores: Object }`. |
| `yukti_active_meds` | Array | Sample medication list (Dose, timing, type). |
| `yukti_history` | Array | Archival memory of analyzed demo reports. |
| `yukti_latest_summary` | Object | The most recent AI synthesis summary. |
| `yukti_daily_log_YYYY-MM-DD`| Object | `{ meds: string[], vitals: Vitals, habits: Habits }`. |

---

## 5. Setup & Design Philosophy

### The Neural Glass System
Yukti OS utilizes a "Neural Glass" shader system to create a premium, calm environment for seniors:
```css
:root {
  --background: #010413;
  --glass-surface: rgba(15, 23, 42, 0.4);
  --glass-border: rgba(255, 255, 255, 0.05);
}
.glass-card {
  background: var(--glass-surface);
  backdrop-filter: blur(40px);
  border: 1px solid var(--glass-border);
}
```

### Aesthetic Standards
- **Atmospheric**: Deep voids with subtle cyan accents.
- **Humble**: Language focus on "Support," "Summary," and "Routine" rather than "Command," "Engine," or "Diagnostics."
- **Premium**: High-fidelity animations and glassmorphic depth.

---
*End of Blueprint. This document is the final authority on the Yukti OS v3.4 Concept Prototype.*
