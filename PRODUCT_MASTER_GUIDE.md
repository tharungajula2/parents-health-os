# Yukti OS: The Complete Product Master Guide
**Version:** 2.2+ (Premium Dark Glassmorphism & Neural Typography Edition)
**Date:** March 28, 2026
**Status:** Live Concept Prototype (v2.2+)
**Author:** Tharun Gajula

---

## 1. Vision: The "Context-First" Health OS

Yukti OS is a longevity operating system designed to bridge the gap between "dumb" health logging and "intelligent" clinical oversight. It operates on the principle that **Medical Data without Patient Context is Noise.**

*   **The Problem:** Most geriatric health apps provide generic alerts (e.g., "Sugar is 160, Alert!"). This leads to "Alert Fatigue" and ignores clinical nuances.
*   **The Solution:** Yukti OS first builds a **Digital Clinical Twin** (Context) of the user and then filters all incoming telemetry (CGM, Vitals, Lab Reports) through that specific clinical lens.
*   **The Metric:** `Contextual Intelligence = (Raw Telemetry + Clinical Profile) * AI Correlation`.

---

## 2. Core Architecture: The Neural Modules

### Module A: Health Assessment (The Clinical Engine)
The foundation of the "Context". Before any AI features are unlocked, the user establishes a baseline.
*   **The Protocol:** A 15-question structured Geriatric Assessment.
*   **The 10 Clinical Pillars:**
    1.  **Metabolic:** Blood sugar and diabetes trajectory.
    2.  **Cardiovascular:** BP, heart history, and circulation.
    3.  **Cognitive:** Memory, confusion, and steadiness indices.
    4.  **Muscular:** Back, knee, and joint pain scores.
    5.  **Frailty:** Balance, fall history, and ADL (Activities of Daily Living) support.
    6.  **Digestive:** Gut health and acidity trends.
    7.  **Emotional:** Stress, anxiety, and low-mood detection.
    8.  **Sleep:** Quality, apnea signs, and daytime fatigue.
    9.  **Lifestyle:** Nutrition, hydration, and exercise habits.
    10. **Resilience:** Age, respiratory capacity, and surgical history.
*   **Scoring Engine:** Total score out of 175.
    *   `0-20`: **Healthy Baseline** (Low Sensitivity Alerts)
    *   `21-40`: **Moderate Attention** (Standard Monitoring)
    *   `>40`: **High Risk** (Aggressive Alerting & Clinical Guardrails)

### Module B: Diagnostics & Trends (The Intelligence Layer)
Uses **Google Gemini 2.5 Flash** to turn unstructured medical "noise" into structured clinical data.
*   **Multimodal Input:** Takes PDFs, Lab Reports, and Prescriptions.
*   **Intelligence Layers:**
    1.  **Extraction:** Pulling biomarkers (Hba1c, Creatinine, etc.) and Meds into `localStorage`.
    2.  **Correlation:** Comparing the report's findings against the user's "Clinical Engine" scoring.
    3.  **Neural Narrative:** Synthesizing months of reports into a single readable clinical history.

### Module C: Wellness Hub (Daily Protocol)
The operational core for daily adherence.
*   **IoT Synchronization (Simulation):** 
    *   **FreeStyle Libre (CGM):** Direct ingest of 15-minute glucose intervals.
    *   **Apple Watch:** Ingest of Activity rings, Weights, and Resting Heart Rate.
*   **Medication Guard:** A clinical-grade checklist with "Relation to Food" and "Time Slot" logic.

### Module D: Clinic Hub (Clinical Operations)
Managing the logistics of the geriatric ecosystem.
*   **Fiscal Nodes:** Simulated health-wallet (`Yukti Senior Shield`) for managing insurance credits.
*   **Service Grid:** Booking simulations for Physio, Cardio, and Geriatric specialists.

### Module E: Care Team & WhatsApp Bot (Neural Link)
*   **Care Team Grid:** Visualization of the "Guardian Network" (Family, Doctors, AI).
*   **WhatsApp Bot:** A zero-learning-curve prototype showing how seniors can "chat" with their OS.

---

## 3. Advanced Simulations (The "Wow" Layer)

### 📞 The Clinical Call Overlay (`CallOverlay.tsx`)
Triggered automatically at 9 AM, 1 PM, and 9 PM if meds are missed. 
*   **Tech:** `Web Speech API` (SpeechSynthesis) + `Framer Motion`.
*   **Experience:** A full-screen incoming call UI with a synthetic voice reading out specific clinical instructions (e.g., "Take your Metformin after food").

### 🔔 Contextual Notifications
Alerts that change their terminology based on the user's Risk Score. High-risk users receive "Neural Log" alerts, while healthy users receive "Wellness Updates".

---

## 4. Design System: "Neural Glass" (v2.2+)

Designed for eyes aged 60+.
*   **Aesthetic:** Dark slate backgrounds (`slate-950`) with `backdrop-blur-xl` translucent layers.
*   **Legibility:** **High-Contrast Clean White** typography. Headers use `font-black` for maximum character recognition.
*   **Color Theory:**
    *   `Cyan-400`: Intelligence & Stability.
    *   `Slate-500`: Low-priority noise.
    *   `Amber-400`: Immediate Attention Required.
    *   `Red-500`: Clinical Alert.

---

## 5. Technical Stack

*   **Frontend:** Next.js 15 (App Router), Tailwind CSS 4.
*   **Animations:** Framer Motion 12 (Motion-DOM).
*   **AI Engine:** Google Gemini (Custom System Instructions for Geriatrics).
*   **Persistence:** `localStorage` (Privacy First).

---

*This guide serves as the definitive source of truth for the Yukti OS v2.2+ architecture and product vision.*
