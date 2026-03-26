# Yukti OS: The Complete Product Master Guide
**Version:** 2.2+ (Premium Dark Glassmorphism & Neural Typography Edition)
**Date:** March 26, 2026
**Status:** Live Concept Prototype (v2.2+)
**Author:** Tharun Gajula

---

## 1. Vision: The "Context-First" Health OS

Yukti OS is an operating system for longevity that flips the traditional health app model. Instead of just logging data, it first builds a **Digital Clinical Twin** of the senior (Context), and then interprets every new data point through that lens.

*   **Logic:** `Data + Context = Insight`
*   **Differentiation:** Standard apps see "Sugar 160" as bad. Yukti sees "Sugar 160 + Age 75 + Fall Risk" as "Safe Target".
*   **Design Philosophy:** A premium **Dark Glassmorphism** interface combined with **High-Contrast Clean White Typography** designed specifically for geriatric users to reduce cognitive load and visual strain.

---

## 2. Core Architecture: The 5 Neural Modules

### Module A: Health Assessment (The Clinical Engine)
*   **Purpose:** To initialize the "Clinical Context" that gates all subsequent AI interpretations.
*   **Protocol:** A digitized 15-point Geriatric Assessment covering metabolic, physical, and cognitive health.
*   **Scoring Engine (`ClinicalEngine.tsx`):**
    *   **Total Score:** 0-175.
    *   **Risk Categorization:** `0-20` (Healthy), `21-40` (Moderate), `>40` (High Risk).
*   **UI Aesthetic:** Plain white `font-black` headers with high-contrast descriptions for zero-ambiguity clinical data entry.

### Module B: Diagnostics & Trends (The Intelligence Layer)
*   **Purpose:** To ingest unstructured medical documents and synthesize them into clinical insights.
*   **Tech:** Google Gemini 2.5 Flash (Context-Aware Multimodal AI).
*   **Key Capabilities (`SmartReport.tsx` / `api/analyze`):**
    1.  **Neural Narrative:** Synthesizes history into a single, cohesive clinical story.
    2.  **Trend Detection:** Identifies biomarker trajectories across multiple historical reports.
    3.  **Adherence Sync:** Auto-identifies prescriptions and syncs them with the Wellness Hub.

### Module C: Wellness Hub (Daily Protocol)
*   **Purpose:** Medication adherence, vitals telemetry, and habit synchronization.
*   **Structure (`MedicationTracker.tsx`):**
    *   **Adherence Tracker:** Premium "Tick to Take" checklist with glassmorphic progress rings.
    *   **Dual-Device Sync:** Native ingestion for **FreeStyle Libre (CGM)** and **Apple Watch**.
    *   **Clinical Inventory:** Tracking of pharmaceutical stocks and refill cycles.

### Module D: Clinic Hub (Clinical Operations)
*   **Purpose:** Managing the logistics and finances of senior care.
*   **Features (`ClinicHub.tsx`):**
    *   **Protocol Schedule:** Specialist booking for Geriatric, Cardio, and Physio nodes.
    *   **Yukti Senior Shield:** Integrated insurance wallet system with operational credit management.

### Module E: Care Team & Bot (Neural Companion)
*   **Care Team Grid (`CareTeam.tsx`):** A decentralized network of clinical specialists and autonomous monitoring nodes.
*   **WhatsApp Bot (`WhatsAppDemo.tsx`):**
    *   Simulated conversational interface demonstrating zero-learning-curve physiological logging.
    *   Re-imagined within a premium dark glassmorphic phone frame.

---

## 3. Design System: "Neural Glass" tokens

| Element | Specification | Rationale |
| :--- | :--- | :--- |
| **Background** | `slate-950` + Cyan Grid | Clinical blueprint aesthetic; reduces glare. |
| **Containers** | `backdrop-blur-xl` + `border-white/10` | Depth perception and visual hierarchy. |
| **Typography** | `text-white font-black uppercase` | Maximum accessibility for aging eyes. |
| **Accents** | `cyan-400` / `blue-500` | Calm, medical-grade color palette. |

---

## 4. Technical Data Model (Privacy-First)

Yukti OS operates on a **100% Client-Side Persistence** model via `localStorage`.

| Key | Description |
| :--- | :--- |
| `yukti_assessment_data_v2` | Structured clinical answers and risk scores. |
| `yukti_active_meds` | Array of current prescriptions (Chronic vs Acute). |
| `yukti_history` | Historical archive of analyzed medical reports. |
| `yukti_daily_log_{date}` | Adherence and Vitals logs for specific dates. |
| `yukti_user_name` | User identity (e.g., "Tharun Gajula"). |

---

## 5. Stakeholder Demo Protocols

### ✨ The "Neural Patch" Flow
1.  **Initialize:** Enter the system via the frictionless "Initialize System" entry point.
2.  **Inject Context:** Use the **Neural Patch (Demo Data)** button to instantly simulate a High-Risk patient profile.
3.  **Audit Trends:** Navigate to **Diagnostics & Trends** to see Gemini-powered analysis in action.
4.  **Simulate Adherence:** Complete a medicine cycle in the **Wellness Hub** and observe the progress rings.
5.  **Autonomous Link:** Demonstrate conversational logging in the **WhatsApp Bot**.

---

*This guide serves as the definitive source of truth for the Yukti OS v2.2+ architecture and product vision.*
