# Parents Health OS: The Context-Aware Eldercare Assistant 🩺✨

> **"Because elderly health is about context, not just numbers."**

Welcome to **Parents Health OS** (First Family Care Console), a warm, clinical-grade operating console designed for care teams and families managing the health of aging parents in India.

---

## 🚀 The Core Philosophy
Most health apps raise panic alarms when a patient's blood glucose hits `160 mg/dL` or their systolic blood pressure fluctuates.
In geriatrics, keeping a diabetic senior’s sugar slightly elevated is often a deliberate clinical choice. Strict sugar control can lead to **hypoglycemia** (low sugar), which causes dizziness, balance loss, and catastrophic falls.

**Parents Health OS** evaluates vitals through a **personalized clinical context**—suppressing false alarms and framing daily targets based on age, chronic conditions, and baseline mobility.

---

## 🌟 Key Features

*   **🩺 Context-Aware Triage:** Warm, clinical priority grading (Stable, Watch, and **Urgent Follow-up**) preventing alarm fatigue.
*   **📋 First Family Intake:** Onboard seniors with a comprehensive 15-pillar geriatric checklist and chronic condition baselines.
*   **🎪 Baseline Health Camp:** A dedicated camp registry to capture field vitals (BP, glucose, pulse, weight) and sync them to core profiles.
*   **📱 WhatsApp Care Companion:** Simulated phone interface showing how seniors interact with **Anaya** (the Care Automation Assistant) via simple WhatsApp templates in their preferred language.
*   **🔬 Smart PDF Lab Analysis:** Upload blood panel PDFs and parse key findings using Google Gemini AI, translating clinical jargon into simple, comforting terms.
*   **🏥 Specialist Roster & Doctor Briefs:** Compile recent logs, reports, and daily compliance records into clean, print-ready clinician discussion briefs.
*   **🔒 Strict DPDPA Consent Compliance:** In compliance with India's Digital Personal Data Protection Act, 2023, data is stored locally first and never analyzed by external AI without explicit consent toggles.

---

## 🚀 The Zero-Setup Sandbox Mode

By default, the application runs in a **100% Client-Side Local Sandbox Mode** with zero server overhead.
- All personal health records (PHRs) are processed on-device and stored in the browser's `localStorage` as a zero-knowledge vault.
- Bypassing live database connections guarantees complete privacy and offline resilience.

---

## 🛠 Developer & Deployment Operations

For full instructions, schemas, and architecture maps, please refer to the detailed system blueprint: [Parents Health OS Source of Truth](file:///c:/000_workspace_22626/1_Product%20Lab%20Portfolio/2_parents-health-os/parents-health-os/ParentsHealthOS_SOURCE_OF_TRUTH_2026-06-19.md).

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tharungajula2/parents-health-os.git
   cd parents-health-os
   ```

2. **Install node dependencies:**
   Ensure you have Node.js 18.17+ installed, and run:
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root folder to define your API keys:
   ```bash
   # Gemini API Key (Required for AI report parsing, fallback mock active if empty)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the local server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

### Supabase Cloud Mode Migration

When you are ready to transition from sandbox mode to a live database, uncomment the variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
```
Upon detection of these keys, the application automatically mounts Supabase authentication and mounts the PostgreSQL data sync engines. 
*(Note: A startup safety check in `src/lib/supabase/client.ts` blocks any connections to the protected client `trelis-life` database to protect production resources).*
